# Sovereign Shield — Defensive AI & OSINT Microservice (MVP)

Moteur d'ingénierie défensive pour l'analyse de messages (Brique 1 NLP) et d'infrastructure réseau (Brique 2 OSINT), adapté au contexte du Sénégal et de l'Afrique de l'Ouest.

---

## 1. Principes d'Ingénierie & Choix Techniques

* **Brique 1 — Modèle ML Sobre & Rapide (Baseline) :**  
  Vectorisation **TF-IDF (n-grams 1-3)** combinée à une **Régression Logistique régularisée** (`class_weight='balanced'`). Temps d'inférence moyen : **< 5 ms sur CPU**.
* **Brique 2 — Hiérarchisation des Signaux d'Infrastructure :**
  1. **Âge du domaine (Priorité 1 - RDAP RFC 7480) :** Signalement des domaines créés il y a moins de 48 heures ou moins de 7 jours. Les domaines très récents sont fréquemment utilisés dans les campagnes de phishing. Gestion explicite de l'incertitude (`domain_age_status: "inconnu"` quand l'extension ou le registre ne répond pas).
  2. **Typosquatting & Usurpation de Marque (Priorité 2) :** Distance de Levenshtein calibrée (distance max 1 pour les marques de 5 lettres ou moins, max 2 pour les marques plus longues) avec **condition de confirmation obligatoire** (TLD à risque, mot-clé d'authentification, homoglyphe) pour éviter les fausses alertes sur des mots courants (`cave`, `save`, `tree`).
  3. **Extensions à risque (Priorité 3) :** Détection des TLDs à bas coût surreprésentés dans les abus (`.xyz`, `.top`, `.click`, `.buzz`, etc.).
  4. **Hébergement / Registre (Signal secondaire) :** Conservé comme signal d'appui informatif.
* **Protection des données personnelles :**  
  Anonymisation automatique et préalable (`anonymizer.py`) des numéros de téléphone sénégalais (formats variés : espaces, tirets, points, +221, 00221), montants en FCFA, codes secrets/OTP, noms de personnes et liens web avant vectorisation.
* **Restitution en Niveaux de Risque Déterministes (Pas de pourcentages bruts) :**  
  Sortie calibrée sur 4 niveaux d'action : `FAIBLE`, `MODERE`, `ELEVE`, `CRITIQUE`.

---

## 2. Liste Blanche des Domaines Officiels Reconnus

> [!IMPORTANT]
> **Validation Requise :** La comparaison s'effectue sur le nom de domaine enregistrable exact (`hostname == domain` ou `hostname.endswith('.' + domain)`). Les sous-chaînes partielles sont rejetées. Merci de valider manuellement cette liste :

| Marque / Institution | Domaines Officiels Autorisés | Statut |
| :--- | :--- | :---: |
| **Wave Mobile Money** | `wave.com`, `wave.sn` | À valider |
| **Orange / Sonatel** | `orange.sn`, `orange.com`, `sonatel.sn` | À valider |
| **Free Sénégal** | `free.sn` | À valider |
| **Campusen (Bourses / État)** | `campusen.sn` | À valider |
| **CBAO Attijariwafa Bank** | `cbao.sn`, `attijariwafabank.com` | À valider |
| **Ecobank** | `ecobank.com` | À valider |
| **Senelec** | `senelec.sn` | À valider |
| **Sen'Eau** | `seneau.sn` | À valider |
| **Police Nationale (DSC)** | `signalementcyber.dgpn.sn`, `policenationale.gouv.sn` | À valider |

*Message retourné lors d'une correspondance :* `« Correspond à un domaine officiel connu »`.

---

## 3. Limites et Avertissements Scientifiques

1. **Représentativité du Corpus :**  
   Le jeu de données actuel ([`dataset/corpus.json`](dataset/corpus.json)) est un échantillon de prototypage représentatif mais rédigé et calibré manuellement. **Il ne constitue pas une preuve de généralisation sur des millions de flux réels non vus.**
2. **Collecte Éthique & Pipeline d'Enrichissement :**  
   Le script [`import_data.py`](import_data.py) est prévu pour intégrer de futurs messages réels. Il impose obligatoirement un indicateur explicite de consentement (`consent_obtained: True`) et applique l'anonymisation avant tout archivage.
3. **Incertitude RDAP :**  
   Certaines extensions territoriales (notamment certains registres `.sn`) ou des coupures réseau ne permettent pas de récupérer la date de création. Dans ce cas, le statut est explicitement marqué comme `"inconnu"` et n'est pas utilisé seul pour sur-évaluer le risque.

---

## 4. Structure du Code

```text
backend/
├── anonymizer.py          # Module d'anonymisation multi-formats & détection de noms
├── classifier.py          # Modèle TF-IDF + Logistic Regression, Split Train/Test & Explications
├── domain_scanner.py      # Scanner RDAP (cache & incertitude), Levenshtein calibré & Whitelist
├── import_data.py         # Pipeline d'ingestion de messages réels avec consentement
├── main.py                # Microservice FastAPI (Points de terminaison REST & OpenAPI)
├── dataset/
│   ├── corpus.json        # Jeu de données de référence
│   └── corpus_imported.json # Données réelles anonymisées avec consentement
├── tests/
│   ├── test_model.py          # Tests unitaires ML, formats de numéros & train/test metrics
│   ├── test_domain_scanner.py # Tests RDAP simulés (succès, 404, timeout), whitelist & exceptions
│   └── test_api.py            # Tests d'intégration des endpoints FastAPI
└── README.md
```

---

## 5. Déploiement en Production (Render / Railway)

Le microservice est conçu pour être hébergé facilement sur un hébergeur cloud gratuit ou managé (Render, Railway, Fly.io) :

> [!NOTE]
> **Démarrage à froid (Cold Start) :**
> Sur les offres gratuites (Render Free Tier notamment), le serveur entre en veille après 15 minutes d'inactivité. Le premier appel API peut nécessiter un délai de démarrage à froid de **30 à 60 secondes**. L'interface XamSafe intègre une sonde d'éveil automatique en arrière-plan (`/health`) pour réveiller le service.

### Déploiement sur Render (Web Service) :
1. Créez un nouveau **Web Service** sur [Render.com](https://render.com).
2. Connectez le dépôt GitHub `XamSafe`.
3. Configurez les paramètres :
   - **Root Directory :** `backend`
   - **Environment :** `Python 3`
   - **Build Command :** `pip install -r requirements.txt`
   - **Start Command :** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Ajoutez la variable d'environnement :
   - `CORS_ORIGINS` = `https://xam-safe.vercel.app,http://localhost:5173`
5. L'URL générée (ex : `https://xamsafe-api.onrender.com`) servira de `VITE_API_URL` pour le frontend.

### Déploiement sur Railway :
1. Créez un projet sur [Railway.app](https://railway.app).
2. Déployez à partir du sous-dossier `backend` (Railway détecte automatiquement `requirements.txt` et `Procfile`).
3. Ajoutez la variable `CORS_ORIGINS` dans l'onglet **Variables**.

---

## 6. Exécution des Tests & Démarrage Local

### Démarrage de l'API en local :
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Lancer la suite de tests complète :
```bash
python -m pytest backend/tests/ -v
```
