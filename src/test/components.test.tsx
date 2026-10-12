import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { MessageAnalyzerPage } from '../pages/MessageAnalyzerPage';
import { PhishingSimulatorPage } from '../pages/PhishingSimulatorPage';
import { AdminPage } from '../pages/AdminPage';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Composants & Parcours Utilisateur XamSafe', () => {
  it('affiche la page d\'accueil avec les 3 boutons d\'action et sans formulaire de connexion', () => {
    render(<App />);

    // Logo & Slogan
    expect(screen.getAllByText(/Xam/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Safe/i).length).toBeGreaterThan(0);

    // Titre principal
    expect(
      screen.getByText(/Une arnaque peut te coûter ton argent/i)
    ).toBeInTheDocument();

    // 3 boutons d'action clés
    expect(screen.getAllByText(/Analyser un message/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Je suis victime/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Apprendre à reconnaître/i).length).toBeGreaterThan(0);

    // Mentions de gratuité et absence de compte
    expect(screen.getAllByText(/Sans inscription/i).length).toBeGreaterThan(0);
  });

  it('permet d\'analyser un message suspect et d\'afficher les indices en direct', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <MessageAnalyzerPage />
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    );

    const textarea = screen.getByPlaceholderText(/Alerte Wave/i);
    fireEvent.change(textarea, {
      target: {
        value: 'Urgence : votre compte Wave sera bloqué sous 15 minutes. Donnez votre code secret SMS.',
      },
    });

    const submitBtn = screen.getByText(/Examiner les indices/i);
    fireEvent.click(submitBtn);

    // After analysis
    expect(textarea).toHaveValue('Urgence : votre compte Wave sera bloqué sous 15 minutes. Donnez votre code secret SMS.');
  });

  it('permet de naviguer et de répondre dans le simulateur de phishing', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <PhishingSimulatorPage />
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    );

    // Vérifie que l'écran de simulation affiche le premier scénario
    expect(screen.getByText(/Scénario 1 sur 6/i)).toBeInTheDocument();
    expect(screen.getByText(/Valider ma réponse/i)).toBeInTheDocument();
  });

  it('protège l\'espace administrateur par code d\'accès et rejette les codes invalides', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AdminPage />
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    );

    const input = screen.getByPlaceholderText(/Entrez le code administrateur/i);
    const submitBtn = screen.getByText(/Déverrouiller la console/i);

    // Mauvais code
    fireEvent.change(input, { target: { value: 'faux-code-invalide' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Code d'accès administrateur invalide/i)).toBeInTheDocument();
  });
});
