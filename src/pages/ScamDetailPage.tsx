import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getScamsCatalog } from '../data/scams';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';

export const ScamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const scam = getScamsCatalog().find((s) => s.id === id);

  if (!scam) {
    return <Navigate to="/arnaques" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'ariane" className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <Link to="/arnaques" className="hover:underline">Bibliothèque des arnaques</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-xs">{scam.title}</span>
      </nav>

      {/* Back button */}
      <div>
        <Link
          to="/arnaques"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux fiches</span>
        </Link>
      </div>

      {/* Main card */}
      <article className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        {/* Title & Metadata */}
        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {scam.category.replace('-', ' ')}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Vérifié le {scam.lastVerifiedDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white leading-tight">
            {scam.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {scam.summary}
          </p>
        </div>

        {/* 1. Exemple fictif identifié */}
        <section className="p-5 bg-amber-50 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
            <span>Exemple fictif réaliste ({scam.fictionalExample.channel})</span>
            <span>Émetteur : {scam.fictionalExample.sender}</span>
          </div>
          <blockquote className="italic text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed border-l-2 border-amber-400 pl-3">
            {scam.fictionalExample.text}
          </blockquote>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 block pt-1">
            *Exemple pédagogique inoffensif adapté au contexte des transactions au Sénégal.
          </span>
        </section>

        {/* 2. Déroulement étape par étape */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Comment se déroule l'arnaque étape par étape
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {scam.stepByStep.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>

        {/* 3. Manipulation psychologique */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Méthodes de manipulation psychologique utilisées
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {scam.psychologicalTactics.map((tac, idx) => (
              <li key={idx}>{tac}</li>
            ))}
          </ul>
        </section>

        {/* 4. Signes d'alerte */}
        <section className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-3">
          <h2 className="text-lg font-bold text-red-950 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Signes d'alerte à reconnaître immédiatement
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-red-900 dark:text-red-200">
            {scam.alertSigns.map((sign, idx) => (
              <li key={idx}>{sign}</li>
            ))}
          </ul>
        </section>

        {/* 5. But de l'attaquant & Erreurs à éviter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Ce que l'escroc cherche à obtenir
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {scam.attackerGoal}
            </p>
          </section>

          <section className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Les erreurs à éviter
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {scam.mistakesToAvoid.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* 6. Comment se protéger */}
        <section className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-3">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Comment se protéger (Conseils clés)
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
            {scam.howToProtect.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>

        {/* 7. Démarche d'urgence */}
        <section className="p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Que faire si vous êtes déjà tombé dans le piège ?
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
            {scam.emergencyAction.map((act, idx) => (
              <li key={idx}>{act}</li>
            ))}
          </ul>
          <div className="pt-2">
            <Link
              to="/urgence-victime"
              className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Accéder au guide complet pour victimes</span>
            </Link>
          </div>
        </section>

        {/* Sources */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Sources fiables & vérifiées :
          </h3>
          <div className="flex flex-wrap gap-4">
            {scam.reliableSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{source.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};
