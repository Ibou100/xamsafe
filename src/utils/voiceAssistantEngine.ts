export interface VoiceDiagnosis {
  id: string;
  category: string;
  titleFr: string;
  titleWo: string;
  dangerLevel: 'danger' | 'warning' | 'info';
  spokenResponseFr: string;
  spokenResponseWo: string;
  instructionFr: string;
  instructionWo: string;
  officialEmergencyContact?: {
    name: string;
    number: string;
  };
  detectedKeywords: string[];
}

export function analyzeSpokenText(rawText: string): VoiceDiagnosis {
  const text = rawText.toLowerCase().trim();

  // 1. DÉTECTION : Faux Agent Wave / Orange Money / Free (Demande de code OTP / PIN)
  const isAgentCode =
    (text.includes('code') || text.includes('kod') || text.includes('chiffre') || text.includes('lim') || text.includes('otp')) &&
    (text.includes('wave') || text.includes('orange') || text.includes('free') || text.includes('agent') || text.includes('bloqu') || text.includes('tëj') || text.includes('debloqu') || text.includes('service') || text.includes('technique'));

  if (isAgentCode) {
    return {
      id: 'agent-code',
      category: 'Mobile Money',
      titleFr: '🚨 Tentative de vol de compte Mobile Money (Faux Agent)',
      titleWo: '🚨 Sàcc kont Wave / Orange (Sàcc bu naan liggéeyukat la)',
      dangerLevel: 'danger',
      spokenResponseFr:
        "Attention danger ! Ceci est une arnaque très grave. Les opérateurs Wave et Orange Money ne demandent JAMAIS votre code secret ou un code reçu par SMS. Raccrochez immédiatement le téléphone et ne donnez absolument rien !",
      spokenResponseWo:
        "Moytul bu baax ! Nàcc-nàcc bu mag la. Wave ak Orange dunu la laaj sa kod mukk ! Tëjal telefon bi ci sàss te bul joxe dara !",
      instructionFr: 'Raccrochez immédiatement. Ne donnez aucun code. Votre compte est en sécurité tant que vous gardez votre code.',
      instructionWo: 'Tëjal telefon bi leegi. Bul joxe sa kod. Sa xaalis du réer su fekkee teyye nga sa kod.',
      officialEmergencyContact: {
        name: 'Service Client Orange (1441) ou Wave Support (App)',
        number: '1441',
      },
      detectedKeywords: ['code', 'wave/orange', 'appel suspect', 'tentative déblocage'],
    };
  }

  // 2. DÉTECTION : Piratage WhatsApp (Détournement de code à 6 chiffres)
  const isWhatsAppHack =
    (text.includes('whatsapp') || text.includes('watsap')) &&
    (text.includes('code') || text.includes('kod') || text.includes('6') || text.includes('ami') || text.includes('xarit') || text.includes('erreur') || text.includes('juum') || text.includes('envoyé') || text.includes('yonnee') || text.includes('compte') || text.includes('kont'));

  if (isWhatsAppHack) {
    return {
      id: 'whatsapp-hack',
      category: 'WhatsApp',
      titleFr: '🚨 Tentative de piratage de votre WhatsApp',
      titleWo: '🚨 Bëgg a sàcc sa WhatsApp (Nax ci kod 6 lim)',
      dangerLevel: 'danger',
      spokenResponseFr:
        "Alerte rouge ! Le compte WhatsApp de votre contact a été piraté. L'escroc essaie d'installer votre propre compte sur son téléphone. Ne lui envoyez surtout pas les 6 chiffres reçus par SMS !",
      spokenResponseWo:
        "Moytul ! Kontu sa xarit bi sàcc nañu ko. Sàcc bi dafa bëgg a jël sa WhatsApp yaw itam. Bul ko yonnee benn kod 6 lim bi la ñëw ci SMS !",
      instructionFr: 'Ne partagez JAMAIS le code à 6 chiffres. Activez la vérification en 2 étapes dans WhatsApp.',
      instructionWo: 'Bul seddoo kod 6 lim bi. Tëjal sa WhatsApp ci « vérification en deux étapes ».',
      officialEmergencyContact: {
        name: 'Division Cybersécurité Police (DSC)',
        number: 'https://signalementcyber.dgpn.sn/',
      },
      detectedKeywords: ['whatsapp', 'code 6 chiffres', 'proche piraté'],
    };
  }

  // 3. DÉTECTION : Faux SMS de transfert / Virement reçu par erreur
  const isFakeTransfer =
    (text.includes('sms') || text.includes('bataaxal') || text.includes('transfert') || text.includes('virement') || text.includes('tromp') || text.includes('erreur') || text.includes('juum')) &&
    (text.includes('argent') || text.includes('xaalis') || text.includes('renvoy') || text.includes('delloo') || text.includes('pleur') || text.includes('jooy') || text.includes('50') || text.includes('solde'));

  if (isFakeTransfer) {
    return {
      id: 'fake-transfer',
      category: 'SMS & Mobile Money',
      titleFr: '⚠️ Faux virement d\'argent reçu (« Erreur de transfert »)',
      titleWo: '⚠️ SMS naxate naan « xaalis juum na ci yaw »',
      dangerLevel: 'danger',
      spokenResponseFr:
        "Ne renvoyez aucun argent ! C'est une fausse alerte. Ouvrez d'abord votre vraie application Wave ou Orange Money pour vérifier votre solde. Si c'est une vraie erreur, seul l'opérateur officiel peut annuler la transaction.",
      spokenResponseWo:
        "Bul delloo benn xaalis ! Naxate la. Ubbil sa Wave walla Orange xool ndax sa xaalis yokk na dëgg dëgg. Su dee dëgg la, opaarater bi mookoy réglé ci këram.",
      instructionFr: 'Vérifiez votre solde réel dans l\'application. Dites à la personne de contacter le service client.',
      instructionWo: 'Xoolal sa xaalis ci appli bi. Waxal nit ki mu woo service client bi.',
      officialEmergencyContact: {
        name: 'Support Réclamation Opérateur',
        number: '1441',
      },
      detectedKeywords: ['sms reçu', 'erreur transfert', 'remboursement demandé'],
    };
  }

  // 4. DÉTECTION : Faux Vendeur en ligne / Demande d'acompte (Dëpp)
  const isFakeSeller =
    (text.includes('vendeur') || text.includes('jaaykat') || text.includes('boutique') || text.includes('tiktok') || text.includes('facebook') || text.includes('achat') || text.includes('jënd')) &&
    (text.includes('avance') || text.includes('acompte') || text.includes('dëpp') || text.includes('payer') || text.includes('fey') || text.includes('livraison') || text.includes('livreur') || text.includes('avant'));

  if (isFakeSeller) {
    return {
      id: 'fake-seller',
      category: 'Commerce en ligne',
      titleFr: '⚠️ Risque d\'escroquerie à l\'acompte en ligne',
      titleWo: '⚠️ Moytul jaaykat bi naan jox ma dëpp',
      dangerLevel: 'warning',
      spokenResponseFr:
        "Prudence maximale ! N'envoyez jamais d'acompte par Wave ou Orange Money à un vendeur en ligne que vous ne connaissez pas. Exigez toujours de payer à la livraison après avoir inspecté le produit.",
      spokenResponseWo:
        "Moytul bu baax ! Bul joxe dëpp ci Wave walla Orange bala nga gis li ngay jënd. Laajal fey ci say loxo bu livreur bi ñëwee ba nga saytu ko.",
      instructionFr: 'Exigez le paiement à la livraison (Cash on Delivery). Refusez toute avance.',
      instructionWo: 'Feyal bu ñu la indiilée sa mbir rekk. Bañall joxe dëpp.',
      detectedKeywords: ['vendeur', 'avance/acompte', 'paiement avant livraison'],
    };
  }

  // 5. DÉTECTION : Faux Recrutement / Emploi payant
  const isFakeJob =
    (text.includes('recrutement') || text.includes('emploi') || text.includes('travail') || text.includes('liggéey') || text.includes('stage') || text.includes('onu') || text.includes('unicef') || text.includes('pam')) &&
    (text.includes('frais') || text.includes('dossier') || text.includes('dósiyé') || text.includes('payer') || text.includes('fey') || text.includes('badge') || text.includes('visite') || text.includes('médicale'));

  if (isFakeJob) {
    return {
      id: 'fake-job',
      category: 'Emploi & Recrutement',
      titleFr: '🚨 Fausse offre d\'emploi avec frais de dossier',
      titleWo: '🚨 Naxate ci liggéey (Feyal dósiyé)',
      dangerLevel: 'danger',
      spokenResponseFr:
        "Stop ! Un vrai employeur ne vous demandera JAMAIS d'argent pour un recrutement, un badge ou un dossier médical. C'est une arnaque pour voler votre argent.",
      spokenResponseWo:
        "Tëyyeel sa bopp ! Kenn dula laaj xaalis ngir am liggéey ci këru liggéeyukaay bu mag. Sàcc lañu, bul fey dara !",
      instructionFr: 'Ne payez aucun frais de dossier. Les vraies ONG recrutent gratuitement.',
      instructionWo: 'Bul fey benn dërëm ci dósiyé. Liggéey bu dëggu feyuloo dara ngir bindu.',
      detectedKeywords: ['offre emploi', 'frais dossier', 'recrutement payant'],
    };
  }

  // 6. DÉTECTION : Fausse Tombola / Faux Cadeau Sonatel ou Lonase
  const isFakeLottery =
    (text.includes('gagné') || text.includes('gaañe') || text.includes('tombola') || text.includes('loterie') || text.includes('sonatel') || text.includes('lonase') || text.includes('cadeau') || text.includes('kado') || text.includes('chèque') || text.includes('million') || text.includes('huissier') || text.includes('maître'));

  if (isFakeLottery) {
    return {
      id: 'fake-lottery',
      category: 'Fausse Tombola',
      titleFr: '🚨 Faux tirage au sort / Gain inexistant',
      titleWo: '🚨 Ndam bu amul (« Gaañe nga xaalis »)',
      dangerLevel: 'danger',
      spokenResponseFr:
        "Attention, c'est un piège ! On ne peut pas gagner à un jeu auquel on n'a jamais participé. Ne payez jamais de faux frais d'huissier ou de dossier pour récupérer un cadeau imaginaire.",
      spokenResponseWo:
        "Moytul, naxate la ! Mënoo gaañe ci tombola boo binduwul mukk. Bul fey xaalis naan frais de dossier ngir jël kado bu amul.",
      instructionFr: 'Ne payez rien. Un vrai gain ne demande jamais de versement préalable.',
      instructionWo: 'Bul fey dara. Ku la naan feyal bala nga jël sa ndam, sàcc la.',
      detectedKeywords: ['gain tombola', 'cadeau', 'frais retrait'],
    };
  }

  // 7. SITUATION GÉNÉRALE / PAROLES SUSPECTES / DANGER NON SPÉCIFIÉ
  const isGeneralDanger =
    text.includes('arnaqu') ||
    text.includes('nàcc') ||
    text.includes('sàcc') ||
    text.includes('vol') ||
    text.includes('perdu') ||
    text.includes('réer') ||
    text.includes('bloqué') ||
    text.includes('urgent') ||
    text.includes('peur') ||
    text.includes('argent') ||
    text.includes('xaalis');

  if (isGeneralDanger) {
    return {
      id: 'general-suspicion',
      category: 'Vigilance Sécurité',
      titleFr: '⚠️ Signal de vigilance identifié',
      titleWo: '⚠️ Teyyeel sa bopp : moytul bu baax',
      dangerLevel: 'warning',
      spokenResponseFr:
        "Votre situation demande une grande prudence. Règle d'or : ne donnez jamais aucun code reçu par SMS, ne transférez aucun argent dans la précipitation et vérifiez toujours directement avec l'organisme officiel.",
      spokenResponseWo:
        "Li nga wax dafa laaj moytu. Sart bu mag bi : bul joxe benn kod SMS, bul gaaw yonnee xaalis, te seetal sa bopp ci këru liggéeyukaay bi.",
      instructionFr: 'Prenez le temps de réfléchir. Ne cédez à aucune pression d\'urgence.',
      instructionWo: 'Teyyel sa xel te moytu gaawte gi ñu la bëgg a dugal.',
      officialEmergencyContact: {
        name: 'Police Cybersécurité Sénégal',
        number: 'https://signalementcyber.dgpn.sn/',
      },
      detectedKeywords: ['mots de vigilance', 'pression', 'méfiance requise'],
    };
  }

  // 8. RÉPONSE NEUTRE / ACCUEIL
  return {
    id: 'neutral-help',
    category: 'Assistant Vocal',
    titleFr: 'ℹ️ Je vous écoute : expliquez votre situation',
    titleWo: 'ℹ️ Mangi lay déglu : wax ma li la dal',
    dangerLevel: 'info',
    spokenResponseFr:
      "Bonjour, je suis votre assistant de protection XamSafe. Dites-moi ce qui se passe : avez-vous reçu un appel suspect, un message vous demandant un code ou un SMS d'argent ?",
    spokenResponseWo:
      "Dalal jàmm, man maay sa ndimbal ci kaaraange XamSafe. Wax ma li xew : ndax nit woo la ci telefon, wala yonnee nañu la bataaxal di laaj kod walla xaalis ?",
    instructionFr: 'Parlez librement en Français, en Wolof ou dans le mélange des deux.',
    instructionWo: 'Waxal ci Français, ci Wolof, walla jaxase ko ni la neexe.',
    detectedKeywords: ['écoute active', 'prêt'],
  };
}
