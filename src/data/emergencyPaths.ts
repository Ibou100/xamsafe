import type { VictimScenario } from '../types';

export const INITIAL_EMERGENCY_PATHS: VictimScenario[] = [
  {
    id: 'envoye-argent-escroc',
    letter: 'A',
    title: 'J\'ai envoyé de l\'argent à un escroc',
    subtitle: 'Transfert effectué vers un numéro mobile money frauduleux ou faux commerçant.',
    reassuringGreeting: 'Respirez calmement. Vous n\'êtes ni la première ni la dernière personne à qui cela arrive. Les escrocs utilisent des techniques de manipulation rodées. Agissons méthodiquement dès maintenant.',
    immediatePriorityActions: [
      'Cessez immédiatement tout contact avec l\'escroc. Ne lui envoyez aucun franc supplémentaire, même s\'il prétend que c\'est pour « débloquer » ou « rembourser » la somme.',
      'Ouvrez immédiatement votre application de transfert ou conservez le SMS de confirmation contenant la référence de la transaction.',
      'Contactez sans délai le service client officiel de votre opérateur mobile money (Wave, Orange Money, Free Money).',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Relever la référence de transaction',
        action: 'Notez le numéro de référence (Ref ID), l\'heure exacte de l\'opération et le numéro du destinataire.',
        details: 'Ces trois informations sont indispensables pour que le support technique de l\'opérateur puisse identifier le flux financier.',
      },
      {
        step: 2,
        title: 'Appeler le support opérateur pour demander le gel du compte récepteur',
        action: 'Expliquez clairement qu\'il s\'agit d\'une transaction frauduleuse et demandez si une procédure de contestation ou de gel conservatoire est possible.',
        details: 'Attention : si l\'escroc a déjà retiré les espèces en kiosque, l\'opérateur ne pourra pas récupérer l\'argent instantanément, mais pourra suspendre le compte du receveur.',
      },
      {
        step: 3,
        title: 'Constituer votre dossier de preuves',
        action: 'Faites des captures d\'écran de la conversation (SMS, WhatsApp, Messenger), du numéro de téléphone de l\'escroc et de la fausse annonce.',
      },
      {
        step: 4,
        title: 'Déposer une plainte officielle',
        action: 'Rendez-vous à la Division Spéciale de Cybersécurité (DSC) ou au commissariat le plus proche avec votre pièce d\'identité et vos preuves imprimées.',
      },
    ],
    evidenceToKeep: [
      'Numéro de référence de la transaction (ex: TX-998829)',
      'Numéro de téléphone complet du destinataire',
      'Heure et date précises du transfert',
      'Captures d\'écran intégrales des échanges écrits',
      'Lien ou capture de l\'annonce frauduleuse',
    ],
    officialChannels: [
      {
        name: 'Support Wave Sénégal (dans l\'app ou numéro gratuit)',
        type: 'phone',
        contact: 'Appel via l\'application Wave ou 200600',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://support.wave.com',
      },
      {
        name: 'Service Client Orange Money Sénégal',
        type: 'phone',
        contact: '1441 (numéro court)',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://www.orange.sn',
      },
      {
        name: 'Division Spéciale de Cybersécurité (Police Nationale)',
        type: 'portal',
        contact: 'Portail officiel de signalement',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Ne croyez aucun message promettant de vous rendre l\'argent contre une nouvelle avance.',
      'Activez les plafonds de transfert et la confirmation biométrique sur votre application.',
    ],
    recoveryScamWarning: 'ATTENTION AUX FAUX RECOUVREMENTS : Des inconnus sur internet prétendent pouvoir « hacker l\'escroc » ou « récupérer vos fonds » contre des frais. C\'est une seconde arnaque qui cible les victimes. Ne leur versez rien.',
  },
  {
    id: 'communique-code-secret-otp',
    letter: 'B',
    title: 'J\'ai communiqué mon code secret ou un code OTP',
    subtitle: 'Vous avez dicté un code PIN ou un code SMS à un faux agent ou sur un faux site.',
    reassuringGreeting: 'Ne paniquez pas, mais agissez dans les secondes qui suivent. La vitesse de votre réaction est essentielle pour empêcher l\'accès au compte.',
    immediatePriorityActions: [
      'Ouvrez immédiatement votre application mobile money et changez immédiatement votre code secret si l\'accès fonctionne encore.',
      'Si l\'accès est déjà verrouillé, appelez immédiatement l\'assistance opérateur pour bloquer votre compte à distance.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Modifier le code secret en priorité',
        action: 'Accédez aux paramètres de sécurité de l\'application et remplacez votre code par un nouveau code imprévisible.',
      },
      {
        step: 2,
        title: 'Contacter l\'opérateur en urgence absolue',
        action: 'Déclarez la compromission de votre code secret pour que l\'opérateur bloque temporairement les sorties de fonds.',
      },
      {
        step: 3,
        title: 'Vérifier l\'historique des transactions récentes',
        action: 'Contrôlez si des transferts frauduleux ont déjà été passés pendant que vous parliez avec l\'escroc.',
      },
      {
        step: 4,
        title: 'Changer les mots de passe associés',
        action: 'Si vous utilisiez le même code pour votre messagerie ou d\'autres applications, modifiez-les sans tarder.',
      },
    ],
    evidenceToKeep: [
      'Numéro de téléphone de l\'appelant imposteur',
      'Heure de l\'appel et SMS officiel reçu contenant le code transmis',
      'Historique des opérations passées pendant l\'incident',
    ],
    officialChannels: [
      {
        name: 'Orange Money Sénégal',
        type: 'phone',
        contact: '1441',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Support Wave Sénégal',
        type: 'phone',
        contact: 'Support intégré dans l\'application Wave',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Division Spéciale de Cybersécurité',
        type: 'portal',
        contact: 'signalementcyber.dgpn.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Ne réutilisez plus jamais le code compromis sur aucun autre service.',
      'Activez la reconnaissance faciale ou digitale pour chaque ouverture d\'application.',
    ],
    recoveryScamWarning: 'Aucun conseiller officiel n\'a le droit de vous demander votre nouveau code pour « vérifier la réinitialisation ». Gardez-le strictement pour vous.',
  },
  {
    id: 'compte-mobile-money-compromis',
    letter: 'C',
    title: 'Mon compte mobile money semble compromis',
    subtitle: 'Transactions inconnues, déconnexion inattendue ou solde diminué sans action de votre part.',
    reassuringGreeting: 'Nous allons sécuriser votre solde et comprendre comment l\'accès s\'est produit.',
    immediatePriorityActions: [
      'Faites suspendre la ligne ou le portefeuille immédiatement auprès de l\'opérateur télécom.',
      'Vérifiez si votre carte SIM est toujours active ou si elle a fait l\'objet d\'un échange de SIM (SIM Swap) non autorisé.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Vérifier le statut du réseau mobile',
        action: 'Si votre téléphone affiche « Aucun service » ou « Carte SIM inactive » soudainement, rendez-vous d\'urgence en agence télécom : il peut s\'agir d\'un SIM swap.',
      },
      {
        step: 2,
        title: 'Demander le relevé détaillé des opérations',
        action: 'Exigez de l\'opérateur l\'historique complet des transactions suspectes avec les identifiants de compte récepteur.',
      },
      {
        step: 3,
        title: 'Déposer plainte officielle',
        action: 'Déposez une plainte à la police avec le relevé pour engager l\'enquête judiciaire.',
      },
    ],
    evidenceToKeep: [
      'Relevé d\'opérations officiel délivré par l\'opérateur',
      'Détail des montants et numéros bénéficiaires',
      'Date et heure de coupure du réseau ou de déconnexion',
    ],
    officialChannels: [
      {
        name: 'Sonatel / Orange Sénégal',
        type: 'phone',
        contact: '1441 ou 33 839 20 20',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Police Cybercrime Sénégal (DGPN)',
        type: 'portal',
        contact: 'signalementcyber.dgpn.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Exigez le blocage de tout nouveau virement vers les numéros suspects identifiés.',
      'Protégez votre carte SIM avec un code PIN personnel personnalisé.',
    ],
    recoveryScamWarning: 'Seules les procédures judiciaires et les réclamations opérateurs permettent un suivi légitime. Rejetez toute proposition de « déblocage magique » sur les réseaux sociaux.',
  },
  {
    id: 'compte-whatsapp-pirate',
    letter: 'D',
    title: 'Mon compte WhatsApp a été piraté',
    subtitle: 'Vous êtes déconnecté de WhatsApp et vos contacts reçoivent des demandes d\'argent.',
    reassuringGreeting: 'C\'est l\'une des attaques les plus courantes au Sénégal. Vos conversations sont généralement chiffrées de bout en bout et vos anciens messages restent sur votre téléphone, mais l\'escroc usurpe votre nom auprès de vos proches. Réagissons vite.',
    immediatePriorityActions: [
      'Prévenez immédiatement vos proches par appel classique, SMS normal ou via les réseaux sociaux pour les avertir que vous êtes piraté et qu\'il ne faut envoyer aucun argent.',
      'Réinstallez WhatsApp ou connectez-vous immédiatement pour demander un nouveau code SMS de connexion.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Tenter de reprendre le contrôle de WhatsApp',
        action: 'Ouvrez WhatsApp sur votre téléphone, saisissez votre numéro de téléphone et validez par le code à 6 chiffres reçu par SMS.',
        details: 'Dès que vous entrez le code correct, le pirate est automatiquement déconnecté de son téléphone.',
      },
      {
        step: 2,
        title: 'Si le pirate a activé un code PIN à 2 étapes',
        action: 'Si WhatsApp vous demande un code PIN que vous ne connaissez pas, le pirate l\'a configuré. Vous devrez attendre 7 jours ouvrés imposés par WhatsApp pour réinitialiser le PIN, mais le pirate est DÉJÀ DÉCONNECTÉ pendant cette période.',
      },
      {
        step: 3,
        title: 'Alerter vos groupes de famille et de travail',
        action: 'Demandez à un proche d\'envoyer un message d\'avertissement dans vos groupes familiaux, religieux et professionnels pour bloquer toute collecte d\'argent.',
      },
      {
        step: 4,
        title: 'Sécuriser avec la vérification en deux étapes',
        action: 'Dès récupération de l\'accès, allez dans Paramètres > Compte > Vérification en deux étapes et définissez un code PIN secret et votre e-mail de secours.',
      },
    ],
    evidenceToKeep: [
      'Captures d\'écran des messages envoyés par le pirate à vos contacts',
      'Numéros de mobile money que le pirate partageait pour réclamer des transferts',
      'Heure de la déconnexion initiale',
    ],
    officialChannels: [
      {
        name: 'Support officiel WhatsApp pour comptes piratés',
        type: 'url',
        contact: 'support@whatsapp.com (sujet: "Compte perdu/volé : veuillez désactiver mon compte +221...")',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://faq.whatsapp.com/1131652977717250',
      },
      {
        name: 'Police Nationale DSC',
        type: 'portal',
        contact: 'signalementcyber.dgpn.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Ne communiquez JAMAIS de code SMS à 6 chiffres à qui que ce soit à l\'avenir.',
      'Vérifiez la liste des appareils connectés dans WhatsApp Web et déconnectez tous les appareils inconnus.',
    ],
    recoveryScamWarning: 'N\'accordez aucune confiance aux prétendus techniciens qui affirment pouvoir réactiver votre compte WhatsApp en 10 minutes contre un paiement Wave. Seule la procédure officielle WhatsApp fonctionne.',
  },
  {
    id: 'compte-reseaux-sociaux-pirate',
    letter: 'E',
    title: 'Mon compte Facebook, Instagram ou TikTok a été piraté',
    subtitle: 'Mot de passe modifié, adresse e-mail changée ou publications malveillantes diffusées en votre nom.',
    reassuringGreeting: 'Ces plateformes disposent d\'outils officiels de récupération d\'urgence et de vérification d\'identité pour restituer les comptes à leurs légitimes propriétaires.',
    immediatePriorityActions: [
      'Vérifiez si vous avez encore accès à la boîte e-mail associée à ce compte.',
      'Utilisez les formulaires d\'assistance dédiés aux comptes piratés de la plateforme concernée.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Vérifier l\'alerte de sécurité dans votre boîte mail',
        action: 'Les plateformes envoient un message quand l\'e-mail est modifié : cliquez sur le lien sécurisé « Ce n\'était pas moi » pour annuler la modification.',
      },
      {
        step: 2,
        title: 'Utiliser la page officielle de compte compromis',
        action: 'Pour Facebook : accédez à facebook.com/hacked. Pour Instagram : instagram.com/hacked. Suivez les étapes de vérification d\'identité.',
      },
      {
        step: 3,
        title: 'Révoquer les sessions actives',
        action: 'Une fois le compte repris, forcez la déconnexion de tous les appareils et activez l\'authentification à deux facteurs.',
      },
    ],
    evidenceToKeep: [
      'E-mails de notification de changement de mot de passe',
      'Captures d\'écran des messages ou vidéos publiés par le pirate',
      'URL exacte de votre profil',
    ],
    officialChannels: [
      {
        name: 'Portail officiel Facebook Hacked',
        type: 'portal',
        contact: 'facebook.com/hacked',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://www.facebook.com/hacked',
      },
      {
        name: 'Portail officiel Instagram Hacked',
        type: 'portal',
        contact: 'instagram.com/hacked',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://www.instagram.com/hacked',
      },
      {
        name: 'Centre de sécurité TikTok',
        type: 'portal',
        contact: 'tiktok.com/safety',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://www.tiktok.com/safety',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Ne réutilisez plus l\'ancien mot de passe.',
      'Sécurisez en priorité votre adresse Gmail ou Yahoo avec la double authentification.',
    ],
    recoveryScamWarning: 'Méfiez-vous des faux experts sur Twitter/X ou Instagram qui promettent de récupérer votre compte : ce sont presque systématiquement de nouveaux pirates.',
  },
  {
    id: 'clique-lien-suspect',
    letter: 'F',
    title: 'J\'ai cliqué sur un lien suspect',
    subtitle: 'Vous avez ouvert une adresse web douteuse reçue par SMS, mail ou message WhatsApp.',
    reassuringGreeting: 'Cliquer sur un lien est stressant, mais dans la majorité des cas sur smartphone, le simple fait d\'ouvrir la page n\'infecte pas instantanément l\'appareil sauf si vous avez téléchargé un fichier ou renseigné des identifiants.',
    immediatePriorityActions: [
      'Fermez immédiatement l\'onglet et le navigateur.',
      'Ne saisissez AUCUNE information (mot de passe, code, numéro de téléphone, carte bancaire) sur cette page.',
      'Si un téléchargement s\'est lancé automatiquement, annulez-le ou supprimez immédiatement le fichier de votre dossier Téléchargements sans l\'ouvrir.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Fermer la page et vider le cache du navigateur',
        action: 'Allez dans les paramètres de votre navigateur (Chrome, Safari) et effacez les données de navigation et cookies récents.',
      },
      {
        step: 2,
        title: 'Évaluer ce que vous avez éventuellement saisi',
        action: 'Si vous avez seulement regardé la page : le risque est faible. Si vous avez tapé un mot de passe ou un code : modifiez-le immédiatement sur le vrai site officiel.',
      },
      {
        step: 3,
        title: 'Vérifier vos applications actives',
        action: 'Consultez la liste de vos applications pour vous assurer qu\'aucun fichier étrange n\'a été installé.',
      },
    ],
    evidenceToKeep: [
      'Adresse URL complète du lien suspect (sans recliquer dessus)',
      'Capture d\'écran du message d\'origine',
      'Date et heure de réception du message avec numéro émetteur',
    ],
    officialChannels: [
      {
        name: 'Outil d\'analyse de lien XamSafe (Vérificateur local)',
        type: 'portal',
        contact: 'xamsafe.sn/verifier-url',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Direction de la Sécurité des Systèmes d\'Information (STCC-SSI)',
        type: 'portal',
        contact: 'stcc-ssi.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://stcc-ssi.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Activez la navigation sécurisée renforcée dans les paramètres de votre navigateur.',
      'Ne cliquez plus sur les liens de livraison ou de récompense reçus par SMS.',
    ],
    recoveryScamWarning: 'Ne téléchargez pas de prétendus "antivirus de nettoyage" proposés par des pop-ups qui prétendent que votre téléphone est infecté.',
  },
  {
    id: 'installe-application-suspecte-apk',
    letter: 'G',
    title: 'J\'ai installé une application suspecte ou un fichier APK',
    subtitle: 'Faux WhatsApp modifié, application de gains en ligne ou fichier téléchargé hors store officiel.',
    reassuringGreeting: 'Nous devons désactiver et désinstaller l\'application avant qu\'elle ne collecte davantage de données sensibles.',
    immediatePriorityActions: [
      'Activez immédiatement le mode Avion pour couper internet (Wifi et données mobiles) et stopper la fuite de données vers le serveur du pirate.',
      'Accédez aux paramètres de votre téléphone pour désinstaller l\'application malveillante.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Passer le téléphone en mode Avion',
        action: 'Empêchez l\'application d\'envoyer vos SMS ou d\'exécuter des requêtes à distance.',
      },
      {
        step: 2,
        title: 'Retirer les autorisations d\'accessibilité et d\'administration',
        action: 'Allez dans Paramètres > Sécurité > Administrateurs de l\'appareil (ou Accessibilité) et désactivez l\'application suspecte.',
      },
      {
        step: 3,
        title: 'Désinstaller l\'application',
        action: 'Dans Paramètres > Applications, sélectionnez l\'application suspecte et choisissez "Désinstaller". Supprimez aussi le fichier .apk du dossier Téléchargements.',
      },
      {
        step: 4,
        title: 'Vérifier les comptes bancaires et changer les mots de passe',
        action: 'Depuis un autre appareil sécurisé, changez les mots de passe de vos comptes clés.',
      },
    ],
    evidenceToKeep: [
      'Nom de l\'application et fichier .apk d\'origine',
      'Source où vous avez obtenu le lien de téléchargement',
      'Captures d\'écran des messages ou contacts ayant transmis l\'application',
    ],
    officialChannels: [
      {
        name: 'Centre d\'assistance Google Play Protect',
        type: 'url',
        contact: 'support.google.com/googleplay',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Police Cybercrime Sénégal (DGPN)',
        type: 'portal',
        contact: 'signalementcyber.dgpn.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Désactivez l\'option « Autoriser l\'installation d\'applications de sources inconnues » sur Android.',
      'Téléchargez uniquement vos applications depuis le Google Play Store ou l\'Apple App Store.',
    ],
    recoveryScamWarning: 'Si l\'application résiste à la désinstallation, effectuez une réinitialisation aux paramètres d\'usine de votre téléphone après avoir sauvegardé vos photos et contacts.',
  },
  {
    id: 'telephone-vole',
    letter: 'H',
    title: 'Mon téléphone a été volé',
    subtitle: 'Votre appareil contient vos applications mobiles, vos SMS et vos comptes bancaires.',
    reassuringGreeting: 'Agissons immédiatement sur les accès distants pour protéger votre argent avant que les voleurs ne contournent le verrouillage de l\'écran.',
    immediatePriorityActions: [
      'Appelez immédiatement vos opérateurs télécoms et mobile money depuis un autre téléphone pour suspendre la carte SIM et les portefeuilles.',
      'Verrouillez ou effacez l\'appareil à distance via Localiser mon appareil (Google) ou Localiser mon iPhone (Apple).',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Bloquer la carte SIM auprès de votre opérateur',
        action: 'Empêchez l\'interception de vos SMS de sécurité ou codes OTP par le voleur.',
      },
      {
        step: 2,
        title: 'Faire suspendre les comptes Wave, Orange Money et bancaires',
        action: 'Contactez les services clients pour figer les comptes rattachés au numéro.',
      },
      {
        step: 3,
        title: 'Effacer l\'appareil à distance',
        action: 'Connectez-vous sur android.com/find ou icloud.com/find pour effacer les données de votre smartphone.',
      },
      {
        step: 4,
        title: 'Déclarer le vol à la police avec le numéro IMEI',
        action: 'Rendez-vous au commissariat avec votre numéro IMEI (15 chiffres figurant sur la boîte d\'origine ou la facture) pour faire blacklister l\'appareil.',
      },
    ],
    evidenceToKeep: [
      'Numéro IMEI du téléphone volé',
      'Facture d\'achat de l\'appareil',
      'Date, heure et lieu précis du vol',
    ],
    officialChannels: [
      {
        name: 'Service Client Orange (blocage SIM)',
        type: 'phone',
        contact: '1441 ou 33 839 20 20',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Support Wave Sénégal (suspension compte)',
        type: 'phone',
        contact: 'Via un autre téléphone au numéro support',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Commissariat de Police ou Brigade de Gendarmerie',
        type: 'portal',
        contact: 'Commissariat le plus proche de votre quartier',
        verifiedDate: '2026-10-10',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Une fois une nouvelle SIM obtenue, configurez un code PIN de SIM personnalisé.',
      'Activez un code de déverrouillage fort (au moins 6 chiffres) sur votre nouvel appareil.',
    ],
    recoveryScamWarning: 'Si vous recevez un SMS quelques jours plus tard affirmant « Votre iPhone a été retrouvé, connectez-vous sur ce lien pour voir sa position », NE CLIQUEZ PAS : c\'est le voleur qui tente d\'obtenir votre mot de passe iCloud.',
  },
  {
    id: 'communique-coordonnees-bancaires',
    letter: 'I',
    title: 'J\'ai communiqué mes coordonnées bancaires',
    subtitle: 'Numéro de carte bancaire, date d\'expiration, CVV (3 chiffres au dos) ou identifiant bancaire en ligne saisis sur un site suspect.',
    reassuringGreeting: 'Faisons opposition sans attendre pour bloquer toute transaction débitrice.',
    immediatePriorityActions: [
      'Faites opposition immédiatement sur votre carte bancaire en appelant le centre d\'opposition de votre banque.',
      'Bloquez l\'accès à votre application bancaire si vous avez transmis vos identifiants de connexion.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Appeler le numéro d\'opposition de votre banque',
        action: 'Le numéro d\'opposition est ouvert 24h/24. Demandez le blocage immédiat de la carte.',
      },
      {
        step: 2,
        title: 'Changer le mot de passe de l\'espace client banque',
        action: 'Depuis un ordinateur sécurisé, réinitialisez vos accès d\'e-banking.',
      },
      {
        step: 3,
        title: 'Surveiller les relevés de compte et contester',
        action: 'Si des débits non autorisés apparaissent, contestez-les formellement par écrit auprès de votre agence.',
      },
    ],
    evidenceToKeep: [
      'Numéro de la carte mise en opposition',
      'Date et heure de l\'appel d\'opposition',
      'URL du site suspect où les données ont été saisies',
    ],
    officialChannels: [
      {
        name: 'Numéro d\'opposition carte de votre établissement bancaire',
        type: 'phone',
        contact: 'Numéro inscrit au dos de votre carte ou sur vos relevés',
        verifiedDate: '2026-10-10',
      },
      {
        name: 'Division Spéciale de Cybersécurité',
        type: 'portal',
        contact: 'signalementcyber.dgpn.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Ne saisissez jamais votre carte sur des sites ne proposant pas la validation 3D-Secure (SMS de confirmation).',
      'Désactivez les paiements internet sur votre carte si vous ne les utilisez pas souvent.',
    ],
    recoveryScamWarning: 'Votre banquier ne vous demandera jamais votre code confidentiel à 4 chiffres ou le code CVV par téléphone pour annuler une transaction.',
  },
  {
    id: 'fausse-offre-emploi-investissement',
    letter: 'J',
    title: 'J\'ai été victime d\'une fausse offre d\'emploi ou investissement',
    subtitle: 'Frais de dossier payés pour un faux recrutement, ou fonds bloqués dans une plateforme de trading/tontine pyramidale.',
    reassuringGreeting: 'Ces réseaux criminels exploitent l\'espoir légitime d\'un emploi ou d\'une vie meilleure. Vous n\'avez pas à avoir honte. Protégez votre identité et stoppez l\'hémorragie financière.',
    immediatePriorityActions: [
      'Arrêtez immédiatement tout versement. Ne payez AUCUNE « taxe de déblocage », « frais de douane » ou « frais d\'huissier » supplémentaires.',
      'Si vous avez envoyé une copie de votre CNI ou passeport, signalez-le pour vous protéger d\'une usurpation future.',
    ],
    numberedSteps: [
      {
        step: 1,
        title: 'Couper tout contact avec les recruteurs ou faux traders',
        action: 'Les escrocs vont insister en vous faisant miroiter que vos fonds sont presque débloqués : refusez fermement et bloquez-les.',
      },
      {
        step: 2,
        title: 'Archiver les preuves numériques',
        action: 'Sauvegardez l\'offre d\'emploi originale, les contrats falsifiés, les adresses e-mails utilisées et les numéros Wave/Orange ayant reçu vos paiements.',
      },
      {
        step: 3,
        title: 'Déclarer l\'escroquerie aux autorités',
        action: 'Déposez une plainte auprès de la DSC et avertissez la plateforme où l\'offre était hébergée (LinkedIn, Facebook, WhatsApp).',
      },
    ],
    evidenceToKeep: [
      'Contrats ou lettres d\'embauche frauduleuses',
      'Reçus de paiement Wave ou Orange Money',
      'Copies d\'écran des annonces et conversations',
    ],
    officialChannels: [
      {
        name: 'Division Spéciale de Cybersécurité (DSC)',
        type: 'portal',
        contact: 'signalementcyber.dgpn.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://signalementcyber.dgpn.sn/',
      },
      {
        name: 'Commission de Protection des Données Personnelles (CDP)',
        type: 'portal',
        contact: 'cdp.sn',
        verifiedDate: '2026-10-10',
        officialUrl: 'https://www.cdp.sn',
      },
    ],
    stepsToPreventFurtherLoss: [
      'Retenez qu\'un travailleur ne paie jamais pour travailler.',
      'Ne souscrivez jamais à des investissements garantissant des rendements anormaux.',
    ],
    recoveryScamWarning: 'Des escrocs se feront passer pour des "avocats internationaux" promettant de récupérer vos fonds perdus dans la plateforme de trading contre des honoraires d\'avance : c\'est un piège de sur-escroquerie.',
  },
];
