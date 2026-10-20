export type Language = 'fr' | 'wo';

export interface Translations {
  nav: {
    home: string;
    scams: string;
    analyzeMessage: string;
    checkUrl: string;
    victim: string;
    secureAccounts: string;
    simulator: string;
    quiz: string;
    resources: string;
    about: string;
    privacy: string;
    admin: string;
  };
  common: {
    emergencyBtn: string;
    analyzeBtn: string;
    learnBtn: string;
    noAccountNeeded: string;
    independentPlatform: string;
    backHome: string;
    readMore: string;
    shareAdvice: string;
    riskLow: string;
    riskMedium: string;
    riskHigh: string;
    riskUndetermined: string;
    disclaimerTitle: string;
    disclaimerText: string;
    verified: string;
    stepsCount: string;
    fictionalExamplePrefix: string;
    seeAllScams: string;
    pedagogicalLibrary: string;
    urgentBannerBadge: string;
    proofMobile: string;
    proofLocal: string;
    proofInstant: string;
    toolsSectionTitle: string;
    toolsSectionSubtitle: string;
    tool1Title: string;
    tool1Desc: string;
    tool1Btn: string;
    tool2Title: string;
    tool2Desc: string;
    tool2Btn: string;
    tool3Title: string;
    tool3Desc: string;
    tool3Btn: string;
    ethicsBadge: string;
    ethicsTitle: string;
    ethicsIntro: string;
    ethicsPoint1: string;
    ethicsPoint2: string;
    ethicsPoint3: string;
    policeTitle: string;
    policeDesc: string;
    policeBtn: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    commonScamsTitle: string;
    commonScamsSubtitle: string;
    lostMoneyTitle: string;
    lostMoneyText: string;
    lostMoneyBtn: string;
    whyXamSafeTitle: string;
    whyXamSafeSubtitle: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  fr: {
    nav: {
      home: 'Accueil',
      scams: 'Comprendre les arnaques',
      analyzeMessage: 'Analyser un message',
      checkUrl: 'Vérifier une URL',
      victim: '🚨 Je suis victime',
      secureAccounts: 'Sécuriser mes comptes',
      simulator: 'Simulateur',
      quiz: 'Quiz',
      resources: 'Ressources officielles',
      about: 'À propos',
      privacy: 'Confidentialité',
      admin: 'Administration',
    },
    common: {
      emergencyBtn: 'Je suis victime',
      analyzeBtn: 'Analyser un message',
      learnBtn: 'Apprendre à reconnaître',
      noAccountNeeded: '100% gratuit • Sans inscription • Aucun compte requis',
      independentPlatform: 'Plateforme citoyenne indépendante de prévention numérique pour le Sénégal',
      backHome: 'Retour à l\'accueil',
      readMore: 'Lire la fiche complète',
      shareAdvice: 'Partager ce conseil',
      riskLow: 'Risque estimé faible',
      riskMedium: 'Risque modéré / vigilance requise',
      riskHigh: 'Risque élevé / Arnaque très probable',
      riskUndetermined: 'Indéterminé : prudence requise',
      disclaimerTitle: 'Avertissement d\'indépendance',
      disclaimerText: 'XamSafe est une initiative citoyenne et pédagogique bénévole. La plateforme n\'est affiliée ni à la Police Nationale, ni aux opérateurs télécoms, ni aux banques.',
      verified: 'Vérifié',
      stepsCount: 'étapes',
      fictionalExamplePrefix: 'Exemple fictif',
      seeAllScams: 'Voir les 15 fiches détaillées',
      pedagogicalLibrary: 'Bibliothèque pédagogique',
      urgentBannerBadge: 'Priorité absolue • Urgence',
      proofMobile: 'Orange Money & Wave',
      proofLocal: 'Traitement local confidentiel',
      proofInstant: 'Résultats instantanés',
      toolsSectionTitle: 'Agir, tester et s\'entraîner sans aucun compte',
      toolsSectionSubtitle: 'Des outils interactifs conçus pour être simples d\'accès sur tout téléphone.',
      tool1Title: 'Analyseur de message suspect',
      tool1Desc: 'Collez un SMS ou un message WhatsApp. Notre moteur heuristique local détecte les demandes de code secret, la fausse urgence et les indices suspects sans envoyer vos données sur un serveur.',
      tool1Btn: 'Analyser un message',
      tool2Title: 'Simulateur de phishing interactif',
      tool2Desc: 'Entraînez-vous sur 6 scénarios réels (faux SMS Wave, faux gain Sonatel, faux recrutement ONU). Repérez les pièges en conditions réelles sans aucun danger.',
      tool2Btn: 'Lancer une simulation',
      tool3Title: 'Quiz de cybersécurité (30 questions)',
      tool3Desc: 'Testez vos réflexes sur le mobile money, WhatsApp, les faux transferts et les mots de passe. Correction immédiate et explications pédagogiques sans inscription.',
      tool3Btn: 'Commencer le quiz',
      ethicsBadge: 'Engagement citoyen',
      ethicsTitle: 'Une plateforme 100% libre, transparente et respectueuse de vos données',
      ethicsIntro: 'XamSafe a été développée comme un bien public numérique. Nous appliquons le principe fondamental de minimisation des données :',
      ethicsPoint1: 'Aucun compte utilisateur requis pour utiliser l\'intégralité du site.',
      ethicsPoint2: 'Aucun stockage serveur de vos messages ou adresses analysés.',
      ethicsPoint3: 'Aucune affiliation commerciale avec les opérateurs ou les banques.',
      policeTitle: 'Canaux officiels de signalement judiciaire',
      policeDesc: 'Si vous êtes victime d\'une infraction pénale, XamSafe vous guide pour réunir vos preuves, mais la plainte doit être déposée directement sur la plateforme officielle de la Police Nationale du Sénégal :',
      policeBtn: 'Accéder à signalementcyber.dgpn.sn',
    },
    home: {
      heroTitle: 'Une arnaque peut te coûter ton argent. Apprends à la reconnaître avant qu\'il ne soit trop tard.',
      heroSubtitle: 'Comprends les techniques des escrocs, vérifie les indices suspects et découvre les bons réflexes pour protéger ton argent et tes comptes. Gratuitement, sans inscription.',
      commonScamsTitle: 'Les arnaques les plus fréquentes au Sénégal',
      commonScamsSubtitle: 'Découvre les méthodes courantes des escrocs sur Wave, Orange Money, WhatsApp et les réseaux sociaux.',
      lostMoneyTitle: 'Tu as déjà envoyé de l\'argent ou donné ton code ?',
      lostMoneyText: 'Chaque minute compte. Suis notre guide d\'urgence pour stopper l\'hémorragie, joindre les opérateurs officiels et réunir tes preuves.',
      lostMoneyBtn: 'Ouvrir les démarches d\'urgence',
      whyXamSafeTitle: 'Pourquoi XamSafe protège réellement les citoyens ?',
      whyXamSafeSubtitle: 'Une conception éthique pensée pour le quotidien de chacun.',
    },
  },
  wo: {
    nav: {
      home: 'Dalal jàmm',
      scams: 'Xam nàcc-nàcc yi',
      analyzeMessage: 'Saytu bataaxal',
      checkUrl: 'Saytu lient web',
      victim: '🚨 Danu ma nàcc',
      secureAccounts: 'Aar samay kont',
      simulator: 'Tàggatu ci nàcc',
      quiz: 'Laaj ak tontu',
      resources: 'Këri nguur gi',
      about: 'Li jëm ci XamSafe',
      privacy: 'Sutura ak sàrt',
      admin: 'Saytukatt',
    },
    common: {
      emergencyBtn: 'Danu ma nàcc',
      analyzeBtn: 'Saytu bataaxal',
      learnBtn: 'Xam ni ngay moytoo',
      noAccountNeeded: 'Feyuloo dara • Bindu fi • Laajul am kont',
      independentPlatform: 'Platformu askan wi ngir kaaraange ci xarala yees ci Senegaal',
      backHome: 'Dellu ci dalal jàmm',
      readMore: 'Gën cee xam',
      shareAdvice: 'Seddoo digal bi',
      riskLow: 'Musiiba bi néew na',
      riskMedium: 'Moytul / teyyeel sa bopp',
      riskHigh: 'Musiiba mu mag / nàcc la',
      riskUndetermined: 'Xamuñu ko bu baax : moytul',
      disclaimerTitle: 'Kàddug kaaraange',
      disclaimerText: 'XamSafe jëf la bu askan wi joxe ngir jàngale. Bokkul ak Polis, opaarater yi wala bàng yi.',
      verified: 'Saytu nañu ko',
      stepsCount: 'matukaay',
      fictionalExamplePrefix: 'Misaal bu ñu sàkku',
      seeAllScams: 'Xool 15 këyit yépp',
      pedagogicalLibrary: 'Kër gi ñuy jànge',
      urgentBannerBadge: 'Liggéey bu sàss • Gaawte',
      proofMobile: 'Orange Money & Wave',
      proofLocal: 'Saytu bu sutura ci telefon bi',
      proofInstant: 'Leeral yu gaaw ci sàss',
      toolsSectionTitle: 'Saytu, seet ak tàggatu te laajul benn kont',
      toolsSectionSubtitle: 'Xarala yu gaaw yoo xamne mën nga koo jëfandikoo ci telefon yépp.',
      tool1Title: 'Saytukat bataaxal bu dul leer',
      tool1Desc: 'Dugalal fi SMS walla bataaxal WhatsApp. XamSafe dina saytu bu dee amna naxate te dula laaj say mbóot.',
      tool1Btn: 'Saytu bataaxal',
      tool2Title: 'Tàggatukaayu nàcc-nàcc',
      tool2Desc: 'Tàggatul ci 6 misaal yu dëggu (SMS Wave bu naxate, kado Sonatel bu amul). Xamal pexe yi te doo gaañu.',
      tool2Btn: 'Dóor tàggatu bi',
      tool3Title: 'Laaj ak tontu ci kaaraange (30 laaj)',
      tool3Desc: 'Xoolal sa xam-xam ci Wave, Orange, WhatsApp ak kod yi. Tontu yi ci sàss lañu lay leeral.',
      tool3Btn: 'Dóor laaj yi',
      ethicsBadge: 'Sàrtu askan wi',
      ethicsTitle: 'Platform bu feyuloo dara, leer nàññ te tëyeel sa sutura',
      ethicsIntro: 'XamSafe defar nañu ko ngir askan wi yépp. Kenn du denc say mbóot :',
      ethicsPoint1: 'Kenn dula laaj kont ngir nga jëfandikoo ko.',
      ethicsPoint2: 'Dunu denc say bataaxal ci benn ordinaatër.',
      ethicsPoint3: 'Bokkunu ak opaarater yi walla bàng yi.',
      policeTitle: 'Këru yoon ngir yégle nàcc',
      policeDesc: 'Su dee dañu la nàcc, XamSafe dina la dimbali nga dajale say firnde, waaye yoon ci Polis lañu koy yóbbu :',
      policeBtn: 'Dem ci signalementcyber.dgpn.sn',
    },
    home: {
      heroTitle: 'Nàcc-nàcc mën na la gaañ ci sa xaalis. Xamal ko bala muy yéex.',
      heroSubtitle: 'Xam pexey sàcc yi, saytu maandargay nàcc te gën a kaaraangel sa xaalis ak say kont. Ci am kóllëre, te bindu ciy kont.',
      commonScamsTitle: 'Nàcc-nàcc yi gën a bari ci Senegaal',
      commonScamsSubtitle: 'Jàngal pexey sàcc yi ci Wave, Orange Money, WhatsApp ak rézo sosiyeux.',
      lostMoneyTitle: 'Yonnée nga xaalis wala joxe nga sa kod ?',
      lostMoneyText: 'Waxtu wi dafa am solo. Toppal leeral yi ci sàss ngir tëj kont bi te jooŋge ak këri liggéeyukaay yi.',
      lostMoneyBtn: 'Ubbil ndimbalu sàss bi',
      whyXamSafeTitle: 'Lu tax XamSafe mën na aar askan wi ?',
      whyXamSafeSubtitle: 'Ndef la mu ñu defar ngir jëfandikukat yépp ci Senegaal.',
    },
  },
};
