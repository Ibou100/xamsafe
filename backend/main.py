"""
Sovereign Shield - Defensive AI Microservice.
FastAPI Application for Real-Time Social Engineering & Scam Detection.
Complies with Zero-Knowledge (PII stripped before ML inference).
Outputs qualitative Risk Levels and explainability indicators.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from anonymizer import anonymize_text
from classifier import SocialEngineeringClassifier

app = FastAPI(
    title="XamSafe Sovereign Shield - Defensive AI Engine",
    description="Microservice d'analyse d'ingénierie sociale et de détection de menaces télécoms au Sénégal.",
    version="1.0.0"
)

# Enable CORS for local dev or web frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton ML Classifier instance
classifier = SocialEngineeringClassifier()
# Train on startup
classifier.train()


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


@app.get("/api/v1/health")
def health_check() -> Dict[str, Any]:
    """
    Vérification de l'état du microservice et des métadonnées du modèle ML.
    """
    return {
        "status": "healthy",
        "service": "XamSafe Defensive AI Core",
        "engine": "TF-IDF + Regularized Logistic Regression Baseline",
        "features_count": len(classifier.feature_names) if classifier.feature_names is not None else 0,
        "supported_languages": ["fr", "wo"],
        "compliance": "Zero-Knowledge / Loi CDP Sénégal 2008-12"
    }


@app.post("/api/v1/analyze-message", response_model=MessageAnalysisResponse)
def analyze_message(request: MessageAnalysisRequest) -> MessageAnalysisResponse:
    """
    Point d'entrée principal : analyse un message en appliquant la chaîne de traitement complète :
    1. Anonymisation stricte des numéros, montants, noms et codes OTP.
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


@app.post("/api/v1/anonymize")
def test_anonymization(request: MessageAnalysisRequest) -> Dict[str, Any]:
    """
    Point de contrôle : visualise comment un message est purgé de ses données nominatives
    avant d'être injecté dans les vecteurs mathématiques.
    """
    clean_text, counts = anonymize_text(request.text)
    return {
        "anonymized_text": clean_text,
        "pii_redacted": counts
    }
