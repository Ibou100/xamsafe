"""
Regression Test Suite - Sovereign Defensive AI Shield.
Replays the 6 critical real-world scam patterns on every test run.
These regression cases are STRICTLY NEVER added to training corpus.
"""

import os
import sys
import json
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from classifier import SocialEngineeringClassifier
from main import app

REGRESSION_PATH = os.path.join(os.path.dirname(__file__), "..", "dataset", "regression_cases.json")
RISK_RANK_MAP = {"FAIBLE": 1, "MODERE": 2, "ELEVE": 3, "CRITIQUE": 4}

client = TestClient(app)


def load_regression_cases():
    with open(REGRESSION_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_regression_cases_dataset_integrity():
    cases = load_regression_cases()
    assert len(cases) == 6, "Le jeu de régression doit contenir exactement 6 cas."
    expected_ids = {"regr-001", "regr-002", "regr-003", "regr-004", "regr-005", "regr-006"}
    assert {c["id"] for c in cases} == expected_ids


def test_regression_cases_classifier_predictions():
    classifier = SocialEngineeringClassifier()
    classifier.train()
    cases = load_regression_cases()

    for case in cases:
        text = case["text"]
        min_level = case["min_risk_level"]
        min_rank = RISK_RANK_MAP[min_level]

        result = classifier.predict(text)
        pred_level = result["risk_level"]
        pred_rank = RISK_RANK_MAP.get(pred_level, 0)

        # Assert risk level meets minimum threshold
        assert pred_rank >= min_rank, (
            f"Échec régression pour '{case['name']}' (ID: {case['id']}): "
            f"obtenu {pred_level}, attendu au minimum {min_level}."
        )

        # Assert forbidden keywords are absent (e.g. no 'frais' for Campusen)
        if "forbidden_explanation_keywords" in case:
            for kw in case["forbidden_explanation_keywords"]:
                for exp in result["explanations"]:
                    assert kw.lower() not in exp.lower(), (
                        f"Mot-clé interdit '{kw}' trouvé dans l'explication: '{exp}' "
                        f"pour le cas '{case['name']}'"
                    )


def test_regression_threat_ultimatum_intimidation_message():
    """
    Spécifique au point 1 :
    'Dernier avertissement : régularisez votre dossier aujourd'hui sinon votre ligne sera suspendue et vos données publiées'
    Doit être au minimum ELEVE et comporter une explication de menace/ultimatum.
    """
    text = "Dernier avertissement : régularisez votre dossier aujourd'hui sinon votre ligne sera suspendue et vos données publiées"
    resp = client.post("/api/v1/analyze-message", json={"text": text})
    assert resp.status_code == 200
    data = resp.json()

    assert data["risk_level"] in ["ELEVE", "CRITIQUE"], (
        f"Le message d'intimidation doit être ELEVE ou CRITIQUE, obtenu: {data['risk_level']}"
    )
    combined_exps = " ".join(data["explanations"]).lower()
    assert any(w in combined_exps for w in ["menace", "ultimatum", "intimidation", "suspension", "données"]), (
        f"L'explication doit refléter la menace ou l'ultimatum : {data['explanations']}"
    )


def test_regression_campusen_no_fees_in_api():
    """
    Spécifique au point 2 :
    'Campusen : vous êtes sélectionné pour une bourse complémentaire. Confirmez vos informations bancaires dans les 24h sur ce lien pour la recevoir.'
    Ne doit en aucun cas mentionner 'frais'.
    """
    text = "Campusen : vous êtes sélectionné pour une bourse complémentaire. Confirmez vos informations bancaires dans les 24h sur ce lien pour la recevoir."
    resp = client.post("/api/v1/analyze", json={"text": text})
    assert resp.status_code == 200
    data = resp.json()

    assert data["risk_level"] in ["ELEVE", "CRITIQUE"]
    for exp in data["explanations"]:
        assert "frais" not in exp.lower(), f"Mention injustifiée de 'frais' détectée dans: {exp}"
