import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeUrlLocally } from '../services/urlAnalyzer';
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
} from 'lucide-react';

export const UrlAnalyzerPage: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleUrls = [
    {
      label: 'Faux clone Wave (.xyz)',
      url: 'https://wave-senegal-connexion.xyz/login?token=otp',
    },
    {
      label: 'Adresse IP brute non chiffrée',
      url: 'http://45.33.32.1/orange-money/verifier',
    },
    {
      label: 'Lien court suspect',
      url: 'https://bit.ly/sonatel-cadeau-2026',
    },
    {
      label: 'Site officiel Wave',
      url: 'https://www.wave.com/fr/sn/',
    },
  ];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeUrlLocally(inputUrl);
      setResult(res);
      setIsAnalyzing(false);
    }, 200);
  };

  const handleSampleClick = (url: string) => {
    setInputUrl(url);
    setResult(null);
  };

  const handleReset = () => {
    setInputUrl('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Link2 className="w-3.5 h-3.5" />
          <span>Vérificateur syntaxique sécurisé (Sans SSRF)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Vérifier les indices d'une URL suspecte
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Examinez la structure d'un lien internet avant de cliquer. Notre outil décortique le nom de domaine, les sous-domaines trompeurs, le chiffrement et les marques imitées, sans jamais visiter l'URL sur notre serveur.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Analyse 100% passive et inoffensive :</span>
          <p className="leading-relaxed">
            XamSafe ne charge pas la page web distante, n'exécute aucun script externe et ne transmet pas l'URL à des tiers sans votre accord. L'examen est purement syntaxique pour votre sécurité.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleCheck} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url-input" className="block text-sm font-bold text-slate-900 dark:text-white">
            Adresse web (URL) à examiner :
          </label>
          <input
            id="url-input"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Ex : https://wave-connexion-senegal.xyz ou http://..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs transition-colors"
          />
        </div>

        {/* Quick samples */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Tester avec un exemple de lien :
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleUrls.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample.url)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!inputUrl.trim() || isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-600/20 transition-all"
          >
            <Link2 className="w-4 h-4" />
            <span>{isAnalyzing ? 'Vérification syntaxique...' : 'Examiner cette adresse'}</span>
          </button>

          {inputUrl && (
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

      {/* RESULT */}
      {result && (
        <section
          aria-live="polite"
          className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-fadeIn"
        >
          {/* Verdict Badge */}
          <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              {result.riskLevel === 'dangereux' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Verdict : Lien très suspect / Risque élevé</span>
                </div>
              )}
              {result.riskLevel === 'suspect' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Verdict : Suspect / Prudence recommandée</span>
                </div>
              )}
              {result.riskLevel === 'faible' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Verdict : Domaine officiel connu</span>
                </div>
              )}
              {result.riskLevel === 'indetermine' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Verdict : Indéterminé</span>
                </div>
              )}

              <span className="text-xs text-slate-400 font-mono">
                {result.isHttps ? '🔒 HTTPS' : '⚠️ HTTP (Non chiffré)'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all border border-slate-200 dark:border-slate-800">
              {result.url}
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {result.recommendation}
            </p>
          </div>

          {/* Breakdown cards: Protocol, Hostname, TLD, Impersonation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block">Protocole</span>
              <span className={`font-bold ${result.isHttps ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.protocol.toUpperCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block">Nom d'hôte</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {result.hostname}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block">Extension (TLD)</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {result.tld || 'Non spécifié'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block">Marque ciblée</span>
              <span className={`font-bold ${result.impersonatedBrand ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
                {result.impersonatedBrand || 'Aucune détectée'}
              </span>
            </div>
          </div>

          {/* Detailed Clues */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Indices techniques relevés :
            </h3>
            <div className="space-y-2">
              {result.clues.map((clue) => (
                <div
                  key={clue.id}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm space-y-1 ${
                    clue.type === 'danger'
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300'
                      : clue.type === 'warning'
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300'
                      : clue.type === 'reassuring'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold">{clue.title}</div>
                  <p>{clue.description}</p>
                  {clue.detail && <p className="italic text-xs pt-1 opacity-80">{clue.detail}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Pedagogical Notes on HTTPS vs Legitimacy */}
          {result.pedagogicalNotes.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Rappel de sécurité fondamental :
              </span>
              {result.pedagogicalNotes.map((note, idx) => (
                <p key={idx} className="leading-relaxed">{note}</p>
              ))}
            </div>
          )}

          {/* Action Links */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Vous avez déjà renseigné des identifiants sur cette page ?
            </span>
            <Link
              to="/urgence-victime"
              className="font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              Consulter la procédure d'urgence
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
