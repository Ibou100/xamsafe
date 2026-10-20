export type RiskLevel = 'faible' | 'moyen' | 'eleve' | 'indetermine';

export interface ScamCard {
  id: string;
  title: string;
  category: 'mobile-money' | 'sms' | 'whatsapp' | 'reseaux-sociaux' | 'email' | 'achats' | 'emploi' | 'investissement' | 'usurpation' | 'piratage' | 'famille';
  summary: string;
  fictionalExample: {
    sender: string;
    text: string;
    channel: 'SMS' | 'WhatsApp' | 'Appel' | 'Facebook' | 'E-mail';
  };
  stepByStep: string[];
  psychologicalTactics: string[];
  alertSigns: string[];
  attackerGoal: string;
  mistakesToAvoid: string[];
  howToProtect: string[];
  emergencyAction: string[];
  reliableSources: {
    name: string;
    url: string;
  }[];
  lastVerifiedDate: string;
  wolofTranslation?: {
    title: string;
    summary: string;
    categoryLabel?: string;
    exampleChannel?: string;
    exampleText?: string;
  };
}

export interface ClueItem {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'reassuring';
  title: string;
  description: string;
  detail?: string;
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  title: string;
  summary: string;
  detectedClues: ClueItem[];
  reassuringClues: ClueItem[];
  limitations: string[];
  complementaryChecks: string[];
  recommendedActions: string[];
  engineType: 'local-heuristic' | 'ai-remote';
}

export interface UrlCheckResult {
  url: string;
  riskLevel: 'faible' | 'suspect' | 'dangereux' | 'indetermine';
  protocol: string;
  isHttps: boolean;
  hostname: string;
  tld: string;
  subdomainCount: number;
  isIpAddress: boolean;
  isShortener: boolean;
  hasPunycodeOrHomoglyphs: boolean;
  impersonatedBrand?: string;
  suspiciousKeywordsFound: string[];
  clues: ClueItem[];
  pedagogicalNotes: string[];
  recommendation: string;
  engineType?: 'local-heuristic' | 'ai-remote';
  threatCategory?: string;
  whySummary?: string;
  sourcesCited?: string[];
}

export interface VictimScenario {
  id: string;
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
  title: string;
  subtitle: string;
  reassuringGreeting: string;
  immediatePriorityActions: string[];
  numberedSteps: {
    step: number;
    title: string;
    action: string;
    details?: string;
  }[];
  evidenceToKeep: string[];
  officialChannels: {
    name: string;
    type: 'phone' | 'url' | 'portal';
    contact: string;
    verifiedDate: string;
    officialUrl?: string;
  }[];
  stepsToPreventFurtherLoss: string[];
  recoveryScamWarning: string;
}

export interface SecurityGuide {
  id: string;
  service: string;
  iconName: string;
  features: string[];
  protectionSteps: {
    title: string;
    instructions: string[];
  }[];
  howToCheckActiveSessions: string[];
  howToSpotImpersonation: string[];
  compromiseRecovery: string[];
  fakeSupportWarning: string;
  officialHelpUrl: string;
  lastVerifiedDate: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  preventionTip: string;
  wolofTranslation?: {
    question: string;
    options: string[];
    explanation: string;
    status: 'validee' | 'a_valider';
  };
}

export interface SimulatorScenario {
  id: string;
  title: string;
  platform: 'SMS' | 'WhatsApp' | 'Email' | 'Web' | 'USSD';
  contextDescription: string;
  messageContent: {
    sender: string;
    body: string;
    link?: string;
    timestamp?: string;
  };
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  reasoning: string;
  protectionMethod: string;
  pedagogicalWarning: string;
}

export interface OfficialResource {
  id: string;
  organization: string;
  role: string;
  description: string;
  url?: string;
  phone?: string;
  address?: string;
  source: string;
  verifiedDate: string;
  isGovernmentOrPolice: boolean;
}
