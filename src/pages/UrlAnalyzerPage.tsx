import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeUrlLocally } from '../services/urlAnalyzer';
import { AIVoiceService } from '../services/aiVoiceService';
import type { UrlCheckResult } from '../types';
import {
  Link2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Info,
  RotateCcw,
  Key,
  Zap,
  ChevronDown,
  Loader2,
} from 'lucide-react';

export interface AttackSample {
  id: string;
  category: 'mobile-money' | 'whatsapp' | 'etudes' | 'malware' | 'officiel';
  categoryLabel: string;
  title: string;
  url: string;
  attackerTactics: string;
  trapIndicator: string;
  isDanger: boolean;
}

export const ATTACK_SAMPLES: AttackSample[] = [
  {
    id: 'wave-phishing-xyz',
    category: 'mobile-money',
    categoryLabel: 'Mobile Money (Wave)',
    title: 'Faux SMS de virement bloqué Wave Mobile Money',
    url: 'https://wave-senegal-connexion.xyz/login?token=otp',
    attackerTactics: 'SMS d\'urgence prétendant qu\'un transfert de 85 000 FCFA est bloqué et expire sous 2 heures.',
    trapIndicator: 'Extension éphémère jetable ".xyz" (non wave.com) et paramètre "?token=otp" conçu pour voler votre code secret SMS.',
    isDanger: true,
  },
  {
    id: 'orange-fake-unblock',
    category: 'mobile-money',
    categoryLabel: 'Mobile Money (Orange)',
    title: 'Faux déblocage de compte Orange Money',
    url: 'http://orange-money-senegal-deblocage.top/auth/verify?step=pin',
    attackerTactics: 'Alerte anxiogène affirmant que votre compte sera clôturé d\'urgence pour défaut d\'identification KYC.',
    trapIndicator: 'Protocole non chiffré HTTP (sans cadenas), extension ".top" et formulaire exigeant votre code PIN secret.',
    isDanger: true,
  },
  {
    id: 'raw-ip-phishing',
    category: 'mobile-money',
    categoryLabel: 'Serveur Bancaire Fictif',
    title: 'Adresse IP brute imitant un serveur bancaire',
    url: 'http://197.234.12.89/wave-connexion/client',
    attackerTactics: 'Message trompeur prétextant une maintenance urgente du serveur de paiement de votre opérateur.',
    trapIndicator: 'L\'adresse est une IP numérique brute (197.234...). Aucune banque ni opérateur sérieux n\'utilise d\'adresse IP dans ses liens publics.',
    isDanger: true,
  },
  {
    id: 'cbao-fake-security',
    category: 'mobile-money',
    categoryLabel: 'Banque (CBAO Attijari)',
    title: 'Fausse alerte de sécurité bancaire CBAO Attijari',
    url: 'https://cbao-attijari-connexion-securisee.fit/espace-client',
    attackerTactics: 'Email alarmiste prétextant un débit frauduleux de 250 000 FCFA à contester immédiatement pour vous faire saisir vos identifiants.',
    trapIndicator: 'Extension ".fit" achetée pour quelques centimes, totalement étrangère au domaine bancaire officiel "cbao.sn".',
    isDanger: true,
  },
  {
    id: 'whatsapp-contest-hijack',
    category: 'whatsapp',
    categoryLabel: 'Piratage WhatsApp',
    title: 'Vol de compte WhatsApp par faux vote de concours',
    url: 'https://whatsapp-vote-concours.club/auth/code?session=sms',
    attackerTactics: 'Un ami piraté vous écrit : « Vote pour ma nièce dans ce concours s\'il te plaît, clique vite ! »',
    trapIndicator: 'Le faux site vous demande d\'entrer le code à 6 chiffres que WhatsApp vient d\'envoyer par SMS sur votre propre téléphone pour voler votre compte.',
    isDanger: true,
  },
  {
    id: 'whatsapp-fake-support',
    category: 'whatsapp',
    categoryLabel: 'Piratage WhatsApp',
    title: 'Faux support technique WhatsApp Anti-Bannissement',
    url: 'https://wa-support-verification.cam/security/restore',
    attackerTactics: 'Message effrayant menaçant de désactiver définitivement votre compte sous 24h pour violation imaginaire des règles.',
    trapIndicator: 'Extension douteuse ".cam" et nom d\'hôte "wa-support-verification" n\'appartenant absolument pas à whatsapp.com.',
    isDanger: true,
  },
  {
    id: 'campusen-scholarship-scam',
    category: 'etudes',
    categoryLabel: 'Études & Bourses',
    title: 'Fausse bourse d\'excellence Campusen (50 000 FCFA)',
    url: 'https://campusen-bourses-senegal.site/inscription?frais=mobilemoney',
    attackerTactics: 'Post sur TikTok/Facebook promettant une allocation mensuelle de l\'État contre 2 500 FCFA de « frais de dossier » par Wave.',
    trapIndicator: 'Extension ".site" au lieu du portail national officiel "campusen.sn". L\'État ne réclame jamais de frais par lien tiers.',
    isDanger: true,
  },
  {
    id: 'fake-public-service-recruitment',
    category: 'etudes',
    categoryLabel: 'Emploi & Recrutement',
    title: 'Faux recrutement de la Fonction Publique / Hôpitaux',
    url: 'https://concours-fonction-publique.online/postuler',
    attackerTactics: 'Collecte frauduleuse de pièces d\'identité (CNI, passeports) pour monter des dossiers de crédit frauduleux en votre nom.',
    trapIndicator: 'Extension commerciale ".online" au lieu d\'un domaine d\'État officiel se terminant par ".gouv.sn".',
    isDanger: true,
  },
  {
    id: 'fake-wave-apk-trojan',
    category: 'malware',
    categoryLabel: 'Trojan / Malware Mobile',
    title: 'Trojan bancaire : Faux « Wave Pro sans frais »',
    url: 'https://wave-sans-frais-apk.icu/download/wave-pro.apk',
    attackerTactics: 'Promet d\'annuler tous les frais de retrait de 1% en installant un APK modifié en dehors du Google Play Store.',
    trapIndicator: 'Téléchargement direct d\'un fichier ".apk" piégé sur l\'extension ".icu", conçu pour intercepter vos SMS et vider votre solde.',
    isDanger: true,
  },
  {
    id: 'pirate-streaming-malvertising',
    category: 'malware',
    categoryLabel: 'Streaming Pirate & Malvertising',
    title: 'Streaming pirate sportif avec bannières de virus (Kooratv)',
    url: 'https://kooratv.club/live-match',
    attackerTactics: 'Attire avec des diffusions sportives gratuites pour afficher des alertes alarmistes (« Votre téléphone a 3 virus ! »).',
    trapIndicator: 'Extension éphémère ".club", redirections publicitaires agressives et téléchargement forcé d\'applications indésirables.',
    isDanger: true,
  },
  {
    id: 'official-wave-sn',
    category: 'officiel',
    categoryLabel: 'Domaine Officiel Sûr',
    title: 'Portail officiel Wave Mobile Money Sénégal',
    url: 'https://www.wave.com/fr/sn/',
    attackerTactics: 'Site officiel et authentique de l\'opérateur Wave au Sénégal.',
    trapIndicator: 'Domaine officiel vérifié "wave.com", certificat HTTPS d\'autorité, aucune extension suspecte.',
    isDanger: false,
  },
  {
    id: 'official-orange-sn',
    category: 'officiel',
    categoryLabel: 'Domaine Officiel Sûr',
    title: 'Portail officiel Sonatel / Orange Sénégal',
    url: 'https://www.orange.sn/',
    attackerTactics: 'Site officiel et authentique de Sonatel Orange au Sénégal.',
    trapIndicator: 'Domaine souverain national ".sn", certificat d\'autorité émis pour Sonatel.',
    isDanger: false,
  },
  {
    id: 'official-esp-dakar',
    category: 'officiel',
    categoryLabel: 'Domaine Officiel Sûr',
    title: 'École Supérieure Polytechnique de Dakar (ESP)',
    url: 'https://esp.sn/',
    attackerTactics: 'Site officiel d\'enseignement supérieur et de recherche de l\'ESP / UCAD.',
    trapIndicator: 'Domaine institutionnel ".sn" officiel reconnu.',
    isDanger: false,
  },
  {
    id: 'official-cisco-netacad',
    category: 'officiel',
    categoryLabel: 'Domaine Officiel Sûr',
    title: 'Cisco Networking Academy (Netacad)',
    url: 'https://www.netacad.com/fr/',
    attackerTactics: 'Plateforme mondiale de formation et de certification officielle de Cisco Systems.',
    trapIndicator: 'Domaine officiel Cisco certifié par Cisco Talos Intelligence.',
    isDanger: false,
  },
];

export const UrlAnalyzerPage: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGallery, setShowGallery] = useState(false);

  const executeAnalysis = async (rawUrl: string) => {
    const target = rawUrl.trim();
    if (!target) return;

    setIsAnalyzing(true);
    setAiError(null);
    setResult(null);

    // 1. Get baseline local analysis
    const localRes = analyzeUrlLocally(target);

    // 2. If Gemini API Key is available, automatically run deep Threat Intelligence
    if (AIVoiceService.hasActiveApiKey()) {
      try {
        const aiRes = await AIVoiceService.investigateUrlWithAI(target);
        const mergedClues = [...localRes.clues];
        aiRes.clues.forEach((ac) => {
          if (!mergedClues.some((lc) => lc.id === ac.id || lc.title === ac.title)) {
            mergedClues.push(ac);
          }
        });

        const combinedResult: UrlCheckResult = {
          ...localRes,
          riskLevel: aiRes.riskLevel || localRes.riskLevel,
          whySummary: aiRes.whySummary || localRes.whySummary,
          threatCategory: aiRes.threatCategory || localRes.threatCategory,
          sourcesCited: aiRes.sourcesCited || localRes.sourcesCited,
          recommendation: aiRes.recommendation || localRes.recommendation,
          engineType: 'ai-remote',
          clues: mergedClues,
        };
        setResult(combinedResult);
      } catch (err: any) {
        setResult(localRes);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setTimeout(() => {
        setResult(localRes);
        setIsAnalyzing(false);
      }, 200);
    }
  };

  const quickChips = [
    { label: 'Wave (.xyz faux site)', url: 'https://wave-senegal-connexion.xyz/login?token=otp' },
    { label: 'Orange Money (.top non chiffré)', url: 'http://orange-money-senegal-deblocage.top/auth/verify?step=pin' },
    { label: 'IP brute bancaire', url: 'http://197.234.12.89/wave-connexion/client' },
    { label: 'Piratage WhatsApp', url: 'https://whatsapp-vote-concours.club/auth/code?session=sms' },
    { label: 'Site officiel Wave (Sûr)', url: 'https://www.wave.com/fr/sn/' },
  ];

  const categories = [
    { id: 'all', label: `Tous (${ATTACK_SAMPLES.length})` },
    { id: 'mobile-money', label: 'Wave & Orange Money' },
    { id: 'whatsapp', label: 'Piratage WhatsApp' },
    { id: 'etudes', label: 'Campusen & Bourses' },
    { id: 'malware', label: 'Faux APK & Streaming' },
    { id: 'officiel', label: 'Domaines Officiels Sûrs' },
  ];

  const filteredSamples =
    selectedCategory === 'all'
      ? ATTACK_SAMPLES
      : ATTACK_SAMPLES.filter((s) => s.category === selectedCategory);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis(inputUrl);
  };

  const handleSampleClick = (url: string) => {
    setInputUrl(url);
    executeAnalysis(url);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setInputUrl('');
    setResult(null);
    setAiError(null);
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim().length > 10) {
      AIVoiceService.saveApiKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
      setAiError(null);
      executeAnalysis(inputUrl);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Page Header - Clean & Focused */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Vérificateur de lien • 100% anonyme & passif</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Vérifier la fiabilité d'un lien internet
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Examinez la structure d'un lien suspect avant de cliquer. XamSafe analyse le nom de domaine, les sous-domaines trompeurs et les imitations de marques sans jamais visiter le site distant.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleCheck} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Adresse web (URL) à examiner :
          </label>
          <input
            id="url-input"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Ex : https://wave-connexion-senegal.xyz ou http://..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-sm shadow-2xs transition-colors font-mono"
          />
        </div>

        {/* Quick sample chips */}
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 block font-medium">
            Exemples fréquents à tester en 1 clic :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.url)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!inputUrl.trim() || isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none shadow-xs transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Examen en cours...</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>Examiner ce lien</span>
              </>
            )}
          </button>

          {inputUrl && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>

        {/* Passive Inspection Footnote */}
        <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Analyse 100% passive : le site distant n'est pas ouvert et aucun script n'est exécuté sur votre appareil.</span>
        </div>
      </form>

      {/* Inline API Key Helper Modal */}
      {showApiKeyInput && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>Clé Google Gemini (Optionnelle pour Threat Intelligence approfondie)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pour vérifier la réputation de n'importe quelle adresse sur les bases internationales, entrez votre clé Google AI Studio gratuite.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Collez votre clé AIzaSy..."
              className="flex-1 p-2 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 transition-colors"
            >
              Activer
            </button>
          </div>
        </div>
      )}

      {aiError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{aiError}</span>
          <button
            type="button"
            onClick={() => setAiError(null)}
            className="text-xs font-bold underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* RESULT SECTION */}
      {result && (
        <section
          aria-live="polite"
          className="bg-white dark:bg-[#0C2438] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs"
        >
          {/* Header result badge & title */}
          <div className="space-y-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {result.riskLevel === 'dangereux' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Verdict : Lien Dangereux / Risque Élevé</span>
                </div>
              )}
              {result.riskLevel === 'suspect' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Verdict : Lien Suspect / Prudence Recommandée</span>
                </div>
              )}
              {result.riskLevel === 'faible' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verdict : Site Sûr et Légitime</span>
                </div>
              )}
              {result.riskLevel === 'indetermine' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Verdict : Domaine Non Répertorié</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{result.isHttps ? '🔒 HTTPS' : '⚠️ HTTP (Non chiffré)'}</span>
              </div>
            </div>

            {/* Display examined URL */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all border border-slate-200 dark:border-slate-800 select-all">
              {result.url}
            </div>

            {/* "Pourquoi ce verdict ?" */}
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 ${
                result.riskLevel === 'dangereux'
                  ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-950 dark:text-red-200'
                  : result.riskLevel === 'suspect'
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>Pourquoi ce verdict ?</span>
              </div>
              <p className="leading-relaxed">
                {result.whySummary || result.recommendation}
              </p>
              <div className="pt-2 text-xs opacity-90 border-t border-current/15 flex items-start gap-1">
                <strong>Recommandation :</strong>
                <span>{result.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Breakdown cards: Protocol, Hostname, TLD, Impersonation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Protocole</span>
              <span className={`font-bold ${result.isHttps ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.protocol.toUpperCase()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nom d'hôte</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {result.hostname}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Extension</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {result.tld || 'Non spécifié'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cible imitée</span>
              <span className={`font-bold ${result.impersonatedBrand ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                {result.impersonatedBrand || 'Aucune'}
              </span>
            </div>
          </div>

          {/* Indices techniques relevés */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Indices techniques constatés ({result.clues.length})
            </h3>
            <div className="space-y-2">
              {result.clues.map((clue) => (
                <div
                  key={clue.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs sm:text-sm space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{clue.title}</span>
                    <span className="text-[10px] uppercase font-semibold opacity-60">
                      {clue.type === 'danger' ? 'Anomalie' : clue.type === 'warning' ? 'Prudence' : 'Conforme'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    {clue.description}
                  </p>
                  {clue.detail && (
                    <p className="text-[11px] text-slate-400 italic pt-0.5">
                      {clue.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Links */}
          {result.riskLevel === 'dangereux' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Vous avez déjà entré vos identifiants ou validé un paiement sur ce site ?
              </span>
              <Link
                to="/urgence-victime"
                className="font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                Suivre la procédure d'urgence
              </Link>
            </div>
          )}
        </section>
      )}

      {/* TRAINING REPOSITORY (Collapsible Drawer) */}
      <section className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Cas réels & Bibliothèque d'entraînement ({ATTACK_SAMPLES.length} URLs réelles)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Exemples d'adresses frauduleuses utilisées au Sénégal (Wave, Orange, WhatsApp, Campusen...).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGallery(!showGallery)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <span>{showGallery ? 'Masquer' : 'Explorer les cas'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGallery ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Grid */}
        {showGallery && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">
                        {sample.categoryLabel}
                      </span>
                      {sample.isDanger ? (
                        <span className="text-[10px] font-bold text-red-600 uppercase">Piège Pirate</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Officiel Sûr</span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-950 dark:text-white leading-snug">
                      {sample.title}
                    </h3>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all select-all">
                      {sample.url}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        <strong>Technique :</strong> {sample.attackerTactics}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                        🚩 {sample.trapIndicator}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSampleClick(sample.url)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Tester ce lien</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
