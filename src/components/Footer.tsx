import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Shield, Lock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="lg" />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              XamSafe est une plateforme citoyenne d'intérêt public, indépendante et gratuite, conçue pour informer et protéger les populations du Sénégal contre les arnaques numériques et la fraude mobile money.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Aucun compte requis • Respect strict de la vie privée</span>
            </div>
            <div className="text-xs text-slate-400 font-mono italic">
              « Xam. Moytu. Aar sa xaalis. »
            </div>
          </div>

          {/* Outils & Prévention */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'wo' ? 'Jumtukaay yi' : 'Outils pratiques'}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/analyser-message" className="hover:text-emerald-400 transition-colors">
                  {t.nav.analyzeMessage}
                </Link>
              </li>
              <li>
                <Link to="/verifier-url" className="hover:text-emerald-400 transition-colors">
                  {t.nav.checkUrl}
                </Link>
              </li>
              <li>
                <Link to="/simulateur" className="hover:text-emerald-400 transition-colors">
                  {t.nav.simulator}
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-emerald-400 transition-colors">
                  {t.nav.quiz}
                </Link>
              </li>
              <li>
                <Link to="/urgence-victime" className="text-red-400 font-medium hover:text-red-300 transition-colors">
                  {t.nav.victim}
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides & Savoir */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'wo' ? 'Xam-xam' : 'Guides & Savoir'}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/arnaques" className="hover:text-emerald-400 transition-colors">
                  {t.nav.scams}
                </Link>
              </li>
              <li>
                <Link to="/securiser-comptes" className="hover:text-emerald-400 transition-colors">
                  {t.nav.secureAccounts}
                </Link>
              </li>
              <li>
                <Link to="/ressources" className="hover:text-emerald-400 transition-colors">
                  {t.nav.resources}
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-emerald-400 transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-emerald-400 transition-colors">
                  {t.nav.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Canaux Officiels du Sénégal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Canaux Officiels (Sénégal)
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://signalementcyber.dgpn.sn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>Police Cybersécurité (DSC)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://signalementcyber.dgpn.sn/verifier-signalement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>Suivi signalement DGPN</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://stcc-ssi.sn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>STCC-SSI (Cybersécurité État)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.cdp.sn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>Commission CDP (Données)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li className="pt-2 text-slate-500">
                Orange Money : <strong>1441</strong> • Wave : <strong>200600</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Independence Disclaimer Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-200">
                Avertissement d'indépendance et mission d'intérêt public :
              </span>
              <p className="leading-relaxed text-slate-400">
                XamSafe est une initiative citoyenne et pédagogique bénévole. La plateforme n'est pas un service officiel de la Police Nationale du Sénégal, d'un opérateur téléphonique (Orange, Wave, Free), d'un établissement bancaire ou du gouvernement. XamSafe ne transmet pas automatiquement de plaintes aux autorités judiciaires ; tout dépôt de signalement officiel doit être réalisé par la victime sur le portail étatique dédié.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-slate-500">
            <p>© 2026 XamSafe. Conçu avec intérêt public pour les citoyens du Sénégal.</p>
            <div className="flex items-center gap-4">
              <Link to="/a-propos" className="hover:text-slate-300">
                Charte éthique
              </Link>
              <span>•</span>
              <Link to="/confidentialite" className="hover:text-slate-300">
                Données & Confidentialité
              </Link>
              <span>•</span>
              <Link to="/admin" className="hover:text-slate-300">
                Gestion des contenus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
