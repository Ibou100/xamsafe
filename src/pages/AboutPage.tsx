import React from 'react';
import { Users, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Mission citoyenne d'intérêt public</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          À propos de XamSafe
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          XamSafe est une initiative technologique et citoyenne à but non lucratif, créée pour doter chaque citoyen sénégalais des connaissances nécessaires pour déjouer les arnaques numériques et protéger son patrimoine financier.
        </p>
      </div>

      {/* Origine du Nom & Valeurs */}
      <div className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Origine du nom XamSafe
            </h2>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Le nom <strong>XamSafe</strong> est né de la rencontre de deux mots :
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-emerald-600 dark:text-emerald-400">Xam</strong> : « Savoir » ou « connaître » en wolof. La connaissance est le premier rempart contre la manipulation.
                </li>
                <li>
                  <strong className="text-emerald-600 dark:text-emerald-400">Safe</strong> : « Sécurité » en anglais.
                </li>
              </ul>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p>Slogan français : <em>« Comprendre les arnaques. Protéger son argent. »</em></p>
                <p>Slogan wolof : <em>« Xam. Moytu. Aar sa xaalis. »</em></p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0F2B43] border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Nos valeurs fondamentales
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>Protection des citoyens :</strong> Primauté accordée à l'intérêt public.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>Accessibilité :</strong> Compréhensible sans jargon informatique.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>Confidentialité stricte :</strong> Zéro création de compte requise.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>Inclusion numérique :</strong> Pensé pour le mobile et les connexions modestes.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Public cible */}
        <section className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>À qui s'adresse XamSafe ?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            La plateforme est ouverte à tous les résidents et à la diaspora sénégalaise :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
              Utilisateurs quotidiens de Wave & Orange Money
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
              Commerçants, boutiquiers et vendeurs en ligne
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
              Étudiants et jeunes diplômés en recherche d'emploi
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
              Parents et personnes âgées face aux arnaques familiales
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
              Victimes cherchant des instructions d'urgence
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
              Utilisateurs actifs de WhatsApp, Facebook et TikTok
            </div>
          </div>
        </section>

        {/* Charte d'indépendance */}
        <section className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Indépendance éditoriale & Déontologie
          </h3>
          <p className="leading-relaxed">
            XamSafe ne perçoit aucune commission des opérateurs de télécommunications ni des banques. La plateforme n'est pas un substitut aux forces de l'ordre mais un outil éducatif de première ligne pour prévenir le préjudice avant qu'il ne se produise.
          </p>
        </section>
      </div>
    </div>
  );
};
