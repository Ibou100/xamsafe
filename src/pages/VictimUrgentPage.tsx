import React, { useState } from 'react';
import { INITIAL_EMERGENCY_PATHS } from '../data/emergencyPaths';
import {
  AlertTriangle,
  Phone,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  HeartHandshake,
} from 'lucide-react';

export const VictimUrgentPage: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    INITIAL_EMERGENCY_PATHS[0].id
  );
  const [copiedProof, setCopiedProof] = useState(false);

  const activeScenario =
    INITIAL_EMERGENCY_PATHS.find((s) => s.id === selectedScenarioId) ||
    INITIAL_EMERGENCY_PATHS[0];

  const handleCopyProofChecklist = () => {
    const textToCopy = `=== FICHE DE PREUVES XAMSAFE — SITUATION : ${activeScenario.title.toUpperCase()} ===\n\n` +
      `Éléments à réunir pour mon dossier de réclamation et plainte officielle :\n` +
      activeScenario.evidenceToKeep.map((item, i) => `[ ] ${i + 1}. ${item}`).join('\n') +
      `\n\nCanaux officiels au Sénégal :\n` +
      activeScenario.officialChannels.map((c) => `- ${c.name} : ${c.contact}`).join('\n') +
      `\n\nPortail officiel de signalement Police Nationale (DSC) : https://signalementcyber.dgpn.sn/\n` +
      `Rappel : Ne payez jamais de faux service de récupération sur les réseaux sociaux.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedProof(false);
    setTimeout(() => setCopiedProof(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Top Crisis Header - Authoritative & Calming */}
      <div className="rounded-2xl border border-red-200 dark:border-red-950/80 bg-red-50/70 dark:bg-red-950/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>Assistance d'urgence citoyenne immédiate • Sans inscription</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Je suis victime : que faire maintenant ?
        </h1>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
          Sélectionnez votre situation ci-dessous pour obtenir immédiatement les démarches prioritaires à faire dans l'heure, les numéros officiels à contacter pour bloquer les flux et la liste des preuves à réunir.
        </p>

        {/* Emergency Hotlines Strip - One-tap direct dialing on mobile */}
        <div className="pt-3 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 border-t border-red-200/80 dark:border-red-900/50">
          <span className="text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm w-full sm:w-auto">Appel gratuit immédiat :</span>
          <a
            href="tel:200600"
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold active:bg-red-50 dark:active:bg-red-950/40 transition-colors cursor-pointer"
            aria-label="Appeler gratuitement le service client Wave au 200600"
          >
            <Phone className="w-4 h-4 text-red-600 shrink-0" />
            <span>Wave : <strong>200600</strong></span>
          </a>
          <a
            href="tel:1441"
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold active:bg-red-50 dark:active:bg-red-950/40 transition-colors cursor-pointer"
            aria-label="Appeler gratuitement Orange Money au 1441"
          >
            <Phone className="w-4 h-4 text-red-600 shrink-0" />
            <span>Orange Money : <strong>1441</strong></span>
          </a>
          <a
            href="tel:17"
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold active:bg-red-50 dark:active:bg-red-950/40 transition-colors cursor-pointer"
            aria-label="Appeler la Police Nationale au 17"
          >
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>Police DSC : <strong>17</strong></span>
          </a>
        </div>
      </div>

      {/* Grid of Situations (A to J) - Mobile dropdown + Desktop grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Sélectionnez votre situation :
          </h2>
          <span className="text-xs text-slate-500 font-medium sm:hidden">
            Procédure {activeScenario.letter} active
          </span>
        </div>

        {/* Mobile quick scenario selector: Instant 1-tap, prevents vertical stacking of 10 cards */}
        <div className="sm:hidden">
          <label htmlFor="mobile-scenario-select" className="sr-only">Sélectionner votre situation d'urgence</label>
          <select
            id="mobile-scenario-select"
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="w-full p-3.5 min-h-[48px] rounded-xl border-2 border-red-500/50 bg-white dark:bg-[#0C2438] text-slate-950 dark:text-white font-bold text-base shadow-sm focus:ring-2 focus:ring-red-500"
          >
            {INITIAL_EMERGENCY_PATHS.map((scen) => (
              <option key={scen.id} value={scen.id}>
                {scen.letter}. {scen.title}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5" role="tablist">
          {INITIAL_EMERGENCY_PATHS.map((scen) => (
            <button
              key={scen.id}
              role="tab"
              aria-selected={scen.id === selectedScenarioId}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 cursor-pointer min-h-[72px] ${
                scen.id === selectedScenarioId
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#0C2438] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                    scen.id === selectedScenarioId
                      ? 'bg-white/20 dark:bg-black/20 text-current'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {scen.letter}
                </span>
                {scen.id === selectedScenarioId && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </div>
              <span className="font-semibold text-xs leading-snug line-clamp-2">
                {scen.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE PATHWAY DETAILS */}
      <div className="bg-white dark:bg-[#0C2438] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Scenario Header */}
        <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-600 dark:text-red-400">
            <span>Procédure {activeScenario.letter}</span>
            <span>•</span>
            <span>Protocole vérifié</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
            {activeScenario.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {activeScenario.subtitle}
          </p>

          {/* Reassurance */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {activeScenario.reassuringGreeting}
            </p>
          </div>
        </div>

        {/* 1. Actions prioritaires immédiates */}
        <section className="p-4 sm:p-5 bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-2.5">
          <h3 className="text-sm font-bold text-red-950 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>À faire immédiatement (dans l'heure) :</span>
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-red-900 dark:text-red-200">
            {activeScenario.immediatePriorityActions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-2"></span>
                <span className="leading-relaxed">{act}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 2. Instructions numérotées */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Démarches détaillées pas-à-pas :
          </h3>
          <div className="space-y-3">
            {activeScenario.numberedSteps.map((step) => (
              <div
                key={step.step}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                  {step.action}
                </p>
                {step.details && (
                  <p className="text-[11px] text-slate-500 italic pl-8">
                    💡 {step.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. Fiche de preuves à réunir */}
        <section className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Preuves à conserver pour l'opérateur et la police</span>
            </h3>
            <button
              type="button"
              onClick={handleCopyProofChecklist}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto"
            >
              {copiedProof ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copié dans le presse-papier !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier la liste de preuves</span>
                </>
              )}
            </button>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {activeScenario.evidenceToKeep.map((item, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded-lg bg-white dark:bg-[#0C2438] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-start gap-2"
              >
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Canaux officiels à contacter */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contacts officiels pour cette situation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeScenario.officialChannels.map((channel, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {channel.name}
                  </div>
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold pt-1 break-all">
                    {channel.contact}
                  </div>
                </div>

                {channel.officialUrl && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={channel.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Accéder au portail officiel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. Avertissement anti-recovery scams */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mise en garde contre les faux experts de récupération sur les réseaux :</span>
          </div>
          <p className="leading-relaxed">
            {activeScenario.recoveryScamWarning}
          </p>
        </div>
      </div>
    </div>
  );
};
