import React from 'react';
import { OFFICIAL_RESOURCES } from '../data/officialResources';
import {
  ShieldCheck,
  Phone,
  ExternalLink,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const OfficialResourcesPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Annuaire officiel • Contacts certifiés au Sénégal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Canaux officiels de signalement & d'assistance
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Accédez directement aux services compétents de l'État du Sénégal (Police DSC, STCC-SSI, CDP) et des opérateurs télécoms (Wave, Orange, Free). Tous les numéros et portails ont été vérifiés à la source.
        </p>
      </div>

      {/* Clarification banner */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-2 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
        <div className="font-bold flex items-center gap-2 text-amber-900 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Rappel d'indépendance de XamSafe :</span>
        </div>
        <p className="leading-relaxed">
          XamSafe est une plateforme citoyenne indépendante et bénévole. XamSafe ne remplace pas un dépôt de plainte formel et ne transmet pas automatiquement votre dossier à la police. Pour engager des poursuites pénales, vous devez effectuer le signalement vous-même auprès des services officiels ci-dessous.
        </p>
      </div>

      {/* Grid of official resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {OFFICIAL_RESOURCES.map((res) => (
          <article
            key={res.id}
            className="bg-white dark:bg-[#0C2438] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    res.isGovernmentOrPolice
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {res.isGovernmentOrPolice ? 'Institution d\'État / Police' : 'Opérateur Télécom / Fintech'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  Vérifié {res.verifiedDate}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-950 dark:text-white leading-snug">
                {res.organization}
              </h2>

              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {res.role}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {res.description}
              </p>

              {/* Contacts */}
              <div className="pt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                {res.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0 font-sans" />
                    <span>Téléphone : <strong>{res.phone}</strong></span>
                  </div>
                )}
                {res.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 font-sans" />
                    <span>Adresse : {res.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Link footer */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Source : {res.source}</span>
              {res.url && (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Accéder au site officiel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
