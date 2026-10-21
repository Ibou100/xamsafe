import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeUnifiedMessage, wakeUpBackend } from '../services/apiClient';

describe('API Client & Offline Resilience (D1, D2)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('bascule de manière transparente sur l\'analyse heuristique locale si le serveur est injoignable', async () => {
    // Simulate network error / offline
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const res = await analyzeUnifiedMessage('Alerte Wave : donnez votre code secret immédiatement');

    expect(res.isOfflineFallback).toBe(true);
    expect(res.offlineMessage).toContain('mode hors ligne');
    expect(res.result).toBeDefined();
    expect(res.result.riskLevel).toBe('eleve'); // Local heuristic catches code secret theft
    expect(res.result.engineType).toBe('local-heuristic');
  });

  it('traite correctement la réponse de l\'API unifiée en mode connecté', async () => {
    const mockApiResponse = {
      risk_level: 'CRITIQUE',
      risk_label: 'Phishing critique détecté',
      explanations: ['Le domaine ressemble fortement à wave.com', 'Demande de code secret'],
      recommendation: 'Ne cliquez sur aucun lien.',
      details: {
        nlp: {
          risk_level: 'CRITIQUE',
          risk_label: 'Urgence critique',
          detected_clues: ['code secret', 'bloque'],
          explanations: ['Tentative de vol de code secret'],
          recommendation: 'Bloquer le contact',
        },
        urls: [
          {
            url: 'http://wvve.com/login',
            hostname: 'wvve.com',
            risk_level: 'CRITIQUE',
            risk_label: 'Typosquatting avéré',
            domain_age_days: 2,
            domain_age_status: 'connu',
            target_brand_spoofed: 'wave',
            explanations: ['Typosquatting sur la marque wave'],
            recommendation: 'Ne jamais visiter ce lien',
          },
        ],
        pii_redacted: { phones: 1, amounts: 0, urls: 1, codes: 1, names: 0 },
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const res = await analyzeUnifiedMessage('Alerte Wave http://wvve.com/login');

    expect(res.isOfflineFallback).toBe(false);
    expect(res.apiData).toBeDefined();
    expect(res.result.riskLevel).toBe('eleve');
    expect(res.result.engineType).toBe('ai-remote');
    expect(res.result.detectedClues.some((c) => c.title.includes('wvve.com'))).toBe(true);
  });

  it('appelle la callback de longue attente si la requête dépasse 5 secondes', async () => {
    vi.useFakeTimers();

    let resolveFetch: (val: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    globalThis.fetch = vi.fn().mockReturnValue(fetchPromise);

    const onWaitLong = vi.fn();
    const analyzePromise = analyzeUnifiedMessage('Message test', onWaitLong);

    // Fast forward 5.1s
    vi.advanceTimersByTime(5100);

    expect(onWaitLong).toHaveBeenCalledWith(5);

    // Resolve fetch
    resolveFetch!({
      ok: true,
      json: async () => ({
        risk_level: 'FAIBLE',
        risk_label: 'Message apparemment légitime',
        explanations: ['Aucun signal malveillant'],
        recommendation: 'Restez vigilant.',
        details: {
          nlp: { risk_level: 'FAIBLE', risk_label: 'Sain', detected_clues: [], explanations: [], recommendation: '' },
          urls: [],
          pii_redacted: { phones: 0, amounts: 0, urls: 0, codes: 0, names: 0 },
        },
      }),
    });

    vi.useRealTimers();
    const res = await analyzePromise;
    expect(res.isOfflineFallback).toBe(false);
  });

  it('le ping de réveil ne lève aucune exception même en cas d\'échec réseau', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    await expect(wakeUpBackend()).resolves.toBeUndefined();
  });

  it('bascule en mode hors ligne sans appeler fetch si le serveur est injoignable', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const res = await analyzeUnifiedMessage('Bonjour, voici le reçu de 10.000 FCFA');
    expect(res.isOfflineFallback).toBe(true);
    expect(res.result.engineType).toBe('local-heuristic');

    warnSpy.mockRestore();
  });
});


