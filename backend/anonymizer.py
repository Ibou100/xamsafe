"""
Anonymizer Module for Senegalese Telecommunications & Messaging.
Applies automated pseudonymization and redaction of PII (personal data)
prior to processing or persistent storage, in compliance with standard privacy practices.
"""

import re
from typing import Tuple, Dict

# Regex patterns for Senegalese phone numbers (Wave, Orange, Free, Expresso)
# Supports: +221, 00221, spaces, dashes, dots, or unseparated digits
# Formats: +221 77 123 45 67, 00221-78-123-45-67, 77.123.45.67, 761234567, 33 821 12 34
SN_PHONE_REGEX = re.compile(
    r'(?:\+221|00221)?\s*(?:[.\-\s]*)?(?:7[05678]|33)(?:[.\-\s]?\d{2,3}){3,4}\b',
    re.IGNORECASE
)

# Generic international phone pattern fallback
INTL_PHONE_REGEX = re.compile(
    r'\+?\b\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{2,4}\b'
)

# Currency & amounts (FCFA, F CFA, Francs, XOF) - handles with or without separators (ex: 15000, 15.000, 15 000)
AMOUNT_REGEX = re.compile(
    r'\b\d+(?:[.\s]\d{3})*(?:[,\.]\d+)?\s*(?:f\s*cfa|fcfa|cfa|francs?|xof|f)\b',
    re.IGNORECASE
)

# OTP / Verification / Security codes
OTP_REGEX = re.compile(
    r'\b(?:code(?:\s+secret|\s+otp|\s+de\s+validation|\s+de\s+confirmation)?\s*[:=]?\s*)([0-9]{4,8})\b',
    re.IGNORECASE
)

# URLs and Web links
URL_REGEX = re.compile(
    r'https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|site|online|tk|ml|ga|cf|gq|link|buzz|com|sn|org|net)(?:/[^\s]*)?',
    re.IGNORECASE
)

# Formal civility titles (French & local)
CIVILITY_NAME_REGEX = re.compile(
    r'\b(?:m\.|mr|mme|mlle|monsieur|madame|docteur|dr|maitre|me|serigne|cheikh|ouztaz)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)?)\b',
    re.IGNORECASE
)

# Common Senegalese given names and patronyms without formal titles
COMMON_SN_NAMES = {
    # Prénoms
    "mamadou", "fatou", "aminata", "cheikh", "babacar", "ousmane", "awa", "mariama",
    "ibrahima", "modou", "khadija", "moussa", "abdoulaye", "astou", "ndeye", "alioune",
    "seynabou", "pape", "assane", "mame", "djibril", "binta", "adama", "samba", "demba",
    # Noms de famille
    "diop", "ndiaye", "sow", "diallo", "fall", "ba", "cisse", "gueye", "sene",
    "faye", "camara", "toure", "kane", "thiam", "sy", "niang", "seck", "sarr", "mbodj", "wade", "dione"
}


def anonymize_text(text: str) -> Tuple[str, Dict[str, int]]:
    """
    Strips and normalizes all PII from the raw text:
    - Phone numbers (Senegalese and international formats)
    - Monetary amounts
    - OTP / validation codes
    - Names with or without civilities
    - Web links
    Returns:
        - anonymized_text: Sanitized string with standard tokens.
        - redacted_counts: Dictionary summarizing redacted items.
    """
    if not text or not isinstance(text, str):
        return "", {"phones": 0, "amounts": 0, "urls": 0, "codes": 0, "names": 0}

    counts = {
        "phones": 0,
        "amounts": 0,
        "urls": 0,
        "codes": 0,
        "names": 0
    }

    sanitized = text

    # 1. Anonymize URLs (keep token for ML features)
    urls = URL_REGEX.findall(sanitized)
    counts["urls"] = len(urls)
    sanitized = URL_REGEX.sub(" <TOKEN_URL> ", sanitized)

    # 2. Anonymize Senegalese Phone Numbers (all formats: +221, spaces, dashes, dots)
    sn_phones = SN_PHONE_REGEX.findall(sanitized)
    counts["phones"] += len(sn_phones)
    sanitized = SN_PHONE_REGEX.sub(" <TOKEN_PHONE> ", sanitized)

    # Fallback international phones
    intl_phones = INTL_PHONE_REGEX.findall(sanitized)
    valid_intl = [p for p in intl_phones if len(re.sub(r'\D', '', p)) >= 8]
    counts["phones"] += len(valid_intl)
    for p in valid_intl:
        sanitized = sanitized.replace(p, " <TOKEN_PHONE> ")

    # 3. Anonymize Monetary Amounts
    amounts = AMOUNT_REGEX.findall(sanitized)
    counts["amounts"] = len(amounts)
    sanitized = AMOUNT_REGEX.sub(" <TOKEN_AMOUNT> ", sanitized)

    # 4. Anonymize OTP codes
    codes = OTP_REGEX.findall(sanitized)
    counts["codes"] = len(codes)
    sanitized = OTP_REGEX.sub(r'code : <TOKEN_CODE> ', sanitized)

    # 5. Anonymize Names with formal civility
    civ_names = CIVILITY_NAME_REGEX.findall(sanitized)
    counts["names"] += len(civ_names)
    sanitized = CIVILITY_NAME_REGEX.sub(" <TOKEN_PERSON> ", sanitized)

    # 6. Anonymize Common Senegalese standalone names (capitalized words matching known directory)
    words = sanitized.split()
    sanitized_words = []
    for w in words:
        clean_w = re.sub(r'^[^\w]+|[^\w]+$', '', w)
        if clean_w.lower() in COMMON_SN_NAMES and clean_w and clean_w[0].isupper():
            sanitized_words.append("<TOKEN_PERSON>")
            counts["names"] += 1
        else:
            sanitized_words.append(w)
    sanitized = " ".join(sanitized_words)

    # Normalize multiple spaces
    sanitized = re.sub(r'\s+', ' ', sanitized).strip()

    return sanitized, counts
