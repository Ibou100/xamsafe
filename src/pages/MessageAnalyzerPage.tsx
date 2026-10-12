import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeMessageLocally, sanitizeUserMessage } from '../services/messageAnalyzer';
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
} from 'lucide-react';

export const MessageAnalyzerPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pre-configured test scenarios for user convenience
  const sampleMessages = [
    {
      label: 'Faux agent Wave (Code SMS)',
      text: 'Bonjour, ici le service technique Wave. Pour éviter la suspension immédiate de votre compte dans 15 minutes, veuillez nous dicter le code de vérification reçu par SMS.',
    },
    {
      label: 'Faux virement reçu',
      text: 'Transfert reçu de 50.000 FCFA de Amadou D. Nouveau solde: 52.450 FCFA. Suivi de l\'appel suppliant de renvoyer l\'argent par erreur de numéro.',
    },
    {
      label: 'Tombola Sonatel',
      text: 'Félicitations ! Votre numéro a été tiré au sort pour la Promo Sonatel 2026. Vous gagnez 5.000.000 FCFA. Envoyez 20.000 FCFA de frais d\'huissier pour débloquer votre lot.',
    },
    {
      label: 'Message anodin habituel',
      text: 'Salam mon frère, j\'espère que tu vas bien et que la famille se porte à merveille. On se voit après la prière du vendredi chez les parents inchaAllah.',
    },
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    // Micro-delay to let UI reflect processing state smoothly
    setTimeout(() => {
      const sanitized = sanitizeUserMessage(inputText);
      const analysis = analyzeMessageLocally(sanitized);
      setResult(analysis);
      setIsAnalyzing(false);
    }, 250);
  };

  const handleSampleClick = (sampleText: string) => {
    setInputText(sampleText);
    setResult(null);
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Search className="w-3.5 h-3.5" />
          <span>Moteur local d'analyse heuristique</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Analyser un message suspect
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Collez le texte d'un SMS, d'un message WhatsApp ou d'une publication suspecte. Notre outil examine les signaux d'alarme typiques (fausse urgence, demande de code secret, piège USSD, promesses financières) sans jamais transmettre ni enregistrer votre texte.
        </p>
      </div>

      {/* Privacy reminder notice */}
      <PiiSanitizerNotice />

      {/* Form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="message-input" className="block text-sm font-bold text-slate-900 dark:text-white">
            Texte du message à examiner :
          </label>
          <textarea
            id="message-input"
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Exemple : « Alerte Wave : votre compte est bloqué sous 15 minutes. Veuillez me dicter votre code à 4 chiffres... »"
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs transition-colors"
          />
        </div>

        {/* Quick sample pills */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Ou essayez avec un exemple typique :
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!inputText.trim() || isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-600/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyse en cours...' : 'Examiner les indices'}</span>
          </button>

          {inputText && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </form>

      {/* ANALYSIS RESULT */}
      {result && (
        <section
          aria-live="polite"
          className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn"
        >
          {/* Header result badge & title */}
          <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {result.riskLevel === 'eleve' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Niveau de risque : Élevé (Arnaque probable)</span>
                </div>
              )}
              {result.riskLevel === 'moyen' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Niveau de risque : Modéré (Vigilance requise)</span>
                </div>
              )}
              {result.riskLevel === 'faible' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Niveau de risque : Estimé faible</span>
                </div>
              )}
              {result.riskLevel === 'indetermine' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Niveau de risque : Indéterminé</span>
                </div>
              )}

              <span className="text-xs text-slate-400 font-mono">
                Moteur : Analyse heuristique locale 100% privée
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {result.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Indices suspects détectés */}
          {result.detectedClues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Indices suspects détectés ({result.detectedClues.length})</span>
              </h3>
              <div className="space-y-3">
                {result.detectedClues.map((clue) => (
                  <div
                    key={clue.id}
                    className="p-4 rounded-xl border border-red-200/80 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-1 text-sm"
                  >
                    <div className="font-bold text-red-900 dark:text-red-300">
                      {clue.title}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      {clue.description}
                    </p>
                    {clue.detail && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                        💡 {clue.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Éléments rassurants éventuels */}
          {result.reassuringClues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Éléments rassurants constatés</span>
              </h3>
              <ul className="space-y-2">
                {result.reassuringClues.map((clue) => (
                  <li
                    key={clue.id}
                    className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 flex items-start gap-2"
                  >
                    <span className="text-emerald-600 font-bold">✓</span>
                    <div>
                      <strong>{clue.title} : </strong>
                      <span>{clue.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Limites de l'analyse et avertissement honnête */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Limites importantes de cette analyse :</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {result.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Vérifications complémentaires */}
          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Vérifications immédiates à effectuer :
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              {result.complementaryChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          </div>

          {/* Next steps CTA banner */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Vous avez déjà transmis un code ou validé un transfert ?
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/urgence-victime"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Que faire maintenant ? (Urgence)</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
