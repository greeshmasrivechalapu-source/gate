export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Subtopic {
  id: string;
  name: string;
}

export interface SyllabusTopic {
  id: string;
  subjectId: string;
  name: string;
  subtopics?: string[];
  importance: 'high' | 'medium' | 'core';
  estimatedHours: number;
}

export interface SyllabusSubject {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  weightageEstimated: string; // e.g., "15-18%"
  topics: SyllabusTopic[];
}

export interface TopicUserData {
  topicId: string;
  status: TopicStatus;
  difficulty?: DifficultyLevel;
  confidence?: ConfidenceLevel;
  startDate?: string | null;
  completedAt?: string | null;
  studyHours: number;
  notes: string;
  pyqsAttempted: number;
  pyqsCorrect: number;
  revisionCount: number;
  lastRevisedAt?: string | null;
  nextRevisionDue?: string | null;
  revisionHistory: { date: string; notes?: string }[];
}

export interface DailyStudyTask {
  id: string;
  date: string; // YYYY-MM-DD
  topicId: string;
  subjectName: string;
  topicName: string;
  type: 'learn' | 'revision' | 'pyq' | 'mock';
  targetMinutes: number;
  completedMinutes: number;
  completed: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  studyMinutes: number;
  completedTopics: string[]; // topicIds
  completedRevisions: string[]; // topicIds
  pyqsAttempted: number;
  pyqsCorrect: number;
  notes?: string;
}

export interface PYQRecord {
  id: string;
  year: number;
  subjectId: string;
  topicId: string;
  topicName: string;
  attempted: number;
  correct: number;
  accuracy: number;
  difficulty: DifficultyLevel;
  date: string;
  notes?: string;
}

export interface MockTestRecord {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
  marksObtained: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeTakenMinutes: number;
  notes?: string;
}

export interface MistakeRecord {
  id: string;
  date: string;
  subjectId: string;
  topicId: string;
  topicName: string;
  question: string;
  myAnswer: string;
  correctAnswer: string;
  reasonForMistake: string;
  correctConcept: string;
  reviewed: boolean;
  reviewedAt?: string;
}

export interface UserProfile {
  name: string;
  paper: string; // "GATE DA"
  targetScore: number;
  targetRank: number;
  dailyStudyHours: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  examDate: string; // ISO date string
  preparationLevel: 'beginner' | 'intermediate' | 'advanced';
  onboardingCompleted: boolean;
}

export interface PlannerConfig {
  dailyStudyHours: number;
  availableDaysPerWeek: number;
  completedSubjectIds: string[];
  targetRevisions: number;
  targetMocks: number;
  planGeneratedAt?: string;
}

export interface PlannerPhase {
  phaseNumber: number;
  name: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  focus: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'topics' | 'streak' | 'pyq' | 'mock' | 'milestone';
  unlockedAt: string | null;
  requirement: string;
}

export interface AppState {
  profile: UserProfile;
  topicData: Record<string, TopicUserData>;
  dailyTasks: Record<string, DailyStudyTask[]>; // key: YYYY-MM-DD
  dailyLogs: Record<string, DailyLog>; // key: YYYY-MM-DD
  pyqs: PYQRecord[];
  mockTests: MockTestRecord[];
  mistakes: MistakeRecord[];
  plannerConfig: PlannerConfig;
  studyStreak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
  };
  unlockedBadges: string[]; // badgeIds
}
