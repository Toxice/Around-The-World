// ─── Claude API Response ──────────────────────────────────────────────────────

export interface TeacherAnalytics {
  grammar_points_observed: string[];
  grammar_errors_frequent: string[];
  target_vocabulary_used: string[];
  missed_opportunities: string[];
  confidence_score: number;
  word_count: number;
  struggle_detected: boolean;
  teacher_brief: string;
}

export interface Gamification {
  points_earned: number;
  character_mood: string;
  achievements: string[];
}

export interface ClaudeResponse {
  character_reply: string;
  teacher_analytics: TeacherAnalytics;
  gamification: Gamification;
  mission_complete: boolean;
}

// ─── Session / Turn ───────────────────────────────────────────────────────────

export interface TurnResponse {
  characterReply: string;
  pointsEarned: number;
  characterMood: string;
  achievements: string[];
  missionComplete: boolean;
}

export interface SessionResults {
  totalScore: number;
  finalConfidence: number;
  badges: { badgeName: string; awardedAt: string }[];
  teacherBrief: string;
  turnCount: number;
  location: string;
  situation: string;
}

// ─── Student / Teacher ────────────────────────────────────────────────────────

export interface StudentSummary {
  id: string;
  studentCode: string;
  totalSessions: number;
  totalScore: number;
  totalTurns: number;
  totalWords: number;
  vocabCount: number;
  avgConfidence: number;
  avgTechMastery: number;
  avgEfficiency: number;
  lastSessionDate: string | null;
  lastSessionTopic: string | null;
  confidenceHistory: number[];
  techMasteryHistory: number[];
  efficiencyHistory: number[];
  pointsHistory: number[];
}

export interface GrammarError {
  error: string;
  count: number;
}

export interface StudentDetail {
  studentCode: string;
  totalSessions: number;
  sessions: SessionSummary[];
  grammarErrors: GrammarError[];
  vocabularyUsed: string[];
  missedOpportunities: string[];
}

export interface SessionSummary {
  id: string;
  location: string;
  situation: string;
  completedAt: string;
  totalScore: number;
  finalConfidence: number;
  struggleDetected: boolean;
  teacherBrief: string;
  badges: string[];
}

// ─── Scenario Config ──────────────────────────────────────────────────────────

export interface Scenario {
  id: string;
  location: string;
  locationCode: "UK" | "US" | "ZA";
  locationFlag: string;
  situation: string;
  situationIcon: string;
  character: string;
  characterRole: string;
  characterEmoji: string;
  missionTexts: string[];
  vocabularyHints: string;
  voiceEnvKey: string;
}
