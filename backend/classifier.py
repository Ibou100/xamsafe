"""
Defensive Machine Learning Model for Telecom & Social Engineering Fraud Detection.
Architecture: TF-IDF (n-grams 1-3) + Regularized Logistic Regression Baseline + Rule Detectors.
Applies automated pseudonymization before vectorization.
Outputs calibrated Risk Levels with explainability (no raw percentages).
"""

import json
import os
import re
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

from anonymizer import anonymize_text

# Stop words in French and Wolof to filter from displayed detected clues
FRENCH_WOLOF_STOP_WORDS = {
    "pour", "sur", "de", "du", "des", "la", "le", "les", "un", "une", "et", "en",
    "au", "aux", "vous", "votre", "vos", "nous", "notre", "nos", "ce", "cet",
    "cette", "ces", "dans", "par", "avec", "qui", "que", "quoi", "dont", "est",
    "sont", "a", "ont", "ci", "sa", "say", "ak", "te", "ko", "ne", "pas", "plus",
    "ou", "mais", "mon", "ma", "mes", "ton", "ta", "tes", "son", "se", "si", "sans",
    "y", "d", "l", "j", "m", "t", "s", "n", "c", "qu", "soit", "bien", "car", "ni",
    "sera", "seront", "serait", "seras", "seriez", "serons",
    "ete", "été", "suis", "sommes", "etes", "êtes", "avez", "avons"
}


def load_verified_contacts() -> Dict[str, Dict[str, Any]]:
    """Loads verified contact configuration file (never hardcoded numbers)."""
    contacts_path = os.path.join(os.path.dirname(__file__), "dataset", "verified_contacts.json")
    if os.path.exists(contacts_path):
        try:
            with open(contacts_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def detect_mentioned_organism(text: str) -> Optional[Tuple[str, Optional[str]]]:
    """
    Detects known organisms mentioned in the message text.
    Returns (display_name, verified_phone_if_any).
    """
    lower = text.lower()
    verified_contacts = load_verified_contacts()

    mapping = [
        (r"\bwave\b", "wave", "Wave"),
        (r"\b(?:orange(?:\s+money)?|sonatel)\b", "orange", "Orange Money"),
        (r"\bfree(?:\s+money)?\b", "free", "Free Money"),
        (r"\bcampusen\b", "campusen", "Campusen"),
        (r"\bcbao\b", "cbao", "CBAO"),
        (r"\becobank\b", "ecobank", "Ecobank"),
        (r"\bsenelec\b", "senelec", "Senelec"),
        (r"\bsen'?eau\b", "sen'eau", "Sen'Eau"),
        (r"\bpolice(?:\s+nationale)?\b", "police", "la Police"),
        (r"\bgendarmerie\b", "gendarmerie", "la Gendarmerie"),
        (r"\bdouanes?\b", "douane", "la Douane"),
        (r"\b(?:tribunal|justice|procureur)\b", None, "les Autorités judiciaires"),
        (r"\b(?:banque|uba|boa|sgbs|bnde|bicis)\b", None, "votre banque"),
        (r"\b(?:op[ée]rateur)\b", None, "votre opérateur"),
    ]

    for pattern, key, display_name in mapping:
        if re.search(pattern, lower):
            phone = None
            if key and key in verified_contacts:
                entry = verified_contacts[key]
                if entry.get("verified") is True and entry.get("phone"):
                    phone = entry["phone"]
            return (display_name, phone)

    return None


def is_meaningful_clue(token: str) -> bool:
    """Checks whether a token or n-gram conveys meaningful semantic clue."""
    clean = token.strip().lower()
    words = [w for w in re.split(r"[^\w]+", clean) if w]
    if not words:
        return False
    if len(words) == 1:
        return words[0] not in FRENCH_WOLOF_STOP_WORDS and len(words[0]) >= 3
    meaningful = [w for w in words if w not in FRENCH_WOLOF_STOP_WORDS and len(w) >= 3]
    return len(meaningful) > 0


def analyze_message_motifs(text: str) -> Dict[str, bool]:
    """
    Extracts semantic and behavioral fraud motifs from raw or anonymized text
    covering all 10 threat categories + mobile money engineering.
    """
    lower = text.lower()

    # 1. Menaces : suspension, blocage, fermeture, poursuites, publication de données, injonction de régulariser
    threat_suspension = bool(re.search(
        r"(?:suspendu|suspendre|suspension|bloqu[ée]|bloquer|blocage|fermeture|fermer|coupure|couper|r[ée]sili[ée]|r[ée]siliation|t[ëe]j|t[ëe]je|katt)",
        lower
    ))
    threat_legal_or_data = bool(re.search(
        r"(?:poursuites?|tribunal|huissier|plainte|mandat|procureur|police|commissariat|donn[ée]es\s+(?:personnelles\s+)?publi[ée]es|publi\w*\s+(?:vos\s+)?donn[ée]es|divulgu\w*|diffus\w*|yoon)",
        lower
    ))
    threat_injunction = bool(re.search(
        r"\b(?:r[ée]gularis|r[ée]gularisez|r[ée]gulariser|mettre\s+[àa]\s+jour\s+votre\s+dossier|mise\s+en\s+demeure|sommation)\b",
        lower
    ))
    has_threat = threat_suspension or threat_legal_or_data or threat_injunction

    # 2. Urgence / Ultimatum
    ultimatum = bool(re.search(
        r"(?:dernier\s+avertissement|dernier\s+d[ée]lai|derni[èe]re\s+sommation|ultime\s+avis|sinon|faute\s+de\s+quoi|sous\s+peine|bala)",
        lower
    ))
    temporal_urgency = bool(re.search(
        r"(?:aujourd'?hui|ce\s+jour|ce\s+soir|imm[ée]diatement|rapidement|sans\s+d[ée]lai|dans\s+les\s+24\s*h|sous\s+24\s*h|dans\s+24\s*h|avant\s+ce\s+soir|sous\s+48\s*h|sous\s+12\s*h|sous\s+15\s*min|sous\s+30\s*min|en\s+urgence|\burgente?\b|l[ée]egi|tey|ci\s+s[àa]ss)",
        lower
    ))
    has_urgency_or_ultimatum = ultimatum or temporal_urgency

    # 3. Demande explicite de code secret / PIN / OTP / mot de passe (Règle CRITIQUE)
    is_warning_negation = bool(re.search(
        r"(?:ne\s+(?:le\s+)?(?:partagez?|partager|donnez?|donner|communiquez?|communiquer|transmettez?|transmettre)\s+(?:jamais|pas|avec\s+personne|à\s+personne|personne)|ne\s+jamais\s+(?:partager|donner|communiquer|transmettre))",
        lower
    ))

    raw_demanding_code = bool(re.search(
        r"(?:(?:donner?|donnez?|envoyer?|envoie|envoyez|transmettre|transmets?|transmettez|partager?|partagez?|renvoyer?|renvoie|renvoyez|confirmer?|confirme|confirmez|fournir|fournissez|communiquer?|communique|communiquez|entrer?|entrez|saisir|saisissez|taper?|tapez|dox|doxal|yobantel|yoneel)\b.{0,40}\b(?:code|pin|otp|mot\s+de\s+passe|secret|chiffres?|identifiant))"
        r"|(?:(?:code|pin|otp|mot\s+de\s+passe|secret|chiffres?)\b.{0,50}\b(?:renvoyer?|renvoie|renvoyez|donner?|donnez?|envoyer?|envoyez|partager?|partagez?|transmettre|transmets?|transmettez|que\s+tu\s+as\s+re[çc]u|re[çc]u\s+par\s+sms|envoy[ée]\s+par\s+sms|pour\s+valider|pour\s+d[ée]bloquer|pour\s+annuler|pour\s+confirmer|re[çc]u\s+sur\s+votre\s+t[ée]l[ée]phone))"
        r"|\b(?:kod\s+whatsapp|6\s+chiffres\s+par\s+erreur|confirmez\s+votre\s+code\s+secret)\b",
        lower
    ))
    is_demanding_code = raw_demanding_code and not is_warning_negation

    # Mention d'identifiants bancaires ou données d'accès
    has_credentials_or_code = is_demanding_code or bool(re.search(
        r"(?:code\s+secret|code\s+pin|\bpin\b|mot\s+de\s+passe|informations?\s+bancaires?|coordonn[ée]es\s+bancaires?|num[ée]ro\s+de\s+carte|donn[ée]es\s+bancaires|identifiants?|rib|otp|token_code|\bcni\b|secret\b|kod\b)",
        lower
    ))

    # 4. Faux remboursement / virement par erreur
    has_fake_transfer = bool(re.search(
        r"(?:transfert\s+re[çc]u|erreur\s+de\s+(?:num[ée]ro|virement|d[ée]p[ôo]t|transfert)|virement\s+.*par\s+erreur|tromp[ée]\s+de\s+num[ée]ro|renvoyez|renvoyer|restituer|retourner\s+le\s+montant|juum\s+na)",
        lower
    ))

    # 5. Promesse de gain ou de bourse
    has_gain_or_scholarship = bool(re.search(
        r"(?:bourse|bourse\s+compl[ée]mentaire|s[ée]lectionn[ée]|gagn[ée]|remport[ée]|gain\b|tombola|loterie|tirage\s+au\s+sort|f[ée]licitations|lot\b|am\s+nga\s+xaalis|am\s+nga\s+kado)",
        lower
    ))

    # 6. Demande de paiement de frais (SEULEMENT si le texte parle explicitement de payer/frais/envoyer de l'argent)
    has_fees = bool(re.search(
        r"\b(?:frais|payer|payez|versez|verser|envoyer\s+de\s+l'argent|avancez?|fey|feyal|caution|commission|acompte)\b",
        lower
    ))

    # 7. Incitation à cliquer / lien
    has_click_incentive = bool(re.search(
        r"(?:cliqu|sur\s+ce\s+lien|ce\s+lien|ouvrir\s+le\s+lien|suivez\s+le\s+lien|lien\s+ci-dessous|visiter\s+le\s+lien|besal\s+ci\s+lien|https?://|[a-z0-9-]+\.(?:xyz|top|biz|info|site|online|tk|ga|ml|cf|gq|link|click|sn|com))",
        lower
    ))

    # 8. Usurpation d'organisme
    has_impersonation = bool(re.search(
        r"\b(?:campusen|wave\b|orange\s+money|sonatel|free\s+money|senelec|sen'?eau|dgid|bceao|police\s+nationale|douane|unicef|onu\b|cbao|ecobank)",
        lower
    ))

    # 9. Catégories transversales spécifiques
    has_fake_job = bool(re.search(
        r"(?:offre\s+d'emploi|recrutement|embauche|poste\s+disponible|offres?\s+de\s+travail|liggey|candidature)\b.{0,60}\b(?:frais|caution|dossier|formation|fey)",
        lower
    ))
    has_fake_buyer_seller = bool(re.search(
        r"(?:livreur\s+mandat[ée]|transporteur\s+priv[ée]|avance(?:z|r)?\s+(?:les\s+)?frais|acompte|d[ée]p[ôo]t\s+de\s+garantie|assurance\s+livraison|feyal\s+transport)\b",
        lower
    ))
    has_romance_scam = bool(re.search(
        r"(?:mon\s+ch[ée]ri|mon\s+amour|mon\s+tr[ée]sor|sama\s+xol|sama\s+beug|b[ée]b[ée]|sweetheart)\b.{0,80}\b(?:urgence\s+m[ée]dicale|hospitalis[ée]|douane|taxe|billet\s+d'avion|bloqu[ée]|m[ée]dicaments|op[ée]ration|ambulans|yoneel\s+ma\s+xaalis)",
        lower
    ))
    has_fake_crypto_loan = bool(re.search(
        r"(?:crypto|trading|investissement|pr[êe]t\s+(?:d'argent|express|rapide)|leebal)\b.{0,60}\b(?:gain\s+garanti|100%\s+garanti|sans\s+risque|frais\s+de\s+dossier|frais\s+d'assurance|multipliez|retour\s+sur\s+investissement)",
        lower
    ))
    has_fake_relative = bool(re.search(
        r"(?:c'est\s+(?:maman|papa|ton\s+fils|ta\s+fille)|sa\s+yaay\s+la|sa\s+doom\s+la)\b.{0,50}\b(?:chang[ée]\s+de\s+num[ée]ro|nouveau\s+num[ée]ro|t[ée]l[ée]phone\s+cass[ée]|panne|envoie|yoneel)",
        lower
    ))
    has_fake_parcel = bool(re.search(
        r"(?:colis|paquet|livraison|chronopost|dhl)\b.{0,60}\b(?:d[ée]douanement|frais\s+de\s+port|reprogramm|bloqu[ée]\s+[àa]\s+la\s+poste|taxe|payer)",
        lower
    ))
    has_fake_visa = bool(re.search(
        r"(?:visa|immigration|ambassade|consulat)\b.{0,60}\b(?:garanti|frais\s+de\s+dossier|avance|frais\s+d'ambassade|express)",
        lower
    ))
    has_fake_police = bool(re.search(
        r"(?:police\s+nationale|gendarmerie|tribunal|procureur|mandat\s+d'arr[êe]t|convocation)\b.{0,60}\b(?:amende|p[ée]dopornographie|infraction|imm[ée]diat|payer|r[ée]gularis|yoon)",
        lower
    ))
    has_whatsapp_theft = bool(re.search(
        r"(?:code\s+(?:whatsapp|[àa]\s+6\s+chiffres)|kod\s+whatsapp)\b.{0,50}\b(?:envoy[ée]\s+par\s+erreur|jumte|renvoie|renvoyez|partage|donne)",
        lower
    ))
    has_sextorsion = bool(re.search(
        r"(?:vid[ée]o\s+intime|webcam|sextorsion|contacts\s+et\s+amis|diffus\w*\s+votre\s+vid[ée]o|enregistr[ée]\s+via\s+votre\s+webcam)",
        lower
    ))

    return {
        "has_threat": has_threat,
        "has_urgency_or_ultimatum": has_urgency_or_ultimatum,
        "is_demanding_code": is_demanding_code,
        "has_credentials_or_code": has_credentials_or_code,
        "has_fake_transfer": has_fake_transfer,
        "has_gain_or_scholarship": has_gain_or_scholarship,
        "has_fees": has_fees,
        "has_click_incentive": has_click_incentive,
        "has_impersonation": has_impersonation,
        "has_fake_job": has_fake_job,
        "has_fake_buyer_seller": has_fake_buyer_seller,
        "has_romance_scam": has_romance_scam,
        "has_fake_crypto_loan": has_fake_crypto_loan,
        "has_fake_relative": has_fake_relative,
        "has_fake_parcel": has_fake_parcel,
        "has_fake_visa": has_fake_visa,
        "has_fake_police": has_fake_police,
        "has_whatsapp_theft": has_whatsapp_theft,
        "has_sextorsion": has_sextorsion
    }


class SocialEngineeringClassifier:
    """
    NLP Classifier detecting financial & telecom scam patterns in Senegal
    (French, Wolof, and local mobile money slang).
    """

    RISK_LEVELS = {
        "FAIBLE": "Risque faible : aucun signal connu repéré",
        "MODERE": "Vigilance recommandée : éléments suspects",
        "ELEVE": "Risque élevé : arnaque probable",
        "CRITIQUE": "Menace imminente : arnaque très probable"
    }

    def __init__(self, corpus_path: Optional[str] = None):
        self.corpus_path = corpus_path or os.path.join(
            os.path.dirname(__file__), "dataset", "corpus.json"
        )
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.model: Optional[LogisticRegression] = None
        self.feature_names: List[str] = []
        self.eval_metrics: Dict[str, Any] = {}

    def train(self, test_size: float = 0.25, random_state: int = 42) -> Dict[str, Any]:
        """
        Loads the balanced corpus, anonymizes all samples, splits into Train/Test sets,
        and trains the TF-IDF + LogReg model with performance evaluation.
        """
        if not os.path.exists(self.corpus_path):
            raise FileNotFoundError(f"Corpus file not found at: {self.corpus_path}")

        with open(self.corpus_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_texts = [item["text"] for item in data]
        labels = [item["label"] for item in data]

        # 1. Anonymize all training data (PII redaction)
        clean_texts = [anonymize_text(t)[0] for t in raw_texts]

        # 2. Train / Test Split
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            clean_texts,
            labels,
            test_size=test_size,
            random_state=random_state,
            stratify=labels
        )

        # 3. Build TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            min_df=1,
            max_df=0.95,
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True
        )

        X_train = self.vectorizer.fit_transform(X_train_raw)
        X_test = self.vectorizer.transform(X_test_raw)
        self.feature_names = self.vectorizer.get_feature_names_out()

        # 4. Fit Model
        self.model = LogisticRegression(
            C=2.0,
            class_weight='balanced',
            solver='liblinear',
            random_state=random_state
        )
        self.model.fit(X_train, y_train)

        # 5. Evaluate on Holdout Test Set
        y_pred = self.model.predict(X_test)
        report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        c_matrix = confusion_matrix(y_test, y_pred).tolist()

        self.eval_metrics = {
            "test_samples": len(y_test),
            "precision_fraud": report_dict.get("1", {}).get("precision", 0.0),
            "recall_fraud": report_dict.get("1", {}).get("recall", 0.0),
            "f1_fraud": report_dict.get("1", {}).get("f1-score", 0.0),
            "accuracy": report_dict.get("accuracy", 0.0),
            "confusion_matrix": c_matrix
        }

        # Refit on all data to maximize feature coverage for production inference
        X_all = self.vectorizer.fit_transform(clean_texts)
        self.model.fit(X_all, labels)
        self.feature_names = self.vectorizer.get_feature_names_out()

        return {
            "status": "trained",
            "samples_count": len(clean_texts),
            "features_extracted": len(self.feature_names),
            "evaluation_metrics": self.eval_metrics
        }

    def predict(self, raw_text: str) -> Dict[str, Any]:
        """
        Analyzes an incoming message:
        1. Anonymizes PII
        2. Computes calibrated log-odds score via ML
        3. Applies complementary rule-based checks for threats/ultimatums and critical patterns
        4. Maps to qualitative Risk Levels
        5. Extracts meaningful, stop-word filtered clues
        6. Generates explanations strictly faithful to detected motifs
        7. Produces tailored actionable advice per scam type without phone numbers
        """
        if self.model is None or self.vectorizer is None:
            self.train()

        # Detect organism context and link presence
        org_info = detect_mentioned_organism(raw_text)
        has_actual_link = bool(re.search(
            r"(?:https?://|www\.|[a-z0-9-]+\.(?:com|sn|net|org|xyz|top|site|online|tk|ga|ml|cf|gq|link|click|app|info|biz))",
            raw_text,
            re.IGNORECASE
        ))

        # Build context-aware doubt advice
        if org_info:
            org_display, org_phone = org_info
            if org_phone:
                doubt_advice = f"Contactez {org_display} directement via son application ou son site officiel (au numéro vérifié {org_phone}), pas via le message reçu."
            else:
                doubt_advice = f"Contactez {org_display} directement via son application ou son site officiel, pas via le message reçu."
        else:
            doubt_advice = "Contactez l'organisme concerné par un canal officiel que vous connaissez déjà (application, site, agence). N'utilisez pas les coordonnées du message."

        anonymized, pii_meta = anonymize_text(raw_text)

        if not anonymized.strip():
            return {
                "risk_level": "FAIBLE",
                "risk_label": self.RISK_LEVELS["FAIBLE"],
                "explanations": ["Message vide ou dépourvu de contenu textuel."],
                "detected_clues": [],
                "recommendation": f"Cela ne garantit pas que le message soit sûr. {doubt_advice}",
                "pii_redacted": pii_meta
            }

        # Vectorize
        X_test = self.vectorizer.transform([anonymized])
        decision_margin = float(self.model.decision_function(X_test)[0])
        probabilities = self.model.predict_proba(X_test)[0]
        prob_fraud = float(probabilities[1])

        # Feature explanation (top active weights)
        feature_indices = X_test.nonzero()[1]
        feature_weights = self.model.coef_[0]

        top_scam_clues = []
        top_legit_clues = []

        for idx in feature_indices:
            weight = feature_weights[idx]
            token = self.feature_names[idx]
            if weight > 0.35:
                top_scam_clues.append((token, weight))
            elif weight < -0.35:
                top_legit_clues.append((token, weight))

        # Sort by importance
        top_scam_clues.sort(key=lambda x: x[1], reverse=True)
        top_legit_clues.sort(key=lambda x: x[1])

        # 1. Base ML Qualitative Risk Mapping (Calibrated thresholds)
        if (prob_fraud >= 0.65 or decision_margin >= 0.60) and top_scam_clues:
            ml_risk_level = "CRITIQUE"
        elif (prob_fraud >= 0.50 or decision_margin >= 0.0) and top_scam_clues:
            ml_risk_level = "ELEVE"
        elif prob_fraud >= 0.40 and top_scam_clues:
            ml_risk_level = "MODERE"
        else:
            ml_risk_level = "FAIBLE"

        # 2. Extract motifs from raw and anonymized text
        combined_text = f"{raw_text} {anonymized}"
        motifs = analyze_message_motifs(combined_text)

        # 3. Rule-based detection floors (in complement to ML, not replacing it)
        rank_hierarchy = {"FAIBLE": 1, "MODERE": 2, "ELEVE": 3, "CRITIQUE": 4}
        current_rank = rank_hierarchy[ml_risk_level]

        # RÈGLE CRITIQUE (Étape 6) : Demande de code secret / PIN / OTP / code WhatsApp -> CRITIQUE direct
        if motifs["is_demanding_code"] or motifs["has_whatsapp_theft"]:
            current_rank = 4

        # Règle Menace + Urgence/Ultimatum : au minimum ELEVE (Étape 1 & 3)
        if motifs["has_threat"] and motifs["has_urgency_or_ultimatum"]:
            current_rank = max(current_rank, 3)

        # Règle Chantage / Sextorsion / Webcam : au minimum ELEVE, voire CRITIQUE si ultimatum
        if motifs["has_sextorsion"]:
            if motifs["has_urgency_or_ultimatum"] or motifs["has_fees"]:
                current_rank = 4
            else:
                current_rank = max(current_rank, 3)

        # Règle Faux transfert / remboursement par erreur : au minimum ELEVE si menace ou urgence
        if motifs["has_fake_transfer"] and (motifs["has_urgency_or_ultimatum"] or motifs["has_threat"]):
            current_rank = max(current_rank, 3)

        # Règle Faux gain / bourse : au minimum ELEVE si coordonnées, lien ou frais
        if motifs["has_gain_or_scholarship"] and (
            motifs["has_click_incentive"]
            or motifs["has_credentials_or_code"]
            or motifs["has_fees"]
            or motifs["has_impersonation"]
            or motifs["has_urgency_or_ultimatum"]
        ):
            current_rank = max(current_rank, 3)

        # Règles des catégories spécifiques (Étape 3)
        if motifs["has_fake_job"]:
            current_rank = max(current_rank, 3)
        if motifs["has_fake_buyer_seller"]:
            current_rank = max(current_rank, 3)
        if motifs["has_romance_scam"]:
            current_rank = max(current_rank, 3)
        if motifs["has_fake_crypto_loan"]:
            current_rank = max(current_rank, 3)
        if motifs["has_fake_relative"]:
            current_rank = max(current_rank, 3)
        if motifs["has_fake_parcel"] and (motifs["has_fees"] or motifs["has_click_incentive"]):
            current_rank = max(current_rank, 3)
        if motifs["has_fake_visa"] and (motifs["has_fees"] or motifs["has_urgency_or_ultimatum"]):
            current_rank = max(current_rank, 3)
        if motifs["has_fake_police"] and (motifs["has_fees"] or motifs["has_threat"] or motifs["has_urgency_or_ultimatum"]):
            current_rank = max(current_rank, 3)

        inv_rank = {1: "FAIBLE", 2: "MODERE", 3: "ELEVE", 4: "CRITIQUE"}
        risk_level = inv_rank[current_rank]

        # 4. Filter stop words from detected clues (Point 2)
        meaningful_clues = []
        for c in top_scam_clues:
            token = c[0]
            if is_meaningful_clue(token):
                meaningful_clues.append(token)
            if len(meaningful_clues) >= 5:
                break

        # 5. Explanations strictly faithful to detected motifs (Point 2 & 3)
        explanations = []
        if risk_level in ["CRITIQUE", "ELEVE", "MODERE"]:
            if motifs["has_whatsapp_theft"]:
                explanations.append("Tentative de vol de compte WhatsApp via détournement de code de vérification SMS.")
            elif motifs["is_demanding_code"] or motifs["has_credentials_or_code"]:
                explanations.append("Demande d'informations confidentielles (code secret, PIN ou coordonnées bancaires).")

            if motifs["has_sextorsion"]:
                explanations.append("Tentative de chantage ou sextorsion avec menace de diffusion de contenus privés.")
            elif motifs["has_threat"]:
                explanations.append("Menace de suspension de ligne, poursuites judiciaires ou divulgation de données.")

            if motifs["has_urgency_or_ultimatum"]:
                explanations.append("Pression temporelle injustifiée ou menace de délai strict.")

            if motifs["has_fake_job"]:
                explanations.append("Fausse offre d'emploi exigeant des frais de dossier préalables ou une caution.")
            elif motifs["has_fake_buyer_seller"]:
                explanations.append("Arnaque au faux acheteur ou faux vendeur demandant une avance de frais ou transporteur.")
            elif motifs["has_romance_scam"]:
                explanations.append("Arnaque aux sentiments sollicitant un transfert d'argent d'urgence.")
            elif motifs["has_fake_crypto_loan"]:
                explanations.append("Fausse promesse de gain financier, crypto ou prêt d'argent avec avance de frais.")
            elif motifs["has_fake_relative"]:
                explanations.append("Usurpation d'identité d'un proche prétextant un changement de numéro ou une urgence.")
            elif motifs["has_fake_parcel"]:
                explanations.append("Fausse notification de livraison de colis réclamant des frais ou une reprogrammation.")
            elif motifs["has_fake_visa"]:
                explanations.append("Fausse promesse de visa ou démarche d'immigration conditionnée par des frais.")
            elif motifs["has_fake_police"]:
                explanations.append("Usurpation des autorités judiciaires ou policières exigeant un paiement immédiat.")
            elif motifs["has_gain_or_scholarship"]:
                explanations.append("Promesse de gain, loterie ou attribution d'une bourse.")

            if motifs["has_fake_transfer"]:
                explanations.append("Mécanique de faux virement reçu par erreur incitant à renvoyer des fonds.")

            # Demande de paiement de frais (SEULEMENT si le texte parle de payer/frais/envoyer de l'argent)
            if motifs["has_fees"] and not (motifs["has_fake_job"] or motifs["has_fake_crypto_loan"] or motifs["has_fake_parcel"]):
                explanations.append("Demande de paiement de frais préalables ou d'envoi d'argent.")

            # Incitation à cliquer (SEULEMENT si un lien est détecté ou demandé)
            if motifs["has_click_incentive"] or has_actual_link:
                explanations.append("Incitation à cliquer sur un lien externe pour valider ou confirmer une démarche.")

            if motifs["has_impersonation"]:
                explanations.append("Usurpation ou utilisation du nom d'un organisme ou opérateur officiel.")

            # Fallback if no specific motif matches
            if not explanations:
                explanations.append("Ce message ressemble à des arnaques connues.")
        else:
            # Wording niveau FAIBLE (Point 4)
            explanations.append("Aucun signal d'arnaque connu repéré.")

        # 6. Tailored advice per scam motif (Point 3 & Étape 2)
        if risk_level in ["CRITIQUE", "ELEVE", "MODERE"]:
            if motifs["is_demanding_code"] or motifs["has_whatsapp_theft"]:
                primary_advice = "Ne donnez jamais votre code, PIN ou mot de passe, même à quelqu'un qui dit être de l'opérateur ou un ami."
            elif motifs["has_fake_transfer"]:
                primary_advice = "Ne renvoyez rien. Vérifiez votre solde via l'application officielle."
            elif motifs["has_fake_relative"]:
                primary_advice = "Ne transférez aucun argent. Appelez directement votre proche sur son numéro habituel pour vérifier son identité."
            elif motifs["has_fake_job"]:
                primary_advice = "Ne payez aucun frais de dossier, de caution ou de formation pour obtenir un emploi."
            elif motifs["has_fake_buyer_seller"]:
                primary_advice = "N'expédiez aucun bien et ne payez aucun frais avant confirmation directe sur votre compte officiel."
            elif motifs["has_romance_scam"]:
                primary_advice = "Méfiez-vous des demandes d'argent pour urgence médicale ou douane venant d'une relation en ligne."
            elif motifs["has_fake_crypto_loan"]:
                primary_advice = "Méfiez-vous des gains garantis et ne versez jamais de frais préalables pour débloquer un prêt."
            elif motifs["has_fake_parcel"]:
                primary_advice = "Ne réglez aucun frais imprévu et vérifiez votre suivi directement sur le site officiel du transporteur."
            elif motifs["has_fake_visa"]:
                primary_advice = "Aucun visa ni bourse d'études légitime ne s'obtient contre un transfert d'argent informel."
            elif motifs["has_fake_police"]:
                primary_advice = "Les autorités judiciaires ou de police ne réclament jamais de paiement d'amende par transfert mobile immédiat."
            elif motifs["has_sextorsion"] or motifs["has_threat"]:
                primary_advice = "Ne cédez pas au chantage et ne paniquez pas. Conservez les preuves et ne versez aucun fond."
            elif motifs["has_gain_or_scholarship"]:
                primary_advice = "Aucun organisme sérieux ne demande de payer pour recevoir un gain."
            elif has_actual_link or motifs["has_click_incentive"]:
                primary_advice = "Ne cliquez pas et ne saisissez aucune information. Passez par le site ou l'application officiels."
            elif motifs["has_credentials_or_code"]:
                primary_advice = "Ne saisissez et ne communiquez aucune coordonnée bancaire confidentielle."
            else:
                primary_advice = "Restez sur vos gardes et ne donnez pas suite à ce message suspect."

            recommendation = f"{primary_advice} {doubt_advice}"
        else:
            recommendation = f"Cela ne garantit pas que le message soit sûr. {doubt_advice}"

        return {
            "risk_level": risk_level,
            "risk_label": self.RISK_LEVELS[risk_level],
            "explanations": explanations,
            "detected_clues": meaningful_clues,
            "recommendation": recommendation,
            "pii_redacted": pii_meta
        }
