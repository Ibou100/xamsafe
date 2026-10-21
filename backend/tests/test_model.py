"""
Defensive ML Test Suite & False Positive Rate (FPR) Evaluation.
Validates accuracy on scams while ensuring zero false alarms on real
transactional receipts from Wave, Orange Money, banks, and citizen chats.
"""

import pytest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from anonymizer import anonymize_text
from classifier import SocialEngineeringClassifier


@pytest.fixture(scope="module")
def classifier():
    clf = SocialEngineeringClassifier()
    clf.train()
    return clf


# =========================================================================
# 1. TESTS D'ANONYMISATION & CONFORMITÉ CDP SÉNÉGAL (ZERO-KNOWLEDGE)
# =========================================================================

def test_anonymize_senegalese_phone_numbers():
    text = "Envoyez la somme sur le 77 123 45 67 ou au +221789998877 immédiatement."
    clean, meta = anonymize_text(text)
    assert "77 123 45 67" not in clean
    assert "+221789998877" not in clean
    assert "<TOKEN_PHONE>" in clean
    assert meta["phones"] >= 2


def test_anonymize_monetary_amounts():
    text = "Vous avez reçu 75.000 FCFA et un bonus de 15000 F CFA."
    clean, meta = anonymize_text(text)
    assert "75.000" not in clean
    assert "<TOKEN_AMOUNT>" in clean
    assert meta["amounts"] >= 2


def test_anonymize_otp_codes():
    text = "Votre code secret : 492019 ne le partagez pas."
    clean, meta = anonymize_text(text)
    assert "492019" not in clean
    assert "<TOKEN_CODE>" in clean
    assert meta["codes"] >= 1


# =========================================================================
# 2. DÉTECTION DES ARNAQUES RÉELLES (VRAIS POSITIFS)
# =========================================================================

def test_detect_wave_fake_refund_french(classifier):
    sample = "Alerte Wave : Vous avez reçu 50.000 FCFA par erreur de Cheikh Diop. Renvoyez immédiatement l'argent sur le 773334455 sous peine de blocage."
    res = classifier.predict(sample)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert len(res["explanations"]) > 0
    # Guarantee no raw probability percentage is exposed
    assert "probability" not in res
    assert "percent" not in res


def test_detect_otp_theft_wolof(classifier):
    sample = "Wave Sénégal : Sa compte dafa tëj. Yoonal ma sa code OTP bi léegi bala sa xaalis di réer."
    res = classifier.predict(sample)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert any("secret" in exp or "OTP" in exp or "urgent" in exp or "inhabituelle" in exp for exp in res["explanations"])


def test_detect_fake_campusen_scholarship(classifier):
    sample = "Campusen Bourse : Votre virement de 180.000 FCFA est en attente. Payez 10.000 FCFA de frais sur http://campusen-bourse-dakar.top"
    res = classifier.predict(sample)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]


# =========================================================================
# 3. MESURE DU TAUX DE FAUX POSITIFS (FALSE POSITIVE RATE - FPR)
# Crucial en milieu bancaire/télécom : un vrai reçu ne doit JAMAIS être bloqué !
# =========================================================================

REAL_LEGITIMATE_TEST_CASES = [
    # Vrai reçu Wave standard
    "Wave : Vous avez transféré 10.000F CFA à Aminata Diallo (775556677). Nouveau solde : 23.450F CFA. Frais : 100F CFA. Réf : TX-778899.",
    # Vrai reçu Orange Money facture
    "Orange Money : Paiement de votre facture Sen'Eau N° 998822 de 12.400 F CFA effectué avec succès le 21/10. Réf OM-9912.",
    # Vraie conversation familiale en wolof
    "Salam yaay, nanga def ? Ndax mën nga ma yabal 5.000 FCFA ci Wave ngir ma jënd livre yi ?",
    # Vraie conversation professionnelle en français
    "Bonjour Monsieur Sow, nous vous confirmons la réunion de chantier demain matin à 09h00 à Diamniadio.",
    # Vraie notification bancaire CBAO
    "CBAO : Votre compte a été crédité du salaire mensuel. Consultez votre solde sur www.cbao.sn.",
    # Vrai SMS de sécurité Wave officiel
    "Wave : Votre code de connexion est 918234. Ne partagez JAMAIS ce code avec personne, même un agent Wave."
]


def test_zero_false_positive_on_legitimate_traffic(classifier):
    """
    Ensures that 0% of legitimate transactional or citizen messages
    are flagged as CRITIQUE or ELEVE.
    """
    false_positives = []

    for idx, message in enumerate(REAL_LEGITIMATE_TEST_CASES):
        result = classifier.predict(message)
        # Legitimate traffic must be classified as FAIBLE or at most MODERE
        if result["risk_level"] in ["ELEVE", "CRITIQUE"]:
            false_positives.append({
                "index": idx,
                "message": message,
                "assigned_risk": result["risk_level"],
                "clues": result["detected_clues"]
            })

    # Assert FPR is strictly 0% on this benchmark
    assert len(false_positives) == 0, f"False positives detected: {false_positives}"


# =========================================================================
# 4. CONFORMITÉ DU FORMAT DE SORTIE
# =========================================================================

def test_response_structure_compliance(classifier):
    res = classifier.predict("Message de test quelconque.")
    assert "risk_level" in res
    assert res["risk_level"] in ["FAIBLE", "MODERE", "ELEVE", "CRITIQUE"]
    assert "risk_label" in res
    assert isinstance(res["explanations"], list)
    assert isinstance(res["detected_clues"], list)
    assert "recommendation" in res
    assert "pii_redacted" in res
