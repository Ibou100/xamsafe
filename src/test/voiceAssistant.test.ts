import { describe, it, expect } from 'vitest';
import { analyzeSpokenText } from '../utils/voiceAssistantEngine';

describe('Voice Assistant Engine (Multilingual & Mixed French/Wolof)', () => {
  it('detects Wave / Orange Money fake agent asking for code in French', () => {
    const input = "Bonjour j'ai reçu un appel se disant agent Wave me demandant le code reçu par SMS pour débloquer mon compte";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('agent-code');
    expect(res.dangerLevel).toBe('danger');
    expect(res.spokenResponseFr).toContain('Wave');
    expect(res.spokenResponseWo).toContain('Wave');
    expect(res.officialEmergencyContact?.number).toBe('1441');
  });

  it('detects Wave / Orange Money fake agent in Wolof', () => {
    const input = "Dañu ma woo ci telefon naan ma liggéeyukatu Wave lañu te laaj ma kod ngir dindi tëj gi";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('agent-code');
    expect(res.dangerLevel).toBe('danger');
  });

  it('detects WhatsApp hijacked code in mixed French/Wolof', () => {
    const input = "Sama xarit dafa juum yonnee ma code whatsapp ci sama numéro te bëgg ma renvoyer ko";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('whatsapp-hack');
    expect(res.dangerLevel).toBe('danger');
    expect(res.spokenResponseFr).toContain('WhatsApp');
    expect(res.spokenResponseWo).toContain('WhatsApp');
  });

  it('detects fake transfer SMS in Wolof/French', () => {
    const input = "Amna nit ku ma woo di jooy naan dafa juum ci transfert 50000 F nako delloo";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('fake-transfer');
    expect(res.dangerLevel).toBe('danger');
  });

  it('detects online fake seller demanding acompte (dëpp) in Wolof', () => {
    const input = "Benn jaaykat ci TikTok dafa laaj dëpp avance ci Wave bala livraison";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('fake-seller');
    expect(res.dangerLevel).toBe('warning');
  });

  it('detects fake job recruitment fees in French', () => {
    const input = "J'ai postulé à une offre d'emploi UNICEF et ils demandent des frais de dossier de 15000 F par Wave";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('fake-job');
    expect(res.dangerLevel).toBe('danger');
  });

  it('returns neutral helpful prompt for vague or greeting speech', () => {
    const input = "Salam aleikoum";
    const res = analyzeSpokenText(input);

    expect(res.id).toBe('neutral-help');
    expect(res.dangerLevel).toBe('info');
    expect(res.spokenResponseFr).toBeTruthy();
    expect(res.spokenResponseWo).toBeTruthy();
  });
});
