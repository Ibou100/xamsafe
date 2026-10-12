import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { ScamsLibrary } from './pages/ScamsLibrary';
import { ScamDetailPage } from './pages/ScamDetailPage';
import { MessageAnalyzerPage } from './pages/MessageAnalyzerPage';
import { UrlAnalyzerPage } from './pages/UrlAnalyzerPage';
import { VictimUrgentPage } from './pages/VictimUrgentPage';
import { AccountSecurityPage } from './pages/AccountSecurityPage';
import { PhishingSimulatorPage } from './pages/PhishingSimulatorPage';
import { CyberQuizPage } from './pages/CyberQuizPage';
import { OfficialResourcesPage } from './pages/OfficialResourcesPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-[#071724] dark:text-slate-100 transition-colors">
            {/* Accessible skip link */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:p-3 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:font-bold"
            >
              Aller directement au contenu principal
            </a>

            <Navbar />

            <main id="main-content" className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/arnaques" element={<ScamsLibrary />} />
                <Route path="/arnaques/:id" element={<ScamDetailPage />} />
                <Route path="/analyser-message" element={<MessageAnalyzerPage />} />
                <Route path="/verifier-url" element={<UrlAnalyzerPage />} />
                <Route path="/urgence-victime" element={<VictimUrgentPage />} />
                <Route path="/securiser-comptes" element={<AccountSecurityPage />} />
                <Route path="/simulateur" element={<PhishingSimulatorPage />} />
                <Route path="/quiz" element={<CyberQuizPage />} />
                <Route path="/ressources" element={<OfficialResourcesPage />} />
                <Route path="/a-propos" element={<AboutPage />} />
                <Route path="/confidentialite" element={<PrivacyPage />} />
                <Route path="/admin" element={<AdminPage />} />
                {/* Fallback 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
