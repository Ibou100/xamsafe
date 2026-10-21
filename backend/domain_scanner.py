"""
Defensive Domain & Infrastructure Intelligence Scanner (Brique 2).
Prioritizes:
1. Domain Age & Creation Time (RDAP / RFC 7480) with explicit uncertainty handling and LRU+TTL caching.
2. Typosquatting & Brand Spoofing (calibrated Levenshtein + secondary confirmation signals).
3. Whitelist loaded from official_domains.json requiring manual verification ('verified': true).
4. SSRF & Private/Loopback IP prevention (no outgoing calls for internal/private hosts).
5. Reputation & High-risk TLDs.
6. Infrastructure & ASN as secondary signals.
Outputs strictly qualitative Risk Levels and explainable indicators.
"""

import re
import os
import json
import time
import datetime
import ipaddress
from urllib.parse import urlparse
from collections import OrderedDict
from typing import Dict, Any, List, Optional, Tuple, Set
import httpx

# Path to configuration file
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "official_domains.json")


def load_official_targets(path: Optional[str] = None) -> Dict[str, Any]:
    """Loads official brand domains configuration."""
    target_path = path or CONFIG_PATH
    if os.path.exists(target_path):
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


# Common everyday words that must not be falsely flagged as typosquatting
COMMON_DICTIONARY_EXCEPTIONS = {
    "cave", "save", "gave", "pave", "brave", "crave", "wavelet",
    "tree", "three", "freezer", "freeze", "street", "coffee", "freedom"
}

# High-risk TLDs frequently abused in malicious campaigns
HIGH_RISK_TLDS = {
    ".xyz", ".top", ".click", ".buzz", ".online", ".site", ".tk", ".ml", ".ga",
    ".cf", ".gq", ".link", ".work", ".rest", ".club", ".live", ".vip", ".icu"
}

# Suspicious authentication / mobile money keywords
AUTH_SENSITIVE_KEYWORDS = {
    "login", "auth", "verify", "verification", "secure", "securite", "compte",
    "otp", "connexion", "recompense", "transfert", "argent", "kiosque", "solde"
}


class RdapCache:
    """
    LRU Cache with Time-To-Live (TTL) eviction.
    Default: 1000 items max, 24 hours (86400s) TTL.
    """
    def __init__(self, max_size: int = 1000, ttl_seconds: float = 86400.0):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self._cache: OrderedDict[str, Tuple[float, Dict[str, Any]]] = OrderedDict()

    def get(self, domain: str) -> Optional[Dict[str, Any]]:
        domain = domain.lower().strip()
        if domain not in self._cache:
            return None
        cached_at, value = self._cache[domain]
        if (time.time() - cached_at) > self.ttl_seconds:
            del self._cache[domain]
            return None
        self._cache.move_to_end(domain)
        return value

    def set(self, domain: str, value: Dict[str, Any]) -> None:
        domain = domain.lower().strip()
        if domain in self._cache:
            del self._cache[domain]
        elif len(self._cache) >= self.max_size:
            # Evict oldest entry (LRU)
            self._cache.popitem(last=False)
        self._cache[domain] = (time.time(), value)

    def __len__(self) -> int:
        return len(self._cache)

    def clear(self) -> None:
        self._cache.clear()


def is_private_or_restricted_target(hostname: str) -> bool:
    """
    Detects private, loopback, link-local, multicast, or reserved IPs/hosts.
    Includes: 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, ::1, localhost.
    """
    clean_host = hostname.lower().strip()
    if clean_host == "localhost" or clean_host.endswith(".localhost"):
        return True

    # Try parsing as IP address (IPv4 or IPv6)
    try:
        ip = ipaddress.ip_address(clean_host)
        return (
            ip.is_private or
            ip.is_loopback or
            ip.is_link_local or
            ip.is_reserved or
            ip.is_multicast or
            ip.is_unspecified
        )
    except ValueError:
        pass

    return False


def compute_levenshtein(s1: str, s2: str) -> int:
    """Computes Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return compute_levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def extract_domain_parts(raw_url: str) -> Tuple[str, str, str, str, str, Optional[str]]:
    """
    Extracts (clean_url, full_hostname, sld, tld, full_path, scheme).
    Handles standard URLs as well as non-standard schemes (javascript:, data:, mailto:, etc.).
    """
    url = raw_url.strip()
    scheme = None

    # 1. Scheme with :// (e.g. http://, https://, ftp://, gopher://, file:///)
    scheme_match = re.match(r'^([a-zA-Z][a-zA-Z0-9+\-.]*)://', url)
    if scheme_match:
        scheme = scheme_match.group(1).lower()
    else:
        # 2. Check for opaque schemes like javascript:..., data:..., mailto:...
        colon_match = re.match(r'^([a-zA-Z][a-zA-Z0-9+\-]*):', url)
        if colon_match and colon_match.group(1).lower() in (
            "javascript", "data", "file", "mailto", "tel", "about", "blob", "vbscript"
        ):
            scheme = colon_match.group(1).lower()
        else:
            # If no explicit scheme prefix, assume http for normalization
            url = "http://" + url
            scheme = "http"

    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    path = (parsed.path or "").lower()

    # Split TLD and SLD
    parts = hostname.split('.')
    if len(parts) >= 2:
        tld = "." + parts[-1]
        sld = parts[-2]
    else:
        tld = ""
        sld = hostname

    return url, hostname, sld, tld, path, scheme


def is_official_domain_match(hostname: str, official_domain: str) -> bool:
    """
    Strict domain matching:
    Valid if hostname exactly equals official_domain OR is a valid subdomain (*.official_domain).
    STRICTLY REJECTS:
    - 'orange.sn.evil.xyz' (ends in .xyz, not .orange.sn)
    - 'evil-orange.sn' (different registrable domain)
    """
    hostname = hostname.lower().strip()
    official_domain = official_domain.lower().strip()
    return hostname == official_domain or hostname.endswith("." + official_domain)


class DomainInfrastructureScanner:
    """
    Defensive OSINT & Infrastructure Scanner:
    - Domain Age Inspection (RDAP) with LRU+TTL caching & uncertainty handling.
    - SSRF prevention rejecting private IPs, loopback, link-local, and non-HTTP schemes.
    - Typosquatting & Brand Spoofing with calibrated thresholds & secondary confirmation.
    - Whitelist comparison on exact registrable domains with explicit 'verified' requirement.
    """

    def __init__(
        self,
        rdap_timeout_sec: float = 3.5,
        cache_max_size: int = 1000,
        cache_ttl_sec: float = 86400.0,
        config_path: Optional[str] = None
    ):
        self.timeout = rdap_timeout_sec
        self.cache = RdapCache(max_size=cache_max_size, ttl_seconds=cache_ttl_sec)
        self.config_path = config_path or CONFIG_PATH
        self.targets = load_official_targets(self.config_path)

    @property
    def _rdap_cache(self):
        """Backward-compatibility mapping for existing test fixtures."""
        return self.cache._cache

    def check_typosquatting_and_spoofing(
        self,
        hostname: str,
        sld: str,
        tld: str,
        path: str
    ) -> Dict[str, Any]:
        """
        Detects brand impersonation, homoglyphs, subdomain abuse, and typosquatting.
        Applies calibrated Levenshtein limits and requires confirmation before escalating.
        Only marks is_official: True if the domain is explicitly verified: True in official_domains.json.
        """
        # 1. Check exact official domain whitelist
        for target_key, info in self.targets.items():
            domains_list = info.get("domains", [])
            for entry in domains_list:
                official = entry.get("domain", "")
                is_verified = entry.get("verified", False)
                if is_official_domain_match(hostname, official):
                    if is_verified:
                        return {
                            "is_official": True,
                            "is_spoofing": False,
                            "target_brand": info.get("brand_name"),
                            "reason": "Correspond à un domaine officiel connu"
                        }
                    else:
                        # Matches official list but pending manual user verification
                        return {
                            "is_official": False,
                            "is_spoofing": False,
                            "target_brand": info.get("brand_name"),
                            "reason": "Domaine officiel en attente de vérification manuelle"
                        }

        # 2. Check for punycode / homoglyphs
        has_punycode = hostname.startswith("xn--") or ".xn--" in hostname

        # 3. Check for auth/sensitive keywords in URL or hostname
        has_auth_keyword = any(k in hostname or k in path for k in AUTH_SENSITIVE_KEYWORDS)

        # 4. Exclude common dictionary words to avoid false positives (e.g. cave, save, tree)
        if sld in COMMON_DICTIONARY_EXCEPTIONS:
            return {
                "is_official": False,
                "is_spoofing": False,
                "target_brand": None,
                "reason": "Terme courant du dictionnaire"
            }

        # 5. Check each protected brand for spoofing & typosquatting
        for target_key, info in self.targets.items():
            official_domains = [d.get("domain", "") for d in info.get("domains", [])]

            # Subdomain Abuse: e.g. 'wave.com.evil.xyz' (contains official domain string but not ending in it)
            for official in official_domains:
                if official in hostname and not is_official_domain_match(hostname, official):
                    return {
                        "is_official": False,
                        "is_spoofing": True,
                        "target_brand": info.get("brand_name"),
                        "technique": "ABUS_SOUS_DOMAINE",
                        "severity": "CRITIQUE",
                        "reason": f"Tentative d'usurpation par faux sous-domaine imitant '{official}'"
                    }

            # Levenshtein distance check on SLD
            for official in official_domains:
                official_sld = official.split('.')[0]
                brand_len = len(official_sld)

                # Calibrated threshold: max 1 for short brands (<= 5 chars), max 2 for longer brands
                max_allowed_dist = 1 if brand_len <= 5 else 2

                dist = compute_levenshtein(sld, official_sld)

                # Direct homoglyph trick check (0 for o, vv for w)
                has_subst_homoglyph = ("0" in sld and "o" in official_sld) or ("vv" in sld and "w" in official_sld)

                if 1 <= dist <= max_allowed_dist and len(sld) >= 3:
                    # Require secondary confirmation signal before triggering CRITIQUE
                    has_confirmation = (
                        tld in HIGH_RISK_TLDS or
                        has_auth_keyword or
                        has_punycode or
                        has_subst_homoglyph
                    )

                    if has_confirmation:
                        return {
                            "is_official": False,
                            "is_spoofing": True,
                            "target_brand": info.get("brand_name"),
                            "technique": "TYPOSQUATTING_CONFIRME",
                            "severity": "CRITIQUE",
                            "reason": f"Altération orthographique trompeuse de '{official_sld}' combinée à des signaux suspects"
                        }
                    else:
                        return {
                            "is_official": False,
                            "is_spoofing": True,
                            "target_brand": info.get("brand_name"),
                            "technique": "TYPOSQUATTING_FAIBLE",
                            "severity": "MODERE",
                            "reason": f"Proximité lexicale avec la marque '{official_sld}' sans signal malveillant aggravant avéré"
                        }

        return {
            "is_official": False,
            "is_spoofing": False,
            "target_brand": None,
            "reason": "Aucune usurpation de marque sénégalaise identifiée"
        }

    def fetch_domain_age_rdap(self, hostname: str) -> Dict[str, Any]:
        """
        Inspects domain creation date via RDAP (RFC 7480).
        Protects against SSRF: Does NOT query RDAP for private/loopback/restricted hosts.
        Uses in-memory cache (LRU + TTL).
        """
        if not hostname or is_private_or_restricted_target(hostname):
            return {
                "status": "NON_ANALYSABLE",
                "domain_age_status": "inconnu",
                "age_days": None,
                "age_category": "INDETERMINE",
                "creation_date": None,
                "hosting_info": "Hôte local ou réseau privé non requêtable"
            }

        # Check if direct public IP
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname) or ":" in hostname:
            return {
                "status": "IP_BRUTE",
                "domain_age_status": "inconnu",
                "age_days": None,
                "age_category": "CRITIQUE",
                "creation_date": None,
                "hosting_info": "Adresse IP directe sans nom de domaine"
            }

        # Extract root domain (ex: 'auth.example.com' -> 'example.com')
        parts = hostname.split('.')
        if len(parts) >= 2:
            root_domain = ".".join(parts[-2:])
        else:
            root_domain = hostname

        # Check in-memory LRU+TTL cache
        cached = self.cache.get(root_domain)
        if cached is not None:
            return cached

        rdap_url = f"https://rdap.org/domain/{root_domain}"

        try:
            with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                resp = client.get(rdap_url)
                if resp.status_code == 200:
                    data = resp.json()
                    events = data.get("events", [])
                    reg_date = None
                    for ev in events:
                        if ev.get("eventAction") in ["registration", "created"]:
                            reg_date = ev.get("eventDate")
                            break

                    if reg_date:
                        clean_date_str = reg_date.split('T')[0]
                        created_dt = datetime.datetime.strptime(clean_date_str, "%Y-%m-%d").date()
                        today = datetime.date.today()
                        age_days = (today - created_dt).days

                        if age_days < 2:
                            cat = "CRITIQUE"
                        elif age_days < 7:
                            cat = "ELEVE"
                        elif age_days < 30:
                            cat = "MODERE"
                        else:
                            cat = "ANCIEN_STABLE"

                        result = {
                            "status": "RESOLVED",
                            "domain_age_status": "connu",
                            "age_days": age_days,
                            "age_category": cat,
                            "creation_date": clean_date_str,
                            "hosting_info": data.get("port43", "RDAP ICANN")
                        }
                        self.cache.set(root_domain, result)
                        return result
        except Exception:
            pass

        # Fallback when RDAP is unresolvable (timeout, 404, or unsupported ccTLD like some .sn)
        result = {
            "status": "INCONNU",
            "domain_age_status": "inconnu",
            "age_days": None,
            "age_category": "INDETERMINE",
            "creation_date": None,
            "hosting_info": "Serveur d'enregistrement non joignable ou extension non supportée"
        }
        self.cache.set(root_domain, result)
        return result

    def scan_url(
        self,
        raw_url: str,
        custom_rdap_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes defensive domain scan:
        1. Validates scheme (HTTP/HTTPS only). Rejects unsupported schemes without network requests.
        2. Validates hostname against SSRF (loopback, private, link-local, localhost).
        3. Exact whitelist matching (only if verified=True in config).
        4. Typosquatting & Brand Spoofing (calibrated Levenshtein).
        5. RDAP Domain Age & RFC 7480 checks with uncertainty handling.
        """
        url, hostname, sld, tld, path, scheme = extract_domain_parts(raw_url)

        # 0. Scheme validation: only HTTP and HTTPS allowed
        if scheme not in ("http", "https"):
            return {
                "risk_level": "FAIBLE",
                "risk_label": "Adresse non analysable",
                "hostname": hostname or raw_url,
                "domain_age_days": None,
                "domain_age_status": "inconnu",
                "creation_date": None,
                "target_brand_spoofed": None,
                "explanations": ["Adresse non analysable : seuls les protocoles HTTP et HTTPS sont pris en charge."],
                "recommendation": "Vérifiez que l'adresse commence par http:// ou https://.",
                "secondary_signal_hosting": None
            }

        # 1. SSRF & Private / Loopback IP protection
        if not hostname or is_private_or_restricted_target(hostname):
            return {
                "risk_level": "FAIBLE",
                "risk_label": "Adresse non analysable",
                "hostname": hostname or raw_url,
                "domain_age_days": None,
                "domain_age_status": "inconnu",
                "creation_date": None,
                "target_brand_spoofed": None,
                "explanations": ["Adresse non analysable : cette adresse pointe vers une adresse IP privée, locale ou réservée."],
                "recommendation": "L'analyse est réservée aux noms de domaine publics sur Internet.",
                "secondary_signal_hosting": None
            }

        # 2. Typosquatting / Brand check
        spoofing = self.check_typosquatting_and_spoofing(hostname, sld, tld, path)

        # Exact match with recognized official domain (only if verified=True)
        if spoofing.get("is_official"):
            return {
                "risk_level": "FAIBLE",
                "risk_label": "Correspond à un domaine officiel connu",
                "hostname": hostname,
                "target_brand_spoofed": spoofing.get("target_brand"),
                "domain_age_days": "> 365",
                "domain_age_status": "connu",
                "creation_date": None,
                "explanations": [f"Ce domaine correspond au portail officiel connu de {spoofing.get('target_brand')}."],
                "recommendation": "Accès officiel sécurisé.",
                "secondary_signal_hosting": "Infrastructure officielle"
            }

        # 3. Domain Age Check (Priority 1)
        rdap = custom_rdap_result if custom_rdap_result else self.fetch_domain_age_rdap(hostname)
        domain_age_status = rdap.get("domain_age_status", "inconnu")
        age_days = rdap.get("age_days")

        # 4. Compile Threat Signals
        explanations = []
        is_critical = False
        is_high = False
        is_moderate = False

        # Signal A: Typosquatting / Spoofing
        if spoofing.get("is_spoofing"):
            explanations.append(spoofing.get("reason", "Tentative d'usurpation détectée"))
            if spoofing.get("severity") == "CRITIQUE":
                is_critical = True
            elif spoofing.get("severity") == "MODERE":
                is_moderate = True
            else:
                is_high = True

        # Signal B: Direct IP address
        if rdap.get("status") == "IP_BRUTE":
            explanations.append("L'adresse utilise une adresse IP directe sans nom de domaine, technique typique d'attaque furtive.")
            is_critical = True

        # Signal C: Domain Age (Priority 1 with uncertainty handling)
        if domain_age_status == "connu" and age_days is not None:
            if age_days < 2:
                explanations.append(
                    f"Nom de domaine très récent (enregistré il y a moins de 48 heures / {age_days} jour(s)). "
                    "Les domaines très récents sont fréquemment utilisés dans les campagnes de phishing."
                )
                is_critical = True
            elif age_days < 7:
                explanations.append(f"Nom de domaine récent (enregistré il y a {age_days} jours).")
                is_high = True
            elif age_days < 30:
                explanations.append(f"Domaine jeune (moins d'un mois d'existence : {age_days} jours).")
                is_moderate = True
        else:
            # Explicit uncertainty: domain age not verifiable
            explanations.append("Âge du domaine non vérifiable.")

        # Signal D: High Risk TLD
        if tld in HIGH_RISK_TLDS:
            explanations.append(f"Utilisation d'une extension à bas coût ({tld}) statistiquement surreprésentée dans les campagnes malveillantes.")
            if is_critical or is_high:
                pass
            else:
                is_moderate = True

        # 5. Determine Overall Qualitative Risk
        if is_critical:
            risk_level = "CRITIQUE"
            risk_label = "Infrastructure de phishing hautement probable"
            recommendation = "DANGER : Ne cliquez jamais sur ce lien et ne transmettez aucun identifiant."
        elif is_high:
            risk_level = "ELEVE"
            risk_label = "Risque d'usurpation élevé"
            recommendation = "Méfiance absolue : domaine suspect non certifié."
        elif is_moderate:
            risk_level = "MODERE"
            risk_label = "Vigilance recommandée"
            recommendation = "Vérifiez soigneusement l'origine du message avant toute interaction."
        else:
            risk_level = "FAIBLE"
            risk_label = "Aucune menace d'infrastructure identifiée"
            recommendation = "Aucun indicateur de menace technique détecté."

        return {
            "risk_level": risk_level,
            "risk_label": risk_label,
            "hostname": hostname,
            "domain_age_days": age_days,
            "domain_age_status": domain_age_status,
            "creation_date": rdap.get("creation_date"),
            "target_brand_spoofed": spoofing.get("target_brand"),
            "explanations": explanations,
            "recommendation": recommendation,
            "secondary_signal_hosting": rdap.get("hosting_info")
        }
