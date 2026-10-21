"""
Defensive Domain & Infrastructure Intelligence Scanner (Brique 2).
Prioritizes:
1. Domain Age & Creation Time (RDAP / RFC 7480) with explicit uncertainty handling.
2. Typosquatting & Brand Spoofing (calibrated Levenshtein + secondary confirmation signals).
3. Reputation & High-risk TLDs.
4. Infrastructure & ASN as secondary signals.
Outputs strictly qualitative Risk Levels and explainable indicators.
"""

import re
import datetime
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Tuple
import httpx

# Whitelist of known official domains targeting Senegal & West Africa
# Each entry requires manual validation. Substring matches are strictly prohibited.
PROTECTED_TARGETS = {
    "wave": {
        "official_domains": ["wave.com", "wave.sn"],
        "brand_name": "Wave Mobile Money",
        "keywords": ["wave", "wav", "waveci", "wavesn"]
    },
    "orange": {
        "official_domains": ["orange.sn", "orange.com", "sonatel.sn"],
        "brand_name": "Orange / Sonatel",
        "keywords": ["orange", "sonatel", "om-sn", "orangemoney"]
    },
    "free": {
        "official_domains": ["free.sn"],
        "brand_name": "Free Sénégal",
        "keywords": ["free", "freemoney"]
    },
    "campusen": {
        "official_domains": ["campusen.sn"],
        "brand_name": "Campusen (Bourses & Orientation)",
        "keywords": ["campusen", "bourse-senegal"]
    },
    "cbao": {
        "official_domains": ["cbao.sn", "attijariwafabank.com"],
        "brand_name": "CBAO Attijariwafa Bank",
        "keywords": ["cbao", "attijariwafa", "attijari"]
    },
    "ecobank": {
        "official_domains": ["ecobank.com"],
        "brand_name": "Ecobank",
        "keywords": ["ecobank"]
    },
    "senelec": {
        "official_domains": ["senelec.sn"],
        "brand_name": "Senelec",
        "keywords": ["senelec"]
    },
    "seneau": {
        "official_domains": ["seneau.sn"],
        "brand_name": "Sen'Eau",
        "keywords": ["seneau"]
    },
    "police": {
        "official_domains": ["signalementcyber.dgpn.sn", "policenationale.gouv.sn"],
        "brand_name": "Police Nationale / DSC",
        "keywords": ["police", "signalementcyber", "dgpn"]
    }
}

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


def extract_domain_parts(raw_url: str) -> Tuple[str, str, str, str, str]:
    """
    Extracts (clean_url, full_hostname, sld, tld, full_path).
    Example: 'https://wave.com.auth.xyz/login' -> ('https://wave.com.auth.xyz/login', 'wave.com.auth.xyz', 'auth', '.xyz', '/login')
    """
    url = raw_url.strip()
    if not re.match(r'^[a-zA-Z]+://', url):
        url = "http://" + url

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

    return url, hostname, sld, tld, path


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
    - Domain Age Inspection (RDAP) with in-memory caching & uncertainty handling.
    - Typosquatting & Brand Spoofing with calibrated thresholds & secondary confirmation.
    - Whitelist comparison on exact registrable domains.
    """

    def __init__(self, rdap_timeout_sec: float = 3.5):
        self.timeout = rdap_timeout_sec
        # In-memory cache to prevent redundant external RDAP queries: {domain: rdap_dict}
        self._rdap_cache: Dict[str, Dict[str, Any]] = {}

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
        """
        # 1. Check exact official domain whitelist
        for target_key, info in PROTECTED_TARGETS.items():
            for official in info["official_domains"]:
                if is_official_domain_match(hostname, official):
                    return {
                        "is_official": True,
                        "is_spoofing": False,
                        "target_brand": info["brand_name"],
                        "reason": "Correspond à un domaine officiel connu"
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

        # 5. Check each protected brand
        for target_key, info in PROTECTED_TARGETS.items():
            official_domains = info["official_domains"]

            # Subdomain Abuse: e.g. 'wave.com.evil.xyz' (contains official domain string but not ending in it)
            for official in official_domains:
                if official in hostname and not is_official_domain_match(hostname, official):
                    return {
                        "is_official": False,
                        "is_spoofing": True,
                        "target_brand": info["brand_name"],
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
                            "target_brand": info["brand_name"],
                            "technique": "TYPOSQUATTING_CONFIRME",
                            "severity": "CRITIQUE",
                            "reason": f"Altération orthographique trompeuse de '{official_sld}' combinée à des signaux suspects"
                        }
                    else:
                        return {
                            "is_official": False,
                            "is_spoofing": True,
                            "target_brand": info["brand_name"],
                            "technique": "PROXIMITE_LEXICALE",
                            "severity": "MODERE",
                            "reason": f"Proximité lexicale avec la marque '{official_sld}', sans indice d'usurpation avéré"
                        }

            # Protected keyword check with high-risk TLD
            for kw in info["keywords"]:
                if kw in hostname and not any(is_official_domain_match(hostname, d) for d in official_domains):
                    severity = "CRITIQUE" if (tld in HIGH_RISK_TLDS or has_auth_keyword) else "MODERE"
                    return {
                        "is_official": False,
                        "is_spoofing": True,
                        "target_brand": info["brand_name"],
                        "technique": "MOT_CLE_IMPOSTURE",
                        "severity": severity,
                        "reason": f"Présence du terme protégé '{kw}' en dehors des domaines officiels connus"
                    }

        if has_punycode:
            return {
                "is_official": False,
                "is_spoofing": True,
                "target_brand": None,
                "technique": "HOMOGLYPHE_PUNYCODE",
                "severity": "CRITIQUE",
                "reason": "Utilisation de caractères Unicode masqués (Punycode xn--)"
            }

        return {
            "is_official": False,
            "is_spoofing": False,
            "target_brand": None,
            "reason": "Aucune marque protégée détectée"
        }

    def fetch_domain_age_rdap(self, hostname: str) -> Dict[str, Any]:
        """
        Interrogates RDAP bootstrap server to determine exact domain creation date.
        Uses in-memory cache and returns 'inconnu' when registration date cannot be verified.
        """
        # Direct IP check
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
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

        # Check in-memory cache
        if root_domain in self._rdap_cache:
            return self._rdap_cache[root_domain]

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
                        self._rdap_cache[root_domain] = result
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
        self._rdap_cache[root_domain] = result
        return result

    def scan_url(
        self,
        raw_url: str,
        custom_rdap_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes defensive domain scan:
        1. Exact whitelist matching (Correspond à un domaine officiel connu)
        2. Typosquatting & Brand Spoofing (calibrated Levenshtein)
        3. Domain Age (RDAP) with uncertainty handling
        4. Synthesizes qualitative Risk Level
        """
        clean_url, hostname, sld, tld, path = extract_domain_parts(raw_url)

        if not hostname:
            return {
                "risk_level": "FAIBLE",
                "risk_label": "URL invalide ou vide",
                "hostname": "",
                "domain_age_days": None,
                "domain_age_status": "inconnu",
                "explanations": ["Impossible d'extraire un nom d'hôte valide."],
                "recommendation": "Vérifiez la saisie de l'adresse."
            }

        # 1. Typosquatting / Brand check
        spoofing = self.check_typosquatting_and_spoofing(hostname, sld, tld, path)

        # Exact match with recognized official domain
        if spoofing.get("is_official"):
            return {
                "risk_level": "FAIBLE",
                "risk_label": "Correspond à un domaine officiel connu",
                "hostname": hostname,
                "target_brand_spoofed": spoofing.get("target_brand"),
                "domain_age_days": "> 365",
                "domain_age_status": "connu",
                "explanations": [f"Ce domaine correspond au portail officiel connu de {spoofing.get('target_brand')}."],
                "recommendation": "Accès officiel sécurisé.",
                "secondary_signal_hosting": "Infrastructure officielle"
            }

        # 2. Domain Age Check (Priority 1)
        rdap = custom_rdap_result if custom_rdap_result else self.fetch_domain_age_rdap(hostname)
        domain_age_status = rdap.get("domain_age_status", "inconnu")
        age_days = rdap.get("age_days")

        # 3. Compile Threat Signals
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
            if not is_critical:
                is_high = True

        # Secondary Signal: Hosting info
        hosting = rdap.get("hosting_info")

        # 4. Final Risk Level Calculation (Strictly Qualitative)
        if is_critical:
            risk_level = "CRITIQUE"
            risk_label = "Menace cyber imminente : domaine d'usurpation ou d'attaque active"
            recommendation = "Ne visitez en aucun cas cette page. N'y saisissez aucun identifiant, mot de passe ou code bancaire."
        elif is_high:
            risk_level = "ELEVE"
            risk_label = "Forte présomption de site frauduleux ou domaine suspect récent"
            recommendation = "Évitez tout échange avec ce lien et privilégiez les applications mobiles officielles."
        elif is_moderate:
            risk_level = "MODERE"
            risk_label = "Vigilance : domaine récent ou structure non standard"
            recommendation = "Vérifiez attentivement la provenance exacte avant de continuer."
        else:
            risk_level = "FAIBLE"
            risk_label = "Aucun indicateur d'infrastructure malveillante identifié"
            recommendation = "Site conforme aux règles standard de navigation."
            if not any(e for e in explanations if e != "Âge du domaine non vérifiable."):
                explanations.append("Domaine sans antécédent d'usurpation et sans TLD douteux.")

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
            "secondary_signal_hosting": hosting
        }
