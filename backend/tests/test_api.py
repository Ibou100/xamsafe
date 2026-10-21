"""
API End-to-End Tests for FastAPI Defensive Microservice.
Tests Part A requirements:
- A1: Rate limiting (20 req/min -> 429), input validation, payload size limits (>2000 / >2048 -> 413).
- A2: Security headers and restricted CORS.
- A3: SSRF protection (loopback, private IPs, unsupported schemes).
- A4: Confidentiality (no raw message storage or leaks).
- A6: Official domain whitelist verification check.
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
def reset_limiter():
    """Reset rate limiter before each test."""
    global_rate_limiter.reset()
    yield
    global_rate_limiter.reset()


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["features_count"] > 0
    assert "evaluation_metrics" in data
    assert "privacy" in data


# =========================================================================
# A1. TESTS DE TAILLE MAXIMALE & VALIDATION (413 / 400)
# =========================================================================

def test_analyze_message_size_limit_413():
    """Messages > 2000 chars must return HTTP 413."""
    oversized_text = "A" * 2001
    response = client.post("/api/v1/analyze-message", json={"text": oversized_text})
    assert response.status_code == 413
    assert "2000 caractères" in response.json()["detail"]


def test_scan_url_size_limit_413():
    """URLs > 2048 chars must return HTTP 413."""
    oversized_url = "https://example.com/" + ("x" * 2030)
    assert len(oversized_url) > 2048
    response = client.post("/api/v1/scan-url", json={"url": oversized_url})
    assert response.status_code == 413
    assert "2048 caractères" in response.json()["detail"]


def test_empty_inputs_rejected_400():
    """Empty or whitespace-only inputs must be rejected."""
    r1 = client.post("/api/v1/analyze-message", json={"text": "   "})
    assert r1.status_code == 400

    r2 = client.post("/api/v1/scan-url", json={"url": "   "})
    assert r2.status_code == 400


# =========================================================================
# A1. TEST DE LIMITATION DE DEBIT (RATE LIMITING 429)
# =========================================================================

def test_rate_limiting_429_french_message():
    """Exceeding 20 requests per minute from same IP returns 429 with French explanation."""
    payload = {"text": "Message de test pour vérifier la limitation de débit."}
    
    # 20 allowed requests
    for _ in range(20):
        res = client.post("/api/v1/analyze-message", json=payload)
        assert res.status_code == 200

    # 21st request must trigger 429
    res_blocked = client.post("/api/v1/analyze-message", json=payload)
    assert res_blocked.status_code == 429
    detail = res_blocked.json()["detail"]
    assert "Limite de requêtes atteinte" in detail
    assert "20 requêtes/minute" in detail
    assert "patienter" in detail.lower()


# =========================================================================
# A2. TESTS DES EN-TETES DE SECURITE ET CORS
# =========================================================================

def test_security_headers_present():
    response = client.get("/api/v1/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "max-age=31536000" in response.headers.get("Strict-Transport-Security", "")


def test_cors_restricted_domain():
    headers = {
        "Origin": "https://xam-safe.vercel.app",
        "Access-Control-Request-Method": "POST"
    }
    response = client.options("/api/v1/analyze-message", headers=headers)
    assert response.headers.get("access-control-allow-origin") == "https://xam-safe.vercel.app"


# =========================================================================
# A3. TESTS SSRF VIA L'API /scan-url
# =========================================================================

@pytest.mark.parametrize("blocked_url", [
    "http://127.0.0.1:8000",
    "http://192.168.1.1",
    "http://10.0.0.1",
    "http://169.254.169.254",
    "http://localhost:3000",
    "ftp://example.com/file",
    "file:///etc/passwd"
])
def test_scan_url_ssrf_blocked(blocked_url):
    response = client.post("/api/v1/scan-url", json={"url": blocked_url})
    assert response.status_code == 200
    data = response.json()
    assert data["risk_label"] == "Adresse non analysable"
    assert any("non analysable" in exp.lower() for exp in data["explanations"])


# =========================================================================
# TESTS FONCTIONNELS EXISTANTS
# =========================================================================

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


def test_scan_url_subdomain_abuse():
    payload = {"url": "http://wave.com.connexion-verification.xyz/auth"}
    response = client.post("/api/v1/scan-url", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert len(data["explanations"]) > 0
    assert "probability" not in data
    assert "percentage" not in data


def test_scan_url_verified_official_domain():
    # Temporarily verify wave.com for this test
    for entry in domain_scanner.targets.get("wave", {}).get("domains", []):
        if entry["domain"] == "wave.com":
            entry["verified"] = True

    try:
        payload = {"url": "https://wave.com/fr/"}
        response = client.post("/api/v1/scan-url", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "FAIBLE"
        assert data["risk_label"] == "Correspond à un domaine officiel connu"
        assert "Wave Mobile Money" in data["target_brand_spoofed"]
    finally:
        # Revert to unverified
        for entry in domain_scanner.targets.get("wave", {}).get("domains", []):
            if entry["domain"] == "wave.com":
                entry["verified"] = False
