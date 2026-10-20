import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { VoiceAssistant } from './VoiceAssistant';
import { useLanguage } from '../context/LanguageContext';

export const VoiceFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {/* Floating Action Button at Bottom-Right - Stable, ergonomic 44px touch target */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 min-h-[44px] rounded-full bg-slate-900/95 dark:bg-emerald-600/95 hover:bg-slate-800 dark:hover:bg-emerald-700 active:scale-98 text-white shadow-md border border-slate-700/50 dark:border-emerald-500/30 transition-colors cursor-pointer"
          aria-label="Ouvrir l'assistant vocal XamSafe (Wolof et Français)"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 dark:bg-black/20 shrink-0">
            <Mic className="w-4 h-4 text-emerald-400 dark:text-white" />
          </span>

          <div className="text-left flex flex-col pr-0.5">
            <span className="text-xs font-bold tracking-tight whitespace-nowrap">
              {language === 'wo' ? 'Waxal ci micro' : 'Assistant vocal'}
            </span>
            <span className="text-[11px] text-slate-300 dark:text-emerald-100 font-medium whitespace-nowrap">
              Wolof • Français
            </span>
          </div>
        </button>
      </div>

      {/* The Assistant Modal */}
      <VoiceAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
