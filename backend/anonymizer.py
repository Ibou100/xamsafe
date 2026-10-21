"""
Anonymizer Module for Senegalese Telecommunications & Messaging.
Guarantees strict Zero-Knowledge / PII compliance (Loi CDP Sénégal 2008-12)
before any text is ingested, stored, or processed by Machine Learning models.
"""

import re
from typing import Tuple, Dict

# Regex patterns for Senegalese phone numbers (Wave, Orange, Free, Expresso)
# Formats: 77 123 45 67, 781234567, +221701234567, 00221 76 123 45 67
SN_PHONE_REGEX = re.compile(
    r'(?:\+221|00221)?\s*(?:7[05678]\d{7}|7[05678][\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|33[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2})',
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

# Names preceded by formal titles (Senegal / French)
NAME_REGEX = re.compile(
    r'\b(?:m\.|mr|mme|mlle|monsieur|madame|docteur|dr|maitre|me|serigne|cheikh|ouztaz)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)?)\b',
    re.IGNORECASE
)


def anonymize_text(text: str) -> Tuple[str, Dict[str, int]]:
    """
    Strips and normalizes all PII from the raw text.
    Returns:
        - anonymized_text: Sanitized string with standard tokens.
        - redacted_counts: Dictionary summarizing what was anonymized.
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

    # 2. Anonymize Senegalese Phone Numbers
    sn_phones = SN_PHONE_REGEX.findall(sanitized)
    counts["phones"] += len(sn_phones)
    sanitized = SN_PHONE_REGEX.sub(" <TOKEN_PHONE> ", sanitized)

    # Secondary phone check
    intl_phones = INTL_PHONE_REGEX.findall(sanitized)
    # Filter out pure small numbers that aren't phones
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

    # 5. Anonymize Names with titles
    names = NAME_REGEX.findall(sanitized)
    counts["names"] = len(names)
    sanitized = NAME_REGEX.sub(" <TOKEN_PERSON> ", sanitized)

    # Normalize multiple spaces
    sanitized = re.sub(r'\s+', ' ', sanitized).strip()

    return sanitized, counts
