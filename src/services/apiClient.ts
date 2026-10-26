/**
 * API Client for XamSafe Sovereign Shield Defensive AI Engine.
 * Calls /api/v1/analyze with a 15-second client-side timeout (AbortController).
 * Falls back cleanly to local heuristic analysis when offline or unavailable.
 */

import { analyzeMessageLocally, sanitizeUserMessage } from './messageAnalyzer';
import type { AnalysisResult, RiskLevel, ClueItem } from '../types';

const isDev = import.meta.env.DEV;
const rawEnvUrl = import.meta.env.VITE_API_URL;

/**
 * URL de base de l'API.
 * RÈGLE DE DÉPLOIEMENT :
 * - En développement local (DEV), fallback sur http://localhost:8000 si non renseigné.
 * - En production, si VITE_API_URL est absente, AUCUN fallback vers localhost:8000.
 *   Le client bascule directement en mode hors ligne et consigne un avertissement console.
 */
export const API_BASE_URL: string | null = (() => {
  if (rawEnvUrl && typeof rawEnvUrl === 'string' && rawEnvUrl.trim().length > 0) {
    return rawEnvUrl.trim().replace(/\/$/, '');
  }
  if (isDev) {
    return 'http://localhost:8000';
  }
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(
      '[XamSafe] VITE_API_URL non configurée en production. Le client bascule automatiquement en mode hors ligne strict (heuristique souveraine).'
    );
  }
  return null;
})();

export interface UnifiedApiResponse {
  risk_level: 'FAIBLE' | 'MODERE' | 'ELEVE' | 'CRITIQUE';
  risk_label: string;
  explanations: string[];
  recommendation: string;
  details: {
    nlp: {
      risk_level: string;
      risk_label: string;
      detected_clues: string[];
      explanations: string[];
      recommendation: string;
    };
    urls: Array<{
      url: string;
      hostname: string;
      risk_level: string;
      risk_label: string;
      domain_age_days?: number | string | null;
      domain_age_status: string;
      creation_date?: string | null;
      target_brand_spoofed?: string | null;
      explanations: string[];
      recommendation: string;
    }>;
    pii_redacted: {
      phones: number;
      amounts: number;
      urls: number;
      codes: number;
      names: number;
    };
  };
}

export interface UnifiedAnalysisClientResult {
  result: AnalysisResult;
  isOfflineFallback: boolean;
  offlineMessage?: string;
  apiData?: UnifiedApiResponse;
  sourceLabel?: string;
}

/**
 * Silent background wake-up ping for sleeping free-tier backends (Render / Railway).
 * Ne tente aucune requête si API_BASE_URL n'est pas définie (évite toute erreur console).
 */
export async function wakeUpBackend(): Promise<void> {
  if (!API_BASE_URL) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // Silent ignore: background probe
  }
}

/**
 * Analyzes a text message by calling the backend API /api/v1/analyze.
 * Strictly respects the 15-second client-side timeout.
 * Automatically falls back to local heuristic analysis if the API fails, times out,
 * or if VITE_API_URL is unconfigured in production.
 */
export async function analyzeUnifiedMessage(
  rawText: string,
  onWaitingLong?: (seconds: number) => void
): Promise<UnifiedAnalysisClientResult> {
  const sanitized = sanitizeUserMessage(rawText);

  // If no backend is configured in production, switch immediately to sovereign local heuristic
  if (!API_BASE_URL) {
    const localResult = analyzeMessageLocally(sanitized);
    return {
      result: {
        ...localResult,
        engineType: 'local-heuristic',
      },
      isOfflineFallback: true,
      offlineMessage: 'Analyse simplifiée (mode hors ligne). Le résultat peut être moins précis.',
      sourceLabel: 'Analyse simplifiée (hors ligne)',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  // Notify after 5 seconds if still waiting
  let timer5s: any = null;
  if (onWaitingLong) {
    timer5s = setTimeout(() => {
      onWaitingLong(5);
    }, 5000);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: rawText }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (timer5s) clearTimeout(timer5s);

    if (!response.ok) {
      let errorMsg = 'Erreur lors de la communication avec le serveur.';
      try {
        const errorJson = await response.json();
        if (errorJson.detail) errorMsg = errorJson.detail;
      } catch {}
      throw new Error(errorMsg);
    }

    const apiData: UnifiedApiResponse = await response.json();

    // Map backend risk level to frontend format
    let mappedRisk: RiskLevel = 'faible';
    let riskScore = 15;
    if (apiData.risk_level === 'CRITIQUE') {
      mappedRisk = 'eleve';
      riskScore = 95;
    } else if (apiData.risk_level === 'ELEVE') {
      mappedRisk = 'eleve';
      riskScore = 80;
    } else if (apiData.risk_level === 'MODERE') {
      mappedRisk = 'moyen';
      riskScore = 50;
    } else {
      mappedRisk = 'faible';
      riskScore = 15;
    }

    const clues: ClueItem[] = [];
    // Convert backend explanations and detected clues
    apiData.explanations.forEach((exp, idx) => {
      clues.push({
        id: `exp-${idx}`,
        type: mappedRisk === 'eleve' ? 'danger' : mappedRisk === 'moyen' ? 'warning' : 'info',
        title: exp,
        description:
          apiData.details.nlp.detected_clues.length > 0
            ? `Mots-clés repérés : ${apiData.details.nlp.detected_clues.join(', ')}`
            : undefined,
      });
    });

    // Add URL clues if any
    apiData.details.urls.forEach((u, idx) => {
      u.explanations.forEach((uExp, uIdx) => {
        clues.push({
          id: `url-${idx}-${uIdx}`,
          type: u.risk_level === 'CRITIQUE' || u.risk_level === 'ELEVE' ? 'danger' : 'info',
          title: `Lien analysé : ${u.hostname}`,
          description: uExp,
          detail: u.domain_age_days ? `Ancienneté du domaine : ${u.domain_age_days} jour(s)` : undefined,
        });
      });
    });

    const result: AnalysisResult = {
      riskLevel: mappedRisk,
      riskScore,
      title: apiData.risk_label,
      summary:
        mappedRisk === 'faible'
          ? "Aucun signal d'arnaque connu repéré. Cela ne garantit pas que le message soit sûr : en cas de doute, vérifiez auprès de l'organisme concerné."
          : apiData.explanations.slice(0, 3).join(' '),
      detectedClues: clues,
      reassuringClues:
        mappedRisk === 'faible'
          ? [
              {
                id: 'reassuring-1',
                type: 'reassuring',
                title: "Aucun signal d'arnaque connu repéré",
                description:
                  "Aucun signal d'arnaque connu repéré. Cela ne garantit pas que le message soit sûr : en cas de doute, vérifiez auprès de l'organisme concerné.",
              },
            ]
          : [],
      limitations: [
        'Cette analyse automatique est une aide à la vigilance et ne constitue pas une certitude absolue.',
        'Les escrocs renouvellent constamment leurs numéros et leurs adresses de redirection.',
      ],
      complementaryChecks: [
        apiData.recommendation,
        'En cas de doute persistant, contactez directement votre opérateur via son numéro court officiel (ex: 1441 Orange, support Wave).',
      ],
      recommendedActions: [apiData.recommendation],
      engineType: 'ai-remote',
    };

    return {
      result,
      isOfflineFallback: false,
      apiData,
      sourceLabel: 'Analyse complète (serveur)',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (timer5s) clearTimeout(timer5s);

    // Fallback cleanly to local heuristic analysis (D2)
    const localResult = analyzeMessageLocally(sanitized);
    return {
      result: {
        ...localResult,
        engineType: 'local-heuristic',
      },
      isOfflineFallback: true,
      offlineMessage: 'Analyse simplifiée (mode hors ligne). Le résultat peut être moins précis.',
      sourceLabel: 'Analyse simplifiée (hors ligne)',
    };
  }
}
