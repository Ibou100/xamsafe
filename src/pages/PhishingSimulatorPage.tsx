import React, { useState } from 'react';
import { INITIAL_SIMULATOR_SCENARIOS } from '../data/simulatorScenarios';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Smartphone,
  Info,
  Check,
} from 'lucide-react';

export const PhishingSimulatorPage: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const scenario = INITIAL_SIMULATOR_SCENARIOS[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === INITIAL_SIMULATOR_SCENARIOS.length - 1;

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleValidate = () => {
    if (!selectedOptionId || isSubmitted) return;
    setIsSubmitted(true);

    const chosenOption = scenario.options.find((o) => o.id === selectedOptionId);
    if (chosenOption?.isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentScenarioIndex < INITIAL_SIMULATOR_SCENARIOS.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    }
  };

  const handleRestart = () => {
    setCurrentScenarioIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setScore(0);
  };

  const chosenOption = scenario.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulateur inoffensif d'entraînement interactif</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Simulateur de phishing & arnaques
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Mettez vos réflexes à l'épreuve face à des faux messages réalistes reçus par SMS, WhatsApp ou e-mail. Apprenez à déceler les détails invisibles qui trahissent les escrocs.
        </p>
      </div>

      {/* Safety pedagogical warning */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Avertissement pédagogique :</strong> Tous les scénarios présentés sont des reproductions inoffensives et fictives. Cet outil ne collecte aucun mot de passe, n'envoie aucun message et ne redirige vers aucun site malveillant réel.
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Scénario {currentScenarioIndex + 1} sur {INITIAL_SIMULATOR_SCENARIOS.length}</span>
          <span>Score : {score} / {INITIAL_SIMULATOR_SCENARIOS.length}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{
              width: `${((currentScenarioIndex + 1) / INITIAL_SIMULATOR_SCENARIOS.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* ACTIVE SCENARIO CARD */}
      <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        {/* Title and context */}
        <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span>Canal : {scenario.platform}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
            {scenario.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {scenario.contextDescription}
          </p>
        </div>

        {/* Realistic Phone / Chat Mockup Screen */}
        <div className="max-w-md mx-auto bg-slate-950 rounded-3xl p-3 shadow-xl border-4 border-slate-800 text-white">
          <div className="bg-slate-900 rounded-2xl p-4 space-y-3 font-sans">
            {/* Mockup status bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">{scenario.messageContent.sender}</span>
              <span>{scenario.messageContent.timestamp || 'Maintenant'}</span>
            </div>

            {/* Bubble message */}
            <div className="bg-slate-800/90 text-slate-100 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-slate-700/60 font-mono">
              {scenario.messageContent.body}
            </div>

            <div className="text-[10px] text-center text-slate-500">
              Simulation d'écran XamSafe • Contenu 100% fictif
            </div>
          </div>
        </div>

        {/* Question: Identify the suspicious clues */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Quelle est la bonne analyse de cette situation ?
          </h3>

          <div className="space-y-3">
            {scenario.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let optionStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-[#0F2B43]';

              if (isSubmitted) {
                if (opt.isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500';
                } else if (isSelected && !opt.isCorrect) {
                  optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 ring-2 ring-red-500';
                } else {
                  optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900';
                }
              } else if (isSelected) {
                optionStyle = 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {isSubmitted && opt.isCorrect ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : isSubmitted && isSelected && !opt.isCorrect ? (
                      '✕'
                    ) : (
                      ''
                    )}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation or Result breakdown */}
        {!isSubmitted ? (
          <div>
            <button
              type="button"
              disabled={!selectedOptionId}
              onClick={handleValidate}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
            >
              Valider ma réponse
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
            {/* Feedback on answer */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3 ${
                chosenOption?.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
              }`}
            >
              {chosenOption?.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-sm">
                <div className="font-bold">
                  {chosenOption?.isCorrect ? 'Excellente réponse !' : 'Attention, ce piège a fonctionné !'}
                </div>
                <p className="text-xs sm:text-sm">{chosenOption?.feedback}</p>
              </div>
            </div>

            {/* Reasoning & Protection Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Le raisonnement de sécurité :
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {scenario.reasoning}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Le bon réflexe de protection :
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {scenario.protectionMethod}
                </p>
              </div>
            </div>

            {/* Next or Finish Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isLastScenario ? 'Dernier scénario complété' : 'Prêt pour le cas suivant ?'}
              </span>

              {!isLastScenario ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 transition-colors"
                >
                  <span>Scénario suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recommencer l'entraînement</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
