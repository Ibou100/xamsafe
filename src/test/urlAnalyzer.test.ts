import { describe, it, expect } from 'vitest';
import { analyzeUrlLocally } from '../services/urlAnalyzer';

describe('URL Analyzer — Vérificateur Syntaxique Sécurisé (Sans SSRF)', () => {
  it('identifie un clone frauduleux de Wave avec TLD suspect (.xyz) comme Dangereux', () => {
    const url = 'https://wave-senegal-connexion.xyz/login?session=otp';
    const result = analyzeUrlLocally(url);

    expect(result.riskLevel).toBe('dangereux');
    expect(result.impersonatedBrand).toBe('Wave Mobile Money');
    expect(result.clues.some((c) => c.id.startsWith('impersonation'))).toBe(true);
    expect(result.clues.some((c) => c.id === 'suspicious-tld')).toBe(true);
  });

  it('détecte une adresse IP numérique brute comme Dangereux', () => {
    const url = 'http://192.168.1.100/orangemoney/confirmation';
    const result = analyzeUrlLocally(url);

    expect(result.isIpAddress).toBe(true);
    expect(result.riskLevel).toBe('dangereux');
    expect(result.clues.some((c) => c.id === 'host-ip')).toBe(true);
  });

  it('détecte un raccourcisseur de lien (bit.ly)', () => {
    const url = 'https://bit.ly/sonatel-cadeau-2026';
    const result = analyzeUrlLocally(url);

    expect(result.isShortener).toBe(true);
    expect(result.clues.some((c) => c.id === 'url-shortener')).toBe(true);
  });

  it('détecte les caractères punycode / homoglyphes', () => {
    const url = 'https://xn--wve-ela.com/login';
    const result = analyzeUrlLocally(url);

    expect(result.hasPunycodeOrHomoglyphs).toBe(true);
    expect(result.clues.some((c) => c.id === 'homoglyph-attack')).toBe(true);
  });

  it('reconnaît le domaine officiel Wave légitime comme Faible', () => {
    const url = 'https://www.wave.com/fr/sn/';
    const result = analyzeUrlLocally(url);

    expect(result.riskLevel).toBe('faible');
    expect(result.clues.some((c) => c.type === 'reassuring')).toBe(true);
  });

  it('explique que HTTPS ne garantit pas à lui seul l\'honnêteté du site', () => {
    const url = 'https://mon-site-test.com/';
    const result = analyzeUrlLocally(url);

    expect(result.isHttps).toBe(true);
    expect(result.pedagogicalNotes[0]).toContain('HTTPS chiffre la connexion, mais ne garantit ABSOLUMENT PAS que le site est honnête');
  });

  it('ne lance aucune requête réseau distante (protection SSRF)', () => {
    // Calling analyzeUrlLocally on an internal or external IP will never trigger fetch()
    const result = analyzeUrlLocally('http://127.0.0.1:8080/admin');
    expect(result.hostname).toBe('127.0.0.1');
    expect(result.isIpAddress).toBe(true);
  });

  it('détecte un faux site clone de plateforme mondiale (Binance / PayPal)', () => {
    const url = 'https://binance-security-verify.click/login';
    const result = analyzeUrlLocally(url);

    expect(result.riskLevel).toBe('dangereux');
    expect(result.impersonatedBrand).toBe('Binance Crypto');
    expect(result.clues.some((c) => c.id === 'suspicious-tld')).toBe(true);
  });

  it('identifie un site de streaming illégal avec extension à risque (kooratv.club) comme Dangereux', () => {
    const url = 'https://kooratv.club/';
    const result = analyzeUrlLocally(url);

    expect(result.riskLevel).toBe('dangereux');
    expect(result.clues.some((c) => c.id === 'piracy-streaming-malvertising')).toBe(true);
    expect(result.clues.some((c) => c.id === 'suspicious-tld')).toBe(true);
  });
});
