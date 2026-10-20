import type { ScamCard } from '../types';

export const INITIAL_SCAMS: ScamCard[] = [
  {
    id: 'faux-agent-mobile-money',
    title: 'Faux agent Wave ou Orange Money (Appel de déblocage)',
    category: 'mobile-money',
    summary: 'Un escroc vous appelle en se faisant passer pour un employé du service client officiel afin de vous faire valider une opération ou révéler votre code secret.',
    fictionalExample: {
      sender: '+221 77 000 00 01 (Fictif - se présente comme "Service Contrôle")',
      channel: 'Appel',
      text: '« Bonjour Monsieur, ici le service technique Wave/Orange Money. Une anomalie de sécurité a été détectée sur votre compte. Pour éviter un blocage définitif de votre solde sous 15 minutes, veuillez me dicter le code à 4 chiffres que vous venez de recevoir par SMS. »',
    },
    stepByStep: [
      'L\'escroc vous contacte par appel normal ou WhatsApp avec une voix posée ou autoritaire.',
      'Il prétend qu\'un problème technique, une mise à niveau obligatoire ou une tentative de piratage menace votre argent.',
      'Il déclenche en parallèle une réinitialisation de votre compte sur son propre téléphone.',
      'Un SMS officiel contenant un code de validation arrive sur votre téléphone.',
      'Il vous met la pression pour que vous lui lisiez ce code immédiatement.',
      'Dès réception du code, il prend le contrôle de votre compte et vide votre solde.',
    ],
    psychologicalTactics: [
      'Peur de perdre son argent ou de voir son compte bloqué.',
      'Usurpation d\'autorité (se faire passer pour un agent technique officiel).',
      'Urgence artificielle (exigence de régler le problème en quelques minutes).',
    ],
    alertSigns: [
      'L\'appel provient d\'un numéro mobile classique (77, 78, 76, 70) et non du numéro court officiel de l\'opérateur.',
      'La personne demande votre code secret, votre code OTP reçu par SMS ou votre code PIN.',
      'Elle refuse que vous rappeliez vous-même le service client.',
    ],
    attackerGoal: 'Obtenir votre code de vérification SMS (OTP) ou votre code secret pour se connecter à votre compte et transférer votre argent.',
    mistakesToAvoid: [
      'Ne jamais lire à haute voix un code reçu par SMS à qui que ce soit.',
      'Ne jamais croire qu\'un agent officiel a besoin de votre code pour régler un problème technique.',
      'Ne pas céder à la panique si la personne vous menace de bloquer votre ligne.',
    ],
    howToProtect: [
      'Règle d\'or absolue : aucun opérateur (Wave, Orange, Free) ne vous demandera JAMAIS votre code secret ou OTP.',
      'Raccrochez immédiatement et contactez vous-même le numéro officiel (ex: 1441 pour Orange, support dans l\'application pour Wave).',
      'Activez la protection biométrique (empreinte digitale) sur vos applications de paiement.',
    ],
    emergencyAction: [
      'Ouvrez immédiatement votre application officielle et tentez de changer votre code secret.',
      'Si vous n\'avez plus accès, appelez sur-le-champ le service client officiel de l\'opérateur pour faire bloquer le compte temporairement.',
      'Conservez le numéro appelant et l\'heure de l\'appel.',
      'Déposez une plainte auprès de la Division Spéciale de Cybersécurité (DSC) de la Police Nationale du Sénégal.',
    ],
    reliableSources: [
      { name: 'Conseils officiels Wave Sénégal', url: 'https://support.wave.com' },
      { name: 'Sécurité Orange Money Sénégal', url: 'https://www.orange.sn' },
      { name: 'Division Spéciale de Cybersécurité (DGPN)', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
    wolofTranslation: {
      title: 'Ay sàcc yu naan « liggéeyukatu Wave / Orange Money lañu » (Woote ngir dindi tëj)',
      summary: 'Nit day woo la naan liggéeyukatu Wave walla Orange la, ngir nax la ba nga jox ko sa kod walla nga dindi kaaraangey sa kont.',
      categoryLabel: 'Xaalis ci telefon',
      exampleChannel: 'Woote',
      exampleText: '« Salam waay, service technique Wave/Orange lañu. Sa kont amna jafe-jafe. Bala 15 simili ñu tëj ko, wax ma kod 4 lim bi la ñëw ci SMS. »',
    },
  },
  {
    id: 'faux-sms-virement-recu',
    title: 'Faux SMS de virement d\'argent reçu (« Erreur de transfert »)',
    category: 'sms',
    summary: 'Vous recevez un SMS imitant une notification de dépôt d\'argent, suivi d\'un appel suppliant de renvoyer la somme soi-disant envoyée par erreur.',
    fictionalExample: {
      sender: '+221 78 000 00 02 (Numéro d\'un particulier)',
      channel: 'SMS',
      text: '« Transfert reçu de 50.000 FCFA de Amadou D. Nouveau solde: 52.450 FCFA. Ref: TX99823489. » suivi d\'un appel: « Salam mon frère, je me suis trompé de numéro en envoyant la dépense quotidienne de ma mère à l\'hôpital, s\'il te plaît renvoie-moi les 50.000 F ! »',
    },
    stepByStep: [
      'L\'escroc rédige lui-même un faux SMS imitant la typographie et les mentions d\'un opérateur mobile money.',
      'Le SMS arrive depuis un numéro ordinaire de téléphone mobile et non depuis l\'émetteur officiel ("Wave" ou "OrangeMoney").',
      'Quelques secondes plus tard, l\'escroc vous appelle avec une voix angoissée ou larmoyante.',
      'Il prétend une urgence vitale (médicaments, ordonnance, frais de scolarité).',
      'Si la victime vérifie son compte sans regarder son solde réel dans l\'application, elle renvoie son propre argent.',
    ],
    psychologicalTactics: [
      'Appel à l\'empathie et à la solidarité religieuse ou familiale (Soutoura, Teranga).',
      'Sentiment de culpabilité si l\'on refuse d\'aider quelqu\'un en détresse.',
      'Confusion entretenue entre le faux SMS et une notification réelle du système.',
    ],
    alertSigns: [
      'Le SMS provient d\'un numéro mobile personnel (+221 7x...) au lieu du nom de l\'expéditeur officiel de l\'opérateur.',
      'Votre solde réel DANS L\'APPLICATION mobile money n\'a pas augmenté.',
      'La personne insiste pour que vous fassiez le transfert retour directement plutôt que de passer par la fonction d\'annulation de l\'opérateur.',
    ],
    attackerGoal: 'Vous soutirer votre propre argent en vous faisant croire que vous ne faites que restituer un virement reçu.',
    mistakesToAvoid: [
      'Ne jamais faire confiance à un SMS reçu sans ouvrir son application officielle.',
      'Ne jamais renvoyer d\'argent de votre propre initiative après un appel téléphonique inconnu.',
    ],
    howToProtect: [
      'Ouvrez toujours votre application officielle pour vérifier si votre solde a réellement augmenté et si l\'historique affiche la transaction.',
      'Dites à l\'appelant : « Si vous avez fait une erreur, contactez le service client de l\'opérateur, c\'est eux qui gèrent les réclamations d\'annulation officielle ».',
      'Ne transférez rien vous-même.',
    ],
    emergencyAction: [
      'Si vous avez déjà envoyé l\'argent, notez la référence de transaction générée.',
      'Contactez immédiatement le support de votre opérateur pour signaler une transaction frauduleuse.',
      'Faites une capture d\'écran du faux SMS et notez le numéro de l\'arnaqueur.',
    ],
    reliableSources: [
      { name: 'Police Nationale du Sénégal (DSC)', url: 'https://signalementcyber.dgpn.sn/' },
      { name: 'Guide sécurité consommateurs ARTP', url: 'https://www.artp.sn' },
    ],
    lastVerifiedDate: '2026-10-10',
    wolofTranslation: {
      title: 'SMS naxate naan « xaalis dugal nañu ko » (Njuumte ci transfert)',
      summary: 'Dañu lay yonnee SMS bu ni mel ni Wave/Orange la, ba noppi woo la naan juum nañu ci yaw, ñaan la nga delloo leen xaalis bi nga xamne sax dugul.',
      categoryLabel: 'Bataaxal SMS',
      exampleChannel: 'SMS',
      exampleText: '« Dugal nañu 50.000 FCFA ci Amadou D. Solde bu bees: 52.450 FCFA... » Ba noppi nit woo la di jooy naan : « Salam, juum naa delloo ma sama xaalis ! »',
    },
  },
  {
    id: 'piratage-whatsapp-code-6-chiffres',
    title: 'Vol de compte WhatsApp par détournement de code de validation',
    category: 'whatsapp',
    summary: 'Un de vos contacts WhatsApp (dont le compte a déjà été piraté) vous demande de lui renvoyer un code à 6 chiffres qu\'il prétend avoir envoyé chez vous par erreur.',
    fictionalExample: {
      sender: 'Compte de votre ami ou oncle (piraté)',
      channel: 'WhatsApp',
      text: '« Salam ! J\'ai un problème pour accéder à mon compte, j\'ai fait une fausse manipulation et mon code de secours a été envoyé par SMS sur ton numéro. Peux-tu me transférer les 6 chiffres s\'il te plaît ? C\'est très urgent ! »',
    },
    stepByStep: [
      'L\'escroc a déjà pris le contrôle du compte WhatsApp d\'un de vos proches.',
      'Il installe WhatsApp sur son téléphone en entrant VOTRE numéro de téléphone.',
      'WhatsApp envoie alors un SMS officiel de vérification sur VOTRE téléphone : « WhatsApp code 123-456. Ne partagez ce code avec personne ».',
      'L\'escroc, sous l\'identité de votre proche, vous demande ce code par message WhatsApp.',
      'Si vous lui donnez ce code, votre compte WhatsApp est immédiatement déconnecté et transféré sur le téléphone de l\'escroc.',
      'L\'escroc contacte ensuite tous vos contacts et vos groupes de famille pour leur demander de l\'argent en votre nom.',
    ],
    psychologicalTactics: [
      'Confiance aveugle accordée à un proche connu (famille, ami, collègue, responsable religieux).',
      'Demande formulée comme un petit service technique anodin.',
      'Urgence pour éviter que vous ne preniez le temps de téléphoner au proche.',
    ],
    alertSigns: [
      'Un message WhatsApp vous demande un code reçu par SMS.',
      'Le SMS que vous recevez indique expressément : « Ne partagez ce code avec personne ».',
      'Le style d\'écriture du contact semble inhabituel ou trop insistant.',
    ],
    attackerGoal: 'Prendre le contrôle total de votre compte WhatsApp pour escroquer vos contacts, vos groupes tontines ou vos proches.',
    mistakesToAvoid: [
      'Ne jamais partager un code de validation SMS, même si la demande semble provenir de votre propre mère ou de votre meilleur ami.',
      'Ne pas croire qu\'un code WhatsApp peut atterrir "par erreur" sur le téléphone de quelqu\'un d\'autre.',
    ],
    howToProtect: [
      'Activez impérativement la vérification en deux étapes dans WhatsApp (Paramètres > Compte > Vérification en deux étapes) avec un code PIN à 6 chiffres connu de vous seul.',
      'Si un proche vous demande un code, appelez-le immédiatement par appel vocal classique pour vérifier.',
    ],
    emergencyAction: [
      'Réinstallez WhatsApp sur votre téléphone et demandez un nouveau code SMS pour vous reconnecter.',
      'Prévenez immédiatement vos proches par appel classique ou SMS : « Mon compte WhatsApp a été piraté, n\'envoyez aucun argent ».',
      'Si l\'escroc a activé un code PIN de deux étapes, vous devrez attendre le délai de sécurité WhatsApp tout en restant vigilant.',
    ],
    reliableSources: [
      { name: 'Centre d\'aide officiel WhatsApp', url: 'https://faq.whatsapp.com/1131652977717250' },
      { name: 'Direction générale de la Police Nationale - Cyber', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
    wolofTranslation: {
      title: 'Sàcc kont WhatsApp jaare ko ci kod bi ñu la yonnee ci SMS',
      summary: 'Sa xarit bu ñu sàcc kontam day la bind ne dafa juum yonnee kodam ci sa telefon, te laaj la nga delloo ko ko. Bu ko joxee, sa bopp WhatsApp lay sàcc.',
      categoryLabel: 'WhatsApp',
      exampleChannel: 'WhatsApp',
      exampleText: '« Salam ! Dama am jafe-jafe ci sama kont, juum naa sama kod ci sa telefon la ñëw. Yonnee ma ko ci sàss ? »',
    },
  },
  {
    id: 'faux-recrutement-ong-dakar',
    title: 'Faux recrutement ONG, agence de l\'ONU ou entreprise à Dakar',
    category: 'emploi',
    summary: 'Une fausse offre d\'emploi alléchante circule sur Facebook, LinkedIn ou WhatsApp promettant un salaire élevé, avant d\'exiger des frais de dossier, de visite médicale ou de badge.',
    fictionalExample: {
      sender: 'Page Facebook "Recrutement Humanitaire Sénégal 2026"',
      channel: 'Facebook',
      text: '« AVIS DE RECRUTEMENT URGENT : Le PAM/UNICEF recrute 45 agents de saisie, chauffeurs et superviseurs à Dakar et Thiès. Salaire : 450.000 FCFA/mois. Envoyez votre CV sur recrutement-unicef-senegal@gmail.com. NB : Frais d\'ouverture de dossier médical et badge obligatoire : 15.000 FCFA par Wave. »',
    },
    stepByStep: [
      'Publication d\'une fausse annonce reprenant les logos officiels d\'une institution prestigieuse (ONU, ONG internationale, grande entreprise sénégalaise).',
      'Les critères de sélection sont très faciles afin d\'attirer un maximum de jeunes diplômés et chercheurs d\'emploi.',
      'Le candidat envoie son CV et reçoit rapidement un email chaleureux disant qu\'il a été "sélectionné".',
      'On lui demande d\'envoyer une somme d\'argent par Wave ou Orange Money pour "l\'assurance", "la tenue de travail" ou "le badge sécurisé".',
      'Une fois l\'argent payé, l\'escroc coupe tout contact ou demande de nouveaux frais inventés.',
    ],
    psychologicalTactics: [
      'Exploitation du chômage et de l\'espoir d\'une insertion professionnelle.',
      'Légitimité apparente conférée par des logos d\'organisations réputées.',
      'Montant demandé présenté comme minime par rapport au salaire promis.',
    ],
    alertSigns: [
      'L\'adresse e-mail de contact est une adresse gratuite (@gmail.com, @yahoo.fr, @outlook.com) et non le nom de domaine officiel de l\'organisation.',
      'On vous demande de payer de l\'argent pour postuler ou être embauché.',
      'L\'embauche se fait sans aucun entretien physique dans les locaux réels de l\'entreprise.',
    ],
    attackerGoal: 'Collecter de l\'argent sous forme de faux frais de dossier et récupérer des copies de pièces d\'identité (CNI, passeport) pour d\'autres arnaques.',
    mistakesToAvoid: [
      'Ne jamais payer pour obtenir un emploi. Un employeur légitime ne demande jamais de frais de recrutement.',
      'Ne pas envoyer sa pièce d\'identité sans vérifier l\'authenticité de l\'employeur.',
    ],
    howToProtect: [
      'Consultez toujours le site officiel de l\'organisme pour vérifier la rubrique Carrières/Emplois.',
      'Méfiez-vous des adresses de messagerie non professionnelles.',
      'Renseignez-vous auprès des sièges physiques connus à Dakar.',
    ],
    emergencyAction: [
      'Cessez tout échange et ne versez aucun montant supplémentaire.',
      'Si vous avez envoyé une copie de votre CNI, signalez l\'usurpation d\'identité potentielle à la police.',
      'Signalez la fausse page ou le compte sur la plateforme (Facebook, LinkedIn).',
    ],
    reliableSources: [
      { name: 'Nations Unies - Avertissement faux recrutements', url: 'https://www.un.org/fr/about-us/fraud-alert' },
      { name: 'Plateforme officielle de signalement cyber Sénégal', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
    wolofTranslation: {
      title: 'Liggéey bu amul (Naxate ci « feyal dósiyé »)',
      summary: 'Dañu lay wax ne am nga liggéey bu mag ci ONG walla ci këru liggéeyukaay, waaye laaj la nga fey xaalis ngir dósiyé walla tàggat.',
      categoryLabel: 'Liggéey',
      exampleChannel: 'Facebook',
      exampleText: '« Ubbil liggéey ci PAM/UNICEF : Fay nañu 450.000 F/weer. Ngir tëj dósiyé bi feyal 15.000 F ci Wave. »',
    },
  },
  {
    id: 'arnaque-mouton-tabaski-commerce',
    title: 'Faux vendeur en ligne (Arnaque au mouton de Tabaski / High-Tech)',
    category: 'achats',
    summary: 'Un faux profil sur TikTok, Instagram ou Facebook Marketplace propose des produits à prix cassés (moutons de race, téléphones iPhone, climatiseurs) et disparaît après encaissement d\'un acompte.',
    fictionalExample: {
      sender: 'Boutique TikTok "Dakar Électro Luxe Promo"',
      channel: 'Facebook',
      text: '« Grande liquidation avant inventaire : iPhone 15 Pro Max neuf scellé à 190.000 FCFA seulement ! Livraison partout au Sénégal. Pour réserver, versez une avance de 50.000 FCFA sur le numéro Wave du livreur. »',
    },
    stepByStep: [
      'Création d\'une page avec des photos et vidéos professionnelles volées sur d\'autres comptes étrangers.',
      'Affichage de prix dérisoires, très en-dessous de la réalité du marché.',
      'Faux avis de clients élogieux postés dans les commentaires.',
      'Le vendeur refuse le paiement intégral à la livraison et exige un acompte "pour réserver" ou "pour payer le carburant du livreur".',
      'Dès que l\'acompte est versé par mobile money, le vendeur bloque le numéro de l\'acheteur sur WhatsApp et les réseaux sociaux.',
    ],
    psychologicalTactics: [
      'Appât du gain et sensation de faire une affaire exceptionnelle.',
      'Fausse urgence : "Il ne reste que 2 pièces disponibles, plusieurs personnes sont sur le coup".',
      'Mise en confiance par de faux témoignages et des vidéos montrant des stocks.',
    ],
    alertSigns: [
      'Prix anormalement bas par rapport aux prix officiels du marché.',
      'Refus absolu de paiement intégral à la livraison ou de rencontre dans un magasin physique.',
      'Compte créé très récemment ou sans adresse de boutique physique identifiable.',
    ],
    attackerGoal: 'Voler l\'acompte versé par le client et couper toute communication.',
    mistakesToAvoid: [
      'Ne jamais verser d\'acompte à un vendeur en ligne que vous ne connaissez pas personnellement sans boutique physique vérifiée.',
      'Ne pas croire aux promotions miraculeuses sans comparaison de prix.',
    ],
    howToProtect: [
      'Exigez systématiquement le paiement à la livraison après avoir inspecté le produit en main propre.',
      'Privilégiez les vendeurs disposant d\'un magasin physique ayant pignon sur rue que vous pouvez visiter.',
      'Vérifiez la date de création de la page et faites une recherche d\'image inversée sur les photos des produits.',
    ],
    emergencyAction: [
      'Conservez les captures d\'écran de la conversation, du numéro de transfert et de l\'annonce.',
      'Signalez le numéro de téléphone au service client mobile money pour compte suspect.',
      'Déposez une plainte à la police avec les coordonnées de la transaction.',
    ],
    reliableSources: [
      { name: 'Direction du Commerce Intérieur du Sénégal', url: 'https://commerce.sec.gouv.sn' },
      { name: 'Police Nationale Cyber', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
    wolofTranslation: {
      title: 'Jaaykat ci internet bu naan « jox ma dëpp bi bala ma lay yonnee »',
      summary: 'Nit day tëral foto telefon walla yére yu rafet te yomb ci TikTok walla Facebook, laaj la nga jox ko dëpp ci Wave/OM bala mu lay yonnee mbir mi, ba noppi tëj telefonam.',
      categoryLabel: 'Jënd ci internet',
      exampleChannel: 'Facebook',
      exampleText: '« iPhone 15 bu bees 190.000 FCFA rekk ! Yonnél avance 50.000 FCFA ci Wave bala livreur bi di génn. »',
    },
  },
  {
    id: 'faux-code-ussd-piege',
    title: 'Faux support technique incitant à taper un code USSD piégé (*144*...)',
    category: 'mobile-money',
    summary: 'Un escroc vous convainc au téléphone de taper une syntaxe de touches (#, * et chiffres) sur votre téléphone pour "configurer votre ligne", ce qui effectue en réalité un transfert ou un transfert d\'appels.',
    fictionalExample: {
      sender: '+221 76 000 00 03 (Se dit "Ingénieur Télécom")',
      channel: 'Appel',
      text: '« Pour activer la 5G gratuite et sécuriser votre compte contre la fraude, tapez immédiatement sur votre clavier : *144*2*771234567*100000*VotreCode# puis appuyez sur la touche d\'appel. »',
    },
    stepByStep: [
      'L\'escroc vous téléphone en prétendant vous offrir un cadeau (bonus de crédit, 5G, déblocage).',
      'Il vous dicte très rapidement une formule de code USSD complexe.',
      'La formule contient en réalité la syntaxe standard d\'envoi d\'argent ou de transfert d\'appels vers son propre numéro.',
      'Si vous suivez ses instructions sans comprendre la formule, vous validez vous-même l\'envoi de vos fonds ou le renvoi de vos SMS.',
    ],
    psychologicalTactics: [
      'Jargon pseudo-technique incompréhensible pour le non-initié.',
      'Rythme rapide pour empêcher la réflexion et la lecture posée de l\'écran.',
      'Promesse d\'un avantage gratuit ou d\'une sécurisation.',
    ],
    alertSigns: [
      'On vous demande de taper un code commençant par * et finissant par # contenant le code de transfert de votre opérateur.',
      'L\'interlocuteur vous demande d\'inclure votre code secret dans la suite de chiffres à taper.',
    ],
    attackerGoal: 'Déclencher un transfert d\'argent direct depuis votre téléphone ou activer un renvoi d\'appels/SMS pour intercepter vos futurs codes OTP.',
    mistakesToAvoid: [
      'Ne jamais composer une formule USSD dictée au téléphone par un inconnu.',
      'Ne jamais insérer son code PIN dans une séquence USSD dictée.',
    ],
    howToProtect: [
      'Mémorisez la signification des codes USSD de votre opérateur (*144# Orange, etc.).',
      'Refusez toute manipulation guidée au téléphone par un tiers non sollicité.',
      'En cas de doute, raccrochez et rendez-vous dans une agence officielle de votre opérateur.',
    ],
    emergencyAction: [
      'Vérifiez immédiatement votre solde dans l\'application.',
      'Tapez ##002# puis appel sur votre téléphone pour annuler tout renvoi d\'appel éventuel.',
      'Contactez l\'opérateur pour signaler la tentative d\'extorsion.',
    ],
    reliableSources: [
      { name: 'Autorité de Régulation des Télécommunications et des Postes (ARTP)', url: 'https://www.artp.sn' },
      { name: 'Orange Sénégal - Sécurité codes USSD', url: 'https://www.orange.sn' },
    ],
    lastVerifiedDate: '2026-10-10',
    wolofTranslation: {
      title: 'Kodu USSD bu naxate (*144*... nax la ba nga yonnee sa xaalis)',
      summary: 'Nit day la woo telefon naan la bësal kod (#, * ak lim) ngir defar sa telefon, fekk day yóbbu sa xaalis walla jox ko sa bataaxal.',
      categoryLabel: 'Xaalis ci telefon',
      exampleChannel: 'Woote',
      exampleText: '« Ngir am 5G ci feyuloo dara, bësal leegi ci sa telefon : *144*2*771234567*100000*SaKod# »',
    },
  },
  {
    id: 'faux-tirage-tombola-sonatel',
    title: 'Faux tirage au sort / Tombola anniversaire opérateur télécom',
    category: 'sms',
    summary: 'Un SMS ou message WhatsApp annonce que votre numéro a été tiré au sort pour remporter des millions de FCFA ou une voiture, mais réclame des "frais d\'huissier" pour recevoir le lot.',
    fictionalExample: {
      sender: '+221 70 000 00 04',
      channel: 'SMS',
      text: '« Félicitations ! Votre numéro 77*** a été tiré au sort pour la Grande Promo Anniversaire Sonatel 2026. Vous gagnez un chèque de 5.000.000 FCFA et un iPhone. Contactez d\'urgence Maître Fall au 77XXXXXXX pour le retrait. Réf : GAGNANT-SN99. »',
    },
    stepByStep: [
      'Envoi massif de SMS ou messages à des milliers de numéros sénégalais.',
      'La personne qui rappelle le numéro indiqué tombe sur un faux huissier de justice ou un faux directeur commercial.',
      'Celui-ci félicite la victime et valide son identité avec un grand professionnalisme de façade.',
      'Il annonce que pour débloquer le chèque ou faire immatriculer le véhicule, il faut payer des frais d\'enregistrement ou d\'huissier (30.000 à 75.000 F) par mobile money.',
      'Une fois la somme payée, l\'escroc réclame de nouveaux frais de transport, jusqu\'à ce que la victime comprenne l\'escroquerie.',
    ],
    psychologicalTactics: [
      'Euphorie d\'un gain inattendu qui altère le jugement critique.',
      'Usage de titres prestigieux : "Maître", "Huissier de justice agréé", "Direction générale".',
      'Pression temporelle : "Si vous ne validez pas avant 17h, le lot sera réattribué à un autre numéro".',
    ],
    alertSigns: [
      'Vous n\'avez jamais acheté de ticket ni participé à un quelconque concours.',
      'On vous demande de payer de l\'argent pour pouvoir toucher un gain.',
      'Le prétendu huissier utilise un numéro mobile personnel et demande un paiement mobile money.',
    ],
    attackerGoal: 'Soutirer des sommes d\'argent sous forme de faux frais administratifs et juridiques.',
    mistakesToAvoid: [
      'Ne jamais payer le moindre centime pour recevoir un prix ou un cadeau.',
      'Ne jamais croire à un tirage au sort auquel on n\'a pas consciemment souscrit.',
    ],
    howToProtect: [
      'Règle universelle de protection : un vrai gain ne nécessite JAMAIS de paiement préalable.',
      'Les vrais jeux-concours des opérateurs sont annoncés publiquement sur leurs canaux officiels vérifiés (pages avec badge bleu).',
    ],
    emergencyAction: [
      'Ne versez aucun centime.',
      'Bloquez immédiatement le numéro émetteur.',
      'Prévenez votre entourage pour éviter que d\'autres personnes tombent dans le piège.',
    ],
    reliableSources: [
      { name: 'Sonatel - Alertes fraudes et jeux concours', url: 'https://sonatel.sn' },
      { name: 'Plateforme cyber DGPN', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'faux-colis-poste-douane',
    title: 'Faux colis bloqué à La Poste Sénégal ou à la Douane',
    category: 'sms',
    summary: 'Un SMS prétend qu\'un colis à votre attention ne peut pas être livré en raison de frais d\'expédition manquants ou d\'une adresse incorrecte, avec un lien web de paiement piégé.',
    fictionalExample: {
      sender: '+221 78 000 00 05',
      channel: 'SMS',
      text: '« La Poste Sénégal : Votre colis numéro SN-88291 est suspendu au centre de tri de Dakar. Veuillez confirmer votre adresse et régler les frais de douane (1.350 FCFA) pour débloquer la livraison : https://laposte-sn-colis.xyz/suivi »',
    },
    stepByStep: [
      'Réception d\'un SMS court évoquant la livraison d\'un paquet.',
      'Beaucoup de personnes attendant des commandes ou ayant de la famille à l\'étranger doutent et cliquent sur le lien.',
      'Le lien ouvre une fausse page web imitant fidèlement l\'identité visuelle de La Poste ou de DHL/Chronopost.',
      'Le site demande les informations personnelles puis invite à entrer son numéro de carte bancaire ou son numéro mobile money avec code secret.',
      'Les données saisies sont immédiatement récupérées par les cybercriminels.',
    ],
    psychologicalTactics: [
      'Curiosité et doute : la victime se demande quel proche a pu lui envoyer un colis.',
      'Montant demandé dérisoire (1.000 à 2.000 FCFA) pour réduire la méfiance.',
      'Peur de voir le colis retourné à l\'expéditeur.',
    ],
    alertSigns: [
      'L\'URL du lien est bizarre (.xyz, .top, nom ressemblant mais pas le site officiel de La Poste Sénégal laposte.sn).',
      'Le SMS provient d\'un numéro mobile personnel inconnu.',
      'Vous n\'avez passé aucune commande internationale récente.',
    ],
    attackerGoal: 'Voler vos coordonnées de carte bancaire ou vous faire valider un faux paiement mobile money qui débite en réalité une somme bien plus élevée.',
    mistakesToAvoid: [
      'Ne jamais cliquer sur un lien reçu par SMS pour régler des frais de livraison.',
      'Ne jamais entrer ses coordonnées de paiement sur un site web non vérifié.',
    ],
    howToProtect: [
      'Rendez-vous directement au bureau de poste le plus proche avec votre numéro de suivi si vous attendez réellement un colis.',
      'Vérifiez scrupuleusement l\'adresse web : le site officiel de La Poste du Sénégal est laposte.sn.',
    ],
    emergencyAction: [
      'Si vous avez entré votre carte bancaire, faites opposition immédiatement auprès de votre banque.',
      'Si vous avez entré un numéro mobile money et un code, changez votre code d\'accès sans attendre.',
    ],
    reliableSources: [
      { name: 'Site officiel La Poste du Sénégal', url: 'https://www.laposte.sn' },
      { name: 'Douanes Sénégalaises', url: 'https://www.douanes.sn' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'usurpation-proche-detresse',
    title: 'Usurpation du profil d\'un proche prétextant une détresse médicale',
    category: 'reseaux-sociaux',
    summary: 'Un cybercriminel clone ou pirate le profil d\'un ami ou membre de votre famille sur Facebook ou Instagram et vous supplie de lui envoyer de l\'argent en urgence pour un hôpital ou un voyage.',
    fictionalExample: {
      sender: 'Profil Facebook cloné d\'un cousin ou ami d\'enfance',
      channel: 'Facebook',
      text: '« Salam mon frère, je suis en urgence à l\'hôpital Principal de Dakar avec ma fille qui vient d\'avoir une crise. Mon compte bancaire est bloqué temporairement, est-ce que tu peux m\'envoyer 40.000 F par Wave sur le numéro du pharmacien ? Je te rembourse demain sans faute ! »',
    },
    stepByStep: [
      'L\'escroc crée un faux profil avec les mêmes nom, prénom et photos volées d\'une personne de votre entourage (ou pirate son vrai compte).',
      'Il vous contacte par Messenger ou message privé avec un ton très affectueux et familier.',
      'Il décrit un événement dramatique soudain (accident, maladie, garde à vue, panne sur l\'autoroute à péage).',
      'Il donne le numéro Wave d\'un "tiers" (médecin, mécanicien) qui est en réalité son propre numéro.',
      'Une fois le transfert effectué, il réclame davantage ou bloque le compte.',
    ],
    psychologicalTactics: [
      'Amour filial, fraternel ou amitié sincère.',
      'État de panique émotionnelle provoqué par l\'urgence vitale simulée.',
      'Honte de refuser de l\'aide à un proche en détresse.',
    ],
    alertSigns: [
      'La personne demande un transfert vers un numéro qui n\'est pas son numéro de téléphone habituel.',
      'Elle refuse de vous parler de vive voix au téléphone ("Je ne peux pas parler, je suis dans la salle de réanimation").',
      'Le profil Messenger présente peu d\'amis ou a été créé récemment.',
    ],
    attackerGoal: 'Profiter de votre attachement affectif pour vous faire envoyer de l\'argent par mobile money.',
    mistakesToAvoid: [
      'Ne jamais envoyer d\'argent sans avoir entendu la voix du proche au téléphone sur son vrai numéro habituel.',
      'Ne pas se fier uniquement aux messages écrits sur les réseaux sociaux.',
    ],
    howToProtect: [
      'Règle absolue : Appelez toujours la personne sur son numéro téléphonique habituel avant toute transaction.',
      'Posez une question piège dont seul le vrai proche connaît la réponse (ex: le nom de son école primaire ou un souvenir partagé).',
    ],
    emergencyAction: [
      'Prévenez immédiatement le vrai proche par appel vocal classique pour l\'avertir de l\'usurpation de son identité.',
      'Signalez le faux profil sur Facebook/Instagram pour "Usurpation d\'identité".',
      'Avertissez les autres membres de la famille.',
    ],
    reliableSources: [
      { name: 'Commission de Protection des Données Personnelles (CDP Sénégal)', url: 'https://www.cdp.sn' },
      { name: 'Centre d\'aide sécurité Meta/Facebook', url: 'https://www.facebook.com/safety' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'tontine-crypto-placement-miracle',
    title: 'Arnaque aux tontines en ligne et faux investissements crypto / Forex',
    category: 'investissement',
    summary: 'Des groupes WhatsApp ou Telegram proposent des "tontines VIP" ou des investissements qui garantiraient de doubler ou tripler son capital en quelques jours sans aucun risque.',
    fictionalExample: {
      sender: 'Groupe WhatsApp "Investissement Gagnant Sénégal 2026"',
      channel: 'WhatsApp',
      text: '« Mettez 50.000 FCFA aujourd\'hui, gagnez 150.000 FCFA dans 72 heures grâce au trading automatique de Bitcoin et à notre tontine solidaire ! Déjà 500 membres payés. Témoignages en vidéo dans le groupe. »',
    },
    stepByStep: [
      'Vous êtes ajouté sans votre accord dans un groupe WhatsApp avec des dizaines d\'inconnus.',
      'Des participants (complices ou faux comptes) publient des captures d\'écran de virements Wave et des messages de remerciements enflammés.',
      'L\'administrateur vous invite à faire un premier versement test.',
      'Au début, pour les petites sommes, certains escrocs reversent parfois un faux bénéfice pour mettre en confiance (système pyramidal de Ponzi).',
      'La victime, séduite, investit alors toutes ses économies ou emprunte à des proches.',
      'Dès que la somme est importante, l\'administrateur supprime le groupe ou bloque les retraits en exigeant des "taxes de déblocage".',
    ],
    psychologicalTactics: [
      'Preuve sociale artificielle (dizaines de faux membres qui célèbrent leurs gains).',
      'Appât du gain rapide et rêve d\'indépendance financière sans effort.',
      'Effet d\'entraînement et peur de rater l\'opportunité (FOMO).',
    ],
    alertSigns: [
      'Gains garantis et irréalistes (doubler sa mise en quelques jours est financièrement impossible sans escroquerie).',
      'Ajout dans un groupe de discussion sans votre consentement préalable.',
      'Absence totale d\'agrément financier officiel auprès de la BCEAO ou du CREPMF/AMF-UMOA.',
    ],
    attackerGoal: 'Capter des capitaux par système pyramidal ou vol direct avant de disparaître avec la caisse.',
    mistakesToAvoid: [
      'Ne jamais investir dans des systèmes financiers non régulés par la Banque Centrale (BCEAO).',
      'Ne pas croire aux témoignages de personnes inconnues sur WhatsApp ou Telegram.',
    ],
    howToProtect: [
      'Paramétrez WhatsApp pour interdire l\'ajout automatique dans des groupes par des inconnus (Paramètres > Confidentialité > Groupes > Mes contacts).',
      'Rappelez-vous ce principe économique fondamental : un rendement très élevé sans aucun risque n\'existe pas.',
    ],
    emergencyAction: [
      'Ne réinvestissez aucun centime même pour "débloquer" vos gains.',
      'Quittez le groupe après avoir fait des captures d\'écran des numéros des administrateurs.',
      'Signalez le groupe à WhatsApp et déposez plainte à la DSC.',
    ],
    reliableSources: [
      { name: 'Banque Centrale des États de l\'Afrique de l\'Ouest (BCEAO) - Alertes', url: 'https://www.bceao.int' },
      { name: 'Autorité des Marchés Financiers de l\'UMOA (AMF-UMOA)', url: 'https://www.amf-umoa.org' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'faux-remboursement-impot-bourse',
    title: 'Faux remboursement d\'impôt ou rappel de bourse étudiante (Campusen/DGID)',
    category: 'email',
    summary: 'Un e-mail ou SMS usurpant l\'identité de la DGID ou de la Direction des Bourses annonce un remboursement ou un rappel d\'allocation en attente de paiement.',
    fictionalExample: {
      sender: 'service-paiement@dgid-remboursement-sn.info',
      channel: 'E-mail',
      text: '« Direction Générale des Impôts et Domaines (DGID) : Après vérification de votre déclaration, un crédit d\'impôt de 85.000 FCFA est disponible en votre faveur. Pour percevoir ce remboursement par virement immédiat, remplissez le formulaire sécurisé avant 48h : http://portail-dgid-finances.org/login »',
    },
    stepByStep: [
      'Envoi d\'un courrier électronique ou SMS institutionnel très soigné avec les armoiries du Sénégal.',
      'Le message annonce une bonne nouvelle financière inattendue.',
      'Le lien renvoie vers un faux portail gouvernemental demandant identifiants, numéro CNI et coordonnées bancaires ou de mobile money.',
      'Une fois le formulaire validé, l\'attaquant utilise les données pour pirater les comptes bancaires ou contracter des micro-crédits.',
    ],
    psychologicalTactics: [
      'Respect et confiance aveugle envers les institutions républicaines.',
      'Bonne surprise financière qui pousse à agir vite avant la date limite.',
    ],
    alertSigns: [
      'L\'adresse du site web ne se termine pas par le domaine officiel de l\'État sénégalais ".gouv.sn" ou ".sn".',
      'L\'administration sénégalaise ne rembourse pas des impôts par SMS en demandant un code de carte de crédit.',
    ],
    attackerGoal: 'Voler vos coordonnées bancaires et vos données d\'identité pour vider vos comptes.',
    mistakesToAvoid: [
      'Ne pas cliquer sur des liens prétendant verser des remboursements fiscaux automatiques.',
      'Ne jamais saisir son code PIN bancaire sur un site internet.',
    ],
    howToProtect: [
      'Connectez-vous directement sur les portails officiels de l\'État (ex: dgid.sn, campussen.sn) sans passer par un lien de message.',
      'Vérifiez la présence du domaine officiel ".gouv.sn".',
    ],
    emergencyAction: [
      'Si vous avez communiqué vos accès bancaires, avertissez immédiatement votre banque pour bloquer les cartes et l\'accès web.',
      'Modifiez immédiatement les mots de passe de votre messagerie.',
    ],
    reliableSources: [
      { name: 'Direction Générale des Impôts et des Domaines (DGID)', url: 'https://www.dgid.sn' },
      { name: 'Direction de la Sécurité des Systèmes d\'Information (STCC-SSI)', url: 'https://stcc-ssi.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'arnaque-location-appartement-dakar',
    title: 'Fausse location d\'appartement ou maison à Dakar / Saly (Acompte sans visite)',
    category: 'achats',
    summary: 'De fausses annonces immobilières publiées sur Facebook ou Expat-Dakar présentent de superbes appartements meublés à loyer modéré, exigeant un acompte avant toute visite.',
    fictionalExample: {
      sender: 'Annonce sur groupe Facebook "Logement Dakar Almadies/Plateau"',
      channel: 'Facebook',
      text: '« À louer superbe F3 meublé avec vue mer aux Almadies pour 200.000 FCFA/mois charges comprises. Beaucoup de demandes en cours. Pour réserver la visite de demain matin et bloquer le bien, versez un acompte de garantie de 50.000 FCFA par Wave au propriétaire qui habite à Saint-Louis. »',
    },
    stepByStep: [
      'L\'escroc télécharge des photos d\'appartements luxueux sur des sites étrangers ou des plateformes Airbnb.',
      'Il publie une annonce avec un prix bien inférieur aux tarifs habituels du quartier à Dakar.',
      'Face à l\'afflux de demandes de locataires intéressés, il annonce qu\'il ne fera visiter qu\'aux personnes "sérieuses" ayant versé un acompte de réservation.',
      'Il encaisse l\'acompte par mobile money et éteint son téléphone le jour convenu pour la visite devant l\'immeuble.',
    ],
    psychologicalTactics: [
      'Pression de la pénurie de logements abordables à Dakar.',
      'Compétition entre candidats locataires incitant à payer vite pour être le premier.',
    ],
    alertSigns: [
      'Loyer nettement en dessous du marché pour le quartier.',
      'Demande de versement d\'argent avant même d\'avoir visité physiquement l\'appartement et rencontré le bailleur ou l\'agence immobilière agréée.',
      'Le propriétaire prétend être en voyage ou en région et ne peut pas se déplacer sans acompte.',
    ],
    attackerGoal: 'Encaisser des acomptes fictifs auprès de dizaines de personnes simultanément.',
    mistakesToAvoid: [
      'Ne jamais verser d\'argent avant d\'avoir visité l\'appartement à l\'intérieur et vérifié l\'identité du propriétaire ou le mandat de l\'agence.',
    ],
    howToProtect: [
      'Passez par des agences immobilières reconnues disposant de locaux identifiables.',
      'Exigez un bail écrit et un reçu en bonne et due forme lors de tout paiement.',
    ],
    emergencyAction: [
      'Conservez les traces de l\'annonce et de la transaction de paiement.',
      'Signalez le numéro frauduleux au support de l\'opérateur de transfert.',
      'Déposez une plainte au commissariat ou à la brigade de gendarmerie la plus proche.',
    ],
    reliableSources: [
      { name: 'Police Nationale du Sénégal', url: 'https://signalementcyber.dgpn.sn/' },
      { name: 'Ordre des Experts Immobiliers du Sénégal', url: 'https://oeis.sn' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'faux-policier-chantage-sextorsion',
    title: 'Chantage à la sextorsion et faux officier de police judiciaire',
    category: 'usurpation',
    summary: 'Après des échanges intimes en vidéo ou sous la menace d\'une fausse convocation pour pédopornographie, un cybercriminel exige de l\'argent pour ne pas diffuser les images ou arrêter les poursuites.',
    fictionalExample: {
      sender: '+221 77 000 00 06 (Photo de profil d\'un policier en uniforme)',
      channel: 'WhatsApp',
      text: '« Lieutenant Diop de la Brigade des Mœurs et Cybercriminalité. Votre numéro fait l\'objet d\'un mandat d\'arrêt pour détention de contenus illicites suite à votre conversation d\'hier. Pour classer le dossier sans suite et éviter la prison, versez 250.000 FCFA d\'amende transactionnelle par Wave dans les 2 heures. »',
    },
    stepByStep: [
      'Phase 1 (séduction ou piège) : Une personne engage une conversation intime en ligne et incite la victime à allumer sa caméra ou envoyer des photos dénudées.',
      'Phase 2 : L\'escroc enregistre la vidéo et menace de l\'envoyer à toute la liste de contacts de la victime (famille, collègues, employeur).',
      'Phase 3 (variante faux policier) : Un complice appelle en se faisant passer pour un officier de police de la DSC et réclame de l\'argent pour étouffer l\'affaire.',
    ],
    psychologicalTactics: [
      'Terreur absolue de la honte sociale, du déshonneur familial et de l\'emprisonnement (Kersa).',
      'Isolement de la victime qui n\'ose en parler à personne par pudeur.',
    ],
    alertSigns: [
      'La vraie police ne règle JAMAIS une procédure pénale ou une amende par transfert mobile money vers un numéro personnel.',
      'La vraie police convoque formellement par convocation écrite et physique dans les locaux du commissariat.',
      'Exigence de payer dans l\'heure sous peine d\'humiliation publique.',
    ],
    attackerGoal: 'Extorquer des sommes d\'argent répétées. Si la victime paie une première fois, l\'escroc redemande systématiquement le double.',
    mistakesToAvoid: [
      'NE PAYEZ JAMAIS. Payer ne règle rien : les maîtres chanteurs continuent d\'exiger de l\'argent.',
      'Ne supprimez pas les messages avant d\'avoir fait des captures d\'écran pour les preuves.',
    ],
    howToProtect: [
      'Ne partagez jamais d\'images dénudées ou intimes sur internet, même avec une personne en qui vous avez confiance.',
      'Bloquez immédiatement le maître chanteur dès la première menace.',
    ],
    emergencyAction: [
      'Ne versez aucun centime.',
      'Faites des captures d\'écran complètes des menaces, profils et numéros.',
      'Contactez en toute confidentialité la Division Spéciale de Cybersécurité (DSC) qui traite ces cas quotidiennement avec discrétion.',
    ],
    reliableSources: [
      { name: 'Division Spéciale de Cybersécurité - Signalement officiel', url: 'https://signalementcyber.dgpn.sn/' },
      { name: 'Commission de Protection des Données Personnelles (CDP)', url: 'https://www.cdp.sn' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'arnaque-qr-code-commercant',
    title: 'Falsification de QR Code de paiement chez les commerçants (Quishing)',
    category: 'mobile-money',
    summary: 'Un escroc colle son propre autocollant QR Code par-dessus le QR Code officiel Wave ou Orange Money d\'une boutique ou d\'une station-service pour détourner les règlements des clients.',
    fictionalExample: {
      sender: 'Autocollant physique falsifié en caisse',
      channel: 'Appel',
      text: 'Le client scanne le QR Code affiché sur le comptoir du vendeur pour payer son achat de 15.000 FCFA. Le paiement est validé, mais le commerçant ne reçoit rien : l\'argent est parti sur le compte de l\'escroc qui a superposé son propre autocollant sur l\'affiche du magasin.',
    },
    stepByStep: [
      'L\'escroc imprime un autocollant portant son propre QR code de compte marchand ou particulier.',
      'Il profite d\'un moment d\'inattention du boutiquier pour coller son sticker directement par-dessus le code authentique du magasin.',
      'Les clients suivants scannent machinalement le code et confirment le paiement.',
      'L\'argent est crédité sur le compte de l\'escroc à l\'insu du commerçant et du client.',
    ],
    psychologicalTactics: [
      'Habitude et geste automatique de scanner sans lire attentivement le nom du destinataire qui apparaît sur l\'écran.',
    ],
    alertSigns: [
      'Le sticker semble mal collé, superposé, ou présente des bords décollés.',
      'Le nom du destinataire affiché dans votre application ne correspond pas au nom de la boutique ou du commerçant chez qui vous vous trouvez.',
    ],
    attackerGoal: 'Détourner les flux de paiement des clients à l\'insu du commerçant légitime.',
    mistakesToAvoid: [
      'Ne pas valider un paiement sans lire attentivement le NOM du bénéficiaire qui s\'affiche sur votre écran de smartphone.',
    ],
    howToProtect: [
      'Vérifiez toujours le nom du compte avant de valider votre code PIN.',
      'Commerçants : protégez vos affiches de QR code sous plexiglas et vérifiez-les chaque matin.',
    ],
    emergencyAction: [
      'Montrez immédiatement la confirmation à l\'écran au commerçant pour constater la divergence de nom.',
      'Appelez le support technique mobile money pour faire geler le compte du destinataire fraudeur.',
      'Décollez le faux autocollant pour protéger les autres clients.',
    ],
    reliableSources: [
      { name: 'Wave Sénégal - Guide commerçants', url: 'https://www.wave.com/fr/sn/' },
      { name: 'Police Nationale Cyber', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
  {
    id: 'appel-urgence-familiale-faux-accident',
    title: 'Faux appel de détresse familiale (« Votre fils est à l\'hôpital »)',
    category: 'famille',
    summary: 'Un escroc appelle un parent paniqué en se faisant passer pour un médecin urgentiste ou un policier, affirmant que son enfant a eu un grave accident et réclame un paiement immédiat pour commencer l\'opération.',
    fictionalExample: {
      sender: '+221 77 000 00 07',
      channel: 'Appel',
      text: '« Madame, c\'est le Major des urgences de l\'hôpital de Fann ! Votre fils vient d\'être admis après un accident de moto grave. Il doit entrer au bloc opératoire immédiatement. Envoyez 70.000 FCFA sur ce numéro Wave pour acheter les poches de sang d\'urgence ! »',
    },
    stepByStep: [
      'L\'escroc trouve le nom d\'un parent et de son enfant via les réseaux sociaux ou des fuites de données.',
      'Il appelle à des heures stratégiques (matin ou fin d\'après-midi).',
      'Des bruits de fond d\'hôpital ou de sirène peuvent être simulés.',
      'Il met le parent dans un état de panique extrême et interdit de raccrocher sous prétexte que chaque seconde compte.',
      'Une fois le transfert effectué, l\'escroc coupe la communication.',
    ],
    psychologicalTactics: [
      'Terreur parentale et instinct viscéral de protection de son enfant.',
      'Surcharge cognitive empêchant toute réflexion logique.',
    ],
    alertSigns: [
      'L\'hôpital ou la police ne demande jamais de transfert d\'argent par téléphone avant de soigner un blessé en urgence vitale au Sénégal.',
      'L\'appelant refuse que vous appeliez directement votre enfant ou son établissement scolaire.',
    ],
    attackerGoal: 'Exploiter l\'angoisse d\'un parent pour lui soutirer une forte somme en quelques minutes.',
    mistakesToAvoid: [
      'Ne pas transférer d\'argent sous le coup de l\'émotion sans avoir vérifié où se trouve réellement votre enfant.',
      'Ne pas rester bloqué au téléphone avec l\'inconnu.',
    ],
    howToProtect: [
      'Gardez votre calme : respirez et demandez le nom exact du médecin et le numéro de chambre.',
      'Utilisez un deuxième téléphone pour appeler directement votre enfant ou l\'école/université où il est censé se trouver.',
    ],
    emergencyAction: [
      'Si vous avez versé de l\'argent, notez le numéro de transaction et contactez l\'opérateur immédiatement.',
      'Rendez-vous à la police pour déposer une plainte pour escroquerie aggravée.',
    ],
    reliableSources: [
      { name: 'Ministère de la Santé et de l\'Action Sociale du Sénégal', url: 'https://sante.gouv.sn' },
      { name: 'Division Spéciale de Cybersécurité (DGPN)', url: 'https://signalementcyber.dgpn.sn/' },
    ],
    lastVerifiedDate: '2026-10-10',
  },
];

const SCAMS_STORAGE_KEY = 'xamsafe_admin_scams';

export function getScamsCatalog(): ScamCard[] {
  if (typeof window === 'undefined') return INITIAL_SCAMS;
  try {
    const raw = localStorage.getItem(SCAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seeds
  }
  return INITIAL_SCAMS;
}

export function saveScamsCatalog(scams: ScamCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCAMS_STORAGE_KEY, JSON.stringify(scams));
  } catch (err) {
    console.warn('Erreur lors de la sauvegarde du catalogue XamSafe:', err);
  }
}

export function resetScamsCatalog(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SCAMS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
