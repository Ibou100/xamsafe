import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { analyzeMessageLocally, sanitizeUserMessage } from '../services/messageAnalyzer';
import { AIVoiceService } from '../services/aiVoiceService';
import type { AnalysisResult } from '../types';
import { PiiSanitizerNotice } from '../components/PiiSanitizerNotice';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Info,
  RotateCcw,
  Image as ImageIcon,
  FileText,
  UploadCloud,
  Key,
  X,
  Zap,
  PhoneCall,
  MessageSquare,
  ChevronDown,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export interface MessageAttackSample {
  id: string;
  category: 'mobile-money' | 'whatsapp' | 'gains' | 'emploi' | 'famille' | 'officiel';
  categoryLabel: string;
  title: string;
  channel: 'SMS' | 'WhatsApp' | 'Appel téléphonique' | 'E-mail';
  text: string;
  attackerTactics: string;
  trapIndicator: string;
  isDanger: boolean;
}

export const MESSAGE_ATTACK_SAMPLES: MessageAttackSample[] = [
  {
    id: 'wave-fake-agent',
    category: 'mobile-money',
    categoryLabel: 'Mobile Money (Wave)',
    title: 'Faux agent Wave prétextant un blocage de compte',
    channel: 'SMS',
    text: 'ALERTE WAVE : Votre compte présente une tentative de connexion inhabituelle. Pour éviter le blocage immédiat de votre solde sous 15 minutes, veuillez dicter le code de vérification à 4 chiffres envoyé par SMS.',
    attackerTactics: 'Crée une panique immédiate avec menace de blocage pour vous pousser à donner votre code secret.',
    trapIndicator: "Règle d'or : Aucun agent Wave n'a le droit de vous demander votre code secret ou un code reçu par SMS. C'est du vol direct.",
    isDanger: true,
  },
  {
    id: 'fake-transfer-refund',
    category: 'mobile-money',
    categoryLabel: 'Mobile Money (Transfert)',
    title: 'Arnaque au faux virement envoyé « par erreur »',
    channel: 'SMS',
    text: "Transfert réussi de 75.000 FCFA de M. Ousmane F. Nouveau solde: 78.400 FCFA. Réf: TXN98762. [Suivi d'un appel immédiat d'une personne en larmes : « S'il vous plaît, je me suis trompé de numéro en envoyant les frais d'hôpital de ma mère, renvoyez-moi l'argent par Wave ! »]",
    attackerTactics: "Manipule votre empathie et votre honnêteté. Le SMS de virement reçu est un faux message imité, aucun franc n'est entré dans votre compte.",
    trapIndicator: "Si vous ouvrez votre vraie application Wave ou Orange Money, votre solde n'a pas bougé. Si vous renvoyez, vous envoyez vos propres économies.",
    isDanger: true,
  },
  {
    id: 'orange-money-fake-kyc',
    category: 'mobile-money',
    categoryLabel: 'Mobile Money (Orange)',
    title: "SMS d'urgence Orange Money (Fausse clôture KYC)",
    channel: 'SMS',
    text: "Orange Money Info : Votre compte n'est pas conforme aux exigences BCEAO. Votre ligne sera suspendue dans 24h. Cliquez ici http://orange-money-senegal-deblocage.top pour mettre à jour votre CNI et code secret.",
    attackerTactics: "Utilise le prétexte réglementaire de la BCEAO pour vous faire paniquer et cliquer sur un faux site clone.",
    trapIndicator: "L'opérateur ne vous envoie jamais un lien HTTP non sécurisé se terminant par « .top » pour demander votre code secret.",
    isDanger: true,
  },
  {
    id: 'whatsapp-contest-hijack',
    category: 'whatsapp',
    categoryLabel: 'Piratage WhatsApp',
    title: 'Piratage de compte WhatsApp via le faux vote de concours',
    channel: 'WhatsApp',
    text: "Salam mon frère ! S'il te plaît, ma petite nièce participe à la finale d'un concours de récitation. Il lui manque 2 votes pour gagner. Je t'ai envoyé un lien par SMS avec un code, renvoie-moi juste le code pour valider le vote barakallahoufik !",
    attackerTactics: "Provient du compte WhatsApp d'un ami ou proche déjà piraté. Exploite la confiance religieuse ou familiale.",
    trapIndicator: "Le code SMS reçu vient de WhatsApp (« Votre code WhatsApp est 123-456 »). Si vous le transmettez, le pirate vole instantanément votre compte.",
    isDanger: true,
  },
  {
    id: 'whatsapp-fake-support',
    category: 'whatsapp',
    categoryLabel: 'Piratage WhatsApp',
    title: 'Fausse notification du support technique WhatsApp',
    channel: 'WhatsApp',
    text: 'Support WhatsApp Officiel : Votre compte a été signalé pour utilisation de version non officielle. Pour éviter la désactivation définitive de votre numéro dans les 12 prochaines heures, envoyez immédiatement "CONFIRMER" suivi de votre code de validation SMS.',
    attackerTactics: "Se fait passer pour l'équipe WhatsApp avec le logo officiel en photo de profil pour terroriser l'utilisateur.",
    trapIndicator: "WhatsApp ne communique jamais par chat individuel pour demander des codes de validation SMS.",
    isDanger: true,
  },
  {
    id: 'sonatel-fake-lottery',
    category: 'gains',
    categoryLabel: 'Loterie & Tombola',
    title: 'Fausse Tombola Promo Sonatel (5 Millions FCFA)',
    channel: 'SMS',
    text: "FÉLICITATIONS ! Votre numéro a été tiré au sort par l'ordinateur central de la Grande Tombola Promo Sonatel 2026. Vous remportez 5.000.000 FCFA et un véhicule. Appelez d'urgence Me Diallo au 77 XXX XX XX pour payer les 25.000 FCFA de frais d'huissier et récupérer votre chèque.",
    attackerTactics: "Miroite une fortune imaginaire pour vous soutirer 25 000 FCFA de prétendus « frais d'huissier » non remboursables.",
    trapIndicator: "Vous n'avez jamais acheté de ticket. Dans une tombola légitime, on ne vous demande JAMAIS d'envoyer de l'argent pour recevoir un lot.",
    isDanger: true,
  },
  {
    id: 'lonase-fake-prime',
    category: 'gains',
    categoryLabel: 'Loterie & Tombola',
    title: 'Faux gain de loterie Lonase / Loto Voyage',
    channel: 'WhatsApp',
    text: "Direction Lonase Sénégal : Votre numéro de téléphone a été sélectionné parmi les abonnés actifs. Vous bénéficiez d'une prime spéciale de 1.500.000 FCFA. Veuillez envoyer 10.000 FCFA de frais d'activation de dossier par Wave sur le numéro du comptable pour valider le virement.",
    attackerTactics: "Usurpation d'une société nationale de jeux pour réclamer un paiement préalable.",
    trapIndicator: "La demande de frais préalables (« frais d'activation de dossier ») est la signature universelle des escroqueries financières.",
    isDanger: true,
  },
  {
    id: 'fake-tiktok-jobs',
    category: 'emploi',
    categoryLabel: 'Emploi Fictif / Tâches',
    title: 'Faux travail en ligne : « Gagnez 25 000 FCFA par jour sur TikTok »',
    channel: 'WhatsApp',
    text: "Bonjour ! Recrutement international : gagnez entre 20.000 et 50.000 FCFA par jour en travaillant depuis chez vous. Il vous suffit de liker des vidéos TikTok et de vous abonner à des chaînes YouTube pendant 30 minutes. Cliquez sur ce lien Telegram pour commencer et toucher votre premier paiement.",
    attackerTactics: "Attire les étudiants et demandeurs d'emploi avec de l'argent facile. Après de petites tâches fictives, on exige des dépôts d'argent (« packs VIP ») non remboursables.",
    trapIndicator: "Aucune entreprise sérieuse ne recrute par WhatsApp non sollicité avec un salaire exorbitant pour de simples clics.",
    isDanger: true,
  },
  {
    id: 'campusen-scholarship-scam',
    category: 'emploi',
    categoryLabel: 'Bourses & Étudiants',
    title: "Fausse bourse d'aide aux étudiants Campusen",
    channel: 'SMS',
    text: "Commission Bourses Campusen : Votre dossier d'allocation sociale étudiante a été retenu pour 45.000 FCFA/mois. Pour finaliser votre enregistrement bancaire, envoyez 3.500 FCFA de frais de timbre par Wave au trésorier au 77 XXX XX XX.",
    attackerTactics: "Exploite la vulnérabilité et l'attente des étudiants sénégalais concernant leurs allocations.",
    trapIndicator: "Les bourses d'État ne se paient jamais via un transfert Wave personnel à un numéro 77 anonyme.",
    isDanger: true,
  },
  {
    id: 'fake-accident-emergency',
    category: 'famille',
    categoryLabel: 'Fausse Urgence Familiale',
    title: "Fausse urgence familiale : « Papa, j'ai eu un accident »",
    channel: 'SMS',
    text: "Papa c'est moi, mon téléphone est déchargé. J'ai eu un grave accident de taxi en allant au cours, la police m'a retenu au commissariat. Envoie vite 30.000 FCFA sur ce numéro Wave pour payer le constat sinon ils m'enferment d'urgence !",
    attackerTactics: "Panique parentale extrême : l'escroc sait qu'un parent affolé enverra l'argent sans réfléchir.",
    trapIndicator: "N'envoyez JAMAIS d'argent dans la précipitation. Appelez directement le numéro habituel de votre enfant ou ses amis pour vérifier la situation.",
    isDanger: true,
  },
  {
    id: 'official-wave-notification',
    category: 'officiel',
    categoryLabel: 'Message Officiel Sûr',
    title: 'Notification officielle Wave Mobile Money (Sûr)',
    channel: 'SMS',
    text: 'Vous avez payé 1.500 FCFA à Boutique Chez Moussa. Nouveau solde: 43.500 FCFA. Frais: 0 FCFA. Wave ne vous demandera JAMAIS votre code secret par téléphone.',
    attackerTactics: "Message authentique d'un opérateur de Mobile Money.",
    trapIndicator: 'Rappel de sécurité officiel explicite, aucun lien externe, pas de demande de virement inverse.',
    isDanger: false,
  },
  {
    id: 'official-orange-notification',
    category: 'officiel',
    categoryLabel: 'Message Officiel Sûr',
    title: 'Notification officielle Orange Money (Sûr)',
    channel: 'SMS',
    text: 'Votre transfert de 10.000 FCFA vers le 77XXXXXXX a été effectué avec succès. Référence de transaction: OM20261019. Service client disponible au 1441.',
    attackerTactics: 'Confirmation de transaction standard.',
    trapIndicator: 'Numéro court officiel du service client (1441), pas de pression temporelle, aucune demande de code secret.',
    isDanger: false,
  },
];

export const MessageAnalyzerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'screenshot'>('text');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickChips = [
    { label: 'Faux agent Wave (Code secret)', text: 'ALERTE WAVE : Votre compte présente une tentative de connexion inhabituelle. Pour éviter le blocage immédiat de votre solde sous 15 minutes, veuillez dicter le code de vérification à 4 chiffres envoyé par SMS.' },
    { label: 'Faux virement « par erreur »', text: 'Transfert réussi de 75.000 FCFA de M. Ousmane F. Nouveau solde: 78.400 FCFA. Réf: TXN98762. [Suivi d\'un appel en larmes : S\'il vous plaît, renvoyez l\'argent par Wave !]' },
    { label: 'Vol compte WhatsApp (Faux vote)', text: 'Salam mon frère ! Ma petite nièce participe à un concours. Il lui manque 2 votes. Je t\'ai envoyé un code par SMS, renvoie-moi juste le code pour valider le vote barakallahoufik !' },
    { label: 'Tombola Sonatel (5 Millions)', text: 'FÉLICITATIONS ! Votre numéro a été tiré au sort par la Grande Tombola Sonatel 2026. Vous remportez 5.000.000 FCFA. Envoyez 25.000 FCFA de frais d\'huissier pour débloquer votre lot.' },
  ];

  const categories = [
    { id: 'all', label: `Tous (${MESSAGE_ATTACK_SAMPLES.length})` },
    { id: 'mobile-money', label: 'Wave & Orange Money' },
    { id: 'whatsapp', label: 'Piratage WhatsApp' },
    { id: 'gains', label: 'Fausses Tombolas' },
    { id: 'emploi', label: 'Faux Emplois' },
    { id: 'famille', label: 'Urgences Familiales' },
    { id: 'officiel', label: 'Messages Légitimes' },
  ];

  const filteredSamples =
    selectedCategory === 'all'
      ? MESSAGE_ATTACK_SAMPLES
      : MESSAGE_ATTACK_SAMPLES.filter((s) => s.category === selectedCategory);

  const handleAnalyzeText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setVisionError(null);
    setTimeout(() => {
      const sanitized = sanitizeUserMessage(inputText);
      const analysis = analyzeMessageLocally(sanitized);
      setResult(analysis);
      setIsAnalyzing(false);
    }, 200);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setVisionError('Le fichier sélectionné doit être une image (PNG, JPG, WEBP).');
      return;
    }
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setResult(null);
      setVisionError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleAnalyzeScreenshot = async () => {
    if (!imagePreview) return;

    if (!AIVoiceService.hasActiveApiKey()) {
      setShowApiKeyInput(true);
      return;
    }

    setIsAnalyzing(true);
    setVisionError(null);

    try {
      const res = await AIVoiceService.analyzeScreenshot(imagePreview, imageMime);
      setResult(res);
    } catch (err: any) {
      if (err.message === 'NO_API_KEY') {
        setShowApiKeyInput(true);
      } else {
        setVisionError(err.message || 'Impossible d\'analyser la capture d\'écran.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim().length > 10) {
      AIVoiceService.saveApiKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
      setVisionError(null);
      handleAnalyzeScreenshot();
    }
  };

  const handleSampleClick = (sampleText: string) => {
    setActiveTab('text');
    setInputText(sampleText);
    setIsAnalyzing(true);
    setVisionError(null);
    setTimeout(() => {
      const sanitized = sanitizeUserMessage(sampleText);
      const analysis = analyzeMessageLocally(sanitized);
      setResult(analysis);
      setIsAnalyzing(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }, 150);
  };

  const handleReset = () => {
    setInputText('');
    setImagePreview(null);
    setResult(null);
    setVisionError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Page Header - Clean, Focused */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Diagnostic confidentiel • Zéro conservation de données</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Analyser un message suspect
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Collez le texte d'un SMS, d'un message WhatsApp ou déposez une capture d'écran. XamSafe détecte les pièges d'ingénierie sociale (fausse urgence, vol de code secret, rançon) en préservant strictement votre anonymat.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm">
        <button
          type="button"
          onClick={() => { setActiveTab('text'); setResult(null); }}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'text'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Texte ou SMS</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('screenshot'); setResult(null); }}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'screenshot'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Capture d'écran</span>
        </button>
      </div>

      {/* Privacy Sanitizer Notice */}
      <PiiSanitizerNotice />

      {/* TAB 1: TEXT ANALYSIS */}
      {activeTab === 'text' && (
        <form onSubmit={handleAnalyzeText} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="message-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Message à vérifier :
            </label>
            <textarea
              id="message-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Collez ici le message suspect... (Ex : « Alerte Wave : votre compte est bloqué, veuillez me dicter le code... »)"
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-sm shadow-2xs transition-colors"
            />
          </div>

          {/* Quick sample chips */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 block font-medium">
              Suggestions rapides à tester :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(sample.text)}
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
              disabled={!inputText.trim() || isAnalyzing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none shadow-xs transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Examiner les indices</span>
                </>
              )}
            </button>

            {inputText && (
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
        </form>
      )}

      {/* TAB 2: SCREENSHOT ANALYSIS */}
      {activeTab === 'screenshot' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-colors bg-white/40 dark:bg-slate-900/30 space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Déposez votre capture d'écran ici, ou cliquez pour parcourir
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Capturez une conversation WhatsApp ou un SMS reçu. Formats : PNG, JPG, WebP.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-white dark:bg-[#0C2438] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Capture prête pour analyse
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  title="Supprimer l'image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden max-h-64 bg-slate-950/10 flex justify-center border border-slate-200 dark:border-slate-800">
                <img
                  src={imagePreview}
                  alt="Aperçu de la capture"
                  className="object-contain max-h-64 w-auto"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAnalyzeScreenshot}
                  disabled={isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyse optique...</span>
                    </>
                  ) : (
                    <span>Lancer l'analyse de l'image</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Changer d'image
                </button>
              </div>
            </div>
          )}

          {showApiKeyInput && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clé Gemini requise pour la reconnaissance optique</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Entrez votre clé API gratuite Google AI Studio pour activer la vision multimodale.
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
                  Valider
                </button>
              </div>
            </div>
          )}

          {visionError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {visionError}
            </div>
          )}
        </div>
      )}

      {/* ANALYSIS RESULT */}
      {result && (
        <section
          aria-live="polite"
          className="bg-white dark:bg-[#0C2438] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs"
        >
          {/* Header result badge & title */}
          <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              {result.riskLevel === 'eleve' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Risque élevé : Arnaque très probable</span>
                </div>
              )}
              {result.riskLevel === 'moyen' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Vigilance requise : Éléments suspects</span>
                </div>
              )}
              {result.riskLevel === 'faible' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Risque faible : Aucun piège détecté</span>
                </div>
              )}
              {result.riskLevel === 'indetermine' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Indéterminé : Prudence recommandée</span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              {result.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Indices suspects détectés */}
          {result.detectedClues.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Indices relevés ({result.detectedClues.length})</span>
              </h3>
              <div className="space-y-2">
                {result.detectedClues.map((clue) => (
                  <div
                    key={clue.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs sm:text-sm space-y-1"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">
                      {clue.title}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      {clue.description}
                    </p>
                    {clue.detail && (
                      <p className="text-[11px] text-slate-400 italic pt-0.5">
                        💡 {clue.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations immédiates */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-500" />
              <span>Que devez-vous faire maintenant ?</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              {result.complementaryChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          </div>

          {/* Next steps CTA banner if danger */}
          {result.riskLevel === 'eleve' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Vous avez déjà envoyé de l'argent ou donné votre code secret ?
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
              <span>Bibliothèque des arnaques fréquentes ({MESSAGE_ATTACK_SAMPLES.length} cas réels)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Entraînez-vous à repérer les prétextes Wave, WhatsApp, fausses tombolas et bourses.
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

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500 flex items-center gap-1">
                        {sample.channel === 'WhatsApp' ? (
                          <MessageSquare className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <PhoneCall className="w-3 h-3 text-blue-500" />
                        )}
                        <span>{sample.channel} • {sample.categoryLabel}</span>
                      </span>
                      {sample.isDanger ? (
                        <span className="text-[10px] font-bold text-red-600 uppercase">Piège</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Officiel</span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-950 dark:text-white leading-snug">
                      {sample.title}
                    </h3>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs italic text-slate-700 dark:text-slate-300">
                      « {sample.text} »
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        <strong>Piège :</strong> {sample.attackerTactics}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                        🚩 {sample.trapIndicator}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSampleClick(sample.text)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Tester ce message</span>
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
