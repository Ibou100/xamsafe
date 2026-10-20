import type { ClueItem, UrlCheckResult } from '../types';

// Known global, pan-African and regional financial/telecom/tech brands targeted by phishing
const TARGET_BRANDS: Record<string, { officialDomains: string[]; label: string }> = {
  // Mobile Money & Regional Telecoms
  wave: { officialDomains: ['wave.com', 'wave.sn'], label: 'Wave Mobile Money' },
  orange: { officialDomains: ['orange.sn', 'orange.com', 'sonatel.sn'], label: 'Orange / Sonatel' },
  sonatel: { officialDomains: ['sonatel.sn', 'sonatel.com'], label: 'Sonatel' },
  free: { officialDomains: ['free.sn'], label: 'Free' },
  mtn: { officialDomains: ['mtn.com', 'mtn.co.za', 'mtn.ci'], label: 'MTN Mobile Money' },
  mpesa: { officialDomains: ['safaricom.co.ke', 'vodacom.com', 'vodacom.co.tz'], label: 'M-Pesa (Safaricom / Vodacom)' },
  airtel: { officialDomains: ['airtel.com', 'airtel.africa', 'airtel.in'], label: 'Airtel Money' },
  moov: { officialDomains: ['moov-africa.com'], label: 'Moov Africa' },

  // Banking & International Payments
  ecobank: { officialDomains: ['ecobank.com'], label: 'Ecobank' },
  cbao: { officialDomains: ['cbao.sn', 'attijariwafabank.com'], label: 'CBAO Attijariwafa Bank' },
  paypal: { officialDomains: ['paypal.com', 'paypal.me'], label: 'PayPal' },
  binance: { officialDomains: ['binance.com', 'binance.me'], label: 'Binance Crypto' },

  // Public Institutions & Postal
  laposte: { officialDomains: ['laposte.sn', 'laposte.fr'], label: 'La Poste' },
  dhl: { officialDomains: ['dhl.com', 'dhl.sn', 'dhl.fr'], label: 'DHL Express' },
  campusen: { officialDomains: ['campusen.sn'], label: 'Campusen' },
  dgid: { officialDomains: ['dgid.sn'], label: 'DGID' },
  police: { officialDomains: ['signalementcyber.dgpn.sn', 'policenationale.gouv.sn', 'interieur.gouv.sn'], label: 'Police Nationale' },

  // Big Tech & Messaging
  whatsapp: { officialDomains: ['whatsapp.com', 'wa.me'], label: 'WhatsApp' },
  telegram: { officialDomains: ['telegram.org', 't.me'], label: 'Telegram' },
  facebook: { officialDomains: ['facebook.com', 'fb.me', 'meta.com'], label: 'Facebook / Meta' },
  google: { officialDomains: ['google.com', 'google.sn', 'google.fr'], label: 'Google' },
  apple: { officialDomains: ['apple.com', 'icloud.com'], label: 'Apple ID' },
  microsoft: { officialDomains: ['microsoft.com', 'live.com', 'outlook.com'], label: 'Microsoft' },
  netflix: { officialDomains: ['netflix.com'], label: 'Netflix' },
  amazon: { officialDomains: ['amazon.com', 'amazon.fr'], label: 'Amazon' },
  cisco: { officialDomains: ['cisco.com', 'netacad.com'], label: 'Cisco Networking Academy' },
  netacad: { officialDomains: ['netacad.com', 'cisco.com'], label: 'Cisco Networking Academy' },
  ucad: { officialDomains: ['ucad.sn', 'esp.sn'], label: 'Université Cheikh Anta Diop / ESP Dakar' },
  esp: { officialDomains: ['esp.sn', 'ucad.sn'], label: 'École Supérieure Polytechnique de Dakar' },
};

const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 't.co', 'ow.ly', 'buff.ly', 'rebrand.ly', 'shorturl.at'
];

const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.click', '.biz', '.info', '.site', '.online', '.tk', '.ga', '.ml', '.cf', '.gq', '.link', '.work', '.rest', '.buzz', '.club', '.live', '.cam', '.vip', '.icu', '.fit', '.surf', '.stream'
];

const PIRACY_STREAMING_KEYWORDS = [
  'koora', 'yalla', 'stream', 'footy', 'hesgoal', 'crack', 'keygen', 'torrent', 'apkpure', 'modapk'
];

/**
 * Analyzes a URL purely via syntax and heuristics without ever visiting it or triggering SSRF.
 */
export function analyzeUrlLocally(rawUrl: string): UrlCheckResult {
  const trimmed = rawUrl.trim();

  // Ensure there is a protocol for URL parsing
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'http://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      url: rawUrl,
      riskLevel: 'indetermine',
      protocol: 'inconnu',
      isHttps: false,
      hostname: rawUrl,
      tld: '',
      subdomainCount: 0,
      isIpAddress: false,
      isShortener: false,
      hasPunycodeOrHomoglyphs: false,
      suspiciousKeywordsFound: [],
      clues: [
        {
          id: 'invalid-syntax',
          type: 'warning',
          title: 'Syntaxe d\'adresse URL non standard ou invalide',
          description: 'L\'adresse web fournie n\'a pas pu être décomposée selon les standards du web (RFC 3986).',
        },
      ],
      pedagogicalNotes: [
        'Vérifiez que vous avez copié l\'adresse complète avec ses points et séparateurs.',
      ],
      recommendation: 'Ne visitez pas ce lien sans vous être assuré de son origine exacte.',
    };
  }

  const clues: ClueItem[] = [];
  const notes: any[] = [];
  let score = 0;

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();
  const isHttps = parsed.protocol.toLowerCase() === 'https:';

  // 1. Protocol check
  if (!isHttps) {
    score += 25;
    clues.push({
      id: 'proto-http',
      type: 'warning',
      title: 'Connexion non chiffrée (HTTP au lieu de HTTPS)',
      description: 'Ce lien utilise l\'ancien protocole HTTP sans cadenas de sécurité. Les données circulent en clair sur le réseau.',
    });
  } else {
    notes.push(
      'Ce site utilise le protocole HTTPS. Attention toutefois : le cadenas HTTPS chiffre la connexion, mais ne garantit ABSOLUMENT PAS que le site est honnête ! Plus de 80% des sites pirates disposent aujourd\'hui d\'un certificat HTTPS gratuit.'
    );
  }

  // 2. IP Address as host
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[');
  if (isIpAddress) {
    score += 40;
    clues.push({
      id: 'host-ip',
      type: 'danger',
      title: "Nom d'hôte constitué d'une adresse IP numérique brute",
      description: `Le lien pointe directement vers l'adresse IP ${hostname} plutôt que vers un nom de domaine enregistré.`,
      detail: 'Les entreprises et services officiels utilisent toujours un nom de domaine lisible, jamais une adresse IP brute dans les liens publics.',
    });
  }

  // 3. Shortener detection
  const isShortener = URL_SHORTENERS.includes(hostname);
  if (isShortener) {
    score += 20;
    clues.push({
      id: 'url-shortener',
      type: 'warning',
      title: 'Raccourcisseur de lien détecté',
      description: `Ce service (${hostname}) masque l'adresse web de destination réelle.`,
      detail: 'Les cybercriminels utilisent les raccourcisseurs pour dissimuler un site frauduleux ou un téléchargement suspect.',
    });
  }

  // 4. Punycode / Homoglyphs / Cyrillic
  const hasPunycodeOrHomoglyphs = hostname.startsWith('xn--') || /[^\x20-\x7E]/.test(hostname);
  if (hasPunycodeOrHomoglyphs) {
    score += 45;
    clues.push({
      id: 'homoglyph-attack',
      type: 'danger',
      title: 'Caractères punycode ou caractères ressemblants détectés',
      description: 'Le nom de domaine utilise des caractères non latins ou une écriture punycode (ex: xn--...).',
      detail: 'Cette technique vise à vous tromper avec des lettres d\'autres alphabets qui ressemblent visuellement aux lettres de marques connues.',
    });
  }

  // 5. Suspicious TLD (.xyz, .top, etc.)
  const tldMatch = hostname.match(/\.[a-z0-9-]+$/);
  const tld = tldMatch ? tldMatch[0] : '';
  if (SUSPICIOUS_TLDS.some((stld) => hostname.endsWith(stld))) {
    score += 25;
    clues.push({
      id: 'suspicious-tld',
      type: 'warning',
      title: `Extension de domaine à faible réputation (${tld})`,
      description: `Les extensions telles que ${tld} sont très peu chères et massivement exploitées pour des sites éphémères de phishing.`,
    });
  }

  // 6. Subdomain chaining (e.g. wave.sn.connexion-client.xyz)
  const domainParts = hostname.split('.');
  const subdomainCount = Math.max(0, domainParts.length - 2);
  if (subdomainCount >= 3) {
    score += 15;
    clues.push({
      id: 'multiple-subdomains',
      type: 'warning',
      title: 'Empilement complexe de sous-domaines',
      description: `Le lien comporte ${subdomainCount} niveaux de sous-domaines, ce qui est souvent utilisé pour noyer le vrai domaine dans la barre d'adresse sur mobile.`,
    });
  }

  // 7. Impersonated Brand / Typosquatting detection
  let impersonatedBrand: string | undefined;
  for (const [brandKey, brandInfo] of Object.entries(TARGET_BRANDS)) {
    const isExactOfficial = brandInfo.officialDomains.some(
      (dom) => hostname === dom || hostname.endsWith('.' + dom)
    );

    // If the hostname or pathname contains the brand name, but isn't the official domain!
    if (!isExactOfficial) {
      const mentionsBrand =
        hostname.includes(brandKey) ||
        domainParts.some((p) => p.includes(brandKey)) ||
        pathname.includes(brandKey);

      if (mentionsBrand) {
        impersonatedBrand = brandInfo.label;
        score += 45;
        clues.push({
          id: `impersonation-${brandKey}`,
          type: 'danger',
          title: `Tentative d'imitation de la marque : ${brandInfo.label}`,
          description: `Ce lien évoque le nom "${brandKey}", mais n'appartient PAS aux domaines officiels vérifiés (${brandInfo.officialDomains.join(', ')}).`,
          detail: 'C\'est l\'indice le plus caractéristique des faux sites de connexion mobile money et bancaires au Sénégal.',
        });
        break;
      }
    } else {
      clues.push({
        id: `official-${brandKey}`,
        type: 'reassuring',
        title: `Correspond au domaine officiel de : ${brandInfo.label}`,
        description: `Le nom d'hôte (${hostname}) correspond bien au domaine officiel enregistré pour cette marque.`,
      });
    }
  }

  // 8. Sensitive keywords in path or query
  const sensitiveWords = ['otp', 'pin', 'password', 'code', 'token', 'login', 'compte', 'verifier', 'reclamation', 'bonus', 'gain', 'remboursement', 'deblocage', 'frais', 'bourses', 'vote', 'apk'];
  const foundKeywords: string[] = [];
  for (const word of sensitiveWords) {
    if (pathname.includes(word) || search.includes(word)) {
      foundKeywords.push(word);
    }
  }

  if (foundKeywords.length > 0) {
    score += 15;
    clues.push({
      id: 'sensitive-params',
      type: 'info',
      title: `Paramètres sensibles détectés dans l'adresse : [${foundKeywords.join(', ')}]`,
      description: 'L\'adresse pointe vers une page prétendant gérer des accès, des identifiants ou des validations.',
    });
  }

  // 9. Piracy / Malvertising / Illegal Streaming Domain patterns
  const isPiracyOrStreaming = PIRACY_STREAMING_KEYWORDS.some((kw) => hostname.includes(kw));
  if (isPiracyOrStreaming) {
    score += 35;
    clues.push({
      id: 'piracy-streaming-malvertising',
      type: 'danger',
      title: 'Site de streaming illégal ou diffusion non licenciée (Risque de Malvertising)',
      description: `Le domaine évoque un réseau de diffusion pirate ou de téléchargement non vérifié (${hostname}).`,
      detail: 'Ces plateformes financent leur infrastructure via des réseaux publicitaires malveillants (malvertising) : fausses alertes d\'infection mobile, pop-ups de casino et téléchargements d\'APK piégés.',
    });
  }

  // 10. For clean standard domains with 0 risk score, add reassuring clue
  if (score === 0 && !clues.some((c) => c.type === 'reassuring')) {
    clues.push({
      id: 'clean-syntax-structure',
      type: 'reassuring',
      title: 'Structure d\'adresse web saine et standard',
      description: 'Ce nom de domaine utilise une syntaxe conforme, sans caractères trompeurs ni extension à risque.',
      detail: 'Aucune technique de dissimulation de marque (typosquatting) n\'a été détectée dans l\'adresse.',
    });
  }

  // Determine risk level
  let riskLevel: 'faible' | 'suspect' | 'dangereux' | 'indetermine';
  let recommendation: string;
  let whySummary: string;

  if (score >= 40) {
    riskLevel = 'dangereux';
    recommendation = 'NE CLIQUEZ PAS et ne saisissez aucune donnée. Ce lien présente de forts indices de tentative de piratage ou de faux site clone.';
    const dangerTitles = clues.filter((c) => c.type === 'danger').map((c) => c.title);
    whySummary = dangerTitles.length > 0
      ? `Ce lien est classé DANGEREUX car il présente des signaux d'attaque critiques : ${dangerTitles.join(' ; ')}.`
      : 'Ce lien présente de multiples anomalies caractéristiques des sites de cyberescroquerie.';
  } else if (score >= 20) {
    riskLevel = 'suspect';
    recommendation = 'Soyez extrêmement prudent. Des anomalies syntaxiques ou des éléments d\'opacité ont été détectés.';
    const warningTitles = clues.filter((c) => c.type === 'warning').map((c) => c.title);
    whySummary = warningTitles.length > 0
      ? `Ce lien est classé SUSPECT en raison d'anomalies structurelles : ${warningTitles.join(' ; ')}.`
      : 'Ce lien présente des signaux inhabituels nécessitant une vérification approfondie.';
  } else {
    riskLevel = 'faible';
    recommendation = 'Ce site ne présente pas d\'anomalies techniques connues. Vous pouvez y accéder avec les précautions de navigation habituelles.';
    const reassuringTitles = clues.filter((c) => c.type === 'reassuring').map((c) => c.title);
    whySummary = isHttps
      ? `Ce site est considéré comme SÛR : connexion chiffrée HTTPS active, domaine standard et absence d'indicateurs de phishing (${reassuringTitles[0] || 'Structure saine'}).`
      : 'Ce site présente une structure saine, mais sa connexion HTTP non chiffrée impose de ne jamais y entrer de mot de passe.';
  }

  return {
    url: rawUrl,
    riskLevel,
    protocol: parsed.protocol.replace(':', ''),
    isHttps,
    hostname,
    tld,
    subdomainCount,
    isIpAddress,
    isShortener,
    hasPunycodeOrHomoglyphs,
    impersonatedBrand,
    suspiciousKeywordsFound: foundKeywords,
    clues,
    pedagogicalNotes: notes,
    recommendation,
    whySummary,
    engineType: 'local-heuristic',
  };
}
