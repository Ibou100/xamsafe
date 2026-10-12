# XamSafe — Plateforme Citoyenne de Prévention des Arnaques Numériques au Sénégal

<p align="center">
  <img src="public/favicon.svg" alt="Logo XamSafe" width="80" height="80" />
</p>

<p align="center">
  <strong>« Comprendre les arnaques. Protéger son argent. »</strong><br />
  <em>« Xam. Moytu. Aar sa xaalis. »</em>
</p>

<p align="center">
  <a href="#fonctionnalités-clés">Fonctionnalités</a> •
  <a href="#architecture-technique">Architecture</a> •
  <a href="#installation-et-démarrage">Installation</a> •
  <a href="#tests-automatisés">Tests</a> •
  <a href="#confidentialité-et-sécurité">Confidentialité</a> •
  <a href="#déploiement">Déploiement</a>
</p>

---

## 1. Vision et Mission du Produit

**XamSafe** est une plateforme citoyenne d'intérêt public, indépendante et gratuite, conçue en priorité pour les populations du Sénégal.

Son objectif est de donner à chaque citoyen les réflexes indispensables pour :
1. **Reconnaître** les techniques de fraude et de phishing avant de subir une perte financière.
2. **Comprendre** les leviers psychologiques exploités par les escrocs (urgence simulée, peur du blocage, faux gains).
3. **Examiner** les indices suspects présents dans un SMS, un message WhatsApp ou une URL.
4. **Réagir méthodiquement** après un incident mobile money (Wave, Orange Money, Free Money) ou bancaire.
5. **Sécuriser** ses comptes du quotidien (WhatsApp, Facebook, TikTok, Instagram, Gmail).
6. **S'entraîner** sur des scénarios réalistes sans aucun danger grâce à des simulateurs et quiz.
7. **Accéder directement** aux canaux officiels d'assistance et de signalement judiciaire au Sénégal.

### Principe Fondateur : AUCUN COMPTE REQUIS
- **Aucune inscription, aucune connexion, aucune adresse e-mail ni numéro de téléphone** n'est exigé pour utiliser la totalité des outils publics.
- Les messages et adresses soumis sont analysés **localement dans la mémoire du navigateur** et ne sont **jamais enregistrés sur nos serveurs**.

---

## 2. Identité de Marque

- **Nom :** XamSafe
  - *Xam* : Savoir, connaître en langue Wolof.
  - *Safe* : Sécurité en anglais.
- **Slogan français :** « Comprendre les arnaques. Protéger son argent. »
- **Slogan wolof :** « Xam. Moytu. Aar sa xaalis. »
- **Palette visuelle WCAG 2.2 AA :**
  - Bleu nuit institutionnel : `#0C2438`
  - Vert sécurité & confiance : `#12B981`
  - Blanc pur : `#FFFFFF`
  - Gris clair d'apaisement : `#F3F6F8`
  - Orange de vigilance : `#F59E0B`
  - Rouge d'urgence critique : `#DC2626`

---

## 3. Architecture Technique

- **Framework Web :** React 19 + TypeScript (mode strict, bundler standard)
- **Outil de Build :** Vite 8 (chargement ultra-rapide optimisé pour mobiles)
- **Routage :** React Router DOM v7 (navigation fluide SPA sans rechargement)
- **Design & Accessibilité :** Tailwind CSS + Lucide Icons (WCAG 2.2 AA, mode sombre/clair, support `prefers-reduced-motion`)
- **Suite de Tests :** Vitest + Testing Library + Jest-DOM (tests unitaires, heuristiques et d'intégration)
- **Internationalisation :** Moteur bilingue Français (par défaut) et Wolof

```
xamsafe/
├── public/                  # Favicon SVG vectoriel, robots.txt, sitemap.xml
├── src/
│   ├── components/          # Composants UI (Navbar, Footer, Logo, PiiSanitizerNotice)
│   ├── context/             # Contextes d'état (LanguageContext, ThemeContext)
│   ├── data/                # Données initiales certifiées
│   │   ├── scams.ts         # 15 fiches d'arnaques détaillées (12 champs structurés)
│   │   ├── quizQuestions.ts # 30 questions de quiz avec explications pédagogiques
│   │   ├── simulatorScenarios.ts # 6 scénarios de phishing inoffensifs
│   │   ├── emergencyPaths.ts# 10 parcours d'urgence pour victimes (A à J)
│   │   ├── accountGuides.ts # 6 guides pratiques de sécurisation
│   │   ├── officialResources.ts # Annuaire vérifié des institutions sénégalaises
│   │   └── i18n.ts          # Dictionnaire de traduction FR / WO
│   ├── pages/               # Pages principales de l'application
│   │   ├── Home.tsx         # Page d'accueil avec bannières d'action
│   │   ├── ScamsLibrary.tsx # Bibliothèque filtrable par 11 catégories
│   │   ├── ScamDetailPage.tsx # Vue permalien indexable pour chaque fiche
│   │   ├── MessageAnalyzerPage.tsx # Analyseur de SMS / WhatsApp avec sanitisation PII
│   │   ├── UrlAnalyzerPage.tsx     # Vérificateur syntaxique d'URL sans SSRF
│   │   ├── VictimUrgentPage.tsx    # Parcours guidé victime & checklist de preuves
│   │   ├── AccountSecurityPage.tsx # Guides de sécurité WhatsApp, Meta, TikTok, etc.
│   │   ├── PhishingSimulatorPage.tsx # Simulateur avec maquettes smartphone
│   │   ├── CyberQuizPage.tsx       # Quiz interactif de 30 questions
│   │   ├── OfficialResourcesPage.tsx # Annuaire officiel DGPN, STCC-SSI, CDP
│   │   ├── AboutPage.tsx    # Présentation, valeurs et indépendance
│   │   ├── PrivacyPage.tsx  # Politique de confidentialité et cadre légal CDP
│   │   └── AdminPage.tsx    # Console éditoriale protégée par code d'accès
│   ├── services/            # Moteurs heuristiques et syntaxiques locaux
│   │   ├── messageAnalyzer.ts # Détection d'OTP, fausse urgence, USSD, tombola
│   │   └── urlAnalyzer.ts     # Analyse syntaxique, homoglyphes, marques imitées
│   ├── test/                # Suite de tests automatisés Vitest
│   ├── types/               # Définitions TypeScript
│   ├── App.tsx              # Définition des routes
│   └── main.tsx             # Point d'entrée de l'application
├── .env.example             # Exemple de variables d'environnement
├── tailwind.config.js       # Configuration Tailwind CSS avec charte XamSafe
├── vite.config.ts           # Configuration Vite + Vitest
└── package.json             # Dépendances et scripts
```

---

## 4. Les 13 Modules Fonctionnels

| Module | URL | Description |
|---|---|---|
| **1. Accueil** | `/` | Présentation directe, statistiques pédagogiques, 3 parcours d'action et alertes d'urgence. |
| **2. Bibliothèque des arnaques** | `/arnaques` | 15 fiches structurées (Mobile money, faux agents, faux virements, faux recrutements ONU, moutons Tabaski, sextorsion, faux colis, etc.) avec filtres et recherche. |
| **3. Fiche détaillée** | `/arnaques/:id` | Permalien SEO avec 12 champs : déroulement, manipulation psychologique, signes d'alerte, erreurs à éviter, protection et sources. |
| **4. Analyseur de message** | `/analyser-message` | Examen heuristique local d'un SMS ou WhatsApp. Sanitisation préalable des numéros et codes, verdict transparent sans faux verdict. |
| **5. Vérificateur d'URL** | `/verifier-url` | Analyse passive sans SSRF : détection d'HTTP, IP brutes, raccourcisseurs, domaines punycode et imitation de marques (Wave, Orange, Banques). |
| **6. « Je suis victime »** | `/urgence-victime` | 10 parcours d'urgence personnalisés (A à J) avec actions immédiates, checklist de preuves à copier et mise en garde anti-faux recouvrement. |
| **7. Sécuriser mes comptes** | `/securiser-comptes` | Guides pratiques pour WhatsApp, Facebook, Instagram, TikTok, Google et Mobile Money (2FA, déconnexion des sessions suspectes). |
| **8. Simulateur de phishing** | `/simulateur` | 6 scénarios inoffensifs sous forme d'écran de messagerie pour repérer les indices en conditions réalistes. |
| **9. Quiz de cybersécurité** | `/quiz` | 30 questions à choix multiples avec correction instantanée et conseils ciblés selon les erreurs (sans stockage serveur). |
| **10. Ressources officielles** | `/ressources` | Annuaire officiel sénégalais : Police DGPN (`signalementcyber.dgpn.sn`), STCC-SSI, CDP, ARTP et numéros vérifiés (Orange 1441, Wave 200600). |
| **11. À propos de XamSafe** | `/a-propos` | Origine du nom, charte éthique, public cible et rappel d'indépendance. |
| **12. Confidentialité & Mentions** | `/confidentialite` | Engagement formel de minimisation des données (Loi n° 2008-12 / CDP). |
| **13. Administration protégée** | `/admin` | Espace réservé aux gestionnaires de contenu protégé par mot de passe sécurisé (édition, suivi des statuts Wolof « validée » / « à valider », export JSON). |

---

## 5. Installation et Démarrage

### Prérequis
- Node.js version 18 ou supérieure (v20+ recommandée)
- npm ou pnpm

### 1. Cloner ou ouvrir le projet
```bash
git clone <url-du-depot> xamsafe
cd xamsafe
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Copier le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
*(Par défaut, la console d'administration utilise le code d'accès de test documenté dans `.env.example`)*

### 4. Lancer le serveur de développement
```bash
npm run dev
```
L'application est accessible à l'adresse : `http://localhost:5173/`

---

## 6. Commandes Disponibles

| Commande | Action |
|---|---|
| `npm run dev` | Démarre le serveur local de développement Vite avec Hot Reload |
| `npm run build` | Vérifie les types TypeScript et compile le bundle optimisé pour la production |
| `npm test` | Exécute la suite complète de 24 tests unitaires et d'intégration avec Vitest |
| `npm run test:watch` | Exécute les tests en mode interactif continu |
| `npm run lint` | Lance le linter rapide oxlint |
| `npm run preview` | Prévisualise localement le bundle de production généré dans `/dist` |

---

## 7. Résultats des Tests Exécutés

Tous les tests unitaires et d'intégration ont été exécutés avec succès :

```text
 ✓ src/test/messageAnalyzer.test.ts (7 tests)
   ✓ masque les données personnelles (PII) avant analyse
   ✓ détecte une tentative de vol de code OTP / code secret comme Risque Élevé
   ✓ détecte une fausse tombola Sonatel avec demande de frais comme Risque Élevé
   ✓ détecte un piège USSD Orange Money (*144*2...)
   ✓ renvoie un statut Indéterminé sans faux verdict pour un message trop court
   ✓ ne prononce pas de faux verdict positif pour un message innocent
   ✓ fonctionne entièrement en local sans clé API requise
 ✓ src/test/urlAnalyzer.test.ts (7 tests)
   ✓ identifie un clone frauduleux de Wave avec TLD suspect (.xyz) comme Dangereux
   ✓ détecte une adresse IP numérique brute comme Dangereux
   ✓ détecte un raccourcisseur de lien (bit.ly)
   ✓ détecte les caractères punycode / homoglyphes
   ✓ reconnaît le domaine officiel Wave légitime comme Faible
   ✓ explique que HTTPS ne garantit pas à lui seul l'honnêteté du site
   ✓ ne lance aucune requête réseau distante (protection SSRF)
 ✓ src/test/quizAndData.test.ts (6 tests)
   ✓ contient au moins 15 fiches d'arnaques complètes avec les 12 champs exigés
   ✓ contient au moins 30 questions de quiz avec 4 options et explication pédagogique
   ✓ contient 6 scénarios de simulation interactifs et inoffensifs
   ✓ contient 10 parcours d'urgence distincts (A à J) avec démarches et preuves
   ✓ contient 6 guides pratiques de sécurisation des comptes
   ✓ recense les ressources officielles du Sénégal sans faux numéros
 ✓ src/test/components.test.tsx (4 tests)
   ✓ affiche la page d'accueil avec les 3 boutons d'action et sans formulaire de connexion
   ✓ permet d'analyser un message suspect et d'afficher les indices en direct
   ✓ permet de naviguer et de répondre dans le simulateur de phishing
   ✓ protège l'espace administrateur par code d'accès et rejette les codes invalides

 Test Files  4 passed (4)
      Tests  24 passed (24)
```

---

## 8. Mesures de Sécurité & Confidentialité

1. **Aucune fuite de données d'analyse :** Les textes soumis dans les analyseurs sont nettoyés (masquage Regex des numéros de téléphone et codes secrets) et traités côté client dans le navigateur.
2. **Protection contre les attaques SSRF (Server-Side Request Forgery) :** L'analyseur d'URL n'effectue aucun appel réseau `fetch()` ou `cURL` vers l'URL fournie. L'analyse est purement syntaxique et déterministe.
3. **Protection contre le vol d'identité d'administration :** Aucun mot de passe en dur n'est stocké dans le dépôt Git ; l'authentification administrateur utilise des variables d'environnement session.
4. **Protection contre les fausses accusations publiques :** La plateforme n'héberge aucun forum public permettant de publier des accusations non vérifiées contre un numéro ou un individu.
5. **Avertissement contre les arnaques de sur-escroquerie (Recovery Scams) :** Présence systématique d'alertes prévenant les victimes contre les faux "hackers éthiques" qui réclament des avances pour récupérer de l'argent perdu.

---

## 9. Déploiement en Production

Le projet produit un bundle statique HTML/JS/CSS entièrement autonome dans le répertoire `/dist`.

### Déploiement sur Vercel / Netlify / Cloudflare Pages
- **Build command :** `npm run build`
- **Publish directory :** `dist`
- **Single Page Application Rewrite :**
  Toutes les routes doivent rediriger vers `/index.html` (Vite SPA).

---

## 10. Prochaines Évolutions Recommandées

1. **Extension des traductions Wolof audio :** Ajouter des capsules audio enregistrées en wolof pour les consignes d'urgence afin de rendre la plateforme accessible aux personnes ne sachant pas lire.
2. **Partenariat de sensibilisation avec les associations étudiantes et commerçantes :** Déploiement d'affiches QR Code de sensibilisation dans les marchés et universités de Dakar, Thiès et Saint-Louis.
3. **Module optionnel de signalement direct vers le portail DGPN :** Faciliter la pré-génération du PDF récapitulatif de plainte pour les victimes à déposer auprès de la Division Spéciale de Cybersécurité.

---

<p align="center">
  XamSafe — Conçu pour l'intérêt public et la protection numérique des citoyens du Sénégal.<br>
  <em>Initiative citoyenne bénévole et indépendante.</em>
</p>
