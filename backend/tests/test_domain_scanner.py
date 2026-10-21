"""
Unit & Integration Tests for Domain Infrastructure & OSINT Scanner (Brique 2).
Validates Domain Age (RDAP), Typosquatting (Levenshtein), Brand Impersonation,
and Zero False Alarms on Official Senegalese Domains.
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from domain_scanner import (
    DomainInfrastructureScanner,
    compute_levenshtein,
    extract_domain_parts
)


@pytest.fixture(scope="module")
def scanner():
    return DomainInfrastructureScanner()


# =========================================================================
# 1. TESTS DE PARSING & LEVENSHTEIN
# =========================================================================

def test_levenshtein_distance():
    assert compute_levenshtein("wave", "wave") == 0
    assert compute_levenshtein("wave", "wavee") == 1
    assert compute_levenshtein("orange", "0range") == 1
    assert compute_levenshtein("cbao", "cba0") == 1
    assert compute_levenshtein("google", "microsoft") > 4


def test_extract_domain_parts():
    url, host, sld, tld = extract_domain_parts("https://wave.com.auth-service.xyz/login?id=1")
    assert host == "wave.com.auth-service.xyz"
    assert sld == "auth-service"
    assert tld == ".xyz"


# =========================================================================
# 2. TESTS SUR LES DOMAINES OFFICIELS (ZÉRO FAUX POSITIF)
# =========================================================================

@pytest.mark.parametrize("official_url,expected_brand", [
    ("https://wave.com", "Wave Mobile Money"),
    ("https://www.wave.sn", "Wave Mobile Money"),
    ("https://orange.sn/portail", "Orange / Sonatel"),
    ("https://www.campusen.sn", "Campusen (Bourses & Orientation)"),
    ("https://www.cbao.sn", "CBAO Attijariwafa Bank"),
    ("https://signalementcyber.dgpn.sn", "Police Nationale / DSC"),
])
def test_official_domains_are_safe(scanner, official_url, expected_brand):
    res = scanner.scan_url(official_url)
    assert res["risk_level"] == "FAIBLE"
    assert expected_brand in res["target_brand_spoofed"]
    assert "officiel" in res["risk_label"].lower()


# =========================================================================
# 3. DÉTECTION DU TYPOSQUATTING & USURPATION DE MARQUE (PRIORITÉ 2)
# =========================================================================

def test_detect_subdomain_abuse(scanner):
    # Attacker uses official brand as a fake subdomain on a .xyz domain
    fake_url = "http://wave.com.connexion-verification.xyz/login"
    res = scanner.scan_url(fake_url)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert "Wave Mobile Money" in res["target_brand_spoofed"]
    assert any("sous-domaine" in exp for exp in res["explanations"])


def test_detect_levenshtein_typosquatting(scanner):
    # '0range' instead of 'orange'
    fake_url = "http://0range.sn"
    res = scanner.scan_url(fake_url)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert any("orthographique" in exp or "Levenshtein" in exp for exp in res["explanations"])


def test_detect_direct_ip_access(scanner):
    raw_ip_url = "http://192.168.1.100/wave-login"
    res = scanner.scan_url(raw_ip_url)
    assert res["risk_level"] == "CRITIQUE"
    assert any("adresse IP" in exp for exp in res["explanations"])


# =========================================================================
# 4. TEST PRIORITAIRE : ÂGE DU DOMAINE (RDAP - PRIORITÉ 1)
# =========================================================================

def test_fresh_domain_under_48h_is_critical(scanner):
    """
    A domain created less than 48h ago must trigger a CRITIQUE or ELEVE risk level.
    """
    mock_fresh_rdap = {
        "status": "RESOLVED",
        "age_days": 1,
        "age_category": "CRITIQUE",
        "creation_date": "2026-10-20",
        "hosting_info": "Namecheap Inc."
    }

    res = scanner.scan_url("https://service-client-assistance.org", custom_rdap_result=mock_fresh_rdap)
    assert res["risk_level"] in ["ELEVE", "CRITIQUE"]
    assert any("48 heures" in exp for exp in res["explanations"])
    assert res["domain_age_days"] == 1


def test_stable_aged_domain_is_not_alarmist(scanner):
    """
    An aged legitimate domain (> 365 days) without typosquatting should remain FAIBLE or MODERE.
    """
    mock_aged_rdap = {
        "status": "RESOLVED",
        "age_days": 1200,
        "age_category": "ANCIEN_STABLE",
        "creation_date": "2023-01-15",
        "hosting_info": "OVH SAS"
    }

    res = scanner.scan_url("https://journal-dakar-actualites.com", custom_rdap_result=mock_aged_rdap)
    assert res["risk_level"] in ["FAIBLE", "MODERE"]


# =========================================================================
# 5. CONFORMITÉ DU FORMAT DE SORTIE
# =========================================================================

def test_output_compliance_no_percentages(scanner):
    res = scanner.scan_url("https://wave-transfert-promo.xyz")
    assert "risk_level" in res
    assert res["risk_level"] in ["FAIBLE", "MODERE", "ELEVE", "CRITIQUE"]
    assert isinstance(res["explanations"], list)
    assert len(res["explanations"]) > 0
    assert "recommendation" in res
    # Strict compliance: NO probability percentage
    assert "probability" not in res
    assert "percent" not in res
