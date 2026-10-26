"""
Tests for Part B: Unified Analysis Endpoint (/api/v1/analyze).
Validates cross-brick fusion:
1. Scam message with official link -> NLP alert MUST NOT be canceled (remains ELEVE/CRITIQUE).
2. Legitimate message without link -> FAIBLE / MODERE.
3. Legitimate message with official link -> FAIBLE.
4. Message without suspicious text but with fraudulent link -> Elevates to ELEVE/CRITIQUE.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, domain_scanner
from rate_limiter import global_rate_limiter

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_limiter_and_targets():
    global_rate_limiter.reset()
    yield
    global_rate_limiter.reset()
    # Ensure targets verified status reverted to default False
    for target in domain_scanner.targets.values():
        for d in target.get("domains", []):
            d["verified"] = False


# =========================================================================
# PARTIE B : 4 CAS DE TEST OBLIGATOIRES
# =========================================================================

def test_case_1_scam_message_with_official_link():
    """
    Cas 1: Message d'arnaque avec lien officiel.
    RÈGLE : Le lien officiel ne doit JAMAIS annuler une alerte NLP.
    Un message à risque avec un vrai lien Wave reste à risque.
    """
    # Temporarily verify wave.com
    for d in domain_scanner.targets.get("wave", {}).get("domains", []):
        if d["domain"] == "wave.com":
            d["verified"] = True

    payload = {
        "text": "Alerte Wave : Vous avez reçu 75.000 FCFA par erreur. Renvoyez immédiatement l'argent sur le 771234567 sous peine de poursuites judiciaires. Voir conditions sur https://wave.com"
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Final risk must remain elevated
    assert data["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert any(term in data["recommendation"] for term in ["Ne renvoyez rien", "DANGER", "Méfiance", "application officielle"])

    # Component details check
    assert data["details"]["nlp"]["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert len(data["details"]["urls"]) == 1
    assert data["details"]["urls"][0]["hostname"] == "wave.com"
    assert data["details"]["urls"][0]["risk_level"] == "FAIBLE"
    assert data["details"]["urls"][0]["risk_label"] == "Correspond à un domaine officiel connu"


def test_case_2_legitimate_message_without_link():
    """
    Cas 2: Message légitime sans lien.
    """
    payload = {
        "text": "Wave : Vous avez transféré 5.000F CFA à Fatou Diop (771112233). Nouveau solde : 14.500F CFA. Frais : 50F CFA. Réf : TX-982173."
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Must be safe/low risk
    assert data["risk_level"] in ["FAIBLE", "MODERE"]
    assert data["risk_level"] not in ["ELEVE", "CRITIQUE"]
    assert len(data["details"]["urls"]) == 0


def test_case_3_legitimate_message_with_official_link():
    """
    Cas 3: Message légitime avec lien officiel.
    """
    # Verify cbao.sn
    for d in domain_scanner.targets.get("cbao", {}).get("domains", []):
        if d["domain"] == "cbao.sn":
            d["verified"] = True

    payload = {
        "text": "CBAO : Votre compte a été crédité du salaire mensuel. Consultez votre solde sur https://www.cbao.sn."
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["risk_level"] == "FAIBLE"
    assert len(data["details"]["urls"]) == 1
    assert data["details"]["urls"][0]["risk_level"] == "FAIBLE"
    assert data["details"]["urls"][0]["risk_label"] == "Correspond à un domaine officiel connu"


def test_case_4_benign_text_with_fraudulent_link():
    """
    Cas 4: Message sans texte suspect mais lien frauduleux.
    RÈGLE : Le lien frauduleux doit propulser le résultat final en ELEVE ou CRITIQUE.
    """
    payload = {
        "text": "Bonjour, voici votre document : http://wvve.com/login"
    }

    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Final risk must be escalated by the URL
    assert data["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert data["details"]["nlp"]["risk_level"] in ["FAIBLE", "MODERE"]
    assert len(data["details"]["urls"]) == 1
    assert data["details"]["urls"][0]["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert any("Altération orthographique" in exp for exp in data["explanations"])


def test_unified_analyze_rate_limit_and_size_limit():
    """Verify rate limit and size limit are enforced on /analyze."""
    # Test 413
    res_413 = client.post("/api/v1/analyze", json={"text": "X" * 2001})
    assert res_413.status_code == 413

    # Test 400
    res_400 = client.post("/api/v1/analyze", json={"text": "   "})
    assert res_400.status_code == 400
