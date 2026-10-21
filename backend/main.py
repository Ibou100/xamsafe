"""
Sovereign Shield - Defensive AI & OSINT Microservice.
FastAPI Application for Real-Time Social Engineering & Telecom Threat Detection.
Applies automated PII anonymization prior to inference.
Outputs qualitative Risk Levels and explainability indicators (no raw percentages).

Security Features (Part A):
- Rate limiting per client IP (20 req/min).
- Strict input length checks (Message <= 2000 chars, URL <= 2048 chars, returns 413).
- Strict CORS configuration (Vercel domain + localhost dev).
- Essential security HTTP headers (nosniff, DENY, etc.).
- SSRF prevention & private IP denial.
- Privacy & confidentiality enforcement (zero raw text/URL logging, zero default storage).
"""

import os
import time
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from anonymizer import anonymize_text
from classifier import SocialEngineeringClassifier
from domain_scanner import DomainInfrastructureScanner
from rate_limiter import global_rate_limiter

# Configure confidential structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("xamsafe.shield")

app = FastAPI(
    title="XamSafe Sovereign Shield - Defensive AI Engine",
    description="Microservice sécurisé d'analyse d'ingénierie sociale (Brique 1) et d'infrastructure réseau OSINT (Brique 2) au Sénégal.",
    version="1.2.0"
)

# A2. Restricted CORS origins (environment configurable)
cors_env = os.getenv(
    "CORS_ORIGINS",
    "https://xam-safe.vercel.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
)
ALLOWED_ORIGINS = [orig.strip() for orig in cors_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# A2 & A4. Security Headers & Confidentiality Middleware
@app.middleware("http")
async def security_and_privacy_middleware(request: Request, call_next):
    start_time = time.time()
    response: Response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # A2: Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # A4: Confidentiality Logging - NEVER log raw message text or full URLs.
    # Only log path, status code, and execution duration.
    logger.info(
        f"Handled {request.method} {request.url.path} | Status: {response.status_code} | Duration: {duration_ms}ms"
    )

    return response


# Singleton ML Classifier instance (Brique 1)
classifier = SocialEngineeringClassifier()
classifier.train()

# Singleton Domain Scanner instance (Brique 2)
domain_scanner = DomainInfrastructureScanner()


# A1: Pydantic schemas with strict validation
class MessageAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Contenu brut du SMS ou message à analyser")


class AnonymizationInfo(BaseModel):
    phones: int
    amounts: int
    urls: int
    codes: int
    names: int


class MessageAnalysisResponse(BaseModel):
    risk_level: str = Field(..., description="Niveau de risque qualitatif (FAIBLE, MODERE, ELEVE, CRITIQUE)")
    risk_label: str = Field(..., description="Libellé explicite du niveau de menace")
    explanations: List[str] = Field(..., description="Justifications pédagogiques et forensiques de la décision")
    detected_clues: List[str] = Field(..., description="Mots-clés ou n-grams déclencheurs identifiés par le modèle")
    recommendation: str = Field(..., description="Directive tactique immédiate pour l'utilisateur ou l'opérateur")
    pii_redacted: AnonymizationInfo = Field(..., description="Compteurs d'éléments confidentiels anonymisés avant inférence")


class UrlScanRequest(BaseModel):
    url: str = Field(..., min_length=1, description="Adresse URL ou nom de domaine à analyser")


class UrlScanResponse(BaseModel):
    risk_level: str = Field(..., description="Niveau de risque qualitatif (FAIBLE, MODERE, ELEVE, CRITIQUE)")
    risk_label: str = Field(..., description="Libellé explicite de la menace d'infrastructure")
    hostname: str = Field(..., description="Nom d'hôte normalisé extrait de l'URL")
    domain_age_days: Optional[Any] = Field(None, description="Ancienneté du domaine en jours via RDAP si disponible")
    domain_age_status: str = Field(..., description="Statut de vérification de l'âge : 'connu' ou 'inconnu'")
    creation_date: Optional[str] = Field(None, description="Date exacte de création du domaine si disponible")
    target_brand_spoofed: Optional[str] = Field(None, description="Marque sénégalaise ciblée par l'usurpation")
    explanations: List[str] = Field(..., description="Explications forensiques détaillées")
    recommendation: str = Field(..., description="Directive de sécurité immédiate")
    secondary_signal_hosting: Optional[str] = Field(None, description="Information d'hébergement ou de registre (signal secondaire)")


@app.get("/api/v1/health")
def health_check() -> Dict[str, Any]:
    """
    Vérification légère de l'état du microservice et des métadonnées du modèle ML.
    """
    return {
        "status": "healthy",
        "service": "XamSafe Defensive AI Core",
        "engine": "TF-IDF + Regularized Logistic Regression (Brique 1) & RDAP Domain Scanner (Brique 2)",
        "features_count": len(classifier.feature_names) if classifier.feature_names is not None else 0,
        "evaluation_metrics": classifier.eval_metrics,
        "supported_languages": ["fr", "wo"],
        "privacy": "Anonymisation automatique des PII, aucune persistance par défaut"
    }


@app.post("/api/v1/analyze-message", response_model=MessageAnalysisResponse)
def analyze_message(req: MessageAnalysisRequest, request: Request) -> MessageAnalysisResponse:
    """
    Point d'entrée Brique 1 : analyse un message en appliquant la chaîne de traitement complète :
    1. Contrôle du débit (A1 Rate limiting).
    2. Contrôle de taille maximale (2000 caractères max -> 413).
    3. Anonymisation des numéros, montants, noms et codes OTP.
    4. Inférence TF-IDF + Régression Logistique.
    5. Sortie en niveau de risque discret et explications transparentes.
    """
    # A1. Rate Limiting
    global_rate_limiter.check(request)

    # A1. Size Limit: Max 2000 characters
    if len(req.text) > 2000:
        raise HTTPException(
            status_code=413,
            detail="La taille du message dépasse la limite maximale autorisée (2000 caractères)."
        )

    raw_text = req.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Le texte fourni ne peut être vide.")

    try:
        result = classifier.predict(raw_text)
        # Log only risk level (A4 Confidentiality)
        logger.info(f"Message analyzed | Risk: {result.get('risk_level')}")
        return MessageAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne lors de l'inférence : {str(e)}")


@app.post("/api/v1/scan-url", response_model=UrlScanResponse)
def scan_url(req: UrlScanRequest, request: Request) -> UrlScanResponse:
    """
    Point d'entrée Brique 2 : Scanner d'infrastructure & OSINT défensif :
    1. Contrôle du débit (A1 Rate limiting).
    2. Contrôle de taille maximale (2048 caractères max -> 413).
    3. Protection SSRF (Rejet des IP privées/locales et des schémas non HTTP).
    4. Vérification d'ancienneté du domaine (RDAP) avec gestion de l'incertitude & cache.
    5. Détection du typosquatting (Levenshtein calibré + confirmation) & liste blanche officielle.
    """
    # A1. Rate Limiting
    global_rate_limiter.check(request)

    # A1. Size Limit: Max 2048 characters
    if len(req.url) > 2048:
        raise HTTPException(
            status_code=413,
            detail="La taille de l'URL dépasse la limite maximale autorisée (2048 caractères)."
        )

    raw_url = req.url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="L'URL fournie ne peut être vide.")

    try:
        result = domain_scanner.scan_url(raw_url)
        # Log only risk level (A4 Confidentiality)
        logger.info(f"URL scanned | Risk: {result.get('risk_level')}")
        return UrlScanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du scan d'infrastructure : {str(e)}")


@app.post("/api/v1/anonymize")
def test_anonymization(req: MessageAnalysisRequest, request: Request) -> Dict[str, Any]:
    """
    Visualise comment un message est purgé de ses données nominatives avant traitement.
    """
    global_rate_limiter.check(request)
    if len(req.text) > 2000:
        raise HTTPException(status_code=413, detail="La taille du message dépasse la limite maximale autorisée (2000 caractères).")

    clean_text, counts = anonymize_text(req.text)
    return {
        "anonymized_text": clean_text,
        "pii_redacted": counts
    }
