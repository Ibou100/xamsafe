import React from 'react';
import {
  Lock,
  ShieldCheck,
  EyeOff,
  Server,
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Protection des données & Transparence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Politique de confidentialité & Mentions légales
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          XamSafe applique le principe de minimisation absolue des données personnelles, en stricte conformité avec l'esprit de la loi sénégalaise n° 2008-12 relative à la protection des données à caractère personnel.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* 1. Absence de compte */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-emerald-600" />
            <span>1. Aucun compte utilisateur requis</span>
          </h2>
          <p>
            Sur XamSafe, <strong>aucune inscription n'est nécessaire</strong>. Nous n'exigeons jamais votre nom, prénom, adresse e-mail, numéro de téléphone ni création de mot de passe pour utiliser les outils publics (analyseur de message, analyseur d'URL, simulateur, quiz, bibliothèque et guides d'urgence).
          </p>
        </section>

        {/* 2. Traitement local des messages analysés */}
        <section className="space-y-3 p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>2. Traitement local et non-conservation des contenus soumis</span>
          </h2>
          <p className="text-emerald-900 dark:text-emerald-200">
            Lorsque vous collez un message ou une URL dans nos outils d'analyse :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            <li>L'analyse s'exécute directement dans la mémoire vive de votre navigateur (moteur local JavaScript).</li>
            <li>Le texte analysé n'est <strong>jamais envoyé ni enregistré dans une base de données serveur</strong>.</li>
            <li>Dès que vous fermez la page ou appuyez sur « Effacer », le contenu disparaît définitivement.</li>
            <li>Nous appliquons un masque préalable sur les numéros et identifiants pour garantir votre sérénité.</li>
          </ul>
        </section>

        {/* 3. Résultats de quiz et sessions */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Résultats de quiz et simulateur
          </h2>
          <p>
            Les réponses aux questions du quiz et les scénarios de simulation sont traités uniquement pendant votre session active. Aucun profil de réussite ni historique individuel n'est conservé ou transmis à des tiers.
          </p>
        </section>

        {/* 4. Données techniques d'hébergement */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            <span>4. Données techniques et journaux de connexion</span>
          </h2>
          <p>
            Comme pour tout site web, l'infrastructure d'hébergement peut enregistrer des journaux réseau techniques temporaires (adresse IP de connexion, horodatage, agent utilisateur du navigateur) strictement nécessaires à la prévention des attaques informatiques de type déni de service (DDoS) et à la sécurité des serveurs. Ces journaux techniques ne sont jamais croisés avec les contenus examinés.
          </p>
        </section>

        {/* 5. Absence de publicité et de traqueurs */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            5. Aucun cookie publicitaire ni revente de données
          </h2>
          <p>
            XamSafe ne déploie aucun cookie publicitaire, aucun outil de ciblage marketing et ne commercialise aucune donnée. Seuls des réglages d'interface locaux (votre choix de langue français/wolof et votre choix de mode clair/sombre) sont stockés dans le stockage local (localStorage) de votre propre navigateur.
          </p>
        </section>

        {/* 6. Cadre légal et autorité de référence */}
        <section className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-700 dark:text-slate-300 block">
            Cadre juridique sénégalais :
          </span>
          <p>
            Pour toute question relative à la protection des données personnelles au Sénégal, l'autorité nationale compétente est la Commission de Protection des Données Personnelles (CDP) : <a href="https://www.cdp.sn/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">www.cdp.sn</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
