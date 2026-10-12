import React, { useState } from 'react';
import { INITIAL_QUIZ_QUESTIONS } from '../data/quizQuestions';
import { useLanguage } from '../context/LanguageContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Check,
  Sparkles,
} from 'lucide-react';

export const CyberQuizPage: React.FC = () => {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; isCorrect: boolean; category: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalQuestions = INITIAL_QUIZ_QUESTIONS.length;
  const currentQ = INITIAL_QUIZ_QUESTIONS[currentQuestionIndex];

  // Dynamic question & options according to selected language if available
  const displayQuestion =
    language === 'wo' && currentQ.wolofTranslation
      ? currentQ.wolofTranslation.question
      : currentQ.question;

  const displayOptions =
    language === 'wo' && currentQ.wolofTranslation
      ? currentQ.wolofTranslation.options
      : currentQ.options;

  const displayExplanation =
    language === 'wo' && currentQ.wolofTranslation
      ? currentQ.wolofTranslation.explanation
      : currentQ.explanation;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionIndex === null || isAnswered) return;
    setIsAnswered(true);

    const isCorrect = selectedOptionIndex === currentQ.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, isCorrect, category: currentQ.category },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers([]);
    setIsCompleted(false);
  };

  // Group missed categories to give tailored advice
  const missedCategories = userAnswers
    .filter((a) => !a.isCorrect)
    .map((a) => a.category);
  const uniqueMissedCategories = Array.from(new Set(missedCategories));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Évaluation pédagogique sans inscription</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Quiz de cybersécurité : Testez vos réflexes
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          30 questions pratiques inspirées du quotidien au Sénégal (Wave, Orange Money, WhatsApp, faux transferts, codes USSD). Vos résultats restent strictement dans la mémoire de votre session.
        </p>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Question {currentQuestionIndex + 1} sur {totalQuestions}</span>
              <span>Score actuel : {score} point{score > 1 ? 's' : ''}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* QUESTION CARD */}
          <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Thème : {currentQ.category}
                </span>
                {language === 'wo' && currentQ.wolofTranslation && (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Traduction Wolof active
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white leading-relaxed">
                {displayQuestion}
              </h2>
            </div>

            {/* OPTIONS */}
            <div className="space-y-3">
              {displayOptions.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                let btnStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-[#0F2B43]';

                if (isAnswered) {
                  if (idx === currentQ.correctAnswerIndex) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500';
                  } else if (isSelected && idx !== currentQ.correctAnswerIndex) {
                    btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 ring-2 ring-red-500';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 ${btnStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {isAnswered && idx === currentQ.correctAnswerIndex ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : isAnswered && isSelected && idx !== currentQ.correctAnswerIndex ? (
                        '✕'
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* ACTION: VALIDATE OR EXPLANATION */}
            {!isAnswered ? (
              <div>
                <button
                  type="button"
                  disabled={selectedOptionIndex === null}
                  onClick={handleConfirmAnswer}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
                >
                  Confirmer ma réponse
                </button>
              </div>
            ) : (
              <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
                {/* Result feedback */}
                <div
                  className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                    selectedOptionIndex === currentQ.correctAnswerIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
                  }`}
                >
                  {selectedOptionIndex === currentQ.correctAnswerIndex ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-sm">
                    <div className="font-bold">
                      {selectedOptionIndex === currentQ.correctAnswerIndex
                        ? 'Bonne réponse !'
                        : 'Mauvaise réponse.'}
                    </div>
                    <p className="leading-relaxed">{displayExplanation}</p>
                  </div>
                </div>

                {/* Practical prevention tip */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Bon réflexe à retenir :
                  </span>
                  <p>{currentQ.preventionTip}</p>
                </div>

                {/* Next button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 transition-colors"
                  >
                    <span>
                      {currentQuestionIndex < totalQuestions - 1
                        ? 'Question suivante'
                        : 'Voir mes résultats finaux'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FINAL SCORE & TAILORED ADVICE */
        <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 space-y-8 shadow-sm text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              Quiz complété !
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Voici votre bilan de connaissances en cybersécurité :
            </p>
          </div>

          {/* Score Badge */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F2B43] border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-2">
            <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
              {score} / {totalQuestions}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {score >= 25
                ? 'Expert en vigilance numérique !'
                : score >= 18
                ? 'Bon niveau, quelques pièges à éviter'
                : 'Attention aux manipulations courantes'}
            </div>
          </div>

          {/* Tailored recommendations based on missed categories */}
          {uniqueMissedCategories.length > 0 && (
            <div className="text-left p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3 max-w-2xl mx-auto">
              <h3 className="font-bold text-amber-950 dark:text-amber-200 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Thèmes à réviser en priorité d'après vos réponses :</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {uniqueMissedCategories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Consultez notre bibliothèque de fiches et notre guide « Sécuriser mes comptes » pour renforcer votre protection sur ces points précis.
              </p>
            </div>
          )}

          {/* Zero server storage guarantee */}
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Vos réponses et votre score ne sont pas conservés sur nos serveurs.</span>
          </div>

          {/* Restart button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recommencer le quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
