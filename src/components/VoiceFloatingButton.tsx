import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { VoiceAssistant } from './VoiceAssistant';
import { useLanguage } from '../context/LanguageContext';

export const VoiceFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {/* Floating Action Button at Bottom-Right - Discreet, Senior Accessibility Widget */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 sm:px-4 sm:py-3 rounded-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 active:scale-95 text-white shadow-lg border border-slate-700/50 dark:border-emerald-500/30 transition-all cursor-pointer"
          aria-label="Ouvrir l'assistant vocal XamSafe"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 dark:bg-black/20">
            <Mic className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
          </span>

          <div className="text-left flex flex-col pr-1">
            <span className="text-xs font-bold tracking-tight whitespace-nowrap">
              {language === 'wo' ? 'Waxal ci micro' : 'Assistant vocal'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-emerald-100 font-medium whitespace-nowrap">
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
