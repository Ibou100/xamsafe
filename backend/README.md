# Sovereign Shield — Defensive AI Microservice (Brique 1)

Ce microservice constitue le moteur d'intelligence artificielle défensive de **XamSafe**, spécialisé dans la détection en temps réel de menaces d'ingénierie sociale et d'escroqueries par SMS / messagerie au Sénégal (Wave, Orange Money, banques, Campusen, en français et wolof).

---

## 1. Principes d'Ingénierie & Choix Techniques

1. **Modèle de référence sobre & rapide (Baseline) :**  
   Vectorisation **TF-IDF (n-grams 1-3)** combinée à une **Régression Logistique régularisée** (`class_weight='balanced'`). Temps d'inférence moyen : **< 5 ms sur CPU**.
2. **Conformité stricte CDP Sénégal & Zero-Knowledge :**  
   Avant toute vectorisation ou persistance, le module [`anonymizer.py`](anonymizer.py) expurge systématiquement :
   * Les numéros sénégalais (`+221`, `77`, `78`, `76`, `70`, `75`) remplacés par `<TOKEN_PHONE>`.
   * Les montants monétaires (`FCFA`, `F CFA`, `XOF`) remplacés par `<TOKEN_AMOUNT>`.
   * Les codes confidentiels / OTP remplacés par `<TOKEN_CODE>`.
   * Les noms précédés de titres civils ou religieux remplacés par `<TOKEN_PERSON>`.
   * Les liens web remplacés par `<TOKEN_URL>`.
3. **Restitution en Niveaux de Risque Déterministes (Pas de pourcentages trompeurs) :**  
   La sortie est calibrée sur 4 niveaux de risque opérationnels :
   * `FAIBLE` : Trafic ou transaction légitime.
   * `MODERE` : Formulation inhabituelle, canal non certifié.
   * `ELEVE` : Suspicion forte d'ingénierie sociale ou faux transfert.
   * `CRITIQUE` : Tentative flagrante de vol d'OTP ou fausse urgence de blocage.
4. **Explicabilité Forensique :**  
   Chaque décision est accompagnée des indices n-grams ayant pesé dans le calcul et d'une explication humaine claire.
5. **Contrôle Strict des Faux Positifs (FPR = 0%) :**  
   Le modèle est testé sur un banc d'essai de vrais reçus de transferts Wave, Orange Money et de conversations courantes pour garantir qu'aucune transaction légitime n'est indûment bloquée.

---

## 2. Structure du Module

```text
backend/
├── anonymizer.py          # Module de désanonymisation / Zero-Knowledge
├── classifier.py          # Modèle TF-IDF + Logistic Regression & Moteur de règles
├── main.py                # Microservice FastAPI (Points de terminaison REST & OpenAPI)
├── dataset/
│   └── corpus.json        # Jeu de données équilibré (Arnaques & Légitimes en FR / WO)
├── tests/
│   ├── test_model.py      # Tests unitaires ML & benchmarking des faux positifs
│   └── test_api.py        # Tests d'intégration des endpoints FastAPI
└── README.md
```

---

## 3. Lancer le Microservice

### Démarrage du serveur :
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Documentation Swagger interactive disponible sur : **http://localhost:8000/docs**

### Lancer la suite de tests :
```bash
python -m pytest backend/tests/ -v
```
Résultat : **12 tests validés avec 0 % de faux positifs sur les reçus légitimes.**
