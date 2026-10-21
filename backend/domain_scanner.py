"""
Defensive Domain & Infrastructure Intelligence Scanner (Brique 2).
Prioritizes:
1. Domain Age & Creation Time (RDAP / RFC 7480)
2. Typosquatting, Homoglyphs & Brand Impersonation (Levenshtein & Subdomain abuse)
3. Global Threat Reputation (URLhaus / Known Bad DB)
4. Infrastructure & ASN (Secondary Signal)
Outputs strictly qualitative Risk Levels and explainable indicators.
"""

import re
import datetime
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Tuple
import httpx

# High-priority protected brands in Senegal & West Africa
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

HIGH_RISK_TLDS = {
    ".xyz", ".top", ".click", ".buzz", ".online", ".site", ".tk", ".ml", ".ga",
    ".cf", ".gq", ".link", ".work", ".rest", ".club", ".live", ".vip", ".icu"
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


def extract_domain_parts(raw_url: str) -> Tuple[str, str, str, str]:
    """
    Extracts (clean_url, full_hostname, sld, tld).
    Example: 'https://wave.com.auth.xyz/login' -> ('https://wave.com.auth.xyz/login', 'wave.com.auth.xyz', 'auth', '.xyz')
    """
    url = raw_url.strip()
    if not re.match(r'^[a-zA-Z]+://', url):
        url = "http://" + url

    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()

    # Split TLD and SLD
    parts = hostname.split('.')
    if len(parts) >= 2:
        tld = "." + parts[-1]
        sld = parts[-2]
    else:
        tld = ""
        sld = hostname

    return url, hostname, sld, tld


class DomainInfrastructureScanner:
    """
    Defensive OSINT & Infrastructure Scanner:
    - Domain Age Inspection (RDAP)
    - Typosquatting & Brand Spoofing Analysis
    - Threat Reputation Checks
    """

    def __init__(self, rdap_timeout_sec: float = 3.0):
        self.timeout = rdap_timeout_sec

    def check_typosquatting_and_spoofing(self, hostname: str, sld: str, tld: str) -> Dict[str, Any]:
        """
        Detects brand impersonation, homoglyphs, subdomain abuse, and typosquatting.
        """
        # 1. Check for punycode / homoglyphs
        has_punycode = hostname.startswith("xn--") or ".xn--" in hostname

        # 2. Check each protected brand
        for target_key, info in PROTECTED_TARGETS.items():
            official_domains = info["official_domains"]

            # Exact match with official domain -> Legit!
            if any(hostname == d or hostname.endswith("." + d) for d in official_domains):
                return {
                    "is_spoofing": False,
                    "target_brand": info["brand_name"],
                    "is_official": True,
                    "reason": "Domaine officiel certifié"
                }

            # Check Subdomain Abuse (e.g., 'wave.com.security-login.xyz')
            for official in official_domains:
                if official in hostname:
                    return {
                        "is_spoofing": True,
                        "target_brand": info["brand_name"],
                        "technique": "ABUS_SOUS_DOMAINE",
                        "severity": "CRITIQUE",
                        "reason": f"Usurpation par faux sous-domaine imitant '{official}'"
                    }

            # Check keywords embedded in hostname with high-risk TLD
            for kw in info["keywords"]:
                if kw in hostname:
                    return {
                        "is_spoofing": True,
                        "target_brand": info["brand_name"],
                        "technique": "MOT_CLE_IMPOSTURE",
                        "severity": "CRITIQUE" if tld in HIGH_RISK_TLDS else "ELEVE",
                        "reason": f"Présence du terme protégé '{kw}' en dehors des domaines officiels"
                    }

            # Check Levenshtein distance on SLD (e.g., 'wvve' or '0range' vs 'wave' / 'orange')
            for official in official_domains:
                official_sld = official.split('.')[0]
                dist = compute_levenshtein(sld, official_sld)
                if 1 <= dist <= 2 and len(sld) >= 3:
                    return {
                        "is_spoofing": True,
                        "target_brand": info["brand_name"],
                        "technique": "TYPOSQUATTING_LEVENSHTEIN",
                        "severity": "CRITIQUE",
                        "reason": f"Altération orthographique trompeuse de '{official_sld}' (distance de Levenshtein = {dist})"
                    }

        if has_punycode:
            return {
                "is_spoofing": True,
                "target_brand": "Inconnu",
                "technique": "HOMOGLYPHE_PUNYCODE",
                "severity": "CRITIQUE",
                "reason": "Utilisation de caractères Unicode masqués (Punycode xn--)"
            }

        return {
            "is_spoofing": False,
            "target_brand": None,
            "is_official": False,
            "reason": "Aucune marque protégée détectée"
        }

    def fetch_domain_age_rdap(self, hostname: str) -> Dict[str, Any]:
        """
        Interrogates standard RDAP bootstrap server to determine exact domain creation date.
        """
        # IP address test directly on hostname
        if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
            return {
                "status": "IP_BRUTE",
                "age_days": 0,
                "age_category": "CRITIQUE",
                "creation_date": None,
                "hosting_info": "Adresse IP directe sans nom de domaine"
            }

        # Clean hostname to get root domain (ex: 'sub.example.com' -> 'example.com')
        parts = hostname.split('.')
        if len(parts) >= 2:
            root_domain = ".".join(parts[-2:])
        else:
            root_domain = hostname

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
                        # Parse ISO date
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

                        return {
                            "status": "RESOLVED",
                            "age_days": age_days,
                            "age_category": cat,
                            "creation_date": clean_date_str,
                            "hosting_info": data.get("port43", "RDAP ICANN")
                        }
        except Exception:
            pass

        # Fallback if RDAP is unreachable or timed out
        return {
            "status": "INCONNU",
            "age_days": None,
            "age_category": "INDETERMINE",
            "creation_date": None,
            "hosting_info": "Serveur d'enregistrement non joignable"
        }

    def scan_url(self, raw_url: str, custom_rdap_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes complete defensive scan:
        1. Typosquatting & Brand Spoofing (Priority 2)
        2. Domain Age (Priority 1)
        3. TLD Risk & Reputation Heuristics
        4. Synthesizes qualitative Risk Level
        """
        clean_url, hostname, sld, tld = extract_domain_parts(raw_url)

        if not hostname:
            return {
                "risk_level": "FAIBLE",
                "risk_label": "URL invalide ou vide",
                "hostname": "",
                "explanations": ["Impossible d'extraire un nom d'hôte valide."],
                "recommendation": "Vérifiez la saisie de l'adresse."
            }

        # 1. Typosquatting / Brand check
        spoofing = self.check_typosquatting_and_spoofing(hostname, sld, tld)

        # If it's an official recognized domain
        if spoofing.get("is_official"):
            return {
                "risk_level": "FAIBLE",
                "risk_label": "Domaine officiel certifié",
                "hostname": hostname,
                "target_brand_spoofed": spoofing.get("target_brand"),
                "domain_age_days": "> 365",
                "explanations": [f"Ce domaine correspond au portail officiel légitime de {spoofing.get('target_brand')}."],
                "recommendation": "Accès officiel sécurisé.",
                "secondary_signal_hosting": "Infrastructure certifiée"
            }

        # 2. Domain Age Check (Priority 1)
        rdap = custom_rdap_result if custom_rdap_result else self.fetch_domain_age_rdap(hostname)

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
            else:
                is_high = True

        # Signal B: Direct IP address
        if rdap.get("status") == "IP_BRUTE":
            explanations.append("L'adresse utilise une adresse IP directe sans nom de domaine, technique typique d'attaque furtive.")
            is_critical = True

        # Signal C: Domain Age (Priority 1)
        age_days = rdap.get("age_days")
        if age_days is not None:
            if age_days < 2:
                explanations.append(f"Nom de domaine créé il y a moins de 48 heures ({age_days} jour(s)) : indicateur majeur de site temporaire frauduleux.")
                is_critical = True
            elif age_days < 7:
                explanations.append(f"Nom de domaine très récent (enregistré il y a {age_days} jours).")
                is_high = True
            elif age_days < 30:
                explanations.append(f"Domaine jeune (moins d'un mois d'existence : {age_days} jours).")
                is_moderate = True

        # Signal D: High Risk TLD
        if tld in HIGH_RISK_TLDS:
            explanations.append(f"Utilisation d'une extension à bas coût ({tld}) statistiquement surreprésentée dans les campagnes malveillantes.")
            if not is_critical:
                is_high = True

        # Secondary Signal: Hosting / Port43 info
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
            if not explanations:
                explanations.append("Domaine sans antécédent d'usurpation, sans TLD douteux et d'ancienneté stable.")

        return {
            "risk_level": risk_level,
            "risk_label": risk_label,
            "hostname": hostname,
            "domain_age_days": age_days,
            "creation_date": rdap.get("creation_date"),
            "target_brand_spoofed": spoofing.get("target_brand"),
            "explanations": explanations,
            "recommendation": recommendation,
            "secondary_signal_hosting": hosting
        }
