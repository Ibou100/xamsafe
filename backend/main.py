"""
Sovereign Shield - Defensive AI & OSINT Microservice.
FastAPI Application for Real-Time Social Engineering & Telecom Threat Detection.
Applies automated PII anonymization prior to inference.
Outputs qualitative Risk Levels and explainability indicators (no raw percentages).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from anonymizer import anonymize_text
from classifier import SocialEngineeringClassifier
from domain_scanner import DomainInfrastructureScanner

app = FastAPI(
    title="XamSafe Sovereign Shield - Defensive AI Engine",
    description="Microservice d'analyse d'ingénierie sociale (Brique 1) et d'infrastructure réseau OSINT (Brique 2) au Sénégal.",
    version="1.1.0"
)

# Enable CORS for local dev or web frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton ML Classifier instance (Brique 1)
classifier = SocialEngineeringClassifier()
classifier.train()

# Singleton Domain Scanner instance (Brique 2)
domain_scanner = DomainInfrastructureScanner()


class MessageAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Contenu brut du SMS ou message à analyser")


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
    url: str = Field(..., min_length=3, max_length=2000, description="Adresse URL ou nom de domaine à analyser")


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
    Vérification de l'état du microservice et des métadonnées du modèle ML.
    """
    return {
        "status": "healthy",
        "service": "XamSafe Defensive AI Core",
        "engine": "TF-IDF + Regularized Logistic Regression (Brique 1) & RDAP Domain Scanner (Brique 2)",
        "features_count": len(classifier.feature_names) if classifier.feature_names is not None else 0,
        "evaluation_metrics": classifier.eval_metrics,
        "supported_languages": ["fr", "wo"],
        "privacy": "Anonymisation automatique des PII avant inférence"
    }


@app.post("/api/v1/analyze-message", response_model=MessageAnalysisResponse)
def analyze_message(request: MessageAnalysisRequest) -> MessageAnalysisResponse:
    """
    Point d'entrée Brique 1 : analyse un message en appliquant la chaîne de traitement complète :
    1. Anonymisation des numéros, montants, noms et codes OTP.
    2. Inférence TF-IDF + Régression Logistique.
    3. Sortie en niveau de risque discret et explications transparentes (aucun pourcentage brut).
    """
    raw_text = request.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Le texte fourni ne peut être vide.")

    try:
        result = classifier.predict(raw_text)
        return MessageAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne lors de l'inférence : {str(e)}")


@app.post("/api/v1/scan-url", response_model=UrlScanResponse)
def scan_url(request: UrlScanRequest) -> UrlScanResponse:
    """
    Point d'entrée Brique 2 : Scanner d'infrastructure & OSINT défensif :
    1. Vérification d'ancienneté du domaine (RDAP) avec gestion de l'incertitude
    2. Détection du typosquatting (Levenshtein calibré + confirmation) & liste blanche officielle
    3. Sortie en niveau de risque qualitatif et explications
    """
    raw_url = request.url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="L'URL fournie ne peut être vide.")

    try:
        result = domain_scanner.scan_url(raw_url)
        return UrlScanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du scan d'infrastructure : {str(e)}")


@app.post("/api/v1/anonymize")
def test_anonymization(request: MessageAnalysisRequest) -> Dict[str, Any]:
    """
    Visualise comment un message est purgé de ses données nominatives avant traitement.
    """
    clean_text, counts = anonymize_text(request.text)
    return {
        "anonymized_text": clean_text,
        "pii_redacted": counts
    }
