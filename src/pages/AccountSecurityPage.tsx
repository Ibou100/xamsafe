import React, { useState } from 'react';
import { INITIAL_ACCOUNT_GUIDES } from '../data/accountGuides';
import {
  Shield,
  AlertTriangle,
  ExternalLink,
  Laptop,
  Key,
} from 'lucide-react';

export const AccountSecurityPage: React.FC = () => {
  const [activeGuideId, setActiveGuideId] = useState(INITIAL_ACCOUNT_GUIDES[0].id);

  const activeGuide =
    INITIAL_ACCOUNT_GUIDES.find((g) => g.id === activeGuideId) ||
    INITIAL_ACCOUNT_GUIDES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Guides pas-à-pas • Double authentification & Codes PIN</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Sécuriser mes comptes du quotidien
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Suivez nos pas-à-pas concrets pour activer la double authentification, vérifier les appareils connectés et vous prémunir du piratage sur WhatsApp, Wave, Orange Money, TikTok et vos comptes e-mail.
        </p>
      </div>

      {/* Tabs for the 6 services */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        {INITIAL_ACCOUNT_GUIDES.map((guide) => (
          <button
            key={guide.id}
            role="tab"
            aria-selected={guide.id === activeGuideId}
            onClick={() => setActiveGuideId(guide.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              guide.id === activeGuideId
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0F2B43] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>{guide.service}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE GUIDE CONTENT */}
      <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        {/* Title & Features bar */}
        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Guide de sécurité : {activeGuide.service}
            </h2>
            <span className="text-xs text-slate-400">
              Procédure vérifiée le {activeGuide.lastVerifiedDate}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {activeGuide.features.map((feat, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        {/* 1. Comment activer les protections indispensables */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>1. Activer les protections recommandées</span>
          </h3>

          <div className="space-y-4">
            {activeGuide.protectionSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F2B43] border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {step.title}
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {step.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Vérifier les sessions et appareils connectés */}
        <section className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
          <h3 className="text-lg font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>2. Vérifier si un intrus est déjà connecté (Sessions actives)</span>
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-blue-900 dark:text-blue-300">
            {activeGuide.howToCheckActiveSessions.map((session, idx) => (
              <li key={idx}>{session}</li>
            ))}
          </ul>
        </section>

        {/* 3. Reconnaitre l'usurpation & Récupération */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <h3 className="font-bold text-amber-950 dark:text-amber-200 text-base">
              3. Signaux d'usurpation fréquents
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
              {activeGuide.howToSpotImpersonation.map((spot, idx) => (
                <li key={idx}>{spot}</li>
              ))}
            </ul>
          </section>

          <section className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              4. Procédure de récupération si piraté
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {activeGuide.compromiseRecovery.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* 4. Alerte faux support & lien officiel */}
        <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-2 text-xs sm:text-sm text-red-950 dark:text-red-200">
          <span className="font-bold flex items-center gap-1.5 text-red-900 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Attention aux faux comptes de support :
          </span>
          <p>{activeGuide.fakeSupportWarning}</p>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Documentation officielle du fournisseur :</span>
          <a
            href={activeGuide.officialHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Consulter la page d'aide officielle</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
