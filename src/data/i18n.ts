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
