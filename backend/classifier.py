"""
Defensive Machine Learning Model for Telecom & Social Engineering Fraud Detection.
Architecture: TF-IDF (n-grams 1-3) + Regularized Logistic Regression Baseline + Rule Detectors.
Applies automated pseudonymization before vectorization.
Outputs calibrated Risk Levels with explainability (no raw percentages).
"""

import json
import os
import re
from typing import Dict, List, Any, Optional
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
    "y", "d", "l", "j", "m", "t", "s", "n", "c", "qu", "soit", "bien", "car", "ni"
}

OPERATOR_CONTACT_SUFFIX = (
    " En cas de doute, contactez votre opérateur via son numéro officiel "
    "(ex: 1441 pour Orange, support dans l'application Wave, 200244 pour Free)."
)


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
    Extracts semantic and behavioral fraud motifs from raw or anonymized text.
    """
    lower = text.lower()

    # 1. Menaces : suspension, blocage, fermeture, poursuites, publication de données, injonction de régulariser
    threat_suspension = bool(re.search(
        r"(?:suspendu|suspendre|suspension|bloqu[ée]|bloquer|blocage|fermeture|fermer|coupure|couper|r[ée]sili[ée]|r[ée]siliation|t[ëe]j|t[ëe]je|katt)",
        lower
    ))
    threat_legal_or_data = bool(re.search(
        r"(?:poursuites?|tribunal|huissier|plainte|mandat|police|commissariat|donn[ée]es\s+(?:personnelles\s+)?publi[ée]es|publi\w*\s+(?:vos\s+)?donn[ée]es|divulgu\w*|diffus\w*|yoon)",
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
        r"(?:aujourd'?hui|ce\s+jour|imm[ée]diatement|rapidement|sans\s+d[ée]lai|dans\s+les\s+24\s*h|sous\s+24\s*h|dans\s+24\s*h|avant\s+ce\s+soir|sous\s+48\s*h|sous\s+15\s*min|sous\s+30\s*min|en\s+urgence|\burgente?\b|l[ée]egi|tey|ci\s+s[àa]ss)",
        lower
    ))
    has_urgency_or_ultimatum = ultimatum or temporal_urgency

    # 3. Demande d'informations bancaires / code / PIN / identifiants
    has_credentials_or_code = bool(re.search(
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
        r"\b(?:frais|payer|payez|versez|verser|envoyer\s+de\s+l'argent|avancez?|fey|feyal)\b",
        lower
    ))

    # 7. Incitation à cliquer / lien
    has_click_incentive = bool(re.search(
        r"(?:cliqu|sur\s+ce\s+lien|ce\s+lien|ouvrir\s+le\s+lien|suivez\s+le\s+lien|lien\s+ci-dessous|visiter\s+le\s+lien|besal\s+ci\s+lien|https?://|[a-z0-9-]+\.(?:xyz|top|biz|info|site|online|tk|ga|ml|cf|gq|link|click|sn|com))",
        lower
    ))

    # 8. Usurpation d'organisme
    has_impersonation = bool(re.search(
        r"\b(?:campusen|wave\b|orange\s+money|sonatel|free\s+money|senelec|sen'?eau|dgid|bceao|police\s+nationale|douane|unicef|onu\b)",
        lower
    ))

    return {
        "has_threat": has_threat,
        "has_urgency_or_ultimatum": has_urgency_or_ultimatum,
        "has_credentials_or_code": has_credentials_or_code,
        "has_fake_transfer": has_fake_transfer,
        "has_gain_or_scholarship": has_gain_or_scholarship,
        "has_fees": has_fees,
        "has_click_incentive": has_click_incentive,
        "has_impersonation": has_impersonation,
    }


class SocialEngineeringClassifier:
    """
    NLP Classifier detecting financial & telecom scam patterns in Senegal
    (French, Wolof, and local mobile money slang).
    """

    RISK_LEVELS = {
        "FAIBLE": "Aucun signal d'arnaque connu repéré. Cela ne garantit pas que le message soit sûr : en cas de doute, vérifiez auprès de l'organisme concerné.",
        "MODERE": "Vigilance conseillée : formulation inhabituelle ou canal non certifié",
        "ELEVE": "Forte suspicion d'ingénierie sociale ou de tentative d'escroquerie",
        "CRITIQUE": "Menace imminente : tentative d'extorsion de code secret ou faux support"
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
        7. Produces tailored actionable advice per scam type
        """
        if self.model is None or self.vectorizer is None:
            self.train()

        anonymized, pii_meta = anonymize_text(raw_text)

        if not anonymized.strip():
            return {
                "risk_level": "FAIBLE",
                "risk_label": self.RISK_LEVELS["FAIBLE"],
                "explanations": ["Message vide ou dépourvu de contenu textuel."],
                "detected_clues": [],
                "recommendation": (
                    f"Aucun signal d'arnaque connu repéré. Cela ne garantit pas que le message soit sûr : "
                    f"en cas de doute, vérifiez auprès de l'organisme concerné.{OPERATOR_CONTACT_SUFFIX}"
                ),
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

        # Rule 1: Threat + Urgency/Ultimatum must result in AT LEAST ELEVE
        if motifs["has_threat"] and motifs["has_urgency_or_ultimatum"]:
            current_rank = max(current_rank, 3)

        # Rule 2: Credentials / OTP / PIN request combined with urgency, brand or link is AT LEAST ELEVE
        if motifs["has_credentials_or_code"] and (
            motifs["has_urgency_or_ultimatum"] or motifs["has_impersonation"] or motifs["has_click_incentive"]
        ):
            current_rank = max(current_rank, 3)

        # Rule 3: Fake transfer / refund claim combined with urgency or threat is AT LEAST ELEVE
        if motifs["has_fake_transfer"] and (motifs["has_urgency_or_ultimatum"] or motifs["has_threat"]):
            current_rank = max(current_rank, 3)

        # Rule 4: Fake gain / tombola or scholarship combined with bank info / link / fees / brand / urgency is AT LEAST ELEVE
        if motifs["has_gain_or_scholarship"] and (
            motifs["has_click_incentive"]
            or motifs["has_credentials_or_code"]
            or motifs["has_fees"]
            or motifs["has_impersonation"]
            or motifs["has_urgency_or_ultimatum"]
        ):
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

        # 5. Explanations strictly faithful to detected motifs (Point 2)
        explanations = []
        if risk_level in ["CRITIQUE", "ELEVE", "MODERE"]:
            # Motif: Demande d'informations bancaires/code/PIN
            if motifs["has_credentials_or_code"]:
                explanations.append("Demande d'informations confidentielles (code secret, PIN ou coordonnées bancaires).")
            # Motif: Urgence temporelle
            if motifs["has_urgency_or_ultimatum"]:
                explanations.append("Pression temporelle injustifiée ou menace de délai strict.")
            # Motif: Promesse de gain ou de bourse
            if motifs["has_gain_or_scholarship"]:
                explanations.append("Promesse de gain, loterie ou attribution d'une bourse.")
            # Motif: Demande de paiement de frais (SEULEMENT si le texte parle de payer/frais/envoyer de l'argent)
            if motifs["has_fees"]:
                explanations.append("Demande de paiement de frais préalables ou d'envoi d'argent.")
            # Motif: Incitation à cliquer
            if motifs["has_click_incentive"]:
                explanations.append("Incitation à cliquer sur un lien externe pour valider ou confirmer une démarche.")
            # Motif: Usurpation d'organisme
            if motifs["has_impersonation"]:
                explanations.append("Usurpation ou utilisation du nom d'un organisme ou opérateur officiel.")
            # Motif: Menace / ultimatum
            if motifs["has_threat"]:
                explanations.append("Menace de suspension de ligne, poursuites judiciaires ou divulgation de données.")
            # Motif: Faux remboursement / virement
            if motifs["has_fake_transfer"]:
                explanations.append("Mécanique de faux virement reçu par erreur incitant à renvoyer des fonds.")

            # Fallback if no specific motif matches
            if not explanations:
                explanations.append("Ce message ressemble à des arnaques connues.")
        else:
            # Wording niveau FAIBLE (Point 4)
            explanations.append(
                "Aucun signal d'arnaque connu repéré. Cela ne garantit pas que le message soit sûr : en cas de doute, vérifiez auprès de l'organisme concerné."
            )

        # 6. Tailored advice per scam motif (Point 3)
        if risk_level in ["CRITIQUE", "ELEVE", "MODERE"]:
            # Priority: code/PIN/OTP -> faux virement -> gain/bourse -> bank info/link -> threat/ultimatum
            if bool(re.search(r"\b(?:code|pin|otp|secret|mot\s+de\s+passe)\b", combined_text.lower())):
                primary_advice = "Ne donnez jamais votre code ou PIN, même à quelqu'un qui dit être de l'opérateur."
            elif motifs["has_fake_transfer"]:
                primary_advice = "Ne renvoyez rien. Vérifiez votre solde via l'application officielle."
            elif motifs["has_gain_or_scholarship"]:
                primary_advice = "Aucun organisme sérieux ne demande de payer pour recevoir un gain."
            elif motifs["has_click_incentive"] or motifs["has_credentials_or_code"]:
                primary_advice = "Ne cliquez pas et ne saisissez aucune information. Passez par le site ou l'application officiels."
            elif motifs["has_threat"] or motifs["has_urgency_or_ultimatum"]:
                primary_advice = "Ne paniquez pas. Contactez directement l'organisme via son numéro officiel."
            else:
                primary_advice = "Restez sur vos gardes et ne donnez pas suite à ce message suspect."
            recommendation = f"{primary_advice}{OPERATOR_CONTACT_SUFFIX}"
        else:
            recommendation = (
                f"Aucun signal d'arnaque connu repéré. Cela ne garantit pas que le message soit sûr : "
                f"en cas de doute, vérifiez auprès de l'organisme concerné.{OPERATOR_CONTACT_SUFFIX}"
            )

        return {
            "risk_level": risk_level,
            "risk_label": self.RISK_LEVELS[risk_level],
            "explanations": explanations,
            "detected_clues": meaningful_clues,
            "recommendation": recommendation,
            "pii_redacted": pii_meta
        }
