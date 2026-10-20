import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { analyzeSpokenText, type VoiceDiagnosis } from '../utils/voiceAssistantEngine';
import { AIVoiceService } from '../services/aiVoiceService';
import { soundFX } from '../utils/soundEffects';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  Info,
  Bot,
  Key,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// TypeScript interface for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialTranscript?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose, initialTranscript }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript || '');
  const [typedInput, setTypedInput] = useState('');
  const [diagnosis, setDiagnosis] = useState<VoiceDiagnosis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [preferredAudioLang, setPreferredAudioLang] = useState<'fr' | 'wo'>(language === 'wo' ? 'wo' : 'fr');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);

  // Gemini AI Key configuration state
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(AIVoiceService.getApiKey());
  const [hasApiKey, setHasApiKey] = useState(AIVoiceService.hasActiveApiKey());
  const [apiTestStatus, setApiTestStatus] = useState<{ testing: boolean; success?: boolean; message?: string } | null>(null);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
    const customWindow = window as unknown as IWindow;
    const SpeechRecognitionClass = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        soundFX.playMicStart();
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        const cleaned = currentTranscript.trim();
        setTranscript(cleaned);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        soundFX.playMicStop();
        if (event.error === 'not-allowed') {
          setMicError('Accès au micro refusé. Vous pouvez autoriser le micro ou taper votre situation ci-dessous.');
        } else if (event.error !== 'no-speech') {
          setMicError(`Erreur micro : ${event.error}. Vous pouvez taper votre phrase ci-dessous.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      stopSpeaking();
    };
  }, []);

  // Sync default audio language with app language
  useEffect(() => {
    setPreferredAudioLang(language === 'wo' ? 'wo' : 'fr');
  }, [language]);

  // Handle Initial Transcript if provided
  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
      processInputWithAI(initialTranscript);
    }
  }, [initialTranscript]);

  // Voice Output (Speech Synthesis)
  const speakText = (text: string, _langCode?: 'fr' | 'wo') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  /**
   * Process input through the Dynamic AI Service (Gemini API or Contextual AI Engine)
   */
  const processInputWithAI = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzingAI(true);
    stopSpeaking();

    try {
      const result = await AIVoiceService.analyzeSpeech(text);
      setDiagnosis(result);

      if (result.dangerLevel === 'danger') {
        soundFX.playWarningAlert();
      }

      // Automatically speak the generated response
      const textToSpeak = preferredAudioLang === 'wo' ? result.spokenResponseWo : result.spokenResponseFr;
      speakText(textToSpeak, preferredAudioLang);
    } catch {
      // Fallback
      const fallback = analyzeSpokenText(text);
      setDiagnosis(fallback);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMicError("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    stopSpeaking();

    if (isListening) {
      try {
        recognitionRef.current.stop();
        soundFX.playMicStop();
      } catch {
        // ignore
      }
      setIsListening(false);

      if (transcript.trim().length > 3) {
        processInputWithAI(transcript);
      }
    } else {
      setTranscript('');
      setDiagnosis(null);
      setMicError(null);
      try {
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        } catch {
          setMicError("Impossible de démarrer le micro. Vérifiez les autorisations.");
        }
      }
    }
  };

  // Run simulation or manual submission
  const runSimulation = (phrase: string) => {
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    setTranscript(phrase);
    processInputWithAI(phrase);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    runSimulation(typedInput);
    setTypedInput('');
  };

  // Test and save the Gemini Key
  const handleSaveAndTestKey = async () => {
    if (!apiKeyInput.trim()) {
      AIVoiceService.removeApiKey();
      setHasApiKey(false);
      setApiTestStatus({ testing: false, success: true, message: 'Clé retirée. Retour au moteur dynamique local.' });
      return;
    }

    setApiTestStatus({ testing: true, message: 'Test de connexion avec l\'API Google Gemini...' });
    const res = await AIVoiceService.testApiKey(apiKeyInput.trim());

    if (res.success) {
      AIVoiceService.saveApiKey(apiKeyInput.trim());
      setHasApiKey(true);
      setApiTestStatus({
        testing: false,
        success: true,
        message: '✅ Clé Google Gemini valide ! Vos réponses vocales sont désormais 100% générées par IA.',
      });
      setTimeout(() => setShowAiConfig(false), 2000);
    } else {
      setApiTestStatus({
        testing: false,
        success: false,
        message: `❌ Erreur : ${res.error}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="bg-white dark:bg-[#0B2236] rounded-2xl max-w-2xl w-full max-h-[92dvh] flex flex-col overflow-y-auto p-5 sm:p-8 space-y-5 shadow-xl border border-slate-200 dark:border-slate-700 relative text-left">

        {/* Header with AI status pill & Settings */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 relative">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Assistant Vocal • XamSafe</span>
              </div>

              {hasApiKey ? (
                <button
                  type="button"
                  onClick={() => setShowAiConfig(!showAiConfig)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Modifier votre clé IA Gemini"
                >
                  <Bot className="w-3 h-3 text-emerald-500" />
                  <span>IA Gemini Active (100% Dynamique) ⚙️</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAiConfig(!showAiConfig)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Connecter l'API Google Gemini gratuite"
                >
                  <Key className="w-3 h-3 text-amber-600" />
                  <span>Activer IA Gemini Gratuite ⚙️</span>
                </button>
              )}
            </div>

            <h2 id="voice-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
              {language === 'wo' ? 'Waxal ci sa gémmiñ, IA bi tontu la' : 'Parlez à voix haute, l\'IA vous répond'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {language === 'wo'
                ? 'Waxal ci Français, ci Wolof walla jaxase ko. IA bi dina la tontu ci oral bu dëggu.'
                : 'Exprimez-vous en Français, en Wolof ou en mélangeant les deux. Réponses intelligentes et personnalisées.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch {
                  // ignore
                }
              }
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fermer l'assistant vocal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* COLLAPSIBLE GEMINI API CONFIGURATION PANEL */}
        {showAiConfig && (
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connexion API Google Gemini (100% Gratuite)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiConfig(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Fermer
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Pour des réponses orales vivantes, empathiques et <strong>jamais génériques</strong>, connectez l'API Google Gemini 1.5 Flash. Elle est <strong>100% gratuite</strong> (15 requêtes/minute, 0 FCFA requis).
            </p>

            <div className="flex items-center gap-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                <span>Obtenir ma clé gratuite sur Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[11px] text-slate-400">Prend 30 secondes avec un compte Google</span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Collez votre clé API Gemini (ex: AIzaSy...)"
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveAndTestKey}
                  disabled={apiTestStatus?.testing}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
                >
                  {apiTestStatus?.testing ? 'Test en cours...' : 'Tester & Activer'}
                </button>
              </div>

              {apiTestStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    apiTestStatus.success
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : apiTestStatus.testing
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {apiTestStatus.testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {apiTestStatus.success && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{apiTestStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BIG MICROPHONE INTERACTION ZONE */}
        <div className="flex flex-col items-center justify-center py-2 space-y-3 text-center">
          <div className="relative">
            <button
              type="button"
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/20'
              }`}
              aria-label={isListening ? "Arrêter l'enregistrement" : "Appuyer pour parler"}
            >
              {isListening ? (
                <>
                  <MicOff className="w-9 h-9 sm:w-11 sm:h-11" />
                  <span className="text-[11px] font-bold mt-1 uppercase">Tëj ko</span>
                </>
              ) : (
                <>
                  <Mic className="w-9 h-9 sm:w-11 sm:h-11" />
                  <span className="text-[11px] font-bold mt-1 uppercase">Waxal</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isListening
                ? '🎙️ Écoute en cours... Parlez librement (Français, Wolof ou Mixte)'
                : 'Appuyez sur le micro et racontez ce qui vous arrive à voix haute'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isListening
                ? 'Réappuyez sur le bouton quand vous avez terminé pour générer la réponse IA'
                : 'Exemple : « Un gars m\'appelle pour me dire que mon Wave est suspendu et veut le code SMS »'}
            </p>
          </div>

          {!speechSupported && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 max-w-md">
              Votre navigateur ne gère pas la saisie vocale directe. Vous pouvez tester immédiatement avec les exemples audio en 1 clic ci-dessous ou taper votre phrase.
            </div>
          )}

          {micError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 max-w-md">
              {micError}
            </div>
          )}
        </div>

        {/* TRANSCRIPT BOX (WHAT THE USER SPOKE) */}
        {transcript && (
          <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              🗣️ Ce que vous avez dit :
            </span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">
              « {transcript} »
            </p>
          </div>
        )}

        {/* LOADING INDICATOR WHILE AI IS GENERATING */}
        {isAnalyzingAI && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-3 text-sm text-emerald-800 dark:text-emerald-300 font-bold animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>🤖 L'IA analyse votre situation et prépare votre réponse orale sur-mesure...</span>
          </div>
        )}

        {/* DIAGNOSIS & SPOKEN AUDIO RESPONSE ZONE */}
        {diagnosis && !isAnalyzingAI && (
          <div
            className={`p-5 rounded-2xl border transition-all space-y-4 ${
              diagnosis.dangerLevel === 'danger'
                ? 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-900/80'
                : diagnosis.dangerLevel === 'warning'
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/80'
                : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/80'
            }`}
          >
            {/* Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {diagnosis.dangerLevel === 'danger' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {language === 'wo' ? diagnosis.titleWo : diagnosis.titleFr}
                </h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                  diagnosis.dangerLevel === 'danger'
                    ? 'bg-red-600 text-white'
                    : diagnosis.dangerLevel === 'warning'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {diagnosis.category}
              </span>
            </div>

            {/* Spoken message text (Dynamic AI Generated) */}
            <div className="p-3.5 bg-white/80 dark:bg-[#071724]/80 rounded-xl border border-slate-200/80 dark:border-slate-800 text-sm leading-relaxed text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                <Volume2 className="w-4 h-4" />
                <span>Réponse orale de sécurité (Générée dynamiquement) :</span>
              </div>
              <p className="font-semibold">
                {preferredAudioLang === 'wo' ? diagnosis.spokenResponseWo : diagnosis.spokenResponseFr}
              </p>
            </div>

            {/* Action buttons (Listen Audio in French / Wolof + Stop) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPreferredAudioLang('fr');
                  speakText(diagnosis.spokenResponseFr, 'fr');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                  isSpeaking && preferredAudioLang === 'fr'
                    ? 'bg-emerald-700 text-white ring-2 ring-emerald-400 font-extrabold'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>🔊 Écouter en Français</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreferredAudioLang('wo');
                  speakText(diagnosis.spokenResponseWo, 'wo');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px] ${
                  isSpeaking && preferredAudioLang === 'wo'
                    ? 'bg-emerald-700 text-white ring-2 ring-emerald-400 font-extrabold'
                    : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 font-extrabold'
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>🔊 Déglul ci Wolof</span>
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  <VolumeX className="w-4 h-4 text-red-500" />
                  <span>⏹️ Stop</span>
                </button>
              )}
            </div>

            {/* Direct Emergency Action Links */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <Link
                to="/urgence-victime"
                onClick={() => {
                  stopSpeaking();
                  onClose();
                }}
                className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                <span>🚨 Ouvrir le protocole d'urgence complet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {diagnosis.officialEmergencyContact && (
                <a
                  href={diagnosis.officialEmergencyContact.number.startsWith('http') ? diagnosis.officialEmergencyContact.number : `tel:${diagnosis.officialEmergencyContact.number}`}
                  target={diagnosis.officialEmergencyContact.number.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{diagnosis.officialEmergencyContact.name}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* MANUAL INPUT OPTION (FOR USERS PREFERRING TO TYPE OR TEST PROMPTS) */}
        <form onSubmit={handleManualSubmit} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Ou tapez votre phrase à tester (ex: On me demande 15000 F pour un job PAM)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071724] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
          >
            <span>Tester l'IA</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-CLICK QUICK SCENARIOS (TRY OUT DIRECTLY) */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              {language === 'wo' ? 'Tàggatu ci sàss (Bësal te déglu) :' : 'Ou testez immédiatement avec ces cas réels :'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => runSimulation("Dañu ma woo naan ma service technique Wave lañu te laaj ma kod SMS")}
              className="p-2.5 rounded-xl text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>📞 « Dañu ma woo ci Wave laaj ma kod SMS »</span>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
            </button>

            <button
              type="button"
              onClick={() => runSimulation("Un ami m'envoie un message WhatsApp pour me demander un code à 6 chiffres reçu par SMS")}
              className="p-2.5 rounded-xl text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>💬 « Mon ami WhatsApp me demande un code 6 chiffres »</span>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
            </button>

            <button
              type="button"
              onClick={() => runSimulation("J'ai reçu un SMS me disant que 50000 F ont été transférés par erreur et une femme pleure au téléphone pour que je lui renvoie")}
              className="p-2.5 rounded-xl text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>📩 « SMS transfert reçu de 50.000 F et appel en pleurs »</span>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
            </button>

            <button
              type="button"
              onClick={() => runSimulation("Benn jaaykat ci TikTok dafa laaj dëpp avance ci Wave bala mu lay livrer iPhone bi")}
              className="p-2.5 rounded-xl text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>🛍️ « Jaaykat bu laaj dëpp avance bala mu lay livrer »</span>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Traitement audio et IA sécurisé. Aucune donnée personnelle n'est stockée sur serveur.</span>
        </div>
      </div>
    </div>
  );
};
