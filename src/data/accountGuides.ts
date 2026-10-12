import type { SecurityGuide } from '../types';

export const INITIAL_ACCOUNT_GUIDES: SecurityGuide[] = [
  {
    id: 'guide-whatsapp',
    service: 'WhatsApp',
    iconName: 'MessageSquare',
    features: ['Vérification en 2 étapes', 'Appareils connectés', 'Verrouillage par empreinte', 'Sauvegardes chiffrées'],
    protectionSteps: [
      {
        title: 'Activer la vérification en deux étapes (PIN obligatoire)',
        instructions: [
          'Ouvrez WhatsApp sur votre smartphone.',
          'Allez dans Paramètres (les 3 points en haut à droite sur Android, ou l\'onglet Réglages sur iPhone).',
          'Appuyez sur Compte > Vérification en deux étapes.',
          'Appuyez sur Activer, puis choisissez un code PIN secret à 6 chiffres difficile à deviner.',
          'Ajoutez impérativement une adresse e-mail de secours : elle vous permettra de récupérer l\'accès si vous oubliez votre code PIN.',
        ],
      },
      {
        title: 'Activer le verrouillage par empreinte digitale ou Face ID',
        instructions: [
          'Allez dans Paramètres > Confidentialité > Verrouillage de l\'application.',
          'Activez l\'option « Déverrouiller avec l\'empreinte digitale » (ou Face ID).',
          'Choisissez le délai : « Immédiatement ». Même si quelqu\'un prend votre téléphone en main, il ne pourra pas lire vos messages.',
        ],
      },
    ],
    howToCheckActiveSessions: [
      'Dans WhatsApp, allez dans Paramètres > Appareils connectés.',
      'Examinez la liste de tous les ordinateurs ou navigateurs web connectés (WhatsApp Web / Desktop).',
      'Si vous apercevez un appareil inconnu ou un lieu suspect, appuyez dessus et sélectionnez « Se déconnecter » immédiatement.',
    ],
    howToSpotImpersonation: [
      'Un contact vous demande un code reçu par SMS : c\'est un pirate.',
      'Un message annonce que votre compte va être suspendu si vous ne cliquez pas sur un lien : WhatsApp officiel ne vous contacte pas de cette manière.',
      'Une personne vous invite dans un groupe de crypto-monnaies ou d\'investissement sans votre accord.',
    ],
    compromiseRecovery: [
      'Désinstallez et réinstallez WhatsApp sur votre téléphone.',
      'Connectez-vous avec votre numéro et validez avec le code SMS à 6 chiffres.',
      'Si un code PIN inconnu est demandé, le pirate a configuré la vérification : attendez le délai légal de 7 jours tout en prévenant vos contacts par appel.',
    ],
    fakeSupportWarning: 'WhatsApp ne dispose d\'aucun compte d\'assistance joignable par appel vocal ordinaire demandant de l\'argent par Wave. Ne communiquez jamais avec un numéro prétendant être le « Support WhatsApp Dakar ».',
    officialHelpUrl: 'https://faq.whatsapp.com/1131652977717250',
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'guide-facebook',
    service: 'Facebook',
    iconName: 'Facebook',
    features: ['Authentification à deux facteurs', 'Alertes de connexion', 'Historique des appareils', 'Clés de sécurité'],
    protectionSteps: [
      {
        title: 'Activer l\'authentification à deux facteurs (2FA)',
        instructions: [
          'Ouvrez Facebook et appuyez sur Menu > Paramètres et confidentialité > Paramètres.',
          'Appuyez sur Espace Comptes (Meta) > Mot de passe et sécurité.',
          'Sélectionnez « Authentification à deux facteurs », choisissez votre compte, puis sélectionnez une application d\'authentification (Google Authenticator) ou par SMS.',
        ],
      },
      {
        title: 'Activer les alertes de connexion non reconnue',
        instructions: [
          'Dans Mot de passe et sécurité, activez les notifications en cas de connexion depuis un appareil ou un navigateur inhabituel.',
        ],
      },
    ],
    howToCheckActiveSessions: [
      'Allez dans Paramètres > Espace Comptes > Mot de passe et sécurité > « Vos connexions » (Où vous êtes connecté).',
      'Inspectez la liste des téléphones, ordinateurs et emplacements géographiques.',
      'Cliquez sur « Tout déconnecter » ou déconnectez les sessions suspectes une par une.',
    ],
    howToSpotImpersonation: [
      'Demande d\'ami reçue d\'un ami que vous avez déjà dans vos contacts (faux profil créé avec ses photos).',
      'Message Messenger d\'un proche prétextant une urgence hospitalière et réclamant un virement Wave.',
    ],
    compromiseRecovery: [
      'Rendez-vous immédiatement sur la page officielle : facebook.com/hacked.',
      'Suivez les instructions en sélectionnant « Quelqu\'un d\'autre a accédé à mon compte sans ma permission ».',
    ],
    fakeSupportWarning: 'Meta n\'a pas de ligne téléphonique au Sénégal pour débloquer les comptes Facebook. Fuyez les faux « dépanneurs informatiques » sur les groupes.',
    officialHelpUrl: 'https://www.facebook.com/hacked',
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'guide-instagram',
    service: 'Instagram',
    iconName: 'Instagram',
    features: ['Double authentification', 'Activité de connexion', 'Comptes restreints', 'Contrôle des abonnés'],
    protectionSteps: [
      {
        title: 'Activer la double authentification',
        instructions: [
          'Ouvrez Instagram, allez sur votre profil puis Menu (3 barres) > Paramètres et confidentialité.',
          'Appuyez sur Espace Comptes > Mot de passe et sécurité > Authentification à deux facteurs.',
          'Choisissez votre compte Instagram et activez la méthode par SMS ou application d\'authentification.',
        ],
      },
      {
        title: 'Mettre à jour l\'adresse e-mail et le numéro de téléphone',
        instructions: [
          'Vérifiez que votre numéro de téléphone et votre e-mail associés au compte sont à jour et accessibles en cas de problème.',
        ],
      },
    ],
    howToCheckActiveSessions: [
      'Dans Paramètres > Espace Comptes > Mot de passe et sécurité > « Vos connexions ».',
      'Vérifiez les appareils connectés et supprimez immédiatement tout accès suspect.',
    ],
    howToSpotImpersonation: [
      'Message privé d\'un contact prétendant que vous avez remporté un concours ou réclamant votre vote pour un projet avec un lien.',
      'Message privé affirmant que votre compte va être fermé pour infraction aux droits d\'auteur.',
    ],
    compromiseRecovery: [
      'Accédez à instagram.com/hacked depuis votre navigateur.',
      'Demandez un lien de connexion ou un code de sécurité envoyé à votre adresse e-mail ou numéro d\'origine.',
    ],
    fakeSupportWarning: 'Instagram ne vous enverra JAMAIS de message direct (DM) pour vous demander votre mot de passe.',
    officialHelpUrl: 'https://www.instagram.com/hacked',
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'guide-tiktok',
    service: 'TikTok',
    iconName: 'Video',
    features: ['Vérification en 2 étapes', 'Appareils gérés', 'Alertes de sécurité'],
    protectionSteps: [
      {
        title: 'Activer la vérification en 2 étapes',
        instructions: [
          'Ouvrez TikTok, allez sur votre Profil > Menu (3 barres) > Paramètres et confidentialité.',
          'Appuyez sur Sécurité > Vérification en 2 étapes.',
          'Sélectionnez au moins deux méthodes de vérification (par exemple : SMS et e-mail, ou mot de passe et application d\'authentification).',
        ],
      },
    ],
    howToCheckActiveSessions: [
      'Allez dans Paramètres et confidentialité > Sécurité > « Vos appareils ».',
      'Vérifiez les téléphones et tablettes connectés et supprimez ceux que vous ne reconnaissez pas.',
    ],
    howToSpotImpersonation: [
      'Faux comptes de boutiques vendant des articles de marque à prix cassés sans adresse physique.',
      'Comptes proposant de multiplier votre argent par Wave en échange d\'abonnements ou de likes.',
    ],
    compromiseRecovery: [
      'Sur l\'écran de connexion, choisissez « Mot de passe oublié ? » et réinitialisez via votre numéro ou votre adresse e-mail.',
      'Si les coordonnées ont été changées, utilisez le formulaire de signalement dans l\'application.',
    ],
    fakeSupportWarning: 'Ne croyez aucun utilisateur dans les commentaires qui prétend « travailler pour TikTok » et pouvoir certifier votre compte ou le débloquer contre de l\'argent.',
    officialHelpUrl: 'https://www.tiktok.com/safety',
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'guide-google-gmail',
    service: 'Compte Google / Gmail',
    iconName: 'Mail',
    features: ['Validation en 2 étapes', 'Checkup de sécurité', 'Mots de passe d\'application', 'Appareils récents'],
    protectionSteps: [
      {
        title: 'Activer la validation en deux étapes sur votre compte Google',
        instructions: [
          'Accédez à myaccount.google.com/security depuis votre navigateur ou votre téléphone.',
          'Dans la section « Se connecter à Google », appuyez sur « Validation en deux étapes » et suivez les instructions.',
          'Ajoutez un numéro de téléphone de récupération fiable et téléchargez les 10 codes de secours à imprimer ou noter sur papier.',
        ],
      },
      {
        title: 'Effectuer le « Check-up Sécurité » complet',
        instructions: [
          'Sur myaccount.google.com, cliquez sur « Vérifier les paramètres de sécurité » pour examiner les applications tierces ayant accès à votre boîte mail.',
        ],
      },
    ],
    howToCheckActiveSessions: [
      'Dans la rubrique Sécurité de votre compte Google, descendez à « Vos appareils » puis cliquez sur « Gérer tous les appareils ».',
      'Déconnectez sans hésiter toute session sur un appareil que vous ne possédez plus.',
    ],
    howToSpotImpersonation: [
      'E-mail menaçant la fermeture de votre compte Gmail sous 24h.',
      'Message prétendant qu\'un virus a été détecté et exigeant l\'installation d\'un logiciel.',
    ],
    compromiseRecovery: [
      'Accédez immédiatement à la page officielle de récupération : accounts.google.com/signin/recovery.',
      'Répondez aux questions d\'authentification en utilisant l\'appareil et la connexion Wifi habituelle.',
    ],
    fakeSupportWarning: 'Google ne fournit aucun service d\'assistance téléphonique payant au Sénégal. N\'appelez jamais les numéros trouvés sur des blogs douteux.',
    officialHelpUrl: 'https://support.google.com/accounts/answer/46526',
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'guide-mobile-money-banque',
    service: 'Mobile Money & Comptes bancaires (Wave, Orange, Banques)',
    iconName: 'CreditCard',
    features: ['Biométrie (Empreinte/Face ID)', 'Plafonds de retrait', 'Code secret fort', 'Notification instantanée'],
    protectionSteps: [
      {
        title: 'Définir un code secret robuste et unique',
        instructions: [
          'N\'utilisez JAMAIS votre année de naissance (ex: 1995, 2000), 1234, 0000 ou les 4 derniers chiffres de votre numéro de téléphone.',
          'Ne partagez jamais ce code secret avec vos enfants, vos proches, vos collègues ou des inconnus.',
        ],
      },
      {
        title: 'Activer l\'accès biométrique (empreinte digitale ou reconnaissance faciale)',
        instructions: [
          'Dans les réglages de votre application Wave ou Orange Money, activez le déverrouillage par empreinte digitale.',
          'Cette mesure empêche toute personne qui emprunte votre téléphone de consulter votre solde ou de lancer un virement.',
        ],
      },
      {
        title: 'Verrouiller votre carte SIM avec un code PIN personnalisé',
        instructions: [
          'Dans les paramètres de votre téléphone, cherchez « Verrouillage de la carte SIM ».',
          'Modifiez le code PIN par défaut (généralement 0000) pour un code personnel connu de vous seul.',
          'Si votre téléphone est volé, la carte SIM sera inutilisable dans un autre téléphone.',
        ],
      },
    ],
    howToCheckActiveSessions: [
      'Wave et Orange Money associent généralement le compte à un seul smartphone principal.',
      'Si vous recevez une notification indiquant qu\'un nouvel appareil tente de se lier à votre compte, refusez immédiatement et contactez le support.',
    ],
    howToSpotImpersonation: [
      'Un interlocuteur vous appelant et prétendant être agent de l\'opérateur qui vous demande votre code secret ou un code reçu par SMS.',
      'Un prétendu coursier vous demandant de taper une commande USSD complexe.',
    ],
    compromiseRecovery: [
      'Pour Orange Money : composez le 1441 sans attendre.',
      'Pour Wave : contactez le support directement dans l\'application ou via leur assistance officielle.',
      'Pour les banques (CBAO, SGBS, Ecobank, BOA, etc.) : contactez le numéro d\'opposition de votre banque.',
    ],
    fakeSupportWarning: 'Aucun conseiller bancaire ni agent mobile money n\'a le droit de connaître votre code PIN. Le code secret ne regarde que vous.',
    officialHelpUrl: 'https://signalementcyber.dgpn.sn/',
    lastVerifiedDate: '2026-10-10',
  },
];
