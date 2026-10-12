import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_SCAMS } from '../data/scams';
import type { ScamCard } from '../types';
import {
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const ScamsLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeScamModal, setActiveScamModal] = useState<ScamCard | null>(null);

  const categories = [
    { id: 'all', label: 'Toutes les arnaques' },
    { id: 'mobile-money', label: 'Mobile money' },
    { id: 'sms', label: 'SMS frauduleux' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'reseaux-sociaux', label: 'Réseaux sociaux' },
    { id: 'achats', label: 'Achats en ligne' },
    { id: 'emploi', label: 'Faux emplois' },
    { id: 'investissement', label: 'Investissements & Tontines' },
    { id: 'usurpation', label: 'Usurpation d\'identité' },
    { id: 'famille', label: 'Ciblant les familles' },
    { id: 'email', label: 'E-mail' },
  ];

  const filteredScams = useMemo(() => {
    return INITIAL_SCAMS.filter((scam) => {
      const matchesCategory =
        selectedCategory === 'all' || scam.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        scam.title.toLowerCase().includes(q) ||
        scam.summary.toLowerCase().includes(q) ||
        scam.attackerGoal.toLowerCase().includes(q) ||
        scam.fictionalExample.text.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Encyclopédie citoyenne de prévention</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bibliothèque des arnaques au Sénégal
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          Consultez nos 15 fiches pédagogiques détaillées pour comprendre comment opèrent les cyberescrocs, reconnaître leurs techniques de manipulation et adopter les bons réflexes de protection.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé (ex: Wave, SMS, huissier, code, avance)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 text-sm shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{filteredScams.length} fiche{filteredScams.length > 1 ? 's' : ''} trouvée{filteredScams.length > 1 ? 's' : ''}</span>
        <span>Exemples 100% fictifs adaptés au Sénégal</span>
      </div>

      {/* Grid of scam cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScams.map((scam) => (
          <article
            key={scam.id}
            className="bg-white dark:bg-[#0F2B43] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {scam.category.replace('-', ' ')}
                </span>
                <span className="text-xs text-slate-400">Vérifié {scam.lastVerifiedDate}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-950 dark:text-white leading-snug">
                {scam.title}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {scam.summary}
              </p>

              {/* Fictional example quote */}
              <div className="p-3 bg-amber-50/60 dark:bg-slate-900/60 border border-amber-200/50 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-amber-900 dark:text-amber-400 block">
                  Exemple fictif ({scam.fictionalExample.channel}) :
                </span>
                <p className="italic text-slate-700 dark:text-slate-300 line-clamp-2">
                  {scam.fictionalExample.text}
                </p>
              </div>

              {/* Alert Sign snippet */}
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Signe d'alerte n°1 :
                </span>
                <p className="line-clamp-2">{scam.alertSigns[0]}</p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveScamModal(scam)}
                className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>Consulter la fiche</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <Link
                to={`/arnaques/${scam.id}`}
                className="text-xs text-slate-400 hover:underline"
                title="Lien permanent vers cette fiche"
              >
                Lien permanent
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filteredScams.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <p className="text-slate-500">Aucune arnaque ne correspond à vos critères de recherche.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* MODAL VIEW FOR COMPLETE SCAM CARD */}
      {activeScamModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-scam-title"
        >
          <div className="bg-white dark:bg-[#0C2438] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-left">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {activeScamModal.category.replace('-', ' ')}
                </span>
                <h2 id="modal-scam-title" className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
                  {activeScamModal.title}
                </h2>
                <span className="text-xs text-slate-400">Dernière vérification : {activeScamModal.lastVerifiedDate}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveScamModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fermer la fiche"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: The 12 structured fields */}
            <div className="space-y-6 text-sm text-slate-700 dark:text-slate-200">
              {/* 2. Description simple */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  1. Description de l'arnaque
                </h3>
                <p className="leading-relaxed">{activeScamModal.summary}</p>
              </div>

              {/* 3. Exemple fictif */}
              <div className="p-4 bg-amber-50 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  <span>2. Exemple fictif identifié ({activeScamModal.fictionalExample.channel})</span>
                  <span>Expéditeur : {activeScamModal.fictionalExample.sender}</span>
                </div>
                <p className="italic text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeScamModal.fictionalExample.text}
                </p>
                <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 block">
                  *Numéro et situation entièrement fictifs conçus à des fins pédagogiques.
                </span>
              </div>

              {/* 4. Déroulement étape par étape */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  3. Déroulement de l'arnaque (étape par étape)
                </h3>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
                  {activeScamModal.stepByStep.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* 5. Méthodes de manipulation psychologique */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  4. Méthodes de manipulation psychologique
                </h3>
                <ul className="list-disc pl-5 space-y-1 leading-relaxed text-slate-600 dark:text-slate-300">
                  {activeScamModal.psychologicalTactics.map((tac, idx) => (
                    <li key={idx}>{tac}</li>
                  ))}
                </ul>
              </div>

              {/* 6. Signes d'alerte */}
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-2">
                <h3 className="font-bold text-red-950 dark:text-red-300 text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  5. Signes d'alerte à repérer immédiatement
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-red-900 dark:text-red-200">
                  {activeScamModal.alertSigns.map((sign, idx) => (
                    <li key={idx}>{sign}</li>
                  ))}
                </ul>
              </div>

              {/* 7. Ce que l'attaquant cherche à obtenir */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  6. Ce que l'attaquant cherche à obtenir
                </h3>
                <p className="leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                  {activeScamModal.attackerGoal}
                </p>
              </div>

              {/* 8. Erreurs à éviter */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  7. Les erreurs à ne jamais commettre
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  {activeScamModal.mistakesToAvoid.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>

              {/* 9. Comment se protéger */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-2">
                <h3 className="font-bold text-emerald-950 dark:text-emerald-300 text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  8. Comment se protéger (Bons réflexes)
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-emerald-900 dark:text-emerald-200">
                  {activeScamModal.howToProtect.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* 10. Que faire si déjà tombé dans le piège */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  9. Que faire si vous avez déjà été piégé ?
                </h3>
                <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                  {activeScamModal.emergencyAction.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* 11. Sources fiables */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sources vérifiées & Références :
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeScamModal.reliableSources.map((source, idx) => (
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
            </div>

            {/* Modal footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                to="/urgence-victime"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Ouvrir la procédure d'urgence pour cette situation</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveScamModal(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
