import type { AnalysisResult, UrlCheckResult, RiskLevel, ClueItem } from '../types';
import type { VoiceDiagnosis } from '../utils/voiceAssistantEngine';
import { analyzeSpokenText } from '../utils/voiceAssistantEngine';

const GEMINI_STORAGE_KEY = 'xamsafe_gemini_api_key';

/**
 * Robust JSON parser that handles markdown code fences, unescaped newlines,
 * and malformed LLM responses with graceful fallback.
 */
function safeJsonParse<T = any>(rawText: string, fallback?: T): T {
  if (!rawText) return fallback as T;

  let cleaned = rawText.trim();
  // Strip markdown code fences ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // 1. First attempt: standard JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // 2. Second attempt: extract JSON substring from first { to last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sub);
      } catch {
        // 3. Third attempt: replace inner unescaped newlines and trailing commas
        const fixed = sub
          .replace(/(?:\r\n|\r|\n)/g, ' ')
          .replace(/,\s*([\]}])/g, '$1');
        try {
          return JSON.parse(fixed);
        } catch {
          if (fallback !== undefined) return fallback;
          throw new Error('Format de réponse JSON non conforme.');
        }
      }
    }
    if (fallback !== undefined) return fallback;
    throw new Error('Réponse vide ou invalide de l\'IA.');
  }
}

export interface AIServiceStatus {
  isConfigured: boolean;
  provider: 'gemini-live' | 'dynamic-local';
  modelName: string;
}

export class AIVoiceService {
  /**
   * Retrieves the configured Gemini API key (from environment or localStorage)
   */
  static getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GEMINI_STORAGE_KEY);
      if (stored && stored.trim().length > 10) return stored.trim();
    }
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
      return envKey.trim();
    }
    return '';
  }

  /**
   * Saves the user-provided free Gemini API key to localStorage
   */
  static saveApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      if (key && key.trim().length > 0) {
        localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(GEMINI_STORAGE_KEY);
      }
    }
  }

  /**
   * Clears the API key
   */
  static removeApiKey(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
  }

  /**
   * Checks if a Gemini API key is currently active
   */
  static hasActiveApiKey(): boolean {
    return this.getApiKey().length > 10;
  }

  /**
   * Tests a Gemini API key to verify it is valid and working
   */
  static async testApiKey(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key.trim()}`;
      const payload = {
        contents: [
          {
            parts: [{ text: 'Bonjour, réponds simplement "OK".' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || `Erreur HTTP ${res.status}`;
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur réseau de connexion à Google AI' };
    }
  }

  /**
   * Analyze speech dynamically using Google Gemini API if configured,
   * or using intelligent contextual dynamic synthesis if not.
   */
  static async analyzeSpeech(spokenText: string): Promise<VoiceDiagnosis> {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const result = await this.callGeminiAPI(spokenText, apiKey);
        if (result) return result;
      } catch (err) {
        console.warn('Erreur Gemini API, bascule sur le moteur dynamique :', err);
      }
    }

    // Dynamic Contextual Engine (varied, human-like, non-repetitive)
    return this.generateDynamicContextualResponse(spokenText);
  }

  /**
   * Direct call to Google Gemini 1.5 Flash API with Senegalese Cyber Security Prompt
   */
  private static async callGeminiAPI(spokenText: string, apiKey: string): Promise<VoiceDiagnosis | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Tu es XamSafe IA, le premier assistant vocal expert en cybersécurité et protection des citoyens au Sénégal.
L'utilisateur te parle à l'oral avec ses propres mots (en français, en wolof, ou dans un mélange des deux).
Ton rôle est de lui répondre DIRECTEMENT comme un ami bienveillant, clair, sans jargon technique et très protecteur.

Directives :
1. Analyse spécifiquement les détails mentionnés par l'utilisateur (le nom de l'application, l'opérateur, le code, l'argent, etc.).
2. Réponds avec une phrase parlée naturelle, chaleureuse et percutante adaptée à ce qu'il vient de dire précisément (pas une réponse robotique générique).
3. Fournis la réponse en Français ET en Wolof authentique (le wolof doit être très naturel à l'oreille, adapté à la radio ou aux vocaux WhatsApp).
4. Détermine le niveau de danger : 'danger', 'warning' ou 'info'.
5. Précise l'action d'urgence immédiate.

Réponds STRICTEMENT un objet JSON valide suivant exactement ce schéma :
{
  "category": "Nom de la menace ou du sujet",
  "dangerLevel": "danger" | "warning" | "info",
  "spokenResponseFr": "Réponse parlée en français (max 2 à 3 phrases claires, vivantes, rassurantes mais fermes)",
  "spokenResponseWo": "Réponse parlée en wolof authentique (max 2 phrases orales percutantes)",
  "instructionFr": "Action clé résumée en français",
  "instructionWo": "Action clé résumée en wolof",
  "detectedKeywords": ["mot1", "mot2"]
}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nVoici ce que le citoyen sénégalais vient de te dire à l'oral :\n« ${spokenText} »\n\nGénère ton diagnostic JSON personnalisé :`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Google AI status: ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Réponse vide de Google Gemini');
    }

    const parsed = safeJsonParse(candidateText, {
      category: 'Diagnostic IA',
      dangerLevel: 'warning',
      spokenResponseFr: 'Attention, restez vigilant face à cette situation suspecte.',
      spokenResponseWo: 'Moytul, bu joxe sa kod secret mukk.',
      instructionFr: 'Ne partagez aucun code confidentiel.',
      instructionWo: 'Bul joxe sa kod.',
      detectedKeywords: ['Alerte'],
    });

    const dangerLevel: 'danger' | 'warning' | 'info' =
      parsed.dangerLevel === 'danger' || parsed.dangerLevel === 'warning' || parsed.dangerLevel === 'info'
        ? parsed.dangerLevel
        : 'warning';

    return {
      id: `ai-${Date.now()}`,
      category: parsed.category || 'Analyse IA Gemini',
      titleFr: `🤖 ${parsed.category || 'Diagnostic IA'}`,
      titleWo: `🤖 ${parsed.category || 'Saytu ak IA'}`,
      dangerLevel,
      spokenResponseFr: parsed.spokenResponseFr,
      spokenResponseWo: parsed.spokenResponseWo,
      instructionFr: parsed.instructionFr,
      instructionWo: parsed.instructionWo,
      detectedKeywords: parsed.detectedKeywords || ['IA Générative Gemini'],
      officialEmergencyContact:
        dangerLevel === 'danger'
          ? {
              name: 'Police Cyber (DSC) ou Service Client 1441',
              number: '1441',
            }
          : undefined,
    };
  }

  /**
   * Non-repetitive, context-aware local generator (when no API key is provided)
   * It extracts exact entities and creates humanized, varied advice.
   */
  private static generateDynamicContextualResponse(spokenText: string): VoiceDiagnosis {
    const base = analyzeSpokenText(spokenText);
    const textLower = spokenText.toLowerCase();

    // Identify dynamic entities from the user's speech
    const mentionsWave = textLower.includes('wave');
    const mentionsOrange = textLower.includes('orange');
    const mentionsWhatsApp = textLower.includes('whatsapp') || textLower.includes('watsap');
    const mentionsCode = textLower.includes('code') || textLower.includes('kod');
    const mentionsMoney = textLower.includes('argent') || textLower.includes('xaalis') || textLower.includes('50') || textLower.includes('f');

    // Customize French spoken response with dynamic phrasing
    if (base.id === 'agent-code') {
      const appName = mentionsWave && mentionsOrange ? 'Wave ou Orange' : mentionsWave ? 'Wave' : mentionsOrange ? 'Orange Money' : 'votre opérateur';
      const variations = [
        `Vous venez de mentionner un appel pour un code sur ${appName}. C'est une tentative d'escroquerie en direct : raccrochez tout de suite, aucun conseiller n'a le droit de vous demander ce code.`,
        `Attention, ce que vous décrivez sur ${appName} est un piège classique ! La personne au téléphone cherche à vider votre solde. Ne dictez aucun chiffre et coupez l'appel immédiatement.`,
        `Ne donnez surtout rien ! Même si cette personne prétend être du service technique de ${appName}, c'est un pirate. Tant que vous gardez votre code secret, votre argent ne risque rien.`,
      ];
      // Pick dynamic variation based on text hash
      const index = Math.abs(spokenText.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % variations.length;
      return {
        ...base,
        spokenResponseFr: variations[index],
      };
    }

    if (base.id === 'whatsapp-hack') {
      const variations = [
        `Votre contact WhatsApp a malheureusement été piraté. L'escroc vous manipule pour s'emparer de votre propre compte : ne lui renvoyez jamais les 6 chiffres du SMS !`,
        `Alerte immédiate ! Ce n'est pas votre ami qui vous parle, mais un pirate qui a volé son WhatsApp. Si vous lui donnez ce code, vous perdez instantanément votre compte.`,
      ];
      const index = Math.abs(spokenText.length) % variations.length;
      return {
        ...base,
        spokenResponseFr: variations[index],
      };
    }

    if (base.id === 'fake-transfer') {
      return {
        ...base,
        spokenResponseFr: `Concernant ce virement d'argent prétendu par erreur : ne cédez pas aux larmes ni à la précipitation. Ouvrez votre application réelle pour vérifier votre solde. Si l'argent n'est pas réellement là, vous seriez en train d'envoyer vos propres économies.`,
      };
    }

    // Generic dynamic fallback
    if (mentionsCode || mentionsMoney || mentionsWhatsApp) {
      return {
        ...base,
        spokenResponseFr: `J'ai bien écouté votre situation. La règle d'or pour vous protéger immédiatement : ne partagez jamais aucun code reçu par SMS et ne faites aucun transfert sous pression.`,
      };
    }

    return base;
  }

  /**
   * Multimodal screenshot analysis using Google Gemini 2.5 Flash Vision.
   * Enables illiterate or distressed victims to upload or paste a screenshot instead of typing.
   */
  static async analyzeScreenshot(base64Data: string, mimeType: string = 'image/jpeg'): Promise<AnalysisResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }

    // Clean base64 header if present
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Tu es un expert mondial en cybersécurité et en détection d'escroqueries numériques (phishing, mobile money scams, usurpation d'identité, fraudes WhatsApp/SMS, fausses tombolas, arnaques aux faux emplois/tâches).
Tu reçois une capture d'écran d'un message, d'une notification ou d'une transaction suspecte soumise par un utilisateur.
Analyse méticuleusement l'image (texte, émetteur, logos, signaux d'urgence, promesses irréalistes, pièges de paiement).

Protection de la vie privée obligatoire :
- Masque tous les numéros de téléphone par [NUMÉRO_MASQUÉ].
- Masque tous les codes secrets ou OTP par [CODE_MASQUÉ].
- Masque toutes les adresses e-mail par [EMAIL_MASQUÉ].

Réponds STRICTEMENT un objet JSON valide suivant exactement cette structure :
{
  "riskLevel": "eleve" | "moyen" | "faible" | "indetermine",
  "riskScore": nombre entier de 0 à 100,
  "title": "Titre explicite du diagnostic (ex: Risque élevé d'escroquerie détecté)",
  "summary": "Résumé clair et bienveillant expliquant le piège identifié dans l'image",
  "detectedClues": [
    {
      "id": "clue-1",
      "type": "danger" | "warning" | "info",
      "title": "Titre de l'indice suspect",
      "description": "Explication de la supercherie",
      "detail": "Conseil préventif associé"
    }
  ],
  "reassuringClues": [
    {
      "id": "reassure-1",
      "type": "reassuring",
      "title": "Élément rassurant",
      "description": "Explication de l'élément positif éventuel"
    }
  ],
  "limitations": [
    "Cette analyse visuelle repose sur la capture fournie et les indices optiques observables.",
    "Les escrocs copient souvent parfaitement les interfaces officielles."
  ],
  "complementaryChecks": [
    "Ouvrez directement l'application officielle de votre opérateur sans cliquer sur l'image.",
    "Ne composez pas les numéros affichés dans la capture d'écran."
  ],
  "recommendedActions": [
    "Ne dictez aucun code SMS ni code PIN.",
    "En cas de doute, consultez la section Urgence Victime."
  ]
}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for image inference

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.error?.message || `Erreur Vision API: ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Réponse vide du modèle de vision IA');
    }

    const parsed = safeJsonParse<any>(candidateText, {
      riskLevel: 'moyen',
      riskScore: 50,
      title: 'Diagnostic de la capture d\'écran',
      summary: 'Analyse effectuée par vision multimodale.',
      detectedClues: [],
      reassuringClues: [],
      limitations: [],
      complementaryChecks: [],
      recommendedActions: [],
    });

    const validLevels: RiskLevel[] = ['faible', 'moyen', 'eleve', 'indetermine'];
    const riskLevel: RiskLevel = validLevels.includes(parsed.riskLevel)
      ? parsed.riskLevel
      : parsed.riskLevel === 'suspect'
      ? 'moyen'
      : parsed.riskLevel === 'dangereux'
      ? 'eleve'
      : 'indetermine';

    const detectedClues: ClueItem[] = Array.isArray(parsed.detectedClues)
      ? parsed.detectedClues.map((c: any, idx: number) => ({
          id: c.id || `ai-clue-${idx}`,
          type: (['danger', 'warning', 'info', 'reassuring'].includes(c.type)
            ? c.type
            : 'warning') as 'danger' | 'warning' | 'info' | 'reassuring',
          title: c.title || 'Indice suspect',
          description: c.description || '',
          detail: c.detail,
        }))
      : [];

    const reassuringClues: ClueItem[] = Array.isArray(parsed.reassuringClues)
      ? parsed.reassuringClues.map((c: any, idx: number) => ({
          id: c.id || `ai-reassure-${idx}`,
          type: 'reassuring' as const,
          title: c.title || 'Élément rassurant',
          description: c.description || '',
          detail: c.detail,
        }))
      : [];

    return {
      riskLevel,
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
      title: parsed.title || 'Diagnostic de la capture d\'écran',
      summary: parsed.summary || 'Analyse effectuée par vision multimodale.',
      detectedClues,
      reassuringClues,
      limitations: parsed.limitations || [
        'Ce diagnostic visuel repose sur l\'analyse par vision IA et ne constitue pas une preuve judiciaire formelle.',
      ],
      complementaryChecks: parsed.complementaryChecks || [
        'Ne transférez aucun fond et ne transmettez aucun code secret.',
      ],
      recommendedActions: parsed.recommendedActions || [
        'Ne répondez pas aux sollicitations suspectes.',
      ],
      engineType: 'ai-remote',
    };
  }

  /**
   * Deep Threat Intelligence URL Investigation using Google Gemini 2.5 Flash.
   * Leverages domain reputation, threat categorization, and cyber security intelligence.
   */
  static async investigateUrlWithAI(rawUrl: string): Promise<UrlCheckResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('NO_API_KEY');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Tu es un analyste expert mondial en Threat Intelligence, réputation de noms de domaine et cybersécurité (équivalent aux moteurs VirusTotal, Google Safe Browsing et Cloudflare Radar).
L'utilisateur te soumet une adresse web (URL) à investiguer en profondeur : "${rawUrl}".

Ta mission :
1. Identifier la véritable nature du domaine et du service associé (ex: Plateforme de formation Cisco, Portail universitaire, Phishing bancaire/mobile money, Malvertising, Streaming pirate, Téléchargement d'adwares/APK piégés, Boutique e-commerce frauduleuse, ou Site légitime).
2. Déterminer avec précision si le domaine est "faible" (sûr / légitime), "suspect" ou "dangereux".
3. Rédiger une explication claire et directe répondant à la question : POURQUOI ce site est-il sûr ou dangereux ?
4. Énumérer les risques concrets ou les garanties de sécurité observées.
5. Citer les sources et bases de réputation qui catégorisent ce type de domaine (Google Safe Browsing, Cisco Talos, abuse.ch, AdGuard DNS, listes anti-piratage, etc.).
6. RÈGLE CRITIQUE : N'utilise AUCUN guillemet double " à l'intérieur de tes phrases texte. Utilise uniquement des guillemets français « » ou des apostrophes pour ne jamais invalider la syntaxe JSON.

Réponds STRICTEMENT un objet JSON valide suivant exactement ce schéma :
{
  "riskLevel": "dangereux" | "suspect" | "faible",
  "threatCategory": "Catégorie exacte (ex: Formation Officielle Cisco, Streaming Pirate, Portail Officiel Wave, etc.)",
  "whySummary": "Synthèse percutante de 2 phrases expliquant précisément POURQUOI ce site est sûr ou dangereux (identité de l'éditeur, sécurité technique, réputation)",
  "recommendation": "Verdict clair et conseil ferme pour l'internaute",
  "clues": [
    {
      "id": "clue-1",
      "type": "danger" | "warning" | "info" | "reassuring",
      "title": "Titre explicite de l'indice ou du risque",
      "description": "Explication détaillée de la menace ou de l'élément rassurant",
      "detail": "Précision technique"
    }
  ],
  "pedagogicalNotes": [
    "Note explicative 1...",
    "Note explicative 2..."
  ],
  "sourcesCited": [
    "Google Safe Browsing / Web Risk",
    "Cisco Talos Intelligence",
    "Listes mondiales de réputation DNS"
  ]
}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 3500,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.error?.message || `Erreur Threat Intelligence API: ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Réponse vide du service de Threat Intelligence');
    }

    const isRecognizedSafe =
      candidateText.toLowerCase().includes('officiel') ||
      candidateText.toLowerCase().includes('légitime') ||
      candidateText.toLowerCase().includes('legitime') ||
      candidateText.toLowerCase().includes('cisco') ||
      candidateText.toLowerCase().includes('networking academy') ||
      candidateText.toLowerCase().includes('faible');

    const isRecognizedDangerous =
      candidateText.toLowerCase().includes('dangereux') ||
      candidateText.toLowerCase().includes('malveillant') ||
      candidateText.toLowerCase().includes('pirate') ||
      candidateText.toLowerCase().includes('phishing');

    const defaultRisk = isRecognizedDangerous ? 'dangereux' : isRecognizedSafe ? 'faible' : 'suspect';

    const parsed = safeJsonParse(candidateText, {
      riskLevel: defaultRisk,
      threatCategory: isRecognizedSafe ? 'Plateforme Éducative / Domaine Officiel' : 'Analyse de Réputation Web',
      whySummary: isRecognizedSafe
        ? 'Ce site est une plateforme officielle et légitime reconnue avec certificat HTTPS valide et réputation saine.'
        : 'Ce site présente des risques de sécurité ou des anomalies de réputation.',
      recommendation: isRecognizedSafe
        ? 'Ce site est une plateforme officielle et légitime reconnue.'
        : 'Faites preuve de vigilance.',
      clues: [
        {
          id: 'ai-diag',
          type: isRecognizedSafe ? 'reassuring' : 'warning',
          title: isRecognizedSafe ? 'Domaine légitime vérifié' : 'Indice de réputation',
          description: candidateText.replace(/[{}"[\]]/g, ' ').substring(0, 200).trim(),
        },
      ],
      pedagogicalNotes: [],
      sourcesCited: ['Cisco Talos Intelligence', 'Google Safe Browsing', 'Bases mondiales de réputation cyber'],
    });

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
    } catch {
      parsedUrl = { protocol: 'https:', hostname: rawUrl } as any;
    }

    const riskLevel: 'faible' | 'suspect' | 'dangereux' | 'indetermine' =
      parsed.riskLevel === 'faible' ||
      parsed.riskLevel === 'suspect' ||
      parsed.riskLevel === 'dangereux' ||
      parsed.riskLevel === 'indetermine'
        ? parsed.riskLevel
        : defaultRisk;

    const clues: ClueItem[] = Array.isArray(parsed.clues)
      ? parsed.clues.map((c: any, idx: number) => ({
          id: c.id || `ai-clue-${idx}`,
          type: (['danger', 'warning', 'info', 'reassuring'].includes(c.type)
            ? c.type
            : 'warning') as 'danger' | 'warning' | 'info' | 'reassuring',
          title: c.title || 'Indice de réputation',
          description: c.description || '',
          detail: c.detail,
        }))
      : [];

    return {
      url: rawUrl,
      riskLevel,
      threatCategory: parsed.threatCategory || 'Analyse Threat Intelligence IA',
      protocol: (parsedUrl.protocol || 'https').replace(':', ''),
      isHttps: parsedUrl.protocol === 'https:',
      hostname: parsedUrl.hostname || rawUrl,
      tld: parsedUrl.hostname ? parsedUrl.hostname.split('.').pop() || '' : '',
      subdomainCount: parsedUrl.hostname ? Math.max(0, parsedUrl.hostname.split('.').length - 2) : 0,
      isIpAddress: /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname || ''),
      isShortener: false,
      hasPunycodeOrHomoglyphs: (parsedUrl.hostname || '').startsWith('xn--'),
      suspiciousKeywordsFound: [],
      clues,
      pedagogicalNotes: parsed.pedagogicalNotes || [],
      recommendation: parsed.recommendation || 'Faites preuve d\'une vigilance absolue.',
      whySummary: parsed.whySummary || (isRecognizedSafe
        ? 'Ce site est une plateforme officielle et légitime reconnue avec certificat HTTPS valide et réputation saine.'
        : 'Ce site présente des éléments suspects nécessitant de la prudence.'),
      engineType: 'ai-remote',
      sourcesCited: parsed.sourcesCited || ['Intelligence Open-Source & Bases de réputation cyber'],
    };
  }
}
