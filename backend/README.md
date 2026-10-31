# Sovereign Shield — Defensive AI & OSINT Microservice (MVP)

Moteur d'ingénierie défensive pour l'analyse de messages (Brique 1 NLP) et d'infrastructure réseau (Brique 2 OSINT), adapté au contexte du Sénégal et de l'Afrique de l'Ouest.

---

## 1. Principes d'Ingénierie & Choix Techniques

* **Brique 1 — Modèle ML Sobre & Rapide (Baseline) :**  
  Vectorisation **TF-IDF (n-grams 1-3)** combinée à une **Régression Logistique régularisée** (`class_weight='balanced'`). Temps d'inférence moyen : **< 5 ms sur CPU**.
* **Brique 2 — Hiérarchisation des Signaux d'Infrastructure :**
  1. **Liens Raccourcis (Priorité Haute) :** Les services de raccourcissement connus (`shorteners.json` : `bit.ly`, `tinyurl.com`, `t.co`, `cutt.ly`, `is.gd`, etc.) masquent leur destination réelle. Ils sont automatiquement classés au minimum au niveau **MODERE** avec recommandation explicite. **Le scanner ne visite jamais le lien sortant** (protection stricte anti-SSRF).
  2. **Âge du domaine (Priorité 1 - RDAP RFC 7480) :** Signalement des domaines créés il y a moins de 48 heures ou moins de 7 jours. Les domaines très récents sont fréquemment utilisés dans les campagnes de phishing. Gestion explicite de l'incertitude (`domain_age_status: "inconnu"` quand l'extension ou le registre ne répond pas).
  3. **Typosquatting & Usurpation de Marque (Priorité 2) :** Distance de Levenshtein calibrée (distance max 1 pour les marques de 5 lettres ou moins, max 2 pour les marques plus longues) avec **condition de confirmation obligatoire** (TLD à risque, mot-clé d'authentification, homoglyphe) pour éviter les fausses alertes sur des mots courants (`cave`, `save`, `tree`).
  4. **Extensions à risque (Priorité 3) :** Détection des TLDs à bas coût surreprésentés dans les abus (`.xyz`, `.top`, `.click`, `.buzz`, etc.).
  5. **Hébergement / Registre (Signal secondaire) :** Conservé comme signal d'appui informatif.
* **Protection des données personnelles :**  
  Anonymisation automatique et préalable (`anonymizer.py`) des numéros de téléphone sénégalais (formats variés : espaces, tirets, points, +221, 00221), montants en FCFA, codes secrets/OTP, noms de personnes et liens web avant vectorisation.
* **Restitution en Niveaux de Risque Déterministes (Pas de pourcentages bruts) :**  
  Sortie calibrée sur 4 niveaux d'action : `FAIBLE`, `MODERE`, `ELEVE`, `CRITIQUE`.

---

## 2. Liste Blanche des Domaines Officiels Reconnus

> [!IMPORTANT]
> **Validation Requise :** La comparaison s'effectue sur le nom de domaine enregistrable exact (`hostname == domain` ou `hostname.endswith('.' + domain)`). Les sous-chaînes partielles sont rejetées.
> Par défaut, chaque domaine de la configuration [`official_domains.json`](official_domains.json) porte la mention `"verified": false`. Tant qu'il n'est pas validé manuellement, un domaine officiel n'est ni présenté comme officiellement certifié, ni sur-alerté à tort.

| Marque / Institution | Domaines Officiels Autorisés | Statut par défaut |
| :--- | :--- | :---: |
| **Wave Mobile Money** | `wave.com`, `wave.sn` | `verified: false` |
| **Orange / Sonatel** | `orange.sn`, `orange.com`, `sonatel.sn` | `verified: false` |
| **Free Sénégal** | `free.sn` | `verified: false` |
| **Campusen (Bourses / État)** | `campusen.sn` | `verified: false` |
| **CBAO Attijariwafa Bank** | `cbao.sn`, `attijariwafabank.com` | `verified: false` |
| **Ecobank** | `ecobank.com` | `verified: false` |
| **Senelec** | `senelec.sn` | `verified: false` |
| **Sen'Eau** | `seneau.sn` | `verified: false` |
| **Police Nationale (DSC)** | `signalementcyber.dgpn.sn`, `policenationale.gouv.sn` | `verified: false` |

---

## 3. Limites et Avertissements Scientifiques

1. **Représentativité du Corpus & Données Écrites à la Main :**  
   Le jeu d'entraînement actuel ([`dataset/corpus.json`](dataset/corpus.json)) ainsi que le jeu de test gelé ([`dataset/frozen_test_set.json`](dataset/frozen_test_set.json)) sont des échantillons synthétiques rédigés et calibrés à la main. **Les métriques rapportées portent exclusivement sur ces données artisanales et ne constituent pas une preuve de généralisation sur des flux réels non supervisés.**
2. **Collecte Éthique & Pipeline d'Enrichissement :**  
   Le script [`import_data.py`](import_data.py) est prévu pour intégrer de futurs messages réels. Il impose obligatoirement un indicateur explicite de consentement (`consent_verified: True`) et applique l'anonymisation avant tout archivage.
3. **Incertitude RDAP :**  
   Certaines extensions territoriales (notamment certains registres `.sn`) ou des coupures réseau ne permettent pas de récupérer la date de création. Dans ce cas, le statut est explicitement marqué comme `"inconnu"` et n'est pas utilisé seul pour sur-évaluer le risque.
4. **Limitation du Rate Limiter en Mémoire :**  
   Le compteur de requêtes (20 req/min) fonctionne en mémoire vive locale du serveur. **Il est réinitialisé à chaque redémarrage de processus ou nouveau déploiement de conteneur.** Pour un cluster multi-instances, un cache Redis partagé sera requis.

---

## 4. Structure du Code

```text
backend/
├── anonymizer.py              # Anonymisation multi-formats & détection de noms
├── classifier.py              # Modèle TF-IDF + Logistic Regression, Split Train/Test, Moteur de règles
├── domain_scanner.py          # Scanner RDAP (cache LRU+TTL), Levenshtein calibré, Whitelist
├── rate_limiter.py            # Limiteur de débit avec gestion sécurisée de TRUST_PROXY
├── shorteners.json            # Liste des noms de domaine de raccourcisseurs d'URL connus
├── official_domains.json      # Liste blanche isolée avec drapeaux 'verified'
├── import_data.py             # Pipeline d'ingestion de messages réels avec consentement
├── main.py                    # Microservice FastAPI (Points de terminaison REST & OpenAPI)
├── dataset/
│   ├── corpus.json            # Jeu de données d'entraînement de référence (342 échantillons équilibrés)
│   ├── corpus_imported.json   # Données réelles anonymisées avec consentement
│   ├── verified_contacts.json # Répertoire des canaux et numéros officiels vérifiés
│   ├── regression_cases.json  # Suite de régression de 16 cas réels critiques
│   └── frozen_test_set.json   # Jeu d'évaluation gelé indépendant (24 cas FR/WO)
├── tests/
│   ├── test_model.py              # Tests unitaires ML & anonymisation
│   ├── test_domain_scanner.py     # Tests RDAP, shorteners, whitelist 'verified: false'
│   ├── test_api.py                # Tests API, sécurité headers, SSRF, proxy rate limit
│   ├── test_unified_analysis.py   # Tests fusion brique 1 & brique 2 (4 cas obligatoires)
│   ├── test_regression_cases.py   # Tests de non-régression sur l'API POST /api/v1/analyze
│   └── test_frozen_evaluation.py  # Évaluation indépendante sur le jeu de test gelé
└── README.md
```

---

## 5. Configuration Vercel & Déploiement en Production

### Variable d'environnement Frontend (Vercel) :
Pour connecter le frontend hébergé sur Vercel à votre backend, configurez la variable suivante dans le tableau de bord Vercel (**Settings > Environment Variables**) :

- **Nom :** `VITE_API_URL`
- **Valeur :** `https://votre-backend.onrender.com` (doit impérativement être en `https://`)
- **Environnements :** Production, Preview, Development

> [!WARNING]
> Si `VITE_API_URL` n'est pas configurée lors d'un build de production, le frontend bascule automatiquement et de manière transparente en mode **hors ligne strict** (moteur heuristique local embarqué dans le navigateur) sans jamais tenter de se connecter à localhost.

### Déploiement du Backend sur Render (Web Service) :
1. Créez un nouveau **Web Service** sur [Render.com](https://render.com).
2. Connectez le dépôt GitHub `XamSafe`.
3. Configurez les paramètres :
   - **Root Directory :** `backend`
   - **Environment :** `Python 3`
   - **Build Command :** `pip install -r requirements.txt`
   - **Start Command :** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Ajoutez les variables d'environnement dans l'onglet **Environment** :
   - `CORS_ORIGINS` = `https://xam-safe.vercel.app,http://localhost:5173`
   - `TRUST_PROXY` = `true` (nécessaire derrière le proxy de Render pour lire correctement les adresses IP)
5. L'URL générée (ex : `https://xamsafe-api.onrender.com`) sera la valeur à renseigner dans `VITE_API_URL` sur Vercel.

---

## 6. Exécution des Tests & Démarrage Local

### Démarrage de l'API en local :
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Lancer la suite de tests complète (Python / pytest) :
```bash
python -m pytest backend/tests/ -v
```

### Évaluer le modèle sur le jeu gelé :
```bash
python -m pytest backend/tests/test_frozen_evaluation.py -s
```
