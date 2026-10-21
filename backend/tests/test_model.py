"""
Defensive ML Test Suite & Model Evaluation.
Validates PII Anonymization, Train/Test Split Metrics, Scam Detection,
and checks for false alarms on legitimate communications.
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from anonymizer import anonymize_text
from classifier import SocialEngineeringClassifier
from import_data import import_sample


@pytest.fixture(scope="module")
def classifier():
    clf = SocialEngineeringClassifier()
    clf.train()
    return clf


# =========================================================================
# 1. TESTS D'ANONYMISATION MULTI-FORMATS
# =========================================================================

@pytest.mark.parametrize("raw_phone", [
    "+221 77 123 45 67",
    "00221-78-999-88-77",
    "77.123.45.67",
    "761234567",
    "+221701234567",
    "33 821 12 34",
    "75-111-22-33"
])
def test_anonymize_varied_phone_formats(raw_phone):
    text = f"Contactez immédiatement le {raw_phone} pour votre compte."
    clean, meta = anonymize_text(text)
    assert raw_phone not in clean
    assert "<TOKEN_PHONE>" in clean
    assert meta["phones"] >= 1


def test_anonymize_names_without_civility():
    text = "Mamadou et Fatou ont transmis le dossier à Cheikh Ndiaye."
    clean, meta = anonymize_text(text)
    assert "Mamadou" not in clean
    assert "Fatou" not in clean
    assert "Cheikh" not in clean
    assert "<TOKEN_PERSON>" in clean
    assert meta["names"] >= 3


def test_anonymize_monetary_amounts():
    text = "Vous avez reçu 75.000 FCFA et un bonus de 15000 F CFA ou 25000 XOF."
    clean, meta = anonymize_text(text)
    assert "75.000" not in clean
    assert "15000" not in clean
    assert "<TOKEN_AMOUNT>" in clean
    assert meta["amounts"] >= 2


def test_anonymize_otp_codes():
    text = "Votre code secret : 492019 ne le partagez pas."
    clean, meta = anonymize_text(text)
    assert "492019" not in clean
    assert "<TOKEN_CODE>" in clean
    assert meta["codes"] >= 1


# =========================================================================
# 2. MÉTRIQUES DU MODÈLE SUR ENSEMBLE DE TEST INDÉPENDANT
# =========================================================================

def test_classifier_train_test_evaluation(classifier):
    metrics = classifier.eval_metrics
    assert "precision_fraud" in metrics
    assert "recall_fraud" in metrics
    assert "f1_fraud" in metrics
    assert "confusion_matrix" in metrics
    assert metrics["test_samples"] > 0
    # On holdout test set, baseline should achieve solid metrics
    assert metrics["f1_fraud"] >= 0.70


# =========================================================================
# 3. DÉTECTION DES ARNAQUES RÉELLES (VRAIS POSITIFS)
# =========================================================================

def test_detect_wave_fake_refund_french(classifier):
    sample = "Alerte Wave : Vous avez reçu 50.000 FCFA par erreur de Cheikh Diop. Renvoyez immédiatement l'argent sur le 773334455 sous peine de blocage."
    res = classifier.predict(sample)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert len(res["explanations"]) > 0
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
# 4. TEST DES REÇUS ET MESSAGES LÉGITIMES
# =========================================================================

REAL_LEGITIMATE_TEST_CASES = [
    "Wave : Vous avez transféré 10.000F CFA à Aminata Diallo (775556677). Nouveau solde : 23.450F CFA. Frais : 100F CFA. Réf : TX-778899.",
    "Orange Money : Paiement de votre facture Sen'Eau N° 998822 de 12.400 F CFA effectué avec succès le 21/10. Réf OM-9912.",
    "Salam yaay, nanga def ? Ndax mën nga ma yabal 5.000 FCFA ci Wave ngir ma jënd livre yi ?",
    "Bonjour Monsieur Sow, nous vous confirmons la réunion de chantier demain matin à 09h00 à Diamniadio.",
    "CBAO : Votre compte a été crédité du salaire mensuel. Consultez votre solde sur www.cbao.sn.",
    "Wave : Votre code de connexion est 918234. Ne partagez JAMAIS ce code avec personne, même un agent Wave."
]


def test_legitimate_traffic_not_critical(classifier):
    for message in REAL_LEGITIMATE_TEST_CASES:
        result = classifier.predict(message)
        assert result["risk_level"] in ["FAIBLE", "MODERE"]
        assert result["risk_level"] not in ["ELEVE", "CRITIQUE"]


# =========================================================================
# 5. SCRIPT D'IMPORT ET VÉRIFICATION DE CONSENTEMENT
# =========================================================================

def test_import_with_consent():
    res = import_sample(
        text="Bonjour, tentative de phishing reçue sur le 771234567 de la part de Cheikh.",
        label=1,
        source="contribution-citoyenne",
        consent_obtained=True
    )
    assert res["status"] == "success"
    assert res["redacted_counts"]["phones"] >= 1


def test_import_without_consent_rejected():
    with pytest.raises(ValueError, match="Consentement non accordé"):
        import_sample(
            text="Message confidentiel sans accord.",
            label=1,
            source="fuite",
            consent_obtained=False
        )
