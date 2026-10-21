"""
Data Ingestion Pipeline for Real-World Field Samples.
Strictly requires explicit consent verification (consent_obtained: True)
and applies automated PII anonymization before persistence.
"""

import json
import os
import datetime
from typing import Dict, Any, List, Optional
from anonymizer import anonymize_text

IMPORTED_CORPUS_PATH = os.path.join(os.path.dirname(__file__), "dataset", "corpus_imported.json")


def import_sample(
    text: str,
    label: int,
    source: str,
    consent_obtained: bool,
    language: str = "fr",
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Ingests and anonymizes a single real-world contribution.
    Raises ValueError if consent is not explicitly verified.
    """
    if not consent_obtained:
        raise ValueError("Consentement non accordé : impossible d'importer le message sans accord explicite.")

    if label not in (0, 1):
        raise ValueError("Label invalide : doit être 0 (légitime) ou 1 (arnaque/menace).")

    anonymized_text, redacted_counts = anonymize_text(text)

    entry = {
        "id": f"imported-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{os.urandom(2).hex()}",
        "text": anonymized_text,
        "label": label,
        "source": source,
        "language": language,
        "consent_verified": True,
        "imported_at": datetime.datetime.utcnow().isoformat() + "Z",
        "redacted_counts": redacted_counts,
        "notes": notes or ""
    }

    # Load existing or initialize
    existing = []
    if os.path.exists(IMPORTED_CORPUS_PATH):
        try:
            with open(IMPORTED_CORPUS_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    existing.append(entry)

    with open(IMPORTED_CORPUS_PATH, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    return {
        "status": "success",
        "id": entry["id"],
        "redacted_counts": redacted_counts
    }


def batch_import(samples: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Batches ingestion of multiple real messages with validation.
    """
    imported_count = 0
    errors = []

    for idx, s in enumerate(samples):
        try:
            import_sample(
                text=s.get("text", ""),
                label=s.get("label", -1),
                source=s.get("source", "inconnu"),
                consent_obtained=bool(s.get("consent_obtained", False)),
                language=s.get("language", "fr"),
                notes=s.get("notes")
            )
            imported_count += 1
        except Exception as e:
            errors.append({"index": idx, "error": str(e)})

    return {
        "total_attempted": len(samples),
        "imported_count": imported_count,
        "errors": errors
    }


if __name__ == "__main__":
    print("XamSafe Data Ingestion Engine ready. Explicit consent is strictly enforced.")
