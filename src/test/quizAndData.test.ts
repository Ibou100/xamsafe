import { describe, it, expect } from 'vitest';
import { INITIAL_SCAMS } from '../data/scams';
import { INITIAL_QUIZ_QUESTIONS } from '../data/quizQuestions';
import { INITIAL_SIMULATOR_SCENARIOS } from '../data/simulatorScenarios';
import { INITIAL_EMERGENCY_PATHS } from '../data/emergencyPaths';
import { INITIAL_ACCOUNT_GUIDES } from '../data/accountGuides';
import { OFFICIAL_RESOURCES } from '../data/officialResources';

describe('Vérification des Données Pédagogiques (Exigences du Cahier des Charges)', () => {
  it('contient au moins 15 fiches d\'arnaques complètes avec les 12 champs exigés', () => {
    expect(INITIAL_SCAMS.length).toBeGreaterThanOrEqual(15);

    INITIAL_SCAMS.forEach((scam) => {
      // 1. Nom / Titre
      expect(scam.title).toBeTruthy();
      // 2. Description
      expect(scam.summary).toBeTruthy();
      // 3. Exemple fictif identifié
      expect(scam.fictionalExample.sender).toBeTruthy();
      expect(scam.fictionalExample.text).toBeTruthy();
      // 4. Déroulement étape par étape
      expect(scam.stepByStep.length).toBeGreaterThanOrEqual(3);
      // 5. Manipulation psychologique
      expect(scam.psychologicalTactics.length).toBeGreaterThanOrEqual(1);
      // 6. Signes d'alerte
      expect(scam.alertSigns.length).toBeGreaterThanOrEqual(1);
      // 7. Ce que l'attaquant cherche
      expect(scam.attackerGoal).toBeTruthy();
      // 8. Erreurs à éviter
      expect(scam.mistakesToAvoid.length).toBeGreaterThanOrEqual(1);
      // 9. Comment se protéger
      expect(scam.howToProtect.length).toBeGreaterThanOrEqual(1);
      // 10. Démarche d'urgence
      expect(scam.emergencyAction.length).toBeGreaterThanOrEqual(1);
      // 11. Sources fiables
      expect(scam.reliableSources.length).toBeGreaterThanOrEqual(1);
      // 12. Date de vérification
      expect(scam.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('contient au moins 30 questions de quiz avec 4 options et explication pédagogique', () => {
    expect(INITIAL_QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(30);

    INITIAL_QUIZ_QUESTIONS.forEach((q) => {
      expect(q.question).toBeTruthy();
      expect(q.options.length).toBe(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(4);
      expect(q.explanation).toBeTruthy();
      expect(q.preventionTip).toBeTruthy();
      expect(q.category).toBeTruthy();
    });
  });

  it('contient 6 scénarios de simulation interactifs et inoffensifs', () => {
    expect(INITIAL_SIMULATOR_SCENARIOS.length).toBe(6);

    INITIAL_SIMULATOR_SCENARIOS.forEach((sim) => {
      expect(sim.title).toBeTruthy();
      expect(sim.messageContent.body).toBeTruthy();
      expect(sim.options.length).toBeGreaterThanOrEqual(2);
      expect(sim.reasoning).toBeTruthy();
      expect(sim.protectionMethod).toBeTruthy();
      expect(sim.pedagogicalWarning).toContain('fictif');
    });
  });

  it('contient 10 parcours d\'urgence distincts (A à J) avec démarches et preuves', () => {
    expect(INITIAL_EMERGENCY_PATHS.length).toBe(10);

    const letters = INITIAL_EMERGENCY_PATHS.map((p) => p.letter);
    expect(letters).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);

    INITIAL_EMERGENCY_PATHS.forEach((path) => {
      expect(path.immediatePriorityActions.length).toBeGreaterThanOrEqual(2);
      expect(path.numberedSteps.length).toBeGreaterThanOrEqual(3);
      expect(path.evidenceToKeep.length).toBeGreaterThanOrEqual(3);
      expect(path.officialChannels.length).toBeGreaterThanOrEqual(1);
      expect(path.recoveryScamWarning).toBeTruthy();
    });
  });

  it('contient 6 guides pratiques de sécurisation des comptes', () => {
    expect(INITIAL_ACCOUNT_GUIDES.length).toBe(6);
    const services = INITIAL_ACCOUNT_GUIDES.map((g) => g.service);
    expect(services).toContain('WhatsApp');
    expect(services).toContain('Facebook');
    expect(services).toContain('Instagram');
    expect(services).toContain('TikTok');
  });

  it('recense les ressources officielles du Sénégal sans faux numéros', () => {
    const police = OFFICIAL_RESOURCES.find((r) => r.id === 'res-dsc-police');
    expect(police).toBeDefined();
    expect(police?.url).toBe('https://signalementcyber.dgpn.sn/');

    const suivi = OFFICIAL_RESOURCES.find((r) => r.id === 'res-dsc-suivi');
    expect(suivi?.url).toBe('https://signalementcyber.dgpn.sn/verifier-signalement');

    const stcc = OFFICIAL_RESOURCES.find((r) => r.id === 'res-stcc-ssi');
    expect(stcc?.url).toBe('https://stcc-ssi.sn/');
  });
});
