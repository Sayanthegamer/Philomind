export interface Question {
  id: number;
  text: string;
  placeholder: string;
  options?: string[];
}

export interface QuestionInsight {
  questionId: number;
  userAnswerSummary: string;
  philosophicalPerspective: string;
  relevantQuote: string;
  philosopher: string;
}

export interface AnalysisResult {
  maturityScore: number; // 0 - 100
  philosophicalPersona: string; // e.g. "The Stoic Sage"
  generalAnalysis: string;
  insights: QuestionInsight[];
  hasAward: boolean;
  awardTitle?: string;
}

export type AppState = 'INTRO' | 'QUESTIONNAIRE' | 'ANALYZING' | 'RESULTS';