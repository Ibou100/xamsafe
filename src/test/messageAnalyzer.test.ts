import { describe, it, expect } from 'vitest';
import { analyzeMessageLocally, sanitizeUserMessage } from '../services/messageAnalyzer';

describe('Message Analyzer — Moteur Heuristique Local & Sécurité des Données', () => {
  it('masque les données personnelles (PII) avant analyse', () => {
    const raw = 'Appelez au 77 123 45 67 ou 781234567, email contact@escroc.com, code: 8941';
    const sanitized = sanitizeUserMessage(raw);

    expect(sanitized).not.toContain('77 123 45 67');
    expect(sanitized).not.toContain('contact@escroc.com');
    expect(sanitized).toContain('[NUMÉRO_TÉLÉPHONE_MASQUÉ]');
    expect(sanitized).toContain('[EMAIL_MASQUÉ]');
    expect(sanitized).toContain('[CODE_MASQUÉ]');
  });

  it('détecte une tentative de vol de code OTP / code secret comme Risque Élevé', () => {
    const message = 'Bonjour ici Wave. Pour éviter le blocage de votre compte sous 15 minutes, veuillez me dicter le code secret reçu par SMS.';
    const result = analyzeMessageLocally(message);

    expect(result.riskLevel).toBe('eleve');
    expect(result.riskScore).toBeGreaterThanOrEqual(45);
    expect(result.detectedClues.some((c) => c.id === 'clue-otp-request')).toBe(true);
    expect(result.detectedClues.some((c) => c.id === 'clue-urgency')).toBe(true);
  });

  it('détecte une fausse tombola Sonatel avec demande de frais comme Risque Élevé', () => {
    const message = 'Félicitations ! Votre numéro a gagné 5.000.000 FCFA à la tombola Sonatel. Frais d\'huissier à payer : 25.000 FCFA pour débloquer votre lot.';
    const result = analyzeMessageLocally(message);

    expect(result.riskLevel).toBe('eleve');
    expect(result.detectedClues.some((c) => c.id === 'clue-gains')).toBe(true);
  });

  it('détecte un piège USSD Orange Money (*144*2...)', () => {
    const message = 'Pour activer votre bonus 5G gratuit, tapez immédiatement *144*2*771234567*20000*0000#';
    const result = analyzeMessageLocally(message);

    expect(result.riskLevel).toBe('eleve');
    expect(result.detectedClues.some((c) => c.id === 'clue-ussd-trap')).toBe(true);
  });

  it('renvoie un statut Indéterminé sans faux verdict pour un message trop court', () => {
    const message = 'Salam';
    const result = analyzeMessageLocally(message);

    expect(result.riskLevel).toBe('indetermine');
    expect(result.title).toContain('trop court');
  });

  it('ne prononce pas de faux verdict positif pour un message innocent', () => {
    const message = 'Salam mon frère, on se voit chez maman pour le repas de dimanche inchaAllah.';
    const result = analyzeMessageLocally(message);

    expect(result.riskLevel).toBe('faible');
    expect(result.reassuringClues.length).toBeGreaterThan(0);
    // Explique toujours les limites même en cas de risque faible
    expect(result.limitations.length).toBeGreaterThan(0);
  });

  it('fonctionne entièrement en local sans clé API requise', () => {
    const result = analyzeMessageLocally('Test de fonctionnement hors ligne');
    expect(result.engineType).toBe('local-heuristic');
  });
});
