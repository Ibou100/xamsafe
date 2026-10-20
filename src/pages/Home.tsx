import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getScamsCatalog } from '../data/scams';
import { VoiceAssistant } from '../components/VoiceAssistant';
import {
  Search,
  Link2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Lock,
  Zap,
  Mic,
  Award,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Phone,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const [voiceOpen, setVoiceOpen] = useState(false);

  // 6 representative real-world scams targeting West African users
  const featuredScams = getScamsCatalog().slice(0, 6);

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* HERO SECTION - Minimalist, Authoritative, Purpose-Driven */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#071724]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Trust Meta Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.common.noAccountNeeded}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
              {t.home.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t.home.heroSubtitle}
            </p>

            {/* Primary Action Console: Clean 3-Card Interactive Hub */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto text-left">
              {/* Option 1: Analyser un message */}
              <Link
                to="/analyser-message"
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {t.common.analyzeBtn}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {language === 'wo'
                        ? 'SMS Wave, Orange Money walla bataaxal WhatsApp'
                        : 'SMS Wave, Orange Money, alerte de blocage ou code secret'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                  <span>{language === 'wo' ? 'Saytu léegi' : 'Lancer l\'analyse'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Option 2: Vérifier une URL */}
              <Link
                to="/verifier-url"
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {language === 'wo' ? 'Saytu lient web' : 'Vérifier un lien (URL)'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {language === 'wo'
                        ? 'Xoolal bu baax lient bi bala nga ciy bës'
                        : 'Détecte les faux sites Wave, Orange ou banques avant de cliquer'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                  <span>{language === 'wo' ? 'Xool lient bi' : 'Examiner le lien'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Option 3: Assistant vocal */}
              <button
                type="button"
                onClick={() => setVoiceOpen(true)}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                    <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {language === 'wo' ? 'Waxal ci micro' : 'Assistant vocal'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {language === 'wo'
                        ? 'Français walla Wolof. Waxal ni la neexe'
                        : 'Posez votre question à voix haute en Français ou en Wolof'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                  <span>{language === 'wo' ? 'Bësal te wax' : 'Activer le micro'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Micro Guarantees Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                {t.common.proofMobile}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                {t.common.proofLocal}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                {t.common.proofInstant}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EMERGENCY PROTOCOL STRIP - Calming, Authoritative, Urgent */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 dark:border-red-950/80 bg-red-50/60 dark:bg-red-950/20 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-red-950 dark:text-red-200">
                {t.home.lostMoneyTitle}
              </h2>
              <p className="text-xs sm:text-sm text-red-800/90 dark:text-red-300 leading-relaxed">
                {t.home.lostMoneyText}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-red-900 dark:text-red-300">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-red-600" />
                  Wave : <strong>200600</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-red-600" />
                  Orange Money : <strong>1441</strong>
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/urgence-victime"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
          >
            <span>{t.home.lostMoneyBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CURATED SCAM REPOSITORY (Les pièges les plus fréquents) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {t.home.commonScamsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.home.commonScamsSubtitle}
            </p>
          </div>

          <Link
            to="/arnaques"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>{t.common.learnBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredScams.map((scam) => {
            const isWo = language === 'wo' && scam.wolofTranslation;
            const title = isWo ? scam.wolofTranslation!.title : scam.title;
            const summary = isWo ? scam.wolofTranslation!.summary : scam.summary;
            const categoryLabel = isWo && scam.wolofTranslation?.categoryLabel
              ? scam.wolofTranslation.categoryLabel
              : scam.category.replace('-', ' ');
            const exampleText = isWo && scam.wolofTranslation?.exampleText
              ? scam.wolofTranslation.exampleText
              : scam.fictionalExample.text;

            return (
              <Link
                key={scam.id}
                to={`/arnaques/${scam.id}`}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {scam.lastVerifiedDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {summary}
                  </p>

                  {/* Clean micro-quote of real trap */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-2">
                    « {exampleText} »
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <span>{t.common.readMore}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE MODULES (Outils pratiques & Entraînement) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            {t.common.toolsSectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.common.toolsSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Simulateur */}
          <Link
            to="/simulateur"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {t.common.tool2Title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.common.tool2Desc}
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-700 dark:text-amber-400 gap-1">
              <span>{t.common.tool2Btn}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Quiz */}
          <Link
            to="/quiz"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t.common.tool3Title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.common.tool3Desc}
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-blue-700 dark:text-blue-400 gap-1">
              <span>{t.common.tool3Btn}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Sécuriser ses comptes */}
          <Link
            to="/securiser-comptes"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {language === 'wo' ? 'Aar samay kont' : 'Guides de Sécurisation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'wo'
                  ? 'Kompant bu nekk ak ni ngay aare sa kod ak sa telefon'
                  : 'Activez la double authentification sur WhatsApp et blindez vos codes PIN Wave & OM.'}
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1">
              <span>{language === 'wo' ? 'Xoolal guide yi' : 'Consulter les guides'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ETHICS & INSTITUTIONAL REPORTING (DSC / DGPN) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 bg-slate-50/50 dark:bg-[#0A1A28] grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {t.common.ethicsBadge}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
              {t.common.ethicsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.common.ethicsIntro}
            </p>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t.common.ethicsPoint1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t.common.ethicsPoint2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t.common.ethicsPoint3}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.common.policeTitle}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.common.policeDesc}
            </p>
            <div className="pt-1">
              <a
                href="https://signalementcyber.dgpn.sn/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                <span>{t.common.policeBtn}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Assistant Modal */}
      <VoiceAssistant isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
};
