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
from domain_scanner import DomainInfrastructureScanner, extract_urls
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


# Part B: Unified Analysis Schemas
class ComponentNlpDetail(BaseModel):
    risk_level: str
    risk_label: str
    detected_clues: List[str]
    explanations: List[str]
    recommendation: str


class ComponentUrlDetail(BaseModel):
    url: str
    hostname: str
    risk_level: str
    risk_label: str
    domain_age_days: Optional[Any] = None
    domain_age_status: str
    creation_date: Optional[str] = None
    target_brand_spoofed: Optional[str] = None
    explanations: List[str]
    recommendation: str


class UnifiedAnalysisDetails(BaseModel):
    nlp: ComponentNlpDetail
    urls: List[ComponentUrlDetail]
    pii_redacted: AnonymizationInfo


class UnifiedAnalysisResponse(BaseModel):
    risk_level: str = Field(..., description="Niveau de risque qualitatif final (le plus élevé entre texte et URLs)")
    risk_label: str = Field(..., description="Libellé explicite du niveau de menace final")
    explanations: List[str] = Field(..., description="Explications fusionnées en français simple")
    recommendation: str = Field(..., description="Directive de sécurité prioritaire")
    details: UnifiedAnalysisDetails = Field(..., description="Détail complet par composant (NLP et URLs)")


# Risk Level Hierarchies (Part B)
RISK_RANKS = {"FAIBLE": 1, "MODERE": 2, "ELEVE": 3, "CRITIQUE": 4}
RANK_TO_LEVEL = {1: "FAIBLE", 2: "MODERE", 3: "ELEVE", 4: "CRITIQUE"}
RANK_TO_LABEL = {
    1: "Aucune menace apparente identifiée",
    2: "Vigilance recommandée",
    3: "Menace ou usurpation probable",
    4: "Tentative d'escroquerie ou phishing critique"
}
RANK_TO_RECOMMENDATION = {
    1: "Restez vigilant : ne communiquez jamais vos codes secrets ni de code de validation par SMS.",
    2: "Vérifiez attentivement l'authenticité du message auprès de votre opérateur officiel.",
    3: "Méfiance absolue : ne cliquez sur aucun lien et ne validez aucun transfert d'argent.",
    4: "DANGER : Ne cliquez sur aucun lien, ne partagez aucun code secret et bloquez l'expéditeur immédiatement."
}


@app.get("/")
@app.get("/health")
def root_health():
    """Vérification ultra-légère pour les sondes de santé Render/Railway."""
    return {"status": "ok", "service": "XamSafe Defensive AI Core"}


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


@app.post("/api/v1/analyze", response_model=UnifiedAnalysisResponse)
def analyze_unified(req: MessageAnalysisRequest, request: Request) -> UnifiedAnalysisResponse:
    """
    Point d'entrée unifié (Partie B) combinant l'analyse NLP du texte et le scan d'infrastructure des URLs :
    1. Contrôle du débit (Rate limiting) & taille maximale (2000 caractères max).
    2. Analyse NLP du message (anonymisation PII automatique + TF-IDF Logistic Regression).
    3. Détection et analyse de chaque URL / domaine présent dans le message.
    4. Consolidation au niveau le plus élevé : un lien officiel n'annule JAMAIS une alerte NLP.
    5. Restitution unifiée avec explications claires et détail complet par composant.
    """
    global_rate_limiter.check(request)

    if len(req.text) > 2000:
        raise HTTPException(
            status_code=413,
            detail="La taille du message dépasse la limite maximale autorisée (2000 caractères)."
        )

    raw_text = req.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Le texte fourni ne peut être vide.")

    try:
        # 1. NLP Analysis
        nlp_res = classifier.predict(raw_text)
        nlp_level = nlp_res["risk_level"]
        nlp_rank = RISK_RANKS.get(nlp_level, 1)

        # 2. Extract & scan URLs
        detected_urls = extract_urls(raw_text)
        url_details: List[ComponentUrlDetail] = []
        max_url_rank = 1

        for u in detected_urls:
            u_res = domain_scanner.scan_url(u)
            u_rank = RISK_RANKS.get(u_res["risk_level"], 1)
            if u_rank > max_url_rank:
                max_url_rank = u_rank

            url_details.append(ComponentUrlDetail(
                url=u,
                hostname=u_res["hostname"],
                risk_level=u_res["risk_level"],
                risk_label=u_res["risk_label"],
                domain_age_days=u_res["domain_age_days"],
                domain_age_status=u_res["domain_age_status"],
                creation_date=u_res.get("creation_date"),
                target_brand_spoofed=u_res.get("target_brand_spoofed"),
                explanations=u_res["explanations"],
                recommendation=u_res["recommendation"]
            ))

        # 3. Consolidate risk: Highest of both.
        # An official domain will NEVER lower an NLP threat alert.
        final_rank = max(nlp_rank, max_url_rank)
        final_level = RANK_TO_LEVEL[final_rank]
        final_label = RANK_TO_LABEL[final_rank]
        final_recommendation = RANK_TO_RECOMMENDATION[final_rank]

        # 4. Merge explanations concisely (2 to 4 short sentences)
        merged_explanations: List[str] = []

        # Add NLP explanations if any risk detected or relevant
        for exp in nlp_res["explanations"]:
            if exp not in merged_explanations:
                merged_explanations.append(exp)

        # Add URL explanations
        for ud in url_details:
            for exp in ud.explanations:
                formatted_exp = f"[{ud.hostname}] {exp}"
                if formatted_exp not in merged_explanations and exp not in merged_explanations:
                    merged_explanations.append(formatted_exp)

        if not merged_explanations:
            merged_explanations.append("Aucun indicateur suspect identifié dans le message ou les liens.")

        # Limit to 4 sentences maximum for clarity
        merged_explanations = merged_explanations[:4]

        # 5. Build component details
        details = UnifiedAnalysisDetails(
            nlp=ComponentNlpDetail(
                risk_level=nlp_res["risk_level"],
                risk_label=nlp_res["risk_label"],
                detected_clues=nlp_res["detected_clues"],
                explanations=nlp_res["explanations"],
                recommendation=nlp_res["recommendation"]
            ),
            urls=url_details,
            pii_redacted=AnonymizationInfo(**nlp_res["pii_redacted"])
        )

        logger.info(f"Unified analysis complete | NLP: {nlp_level} | URLs: {len(detected_urls)} | Final Risk: {final_level}")

        return UnifiedAnalysisResponse(
            risk_level=final_level,
            risk_label=final_label,
            explanations=merged_explanations,
            recommendation=final_recommendation,
            details=details
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne lors de l'analyse unifiée : {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

