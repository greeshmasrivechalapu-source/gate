import { AppState, SyllabusSubject, TopicStatus } from '../types';
import { ALL_SUBJECTS, ALL_TOPICS } from '../data/syllabus';

export interface OverallStats {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  overallPercentage: number;
  totalStudyHours: number;
  revisionDueCount: number;
  pyqsAttempted: number;
  pyqsCorrect: number;
  pyqAccuracy: number;
  mocksCompleted: number;
  averageMockScore: number;
  bestMockScore: number;
  recentMockScore: number;
  currentStreak: number;
  longestStreak: number;
}

export interface SubjectStats {
  subject: SyllabusSubject;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  revisionDueTopics: number;
  percentage: number;
  studyHours: number;
}

export function calculateOverallStats(state: AppState): OverallStats {
  const totalTopics = ALL_TOPICS.length;
  let completedTopics = 0;
  let inProgressTopics = 0;
  let notStartedTopics = 0;
  let totalStudyHours = 0;
  let revisionDueCount = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  ALL_TOPICS.forEach((t) => {
    const userTopic = state.topicData[t.id];
    const status: TopicStatus = userTopic ? userTopic.status : 'not_started';
    if (status === 'completed') completedTopics++;
    else if (status === 'in_progress') inProgressTopics++;
    else notStartedTopics++;

    if (userTopic) {
      totalStudyHours += userTopic.studyHours || 0;
      if (
        userTopic.status === 'completed' &&
        userTopic.nextRevisionDue &&
        userTopic.nextRevisionDue <= todayStr
      ) {
        revisionDueCount++;
      }
    }
  });

  const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 1000) / 10 : 0;

  const pyqsAttempted = state.pyqs.reduce((sum, p) => sum + p.attempted, 0);
  const pyqsCorrect = state.pyqs.reduce((sum, p) => sum + p.correct, 0);
  const pyqAccuracy = pyqsAttempted > 0 ? Math.round((pyqsCorrect / pyqsAttempted) * 1000) / 10 : 0;

  const mocksCompleted = state.mockTests.length;
  let averageMockScore = 0;
  let bestMockScore = 0;
  let recentMockScore = 0;

  if (mocksCompleted > 0) {
    const scores = state.mockTests.map((m) => m.marksObtained);
    averageMockScore = Math.round((scores.reduce((a, b) => a + b, 0) / mocksCompleted) * 10) / 10;
    bestMockScore = Math.round(Math.max(...scores) * 10) / 10;
    recentMockScore = Math.round(scores[scores.length - 1] * 10) / 10;
  }

  return {
    totalTopics,
    completedTopics,
    inProgressTopics,
    notStartedTopics,
    overallPercentage,
    totalStudyHours: Math.round(totalStudyHours * 10) / 10,
    revisionDueCount,
    pyqsAttempted,
    pyqsCorrect,
    pyqAccuracy,
    mocksCompleted,
    averageMockScore,
    bestMockScore,
    recentMockScore,
    currentStreak: state.studyStreak.current,
    longestStreak: state.studyStreak.longest
  };
}

export function calculateSubjectStats(state: AppState): SubjectStats[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return ALL_SUBJECTS.map((subject) => {
    const totalTopics = subject.topics.length;
    let completedTopics = 0;
    let inProgressTopics = 0;
    let notStartedTopics = 0;
    let revisionDueTopics = 0;
    let studyHours = 0;

    subject.topics.forEach((t) => {
      const u = state.topicData[t.id];
      const status: TopicStatus = u ? u.status : 'not_started';
      if (status === 'completed') completedTopics++;
      else if (status === 'in_progress') inProgressTopics++;
      else notStartedTopics++;

      if (u) {
        studyHours += u.studyHours || 0;
        if (u.status === 'completed' && u.nextRevisionDue && u.nextRevisionDue <= todayStr) {
          revisionDueTopics++;
        }
      }
    });

    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      subject,
      totalTopics,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      revisionDueTopics,
      percentage,
      studyHours: Math.round(studyHours * 10) / 10
    };
  });
}

export function getCountdownTime(examDateIso: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
} {
  const examTime = new Date(examDateIso).getTime();
  const now = Date.now();
  const diff = examTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPassed: false };
}
