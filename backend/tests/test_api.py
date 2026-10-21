"""
API End-to-End Tests for FastAPI Defensive Microservice.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["features_count"] > 0
    assert "Zero-Knowledge" in data["compliance"]


def test_analyze_message_scam():
    payload = {
        "text": "Alerte Wave : Vous avez reçu 75.000 FCFA par erreur. Renvoyez immédiatement l'argent sur le 771234567 sous peine de poursuites."
    }
    response = client.post("/api/v1/analyze-message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert len(data["explanations"]) > 0
    assert "recommendation" in data
    # Verify no raw probabilities
    assert "probability" not in data
    assert "percentage" not in data


def test_analyze_message_legitimate_receipt():
    payload = {
        "text": "Wave : Vous avez transféré 5.000F CFA à Fatou Diop (771112233). Nouveau solde : 14.500F CFA. Frais : 50F CFA. Réf : TX-982173."
    }
    response = client.post("/api/v1/analyze-message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["FAIBLE", "MODERE"]
    assert data["risk_level"] not in ["ELEVE", "CRITIQUE"]


def test_anonymize_endpoint():
    payload = {
        "text": "Contactez M. Sow au 771234567 et payez 50000 FCFA avec le code 998811 sur http://site.top"
    }
    response = client.post("/api/v1/anonymize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "771234567" not in data["anonymized_text"]
    assert "50000" not in data["anonymized_text"]
    assert "<TOKEN_PHONE>" in data["anonymized_text"]
    assert "<TOKEN_AMOUNT>" in data["anonymized_text"]


def test_scan_url_official_domain():
    payload = {"url": "https://wave.com/fr/"}
    response = client.post("/api/v1/scan-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "FAIBLE"
    assert "Wave Mobile Money" in data["target_brand_spoofed"]


def test_scan_url_subdomain_abuse():
    payload = {"url": "http://wave.com.connexion-verification.xyz/auth"}
    response = client.post("/api/v1/scan-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert len(data["explanations"]) > 0
    # Guarantee no probability percentages
    assert "probability" not in data
    assert "percentage" not in data
