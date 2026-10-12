import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_SCAMS } from '../data/scams';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Lock,
  ExternalLink,
  Award,
  Zap,
} from 'lucide-react';
export const Home: React.FC = () => {
  const { t } = useLanguage();

  // Highlight 6 popular Senegalese scams for the homepage grid
  const featuredScams = INITIAL_SCAMS.slice(0, 6);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-16 lg:pb-20 bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-[#0C2438] dark:via-[#091F30] dark:to-[#071724] border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Subtle decorative security grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#12B981_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Citizen badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.common.noAccountNeeded}</span>
            </div>

            {/* Main title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15]">
              {t.home.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t.home.heroSubtitle}
            </p>

            {/* 3 Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 max-w-xl mx-auto">
              <Link
                to="/analyser-message"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Search className="w-5 h-5" />
                <span>{t.common.analyzeBtn}</span>
              </Link>

              <Link
                to="/urgence-victime"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 shadow-lg shadow-red-600/25 transition-all"
              >
                <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>{t.common.emergencyBtn}</span>
              </Link>

              <Link
                to="/arnaques"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
              >
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.common.learnBtn}</span>
              </Link>
            </div>

            {/* Micro proof bar */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                Orange Money & Wave
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                Traitement local confidentiel
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500" />
                Résultats instantanés
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: TU AS DÉJÀ PERDU DE L'ARGENT ? (URGENT PATHWAY BANNER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800/60 text-red-200 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Priorité absolue • Urgence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.home.lostMoneyTitle}
            </h2>
            <p className="text-red-100 text-sm sm:text-base leading-relaxed">
              {t.home.lostMoneyText}
            </p>
          </div>

          <Link
            to="/urgence-victime"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-red-950 bg-white hover:bg-red-50 active:scale-95 shadow-lg transition-all"
          >
            <span>{t.home.lostMoneyBtn}</span>
            <ArrowRight className="w-5 h-5 text-red-600" />
          </Link>
        </div>
      </section>

      {/* SECTION: LES ARNAQUES LES PLUS FRÉQUENTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Bibliothèque pédagogique
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t.home.commonScamsTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
              {t.home.commonScamsSubtitle}
            </p>
          </div>

          <Link
            to="/arnaques"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 group"
          >
            <span>Voir les 15 fiches détaillées</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid of 6 featured cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredScams.map((scam) => (
            <div
              key={scam.id}
              className="bg-white dark:bg-[#0F2B43] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {scam.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">Vérifié {scam.lastVerifiedDate}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                  {scam.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {scam.summary}
                </p>

                {/* Example preview snippet */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/80 text-xs italic text-slate-600 dark:text-slate-300">
                  <span className="font-semibold not-italic block text-slate-500 mb-1">
                    Exemple fictif ({scam.fictionalExample.channel}) :
                  </span>
                  {scam.fictionalExample.text.slice(0, 120)}...
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/arnaques/${scam.id}`}
                  className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>{t.common.readMore}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs text-slate-400">{scam.stepByStep.length} étapes</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: LES OUTILS CLÉS EN UN CLIN D'ŒIL */}
      <section className="bg-slate-100/70 dark:bg-[#0A1D2E] py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Agir, tester et s'entraîner sans aucun compte
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Des outils interactifs conçus pour être simples d'accès sur tout téléphone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Tool 1: Analyser un message */}
            <div className="bg-white dark:bg-[#0F2B43] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Analyseur de message suspect
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Collez un SMS ou un message WhatsApp. Notre moteur heuristique local détecte les demandes de code secret, la fausse urgence et les indices suspects sans envoyer vos données sur un serveur.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/analyser-message"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                >
                  <span>Analyser un message</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tool 2: Simulateur de phishing */}
            <div className="bg-white dark:bg-[#0F2B43] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Simulateur de phishing interactif
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Entraînez-vous sur 6 scénarios réels (faux SMS Wave, faux gain Sonatel, faux recrutement ONU). Repérez les pièges en conditions réelles sans aucun danger.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/simulateur"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                >
                  <span>Lancer une simulation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tool 3: Quiz de cybersécurité */}
            <div className="bg-white dark:bg-[#0F2B43] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Quiz de cybersécurité (30 questions)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Testez vos réflexes sur le mobile money, WhatsApp, les faux transferts et les mots de passe. Correction immédiate et explications pédagogiques sans inscription.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/quiz"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                >
                  <span>Commencer le quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ÉTHIQUE ET INDÉPENDANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0F2B43] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Engagement citoyen
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Une plateforme 100% libre, transparente et respectueuse de vos données
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              XamSafe a été développée comme un bien public numérique. Nous appliquons le principe fondamental de minimisation des données :
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Aucun compte utilisateur</strong> requis pour utiliser l'intégralité du site.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Aucun stockage serveur</strong> de vos messages ou adresses analysés.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Aucune affiliation commerciale</strong> avec les opérateurs ou les banques.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Canaux officiels de signalement judiciaire</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Si vous êtes victime d'une infraction pénale, XamSafe vous guide pour réunir vos preuves, mais la plainte doit être déposée directement sur la plateforme officielle de la Police Nationale du Sénégal :
            </p>
            <a
              href="https://signalementcyber.dgpn.sn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <span>Accéder à signalementcyber.dgpn.sn</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
