"""
Unit & Integration Tests for Domain Infrastructure & OSINT Scanner (Brique 2).
Validates Domain Age Uncertainty Handling (RDAP), Typosquatting Limits,
Common Word Exceptions, and Strict Whitelist Registrable Domain Matching.
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from domain_scanner import (
    DomainInfrastructureScanner,
    compute_levenshtein,
    extract_domain_parts,
    is_official_domain_match
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
    url, host, sld, tld, path = extract_domain_parts("https://wave.com.auth-service.xyz/login?id=1")
    assert host == "wave.com.auth-service.xyz"
    assert sld == "auth-service"
    assert tld == ".xyz"
    assert path == "/login"


# =========================================================================
# 2. LISTE BLANCHE : COMPARAISON STRICTE DU DOMAINE ENREGISTRABLE
# =========================================================================

def test_whitelist_exact_matching():
    # Valid official domains and valid subdomains
    assert is_official_domain_match("orange.sn", "orange.sn") is True
    assert is_official_domain_match("boutique.orange.sn", "orange.sn") is True
    assert is_official_domain_match("wave.com", "wave.com") is True
    assert is_official_domain_match("app.wave.com", "wave.com") is True

    # MUST NOT MATCH (Substrings or spoofed subdomains)
    assert is_official_domain_match("orange.sn.evil.xyz", "orange.sn") is False
    assert is_official_domain_match("evil-orange.sn", "orange.sn") is False
    assert is_official_domain_match("wave.com.fake-login.top", "wave.com") is False
    assert is_official_domain_match("mywave.com", "wave.com") is False


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
    assert res["risk_label"] == "Correspond à un domaine officiel connu"
    assert expected_brand in res["target_brand_spoofed"]


def test_spoofed_subdomain_rejected_by_whitelist(scanner):
    # 'orange.sn.evil.xyz' must NEVER pass as official!
    res = scanner.scan_url("http://orange.sn.evil.xyz/login")
    assert res["risk_level"] != "FAIBLE"
    assert res["risk_label"] != "Correspond à un domaine officiel connu"
    assert any("faux sous-domaine" in exp for exp in res["explanations"])


def test_hyphenated_domain_rejected_by_whitelist(scanner):
    # 'evil-orange.sn' must NEVER pass as official!
    res = scanner.scan_url("http://evil-orange.sn")
    assert res["risk_level"] != "FAIBLE"
    assert res["risk_label"] != "Correspond à un domaine officiel connu"


# =========================================================================
# 3. TYPOSQUATTING : TESTS DES FAUX POSITIFS & CONFIRMATIONS
# =========================================================================

@pytest.mark.parametrize("legit_word_url", [
    "https://cave.com",
    "https://save.org",
    "https://tree.com",
    "https://street.com"
])
def test_common_words_do_not_trigger_critical(scanner, legit_word_url):
    """
    Common English/French words sharing Levenshtein proximity with wave/free
    must NOT trigger CRITIQUE.
    """
    res = scanner.scan_url(legit_word_url)
    assert res["risk_level"] != "CRITIQUE"


def test_typosquatting_without_confirmation_is_moderate(scanner):
    """
    A typosquatting domain on a neutral TLD without auth keywords should be MODERE, not CRITIQUE.
    """
    mock_aged_rdap = {
        "status": "RESOLVED",
        "domain_age_status": "connu",
        "age_days": 500,
        "age_category": "ANCIEN_STABLE",
        "creation_date": "2024-01-01",
        "hosting_info": "Generic Host"
    }
    # 'wawe.org' has Levenshtein 1 from wave, but no auth keyword and stable age
    res = scanner.scan_url("https://wawe.org/blog", custom_rdap_result=mock_aged_rdap)
    assert res["risk_level"] == "MODERE"
    assert any("Proximité lexicale" in exp for exp in res["explanations"])


def test_typosquatting_with_confirmation_triggers_alert(scanner):
    """
    'wvve.com' with auth keyword or '0range.sn' (homoglyph) must trigger an alert.
    """
    # 0range with digit substitution for o
    res1 = scanner.scan_url("http://0range.sn/login")
    assert res1["risk_level"] in ["ELEVE", "CRITIQUE"]

    # wvve with double-v homoglyph on login
    res2 = scanner.scan_url("http://wvve.com/login")
    assert res2["risk_level"] in ["ELEVE", "CRITIQUE"]


# =========================================================================
# 4. RDAP : GESTION DE L'INCERTITUDE ET TESTS SIMULÉS
# =========================================================================

def test_rdap_simulated_success(scanner):
    mock_success = {
        "status": "RESOLVED",
        "domain_age_status": "connu",
        "age_days": 1,
        "age_category": "CRITIQUE",
        "creation_date": "2026-10-20",
        "hosting_info": "Namecheap Inc."
    }
    res = scanner.scan_url("https://service-portail-urgent.xyz", custom_rdap_result=mock_success)
    assert res["domain_age_status"] == "connu"
    assert res["domain_age_days"] == 1
    assert any("moins de 48 heures" in exp for exp in res["explanations"])


def test_rdap_simulated_404_or_unsupported(scanner):
    mock_unsupported = {
        "status": "INCONNU",
        "domain_age_status": "inconnu",
        "age_days": None,
        "age_category": "INDETERMINE",
        "creation_date": None,
        "hosting_info": "Extension non supportée ou introuvable"
    }
    res = scanner.scan_url("https://mon-site-local.sn", custom_rdap_result=mock_unsupported)
    assert res["domain_age_status"] == "inconnu"
    assert res["domain_age_days"] is None
    assert any("Âge du domaine non vérifiable" in exp for exp in res["explanations"])
    # MUST NOT be treated as CRITIQUE solely because age is unknown
    assert res["risk_level"] in ["FAIBLE", "MODERE"]


def test_rdap_simulated_timeout(scanner):
    mock_timeout = {
        "status": "INCONNU",
        "domain_age_status": "inconnu",
        "age_days": None,
        "age_category": "INDETERMINE",
        "creation_date": None,
        "hosting_info": "Timeout réseau"
    }
    res = scanner.scan_url("https://site-lent.org", custom_rdap_result=mock_timeout)
    assert res["domain_age_status"] == "inconnu"
    assert any("Âge du domaine non vérifiable" in exp for exp in res["explanations"])
