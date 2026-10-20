import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  X,
  Sun,
  Moon,
  AlertTriangle,
  Globe,
  Search,
  BookOpen,
  Link2,
  Shield,
  HelpCircle,
  Award,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/arnaques', label: t.nav.scams, icon: BookOpen },
    { to: '/analyser-message', label: t.nav.analyzeMessage, icon: Search },
    { to: '/verifier-url', label: t.nav.checkUrl, icon: Link2 },
    { to: '/securiser-comptes', label: t.nav.secureAccounts, icon: Shield },
    { to: '/simulateur', label: t.nav.simulator, icon: HelpCircle },
    { to: '/quiz', label: t.nav.quiz, icon: Award },
    { to: '/ressources', label: t.nav.resources },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0C2438]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            aria-label="Retour à l'accueil XamSafe"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5" aria-label="Navigation principale">
            {navLinks.slice(1, 7).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action buttons (Victim Emergency + Theme + Language) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Professional Emergency Action - High priority, minimum 44px touch target */}
            <Link
              to="/urgence-victime"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-xs min-h-[44px]"
              aria-label="Parcours d'urgence : Je suis victime"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
              <span className="whitespace-nowrap">{t.common.emergencyBtn}</span>
            </Link>

            {/* Language Toggle - Compact pill, min 44px height container */}
            <div className="relative inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold min-h-[44px]">
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center cursor-pointer ${
                  language === 'fr'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                aria-pressed={language === 'fr'}
                title="Passer en Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage('wo')}
                className={`px-2.5 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center cursor-pointer ${
                  language === 'wo'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                aria-pressed={language === 'wo'}
                title="Passer en Wolof (Xam. Moytu. Aar sa xaalis)"
              >
                WO
              </button>
            </div>

            {/* Dark/Light mode toggle - Visible on sm+, moved to drawer on tiny screens to avoid overflow */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center p-2.5 min-h-[44px] min-w-[44px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile menu hamburger toggle - Generous 44x44px touch target */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden flex items-center justify-center p-2.5 min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Stable, thumb-friendly navigation without jitter */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C2438] px-4 pt-3 pb-8 space-y-2 shadow-xl"
          role="dialog"
          aria-label="Menu mobile"
        >
          {/* Quick status & Theme toggle on mobile */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
              <Globe className="w-4 h-4 text-emerald-500" />
              {language === 'wo' ? 'Wolof' : 'Français'} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% sans compte</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
            </button>
          </div>

          <div className="space-y-1 pt-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-base font-medium transition-colors ${
                    isActive(item.to)
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 font-bold'
                      : 'text-slate-700 active:bg-slate-100 dark:text-slate-200 dark:active:bg-slate-800/60'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5 shrink-0 opacity-80 text-emerald-600 dark:text-emerald-400" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
            <Link
              to="/urgence-victime"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 min-h-[48px] rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 text-center shadow-sm text-base"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 text-white" />
              <span>{t.nav.victim}</span>
            </Link>

            <div className="flex justify-between items-center px-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Link to="/a-propos" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:underline">
                {t.nav.about}
              </Link>
              <span>•</span>
              <Link to="/confidentialite" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:underline">
                {t.nav.privacy}
              </Link>
              <span>•</span>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:underline">
                {t.nav.admin}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
