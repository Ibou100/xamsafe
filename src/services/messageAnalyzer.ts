import type { AnalysisResult, ClueItem, RiskLevel } from '../types';

/**
 * Sanitizes input text to strip potential phone numbers, emails, and sensitive codes.
 */
export function sanitizeUserMessage(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Mask Senegalese mobile numbers with various spacing (+221 77 123 45 67, 77 123 45 67, 781234567)
    .replace(/(?:\+221[\s.-]*)?(?:7[05678][\s.-]*(?:\d[\s.-]*){7})/gi, '[NUMÉRO_TÉLÉPHONE_MASQUÉ]')
    // Mask emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_MASQUÉ]')
    // Mask potential 4-6 digit numeric codes explicitly preceded by words like code/pin/otp
    .replace(/(code|pin|otp|pass|passe|chiffres?)\s*[:=]?\s*\b\d{4,6}\b/gi, '$1 [CODE_MASQUÉ]');
}

/**
 * Deterministic local heuristic analyzer for messages received by Senegalese users.
 */
export function analyzeMessageLocally(rawText: string): AnalysisResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // If text is extremely short or empty
  if (text.length < 10) {
    return {
      riskLevel: 'indetermine',
      riskScore: 0,
      title: 'Message trop court pour une analyse fiable',
      summary: 'Le texte fourni est trop bref pour identifier des indicateurs d\'arnaque ou des éléments rassurants.',
      detectedClues: [],
      reassuringClues: [],
      limitations: [
        'Une phrase ou un mot isolé ne permet pas de dégager un contexte.',
        'La vigilance élémentaire reste requise.'
      ],
      complementaryChecks: [
        'Vérifiez le message complet reçu.',
        'Ne fournissez aucun code secret par réflexe.'
      ],
      recommendedActions: [
        'Collez le message complet incluant les éventuelles consignes ou liens.',
        'En cas de doute avec un opérateur, appelez le service officiel.'
      ],
      engineType: 'local-heuristic',
    };
  }

  const detectedClues: ClueItem[] = [];
  const reassuringClues: ClueItem[] = [];
  let score = 0;

  // 1. Detection of OTP / PIN / Secret Code request (Critical Danger)
  const otpPatterns = [
    /code.*(?:secret|otp|reçu|sms|4\s*chiffres|6\s*chiffres|validation|confirmation)/i,
    /(?:dicter|partager|envoyer|donner|transférer).*(?:code|pin|mot de passe)/i,
    /ne partagez (?:pas|jamais).*code/i,
    /kod.*(?:4|6|secret)/i, // Wolof hints
  ];
  const hasOtpRequest = otpPatterns.some((pattern) => pattern.test(lower));
  if (hasOtpRequest) {
    score += 45;
    detectedClues.push({
      id: 'clue-otp-request',
      type: 'danger',
      title: 'Demande de code secret ou de code OTP reçue par SMS',
      description: 'Le message sollicite directement ou indirectement la communication d\'un code de sécurité ou d\'un code à chiffres.',
      detail: 'Règle absolue : aucun opérateur légitime (Wave, Orange, Free) ni aucune banque ne demande de leur lire un code secret ou un code SMS.',
    });
  }

  // 2. Detection of false urgency / imminent blocking (Critical / High Danger)
  const urgencyPatterns = [
    /(?:blocage|bloqu[ée]|suspendu|clôtur[ée]|définitif).*(?:dans|sous|en|avant)\s*(?:\d+|quelques|15|30)\s*(?:minutes?|heures?|h|min)/i,
    /urgence|immédiat|sans délai|dernier avertissement|sous 24h|sous 48h/i,
    /tëj.*(?:kont|ligne|ci sàss)/i, // Wolof: tëj kont ci sàss
  ];
  const hasUrgency = urgencyPatterns.some((pattern) => pattern.test(lower));
  if (hasUrgency) {
    score += 25;
    detectedClues.push({
      id: 'clue-urgency',
      type: 'danger',
      title: 'Pression temporelle et menace de blocage immédiat',
      description: 'Le texte installe un sentiment d\'urgence artificielle (ex: "compte suspendu sous 30 min", "urgent").',
      detail: 'Cette manipulation psychologique vise à vous faire paniquer pour court-circuiter votre réflexion.',
    });
  }

  // 3. Detection of Unrealistic Gains / Lottery / Tombola (High Danger)
  const gainPatterns = [
    /(?:gagn[ée]|remport[ée]|félicitations?|sélectionn[ée]).*(?:tirage|tombola|million|fcfa|chèque|iphone|voiture)/i,
    /am nga.*(?:xaalis|kado)/i,
  ];
  const hasAdvanceFees = /(?:frais d'huissier|frais de retrait|frais de dossier|frais d'enregistrement|frais de dédouanement).*(?:payer|verser|envoyer|régler)/i.test(lower);
  const hasGains = gainPatterns.some((pattern) => pattern.test(lower)) || hasAdvanceFees;

  if (hasGains) {
    score += hasAdvanceFees ? 50 : 30;
    detectedClues.push({
      id: 'clue-gains',
      type: 'danger',
      title: 'Promesse de gain spectaculaire ou loterie inattendue',
      description: 'Le message annonce un tirage au sort avantageux, souvent accompagné d\'une demande de frais préalable pour débloquer le lot.',
      detail: 'Aucun jeu légitime ne réclame de verser de l\'argent par mobile money pour toucher un prix.',
    });
  }

  // 4. USSD traps detection (*144*...# etc.)
  const ussdRegex = /\*1(?:44|45|50|55)\*[0-9*#]+/i;
  if (ussdRegex.test(lower)) {
    score += 35;
    detectedClues.push({
      id: 'clue-ussd-trap',
      type: 'danger',
      title: 'Code USSD de transfert ou de manipulation présent',
      description: 'Le texte contient une commande USSD de type opérateur (*144*...).',
      detail: 'Taper ce genre de code sur son clavier peut déclencher un transfert immédiat de vos fonds vers le numéro d\'un escroc.',
    });
  }

  // 5. Fake Transfer Claim / Refund Request
  const transferRefundPatterns = [
    /(?:transfert reçu|erreur de numéro|renvoyez|restituer|erreur de transfert|trompé de numéro)/i,
    /juum na.*(?:numero|xaalis)/i, // Wolof: juum na ci numero
  ];
  if (transferRefundPatterns.some((pattern) => pattern.test(lower))) {
    score += 25;
    detectedClues.push({
      id: 'clue-fake-transfer-refund',
      type: 'warning',
      title: 'Prétendu transfert d\'argent par erreur',
      description: 'Le message évoque un transfert prétendument envoyé par erreur et incite à renvoyer l\'argent.',
      detail: 'Vérifiez toujours votre solde réel DANS votre application officielle. Ne vous fiez jamais à un simple SMS.',
    });
  }

  // 6. Suspicious Web Link included
  const hasLink = /(https?:\/\/|[a-z0-9-]+\.(?:xyz|top|biz|info|site|online|tk|ga|ml|cf|gq|link|click|work))/i.test(lower);
  if (hasLink) {
    score += 20;
    detectedClues.push({
      id: 'clue-web-link',
      type: 'warning',
      title: 'Présence d\'un lien web externe',
      description: 'Le message incite à cliquer sur une adresse internet pour vous connecter ou confirmer une identité.',
      detail: 'Les opérateurs mobiles et banques gèrent leurs services via leurs applications sécurisées et non via des liens web informels.',
    });
  }

  // 7. Task Scam / Fake Remote Job ("Like & Follow" scam)
  const taskScamPatterns = [
    /(?:gagn|touch).*(?:\d+.*(?:fcfa|\$|€|euros?).*(?:jour|heure|tâche|video|tiktok|youtube|telegram))/i,
    /(?:travail à domicile|job en ligne|recrutement en ligne).*(?:salaire|gain|dépôt|investir)/i,
    /(?:like|aimer|suivre|visionn).*(?:vidéo|compte|chaine|page|tiktok|youtube).*(?:payé|rémunér|argent|fcfa|\$|€)/i,
  ];
  if (taskScamPatterns.some((pattern) => pattern.test(lower))) {
    score += 45;
    detectedClues.push({
      id: 'clue-task-scam',
      type: 'danger',
      title: 'Arnaque à la fausse tâche rémunérée ou faux emploi (Task Scam)',
      description: 'Le message promet une rémunération facile pour liker des vidéos, s\'abonner à des chaînes ou accomplir des micro-tâches.',
      detail: 'Mécanique mondiale : les escrocs versent une petite somme au début pour inspirer confiance, puis exigent des dépôts croissants que la victime ne revoit jamais.',
    });
  }

  // 8. Crypto / High-Yield Investment Fraud (Pig Butchering / Ponzi)
  const cryptoPatterns = [
    /(?:crypto|bitcoin|usdt|trading|forex).*(?:rendement|garanti|bénéfice|multiplier|x2|x3|robot)/i,
    /(?:investir|investissement).*(?:sans risque|100% garanti|doubler en \d+|retrait immédiat)/i,
  ];
  if (cryptoPatterns.some((pattern) => pattern.test(lower))) {
    score += 45;
    detectedClues.push({
      id: 'clue-crypto-ponzi',
      type: 'danger',
      title: 'Arnaque au faux investissement crypto ou trading garanti',
      description: 'Le texte fait miroiter des rendements financiers spectaculaires et sans risque dans les cryptomonnaies ou le trading.',
      detail: 'En finance légale, un rendement très élevé implique toujours un risque majeur. Les promesses de gains "garantis" sont des arnaques 100% avérées.',
    });
  }

  // 9. Delivery / Parcel Hold / Customs Phishing
  const deliveryPatterns = [
    /(?:colis|paquet|livraison).*(?:bloqué|retenu|suspendu|adresse incomplète|frais de douane|frais de port)/i,
    /(?:dhl|fedex|chronopost|ups|la poste).*(?:frais|payer|retrait|cliquez)/i,
  ];
  if (deliveryPatterns.some((pattern) => pattern.test(lower))) {
    score += 35;
    detectedClues.push({
      id: 'clue-delivery-scam',
      type: 'danger',
      title: 'Arnaque au faux colis bloqué ou frais de douane fictifs',
      description: 'Le message prétend qu\'un colis vous attend et réclame un règlement immédiat pour régulariser la livraison.',
      detail: 'Les fraudeurs diffusent ces SMS par vagues massives en espérant tomber sur une personne attendant effectivement une commande.',
    });
  }

  // 10. Family Distress / "Hi Mum" Impersonation Scam
  const familyDistressPatterns = [
    /(?:bonjour|salut|coucou)\s+(?:maman|papa).*mon téléphone.*(?:cassé|perdu|volé|nouveau numéro)/i,
    /(?:sauvegarde ce numéro|écris-moi sur whatsapp).*(?:urgence|bloqué|besoin d'argent)/i,
  ];
  if (familyDistressPatterns.some((pattern) => pattern.test(lower))) {
    score += 40;
    detectedClues.push({
      id: 'clue-family-distress',
      type: 'danger',
      title: 'Usurpation d\'identité d\'un proche ou détresse familiale fictive ("Hi Mum")',
      description: 'L\'interlocuteur prétend être votre enfant ou parent ayant changé de numéro de téléphone en urgence.',
      detail: 'Ne versez rien et ne cliquez sur rien. Appelez toujours le numéro habituel officiel de votre proche pour vérifier de vive voix.',
    });
  }

  // 11. SIM Swap / Network Migration Urgency
  const simSwapPatterns = [
    /(?:mise à niveau|identification|enregistrement|migration).*(?:carte sim|puce|5g|ligne).*(?:expir|bloqu|suspension)/i,
    /désactivation.*(?:sim|numéro|ligne).*(?:cliquez|composez|renouvelez)/i,
  ];
  if (simSwapPatterns.some((pattern) => pattern.test(lower))) {
    score += 40;
    detectedClues.push({
      id: 'clue-sim-swap',
      type: 'danger',
      title: 'Tentative de SIM Swap ou faux renouvellement de ligne',
      description: 'Le message tente de vous pousser à valider une opération de SIM Swap qui transférerait votre ligne mobile aux mains de l\'escroc.',
      detail: 'Une fois votre SIM dupliquée, l\'attaquant intercepte tous vos SMS de double authentification et vide vos comptes.',
    });
  }

  // 7. Impersonation of brands without official channels (Wave, Orange, Free, ONU, Police, etc.)
  const brandKeywords = [
    'wave', 'orange money', 'sonatel', 'free money', 'unicef', 'police', 'douane', 'la poste', 'dgid', 'campusen'
  ];
  const mentionedBrand = brandKeywords.find((b) => lower.includes(b));
  if (mentionedBrand) {
    detectedClues.push({
      id: 'clue-brand-mentioned',
      type: 'info',
      title: `Nom de service ou institution mentionné : ${mentionedBrand.toUpperCase()}`,
      description: `L'expéditeur invoque le nom d'une grande entité pour inspirer confiance ou autorité.`,
      detail: 'Les escrocs usurpent très couramment les marques nationales connues au Sénégal.',
    });
  }

  // 8. Reassuring clues
  if (!hasOtpRequest && !lower.includes('code') && !lower.includes('mot de passe')) {
    reassuringClues.push({
      id: 'reassure-no-code',
      type: 'reassuring',
      title: 'Aucune demande explicite de mot de passe ou code secret',
      description: 'Le texte ne semble pas exiger de révéler vos clés d\'accès confidentielles.',
    });
  }

  if (!hasUrgency) {
    reassuringClues.push({
      id: 'reassure-no-urgency',
      type: 'reassuring',
      title: 'Absence de menace temporelle immédiate',
      description: 'Le message n\'impose pas d\'ultimatum agressif de type "dans les 15 minutes".',
    });
  }

  if (!hasLink) {
    reassuringClues.push({
      id: 'reassure-no-link',
      type: 'reassuring',
      title: 'Aucun lien internet cliquable dans le message',
      description: 'L\'expéditeur n\'a pas inclus d\'adresse de redirection web dans le texte analysé.',
    });
  }

  // Compute final risk level
  let riskLevel: RiskLevel;
  let title: string;
  let summary: string;

  if (score >= 45) {
    riskLevel = 'eleve';
    title = 'Risque élevé d\'escroquerie détecté';
    summary = 'Ce message présente des caractéristiques très nettes d\'une tentative de fraude numérique ou d\'hameçonnage (phishing). Nous vous conseillons de ne pas donner suite.';
  } else if (score >= 20) {
    riskLevel = 'moyen';
    title = 'Indices suspects détectés — Vigilance requise';
    summary = 'Ce message comporte des signaux d\'alerte qui invitent à une grande prudence. N\'exécutez aucune action sans vérification indépendante.';
  } else if (detectedClues.length === 0 && score === 0) {
    riskLevel = 'faible';
    title = 'Peu ou pas d\'indices suspects identifiés';
    summary = 'Le moteur de règles n\'a pas relevé d\'indicateurs typiques de fraude dans ce texte. Restez toutefois attentif au contexte global de l\'échange.';
  } else {
    riskLevel = 'indetermine';
    title = 'Niveau de risque indéterminé';
    summary = 'Impossible de déterminer avec certitude si ce message est frauduleux. Voici les vérifications complémentaires à effectuer.';
  }

  return {
    riskLevel,
    riskScore: Math.min(100, score),
    title,
    summary,
    detectedClues,
    reassuringClues,
    limitations: [
      'Ce diagnostic repose sur une analyse heuristique locale des motifs textuels et ne constitue pas une certitude juridique absolue.',
      'L\'absence d\'indices suspects ne garantit pas à 100% qu\'un interlocuteur est de bonne foi.',
      'Le résultat ne porte pas de jugement définitif sur une personne ou un numéro à partir d\'un simple fragment textuel.',
    ],
    complementaryChecks: [
      'N\'appelez pas le numéro mentionné dans le message : utilisez le numéro officiel de l\'organisme.',
      'Ouvrez directement votre application mobile officielle pour contrôler votre solde et votre historique.',
      'Si le message provient d\'un proche, joignez-le par un appel vocal classique pour entendre sa voix.',
    ],
    recommendedActions: [
      'Ne communiquez JAMAIS de code secret, de code PIN ou de code SMS.',
      'Ne cliquez sur aucun lien web non vérifié.',
      'En cas d\'insistance ou de menace, bloquez le numéro émetteur.',
      'Consultez notre rubrique « Je suis victime » si vous avez déjà validé une opération.',
    ],
    engineType: 'local-heuristic',
  };
}
