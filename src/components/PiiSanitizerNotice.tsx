import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface PiiNoticeProps {
  className?: string;
}

export const PiiSanitizerNotice: React.FC<PiiNoticeProps> = ({ className = '' }) => {
  return (
    <div
      role="region"
      aria-label="Rappel de confidentialité"
      className={`bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-sm ${className}`}
    >
      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg shrink-0 mt-0.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-950 dark:text-emerald-300">
          <Lock className="w-3.5 h-3.5" />
          <span>Protection stricte de votre vie privée</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
          Supprimez les <strong>codes secrets, mots de passe, numéros de compte et coordonnées bancaires</strong> avant de soumettre un texte. L'analyse s'effectue directement dans votre navigateur : aucun message n'est enregistré sur nos serveurs.
        </p>
      </div>
    </div>
  );
};
