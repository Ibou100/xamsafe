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
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-800/70 text-red-200 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Assistance d'urgence citoyenne immédiate</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Je suis victime : que faire maintenant ?
        </h1>
        <p className="text-red-100 text-sm sm:text-base max-w-3xl leading-relaxed">
          Aucun compte ni mot de passe requis. Choisissez votre situation ci-dessous pour obtenir immédiatement les actions prioritaires, les numéros officiels à contacter et la liste des preuves à réunir.
        </p>
      </div>

      {/* Grid of the 10 Situations (A to J) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Sélectionnez votre situation :</span>
          <span className="text-xs font-normal text-slate-500">(10 parcours guidés)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" role="tablist">
          {INITIAL_EMERGENCY_PATHS.map((scen) => (
            <button
              key={scen.id}
              role="tab"
              aria-selected={scen.id === selectedScenarioId}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                scen.id === selectedScenarioId
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-600 ring-2 ring-red-500 shadow-xs'
                  : 'bg-white dark:bg-[#0F2B43] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    scen.id === selectedScenarioId
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {scen.letter}
                </span>
                {scen.id === selectedScenarioId && (
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                )}
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                {scen.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE PATHWAY DETAILS */}
      <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        {/* Scenario Header & Reassuring Greeting */}
        <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-red-600 text-white font-extrabold text-sm flex items-center justify-center">
              {activeScenario.letter}
            </span>
            <span className="text-xs uppercase font-bold text-red-600 dark:text-red-400 tracking-wider">
              Procédure d'urgence guidée
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
            {activeScenario.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {activeScenario.subtitle}
          </p>

          {/* Reassuring greeting */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
              {activeScenario.reassuringGreeting}
            </p>
          </div>
        </div>

        {/* 1. Actions prioritaires immédiates */}
        <section className="p-5 sm:p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-red-950 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Actions prioritaires immédiates (dans l'heure) :</span>
          </h3>
          <ul className="space-y-2">
            {activeScenario.immediatePriorityActions.map((act, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-red-900 dark:text-red-200 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-2"></span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 2. Instructions numérotées */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Instructions détaillées pas-à-pas :
          </h3>
          <div className="space-y-4">
            {activeScenario.numberedSteps.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F2B43] border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                  {step.action}
                </p>
                {step.details && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-10">
                    💡 {step.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. Fiche de preuves à réunir (avec bouton Copier) */}
        <section className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              <span>Fiche des preuves à conserver pour la police & l'opérateur</span>
            </h3>
            <button
              type="button"
              onClick={handleCopyProofChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copiedProof ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Checklist copiée !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier la fiche de preuves</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rassemblez ces documents avant d'appeler ou de vous déplacer au commissariat :
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeScenario.evidenceToKeep.map((item, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#0C2438] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
              >
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Canaux officiels à contacter */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>Canaux officiels vérifiés pour ce cas</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeScenario.officialChannels.map((channel, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#0F2B43] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Contact officiel
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {channel.name}
                  </div>
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold break-all">
                    {channel.contact}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Vérifié {channel.verifiedDate}</span>
                  {channel.officialUrl && (
                    <a
                      href={channel.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      Portail
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Avertissement anti-recovery scams & non-garantie */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-2 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
            <div className="font-bold flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Mise en garde capitale contre les fausses récupérations d'argent :</span>
            </div>
            <p className="leading-relaxed">
              {activeScenario.recoveryScamWarning}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Rappel d'honnêteté et de transparence :
            </span>
            <p>
              La récupération de fonds envoyés à un escroc n'est jamais garantie et dépend de la rapidité de la réaction et de la présence ou non de solde sur le compte récepteur. XamSafe ne facture aucun service et ne promet aucun résultat magique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
