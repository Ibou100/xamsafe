"""
Defensive Machine Learning Model for Telecom & Social Engineering Fraud Detection.
Architecture: TF-IDF (n-grams 1-3) + Regularized Logistic Regression Baseline.
Complies with Zero-Knowledge (PII stripped before vectorization) and outputs
calibrated Risk Levels with explainability (no raw percentages).
"""

import json
import os
from typing import Dict, List, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from anonymizer import anonymize_text


class SocialEngineeringClassifier:
    """
    NLP Classifier detecting financial & telecom scam patterns in Senegal
    (French, Wolof, and local mobile money slang).
    """

    RISK_LEVELS = {
        "FAIBLE": "Communication normale sans indicateur de menace",
        "MODERE": "Vigilance conseillée : formulation inhabituelle ou canal non certifié",
        "ELEVE": "Forte suspicion d'ingénierie sociale ou de faux transfert",
        "CRITIQUE": "Menace imminente : tentative d'extorsion de code secret ou faux support"
    }

    def __init__(self, corpus_path: Optional[str] = None):
        self.corpus_path = corpus_path or os.path.join(
            os.path.dirname(__file__), "dataset", "corpus.json"
        )
        self.pipeline: Optional[Pipeline] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.model: Optional[LogisticRegression] = None
        self.feature_names: List[str] = []

    def train(self) -> Dict[str, Any]:
        """
        Loads the balanced corpus, anonymizes all samples, and trains the TF-IDF + LogReg model.
        """
        if not os.path.exists(self.corpus_path):
            raise FileNotFoundError(f"Corpus file not found at: {self.corpus_path}")

        with open(self.corpus_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_texts = [item["text"] for item in data]
        labels = [item["label"] for item in data]

        # 1. Anonymize all training data (Loi CDP compliance)
        clean_texts = [anonymize_text(t)[0] for t in raw_texts]

        # 2. Build TF-IDF Pipeline with character & word n-grams
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            min_df=1,
            max_df=0.95,
            sublinear_tf=True,
            strip_accents='unicode',
            lowercase=True
        )

        self.model = LogisticRegression(
            C=2.0,
            class_weight='balanced',
            solver='liblinear',
            random_state=42
        )

        # Transform and fit
        X_train = self.vectorizer.fit_transform(clean_texts)
        self.model.fit(X_train, labels)
        self.feature_names = self.vectorizer.get_feature_names_out()

        # Training metrics
        train_accuracy = float(self.model.score(X_train, labels))

        return {
            "status": "trained",
            "samples_count": len(clean_texts),
            "features_extracted": len(self.feature_names),
            "train_accuracy": train_accuracy
        }

    def predict(self, raw_text: str) -> Dict[str, Any]:
        """
        Analyzes an incoming message:
        1. Anonymizes PII
        2. Computes calibrated log-odds score
        3. Maps to qualitative Risk Levels
        4. Extracts top contributing n-grams for explainability
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
                "recommendation": "Aucune action requise.",
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

        # Qualitative Risk Mapping (Calibrated thresholds without exposing percentages)
        if prob_fraud >= 0.70 or decision_margin >= 0.8:
            risk_level = "CRITIQUE"
        elif prob_fraud >= 0.45 or decision_margin >= -0.2:
            risk_level = "ELEVE"
        elif prob_fraud >= 0.30 or decision_margin >= -0.8:
            risk_level = "MODERE"
        else:
            risk_level = "FAIBLE"

        # Generate human-readable defense explanations
        explanations = []
        token_str = " ".join([c[0] for c in top_scam_clues] + [anonymized.lower()])

        if risk_level in ["CRITIQUE", "ELEVE", "MODERE"]:
            if any(k in token_str for k in ["code", "otp", "secret", "token_code"]):
                explanations.append("Demande anormale de code confidentiel ou code secret OTP.")
            if any(k in token_str for k in ["erreur", "renvoyer", "retour", "annul"]):
                explanations.append("Mécanique typique de faux transfert ou de faux remboursement invoqué.")
            if any(k in token_str for k in ["bloque", "urgent", "immediatement", "gaaw", "peine", "reer", "accident"]):
                explanations.append("Pression psychologique et création d'une fausse situation d'urgence.")
            if any(k in token_str for k in ["gagn", "tombola", "tirage", "lot", "promo"]):
                explanations.append("Promesse fallacieuse de gain d'argent ou loterie non sollicitée.")
            if any(k in token_str for k in ["bourse", "campusen", "recrutement", "onu", "poste"]):
                explanations.append("Usurpation de programme d'État ou de faux recrutement exigeant des frais préalables.")
            if not explanations:
                explanations.append("Combinaison de termes et structure sémantique atypique.")
        else:
            if top_legit_clues:
                explanations.append("Présence d'éléments caractéristiques d'une transaction officielle (référence, solde, frais).")
            else:
                explanations.append("Aucun indicateur de menace ou d'ingénierie sociale relevé.")

        # Actionable Recommendation
        if risk_level == "CRITIQUE":
            recommendation = "Ne répondez pas et ne tapez aucun code secret. Les opérateurs officiels (Wave, Orange, Free) ne demandent JAMAIS vos codes par SMS."
        elif risk_level == "ELEVE":
            recommendation = "Vérifiez directement le solde de votre application officielle sans utiliser les liens ou numéros figurant dans ce message."
        elif risk_level == "MODERE":
            recommendation = "Conservez le message et vérifiez l'identité de l'expéditeur avant d'effectuer toute démarche financière."
        else:
            recommendation = "Message réputé légitime selon les critères d'hygiène numérique."

        return {
            "risk_level": risk_level,
            "risk_label": self.RISK_LEVELS[risk_level],
            "explanations": explanations,
            "detected_clues": [c[0] for c in top_scam_clues[:5]],
            "recommendation": recommendation,
            "pii_redacted": pii_meta
        }
