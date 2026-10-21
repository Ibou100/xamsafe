"""
Unit & Integration Tests for Domain Infrastructure & OSINT Scanner (Brique 2).
Validates:
- Domain Age Uncertainty Handling (RDAP) & Caching (LRU + TTL).
- SSRF Prevention (Private IPs, Loopback, Link-Local, Localhost, Non-HTTP Schemes).
- Typosquatting Limits & Common Word Exceptions.
- Strict Whitelist Isolation with 'verified': false default behavior.
"""

import pytest
import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from domain_scanner import (
    DomainInfrastructureScanner,
    RdapCache,
    compute_levenshtein,
    extract_domain_parts,
    is_official_domain_match,
    is_private_or_restricted_target
)


@pytest.fixture(scope="module")
def scanner():
    """Default scanner with official_domains.json (verified: false by default)."""
    return DomainInfrastructureScanner()


@pytest.fixture(scope="module")
def verified_scanner():
    """Scanner instance with all official domains manually marked as verified: true."""
    s = DomainInfrastructureScanner()
    # Mock verified: true for all domains in targets
    for target_key, info in s.targets.items():
        for d in info.get("domains", []):
            d["verified"] = True
    return s


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
    url, host, sld, tld, path, scheme = extract_domain_parts("https://wave.com.auth-service.xyz/login?id=1")
    assert host == "wave.com.auth-service.xyz"
    assert sld == "auth-service"
    assert tld == ".xyz"
    assert path == "/login"
    assert scheme == "https"


# =========================================================================
# 2. LISTE BLANCHE : COMPARAISON STRICTE ET ISOLATION DU STATUT 'VERIFIED'
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


def test_unverified_domains_treated_as_normal_by_default(scanner):
    """
    By default in official_domains.json, 'verified': false.
    The scanner must NOT grant 'Correspond à un domaine officiel connu'.
    """
    mock_aged_rdap = {
        "status": "RESOLVED",
        "domain_age_status": "connu",
        "age_days": 800,
        "age_category": "ANCIEN_STABLE",
        "creation_date": "2022-01-01",
        "hosting_info": "Official Registrar"
    }
    res = scanner.scan_url("https://wave.com", custom_rdap_result=mock_aged_rdap)
    assert res["risk_label"] != "Correspond à un domaine officiel connu"
    # Still treated as legitimate safe normal domain
    assert res["risk_level"] == "FAIBLE"


@pytest.mark.parametrize("official_url,expected_brand", [
    ("https://wave.com", "Wave Mobile Money"),
    ("https://www.wave.sn", "Wave Mobile Money"),
    ("https://orange.sn/portail", "Orange / Sonatel"),
    ("https://www.campusen.sn", "Campusen (Bourses & Orientation)"),
    ("https://www.cbao.sn", "CBAO Attijariwafa Bank"),
    ("https://signalementcyber.dgpn.sn", "Police Nationale / DSC"),
])
def test_verified_official_domains_produce_official_label(verified_scanner, official_url, expected_brand):
    """When verified: true, the official status is granted."""
    res = verified_scanner.scan_url(official_url)
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
# 3. PROTECTION SSRF & RESTRICTIONS D'IP ET DE SCHÉMAS (Partie A3)
# =========================================================================

@pytest.mark.parametrize("private_ip_url", [
    "http://127.0.0.1",
    "http://127.0.0.5:8080/admin",
    "http://10.0.0.1/status",
    "http://172.16.0.10",
    "http://192.168.1.1/router",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]/debug",
    "http://localhost",
    "http://sub.localhost:3000"
])
def test_ssrf_private_ips_and_localhost_rejected(scanner, private_ip_url):
    """SSRF: Private, loopback, link-local, and localhost must return 'Adresse non analysable'."""
    res = scanner.scan_url(private_ip_url)
    assert res["risk_label"] == "Adresse non analysable"
    assert any("adresse non analysable" in exp.lower() for exp in res["explanations"])
    # No network query should be performed
    assert res["domain_age_days"] is None
    assert res["domain_age_status"] == "inconnu"


@pytest.mark.parametrize("forbidden_scheme_url", [
    "ftp://wave.com/file.txt",
    "file:///etc/passwd",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "gopher://evil.com"
])
def test_unsupported_schemes_rejected(scanner, forbidden_scheme_url):
    """Only HTTP and HTTPS schemes are supported."""
    res = scanner.scan_url(forbidden_scheme_url)
    assert res["risk_label"] == "Adresse non analysable"
    assert any("protocoles http et https" in exp.lower() for exp in res["explanations"])


def test_is_private_or_restricted_target():
    assert is_private_or_restricted_target("127.0.0.1") is True
    assert is_private_or_restricted_target("10.10.10.10") is True
    assert is_private_or_restricted_target("172.20.0.1") is True
    assert is_private_or_restricted_target("192.168.0.254") is True
    assert is_private_or_restricted_target("169.254.1.1") is True
    assert is_private_or_restricted_target("::1") is True
    assert is_private_or_restricted_target("localhost") is True
    assert is_private_or_restricted_target("test.localhost") is True
    assert is_private_or_restricted_target("8.8.8.8") is False
    assert is_private_or_restricted_target("wave.com") is False


# =========================================================================
# 4. CACHE RDAP : TAILLE MAXIMALE ET EXPIRATION TTL (Partie A5)
# =========================================================================

def test_rdap_cache_max_size_eviction():
    cache = RdapCache(max_size=3, ttl_seconds=3600.0)
    cache.set("domain1.com", {"val": 1})
    cache.set("domain2.com", {"val": 2})
    cache.set("domain3.com", {"val": 3})
    assert len(cache) == 3
    assert cache.get("domain1.com") is not None

    # Insert 4th domain -> oldest entry should be evicted
    cache.set("domain4.com", {"val": 4})
    assert len(cache) == 3
    # domain2.com was the least recently used because domain1.com was accessed with get()
    assert cache.get("domain2.com") is None
    assert cache.get("domain4.com") is not None


def test_rdap_cache_ttl_expiration():
    cache = RdapCache(max_size=10, ttl_seconds=0.05)
    cache.set("temp-domain.com", {"val": 99})
    assert cache.get("temp-domain.com") == {"val": 99}

    time.sleep(0.06)
    # Expired
    assert cache.get("temp-domain.com") is None
    assert len(cache) == 0


# =========================================================================
# 5. TYPOSQUATTING : TESTS DES FAUX POSITIFS & CONFIRMATIONS
# =========================================================================

@pytest.mark.parametrize("legit_word_url", [
    "https://cave.com",
    "https://save.org",
    "https://tree.com",
    "https://street.com"
])
def test_common_words_do_not_trigger_critical(scanner, legit_word_url):
    """Common English/French words sharing Levenshtein proximity with wave/free must NOT trigger CRITIQUE."""
    res = scanner.scan_url(legit_word_url)
    assert res["risk_level"] != "CRITIQUE"


def test_typosquatting_without_confirmation_is_moderate(scanner):
    """A typosquatting domain on a neutral TLD without auth keywords should be MODERE, not CRITIQUE."""
    mock_aged_rdap = {
        "status": "RESOLVED",
        "domain_age_status": "connu",
        "age_days": 500,
        "age_category": "ANCIEN_STABLE",
        "creation_date": "2024-01-01",
        "hosting_info": "Generic Host"
    }
    res = scanner.scan_url("https://wawe.org/blog", custom_rdap_result=mock_aged_rdap)
    assert res["risk_level"] == "MODERE"
    assert any("Proximité lexicale" in exp for exp in res["explanations"])


def test_typosquatting_with_confirmation_triggers_alert(scanner):
    """'wvve.com' with auth keyword or '0range.sn' (homoglyph) must trigger an alert."""
    res1 = scanner.scan_url("http://0range.sn/login")
    assert res1["risk_level"] in ["ELEVE", "CRITIQUE"]

    res2 = scanner.scan_url("http://wvve.com/login")
    assert res2["risk_level"] in ["ELEVE", "CRITIQUE"]


# =========================================================================
# 6. RDAP : GESTION DE L'INCERTITUDE ET TESTS SIMULÉS
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
