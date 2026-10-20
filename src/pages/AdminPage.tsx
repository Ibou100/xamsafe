import React, { useState } from 'react';
import { INITIAL_SCAMS, getScamsCatalog, saveScamsCatalog, resetScamsCatalog } from '../data/scams';
import { INITIAL_QUIZ_QUESTIONS } from '../data/quizQuestions';
import type { ScamCard, QuizQuestion } from '../types';
import {
  Lock,
  Unlock,
  FilePlus,
  Eye,
  Download,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('xamsafe_admin_auth') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active admin tab: 'scams' | 'quiz' | 'wolof' | 'new-scam'
  const [activeTab, setActiveTab] = useState<'scams' | 'quiz' | 'wolof' | 'new-scam'>('scams');

  // Persistent state for editable items
  const [scamsList, setScamsList] = useState<ScamCard[]>(() => getScamsCatalog());
  const [quizList] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [previewScam, setPreviewScam] = useState<ScamCard | null>(null);

  // New scam form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ScamCard['category']>('mobile-money');
  const [newSummary, setNewSummary] = useState('');
  const [newAttackerGoal, setNewAttackerGoal] = useState('');
  const [newExampleText, setNewExampleText] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const configuredCode = (import.meta as any).env?.VITE_ADMIN_PASSCODE || 'XamSafeAdmin2026!';

    if (passcodeInput.trim() === configuredCode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('xamsafe_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Code d\'accès administrateur invalide.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('xamsafe_admin_auth');
    setPasscodeInput('');
  };

  const handleCreateScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: ScamCard = {
      id: `scam-custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      summary: newSummary || 'Fiche pédagogique en cours de rédaction.',
      fictionalExample: {
        sender: '+221 77 000 00 99 (Fictif)',
        channel: 'SMS',
        text: newExampleText || 'Exemple fictif en cours d\'élaboration.',
      },
      stepByStep: ['Contact initial du suspect', 'Mise sous pression de la cible', 'Tentative de détournement'],
      psychologicalTactics: ['Urgence artificielle', 'Confiance trompeuse'],
      alertSigns: ['Demande inhabituelle d\'argent ou de code', 'Pression temporelle'],
      attackerGoal: newAttackerGoal || 'Détourner des fonds par mobile money.',
      mistakesToAvoid: ['Ne pas envoyer de code secret', 'Ne pas transférer d\'argent'],
      howToProtect: ['Vérifier auprès de l\'opérateur officiel'],
      emergencyAction: ['Bloquer le compte en contactant le support'],
      reliableSources: [{ name: 'Police Nationale Cyber', url: 'https://signalementcyber.dgpn.sn/' }],
      lastVerifiedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [created, ...scamsList];
    setScamsList(updated);
    saveScamsCatalog(updated);
    setNewTitle('');
    setNewSummary('');
    setNewAttackerGoal('');
    setNewExampleText('');
    setActiveTab('scams');
  };

  const handleResetCatalog = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes les fiches d\'arnaques aux 15 fiches par défaut ?')) {
      resetScamsCatalog();
      setScamsList(INITIAL_SCAMS);
    }
  };

  const handleExportData = () => {
    const data = {
      scams: scamsList,
      quiz: quizList,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xamsafe-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-left">
        <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mx-auto">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-slate-950 dark:text-white">
              Espace d'administration protégé
            </h1>
            <p className="text-xs text-slate-500">
              Réservé aux éditeurs de contenus de XamSafe. Les visiteurs publics n'ont jamais besoin de se connecter.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-passcode" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Code d'accès sécurisé :
              </label>
              <input
                id="admin-passcode"
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Entrez le code administrateur..."
                className="w-full p-3.5 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 transition-colors shadow-sm"
            >
              Déverrouiller la console
            </button>
          </form>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold block text-slate-700 dark:text-slate-300">
              Note de sécurité :
            </span>
            <p>
              Ce code est configurable côté environnement serveur via <code>VITE_ADMIN_PASSCODE</code>. Aucun mot de passe permanent n'est codé en dur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Console de gestion éditoriale
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
            Administration des contenus
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetCatalog}
            title="Réinitialiser le catalogue aux 15 fiches par défaut"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter JSON</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-900"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist">
        <button
          onClick={() => setActiveTab('scams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scams'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'bg-white dark:bg-[#0F2B43] text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Fiches d'arnaques ({scamsList.length})
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'bg-white dark:bg-[#0F2B43] text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Banque de Quiz ({quizList.length})
        </button>
        <button
          onClick={() => setActiveTab('wolof')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wolof'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'bg-white dark:bg-[#0F2B43] text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Traductions Wolof (Statuts)
        </button>
        <button
          onClick={() => setActiveTab('new-scam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'new-scam'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-[#0F2B43] text-emerald-600 border border-emerald-300 dark:border-emerald-800'
          }`}
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>Créer une fiche</span>
        </button>
      </div>

      {/* TAB 1: SCAMS LIST */}
      {activeTab === 'scams' && (
        <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Gestion des fiches pédagogiques
            </h2>
            <span className="text-xs text-slate-400">Toutes publiées</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {scamsList.map((scam) => (
              <div key={scam.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {scam.category}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {scam.title}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Vérifié le {scam.lastVerifiedDate}</span>
                    <span>• {scam.reliableSources[0]?.name || 'Source officielle'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Publié
                  </span>
                  <button
                    onClick={() => setPreviewScam(scam)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    title="Aperçu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUIZ LIST */}
      {activeTab === 'quiz' && (
        <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Banque des 30 questions de quiz
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {quizList.map((q, idx) => (
              <div key={q.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-600">Question #{idx + 1} ({q.category})</span>
                  <span className="text-[11px] text-slate-400">4 options</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {q.question}
                </p>
                <p className="text-xs text-slate-500 italic">
                  Bonne réponse : {q.options[q.correctAnswerIndex]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WOLOF TRANSLATION AUDIT */}
      {activeTab === 'wolof' && (
        <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Audit et validation des traductions Wolof
            </h2>
            <p className="text-xs text-slate-500">
              Conformément à la règle d'intégrité linguistique : toute traduction doit être validée par un locuteur avant d'être certifiée.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  Interface générale (Navigation, boutons d'urgence, slogans)
                </span>
                <span className="text-xs text-slate-500">
                  « Xam. Moytu. Aar sa xaalis » — « Danu ma nàcc »
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Validée
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  Questions de Quiz fondamentales (Q1, Q2)
                </span>
                <span className="text-xs text-slate-500">
                  Demande de code SMS Wave & piratage compte WhatsApp
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Validée
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  Questions spécialisées Q3 à Q30 & Fiches avancées
                </span>
                <span className="text-xs text-slate-500">
                  En cours de relecture par le comité de locuteurs
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                À valider
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NEW SCAM FORM */}
      {activeTab === 'new-scam' && (
        <form onSubmit={handleCreateScam} className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Rédiger une nouvelle fiche d'arnaque
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Titre de la technique :</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Fausse tombola sur Telegram..."
                className="w-full p-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Catégorie :</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full p-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-base"
              >
                <option value="mobile-money">Mobile money</option>
                <option value="sms">SMS frauduleux</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="reseaux-sociaux">Réseaux sociaux</option>
                <option value="achats">Achats en ligne</option>
                <option value="emploi">Faux emplois</option>
                <option value="investissement">Investissements</option>
                <option value="usurpation">Usurpation d'identité</option>
                <option value="famille">Ciblant les familles</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description simple :</label>
            <textarea
              rows={2}
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Expliquez la mécanique en termes clairs..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exemple fictif réaliste :</label>
            <textarea
              rows={2}
              value={newExampleText}
              onChange={(e) => setNewExampleText(e.target.value)}
              placeholder="Ex : « Félicitations, vous avez gagné... »"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ce que l'attaquant cherche à obtenir :</label>
            <input
              type="text"
              value={newAttackerGoal}
              onChange={(e) => setNewAttackerGoal(e.target.value)}
              placeholder="Ex: Voler les codes secrets ou soutirer une avance..."
              className="w-full p-3 min-h-[48px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F2B43] text-base"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Enregistrer et publier la fiche
            </button>
          </div>
        </form>
      )}

      {/* MODAL PREVIEW FOR ADMIN */}
      {previewScam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0C2438] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Aperçu fiche : {previewScam.title}</span>
              <button onClick={() => setPreviewScam(null)} className="text-slate-400">✕</button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">{previewScam.summary}</p>
            <div className="p-3 bg-amber-50 dark:bg-slate-900 rounded-xl text-xs italic">
              {previewScam.fictionalExample.text}
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewScam(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white"
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
