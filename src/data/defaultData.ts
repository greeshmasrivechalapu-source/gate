import { AppState, Badge, TopicUserData, DailyStudyTask, PYQRecord, MockTestRecord, MistakeRecord } from '../types';
import { ALL_TOPICS } from './syllabus';

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_topic',
    title: 'First Step to IIT',
    description: 'Completed your very first GATE DA topic',
    icon: 'Trophy',
    category: 'topics',
    unlockedAt: '2026-09-10T10:00:00Z',
    requirement: 'Complete 1 topic'
  },
  {
    id: 'streak_7',
    title: 'Unstoppable Momentum',
    description: 'Maintained a 7-day consistent study streak',
    icon: 'Flame',
    category: 'streak',
    unlockedAt: '2026-09-25T21:00:00Z',
    requirement: 'Reach 7-day streak'
  },
  {
    id: 'topics_25',
    title: 'Quarter Milestone',
    description: 'Completed 25 comprehensive GATE DA topics',
    icon: 'BookOpen',
    category: 'topics',
    unlockedAt: '2026-09-26T18:30:00Z',
    requirement: 'Complete 25 topics'
  },
  {
    id: 'first_mock',
    title: 'Battle Tested',
    description: 'Completed your first full-length or sectional mock test',
    icon: 'Target',
    category: 'mock',
    unlockedAt: '2026-09-22T14:00:00Z',
    requirement: 'Complete 1 mock test'
  },
  {
    id: 'pyq_100',
    title: 'Century of PYQs',
    description: 'Attempted and analyzed 100+ official GATE practice questions',
    icon: 'CheckCircle',
    category: 'pyq',
    unlockedAt: null,
    requirement: 'Attempt 100 PYQs'
  },
  {
    id: 'halfway_50',
    title: 'Halfway to AIR 1',
    description: 'Completed 50% of the entire official GATE DA syllabus',
    icon: 'Rocket',
    category: 'milestone',
    unlockedAt: null,
    requirement: 'Complete 50% of syllabus'
  },
  {
    id: 'streak_30',
    title: 'Iron Discipline',
    description: 'Reached a remarkable 30-day continuous study streak',
    icon: 'Zap',
    category: 'streak',
    unlockedAt: null,
    requirement: 'Reach 30-day streak'
  }
];

export function getInitialAppState(): AppState {
  const todayStr = new Date().toISOString().split('T')[0];

  // Pre-seed some topics as completed, some as in_progress, and rest not_started
  const completedTopicIds = new Set([
    'ps-01', 'ps-02', 'ps-03', 'ps-04', 'ps-05', // Prob & stats completed
    'la-01', 'la-02', 'la-03', 'la-04', 'la-07', // Linear algebra completed
    'co-01', 'co-02', 'co-03', 'co-04',          // Calculus completed
    'pd-01', 'pd-02', 'pd-03', 'pd-06',          // Python & basic dsa completed
    'db-01', 'db-02', 'db-03',                   // DBMS basic completed
    'ml-01', 'ml-02', 'ml-03',                   // ML regression & knn completed
    'ai-01', 'ai-02',                            // AI search completed
    'ga-01', 'ga-03'                             // GA completed
  ]);

  const inProgressTopicIds = new Set([
    'ps-06', 'la-05', 'co-07', 'pd-07', 'db-04', 'ml-06', 'ml-07', 'ai-04'
  ]);

  const topicData: Record<string, TopicUserData> = {};

  ALL_TOPICS.forEach((topic) => {
    if (completedTopicIds.has(topic.id)) {
      // Completed topic
      const isWeak = topic.id === 'ml-06' || topic.id === 'db-04' || topic.id === 'ps-04';
      topicData[topic.id] = {
        topicId: topic.id,
        status: 'completed',
        difficulty: isWeak ? 'hard' : 'medium',
        confidence: isWeak ? 'low' : 'high',
        startDate: '2026-09-01T09:00:00Z',
        completedAt: '2026-09-20T17:00:00Z',
        studyHours: topic.estimatedHours || 5,
        notes: `Key formulas & concepts reviewed for ${topic.name}. Verified standard theorem proofs.`,
        pyqsAttempted: isWeak ? 15 : 12,
        pyqsCorrect: isWeak ? 7 : 11, // if weak, lower correct
        revisionCount: 2,
        lastRevisedAt: '2026-09-24T18:00:00Z',
        // Some are due today for revision!
        nextRevisionDue: (topic.id === 'ps-04' || topic.id === 'la-07' || topic.id === 'ml-01' || topic.id === 'db-03') 
          ? todayStr 
          : '2026-10-05',
        revisionHistory: [
          { date: '2026-09-21', notes: '1st spaced revision - formulas checked.' },
          { date: '2026-09-24', notes: '3rd day spaced revision - solved 5 practice problems.' }
        ]
      };
    } else if (inProgressTopicIds.has(topic.id)) {
      // In progress topic
      const isWeak = topic.id === 'ml-06';
      topicData[topic.id] = {
        topicId: topic.id,
        status: 'in_progress',
        difficulty: isWeak ? 'hard' : 'medium',
        confidence: isWeak ? 'low' : 'medium',
        startDate: '2026-09-26T10:00:00Z',
        completedAt: null,
        studyHours: 2.5,
        notes: `Currently solving practice exercises on ${topic.name}. Need more clarity on boundary conditions.`,
        pyqsAttempted: 8,
        pyqsCorrect: 4,
        revisionCount: 0,
        lastRevisedAt: null,
        nextRevisionDue: null,
        revisionHistory: []
      };
    } else {
      // Not started topic
      topicData[topic.id] = {
        topicId: topic.id,
        status: 'not_started',
        difficulty: undefined,
        confidence: undefined,
        startDate: null,
        completedAt: null,
        studyHours: 0,
        notes: '',
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
        lastRevisedAt: null,
        nextRevisionDue: null,
        revisionHistory: []
      };
    }
  });

  const samplePYQs: PYQRecord[] = [
    {
      id: 'pyq-1',
      year: 2024,
      subjectId: 'prob_stats',
      topicId: 'ps-04',
      topicName: "Bayes' Theorem & Inference",
      attempted: 10,
      correct: 8,
      accuracy: 80,
      difficulty: 'medium',
      date: '2026-09-22',
      notes: 'GATE DA 2024 Q.23 and Q.41 on conditional false positives.'
    },
    {
      id: 'pyq-2',
      year: 2024,
      subjectId: 'linear_algebra',
      topicId: 'la-07',
      topicName: 'Eigenvalues & Eigenvectors',
      attempted: 12,
      correct: 11,
      accuracy: 91.6,
      difficulty: 'medium',
      date: '2026-09-23',
      notes: 'Characteristic equation with 3x3 matrices and trace/determinant shortcut.'
    },
    {
      id: 'pyq-3',
      year: 2025,
      subjectId: 'machine_learning',
      topicId: 'ml-01',
      topicName: 'Linear Regression & Regularization (Ridge, Lasso)',
      attempted: 14,
      correct: 12,
      accuracy: 85.7,
      difficulty: 'hard',
      date: '2026-09-24',
      notes: 'Ridge L2 penalty gradient and singular matrix inversion handling.'
    },
    {
      id: 'pyq-4',
      year: 2024,
      subjectId: 'dbms_wh',
      topicId: 'db-04',
      topicName: 'Functional Dependencies & Normalization (1NF to BCNF)',
      attempted: 10,
      correct: 5,
      accuracy: 50.0,
      difficulty: 'hard',
      date: '2026-09-25',
      notes: 'Preservation of functional dependencies during decomposition.'
    },
    {
      id: 'pyq-5',
      year: 2025,
      subjectId: 'calculus_opt',
      topicId: 'co-04',
      topicName: 'Gradients & Directional Derivatives',
      attempted: 8,
      correct: 7,
      accuracy: 87.5,
      difficulty: 'medium',
      date: '2026-09-26',
      notes: 'Direction of steepest increase unit vector normalisation.'
    }
  ];

  const sampleMockTests: MockTestRecord[] = [
    {
      id: 'mock-1',
      name: 'GATE DA 2027 Sectional Mock 1 (Math & Stats)',
      date: '2026-09-15',
      totalMarks: 50,
      marksObtained: 38.67,
      correctCount: 22,
      incorrectCount: 5,
      unattemptedCount: 3,
      timeTakenMinutes: 85,
      notes: 'Good accuracy in Probability, minor calculation slip in 2-mark Eigenvalue problem.'
    },
    {
      id: 'mock-2',
      name: 'GATE DA 2027 Full Length Mock 1',
      date: '2026-09-22',
      totalMarks: 100,
      marksObtained: 66.33,
      correctCount: 44,
      incorrectCount: 11,
      unattemptedCount: 10,
      timeTakenMinutes: 172,
      notes: 'First full 3-hour simulation. Strong in Linear Algebra and Python DSA. Need to speed up DBMS Normalization and SVM.'
    }
  ];

  const sampleMistakes: MistakeRecord[] = [
    {
      id: 'mistake-1',
      date: '2026-09-25',
      subjectId: 'dbms_wh',
      topicId: 'db-04',
      topicName: 'Functional Dependencies & Normalization (1NF to BCNF)',
      question: 'Given relation R(A, B, C, D) with FDs AB -> C, C -> D, D -> A. Determine the highest normal form.',
      myAnswer: '3NF because non-prime attribute D is transitively dependent.',
      correctAnswer: 'BCNF because candidate keys are AB, BC, CD. Every determinant is a superkey!',
      reasonForMistake: 'Failed to find all candidate keys including cyclic ones (CD and BC).',
      correctConcept: 'Always compute closure of all attributes to identify ALL candidate keys before evaluating 3NF/BCNF.',
      reviewed: false
    },
    {
      id: 'mistake-2',
      date: '2026-09-24',
      subjectId: 'machine_learning',
      topicId: 'ml-06',
      topicName: 'Support Vector Machines (SVM)',
      question: 'What happens to the margin of a Soft-Margin SVM when the penalty parameter C approaches infinity?',
      myAnswer: 'The margin becomes maximum and allows many misclassifications.',
      correctAnswer: 'The penalty for margin violations becomes infinite, forcing Hard-Margin behavior (narrower margin, zero margin violations allowed).',
      reasonForMistake: 'Confused C parameter as regularization parameter instead of slack penalty multiplier.',
      correctConcept: 'In standard SVM formulation, large C = strict penalty = hard margin (risk of overfitting). Small C = wider margin (more tolerance).',
      reviewed: false
    },
    {
      id: 'mistake-3',
      date: '2026-09-23',
      subjectId: 'prob_stats',
      topicId: 'ps-07',
      topicName: 'Discrete Distributions: Bernoulli, Binomial, Poisson',
      question: 'For a Poisson distribution with parameter lambda, what is E[X(X-1)]?',
      myAnswer: 'lambda^2 - lambda',
      correctAnswer: 'lambda^2',
      reasonForMistake: 'Directly subtracted without expanding E[X^2] - E[X]. Since Var(X) = lambda, E[X^2] = lambda + lambda^2, so E[X^2] - E[X] = lambda^2.',
      correctConcept: 'Factorial moment for Poisson: E[X(X-1)...(X-k+1)] = lambda^k.',
      reviewed: true,
      reviewedAt: '2026-09-25'
    }
  ];

  const todayTasks: DailyStudyTask[] = [
    {
      id: 'task-1',
      date: todayStr,
      topicId: 'ps-06',
      subjectName: 'Probability and Statistics',
      topicName: 'Expectation, Variance & Moments',
      type: 'learn',
      targetMinutes: 90,
      completedMinutes: 90,
      completed: true
    },
    {
      id: 'task-2',
      date: todayStr,
      topicId: 'ml-06',
      subjectName: 'Machine Learning',
      topicName: 'Support Vector Machines (SVM)',
      type: 'learn',
      targetMinutes: 90,
      completedMinutes: 60,
      completed: false
    },
    {
      id: 'task-3',
      date: todayStr,
      topicId: 'ps-04',
      subjectName: 'Probability and Statistics',
      topicName: "Bayes' Theorem & Inference",
      type: 'revision',
      targetMinutes: 45,
      completedMinutes: 45,
      completed: true
    },
    {
      id: 'task-4',
      date: todayStr,
      topicId: 'la-07',
      subjectName: 'Linear Algebra',
      topicName: 'Eigenvalues & Eigenvectors',
      type: 'pyq',
      targetMinutes: 45,
      completedMinutes: 0,
      completed: false
    }
  ];

  return {
    profile: {
      name: 'Aspirant',
      paper: 'GATE DA',
      targetScore: 78,
      targetRank: 50,
      dailyStudyHours: 4.5,
      preferredStudyTime: 'morning',
      examDate: '2027-02-06T09:00:00',
      preparationLevel: 'intermediate',
      onboardingCompleted: true
    },
    topicData,
    dailyTasks: {
      [todayStr]: todayTasks
    },
    dailyLogs: {
      [todayStr]: {
        date: todayStr,
        studyMinutes: 195,
        completedTopics: ['ps-06'],
        completedRevisions: ['ps-04'],
        pyqsAttempted: 12,
        pyqsCorrect: 10,
        notes: 'Great productive session on conditional expectations and Bayes revision.'
      }
    },
    pyqs: samplePYQs,
    mockTests: sampleMockTests,
    mistakes: sampleMistakes,
    plannerConfig: {
      dailyStudyHours: 4.5,
      availableDaysPerWeek: 7,
      completedSubjectIds: [],
      targetRevisions: 3,
      targetMocks: 15,
      planGeneratedAt: '2026-09-01'
    },
    studyStreak: {
      current: 12,
      longest: 12,
      lastActiveDate: todayStr
    },
    unlockedBadges: ['first_topic', 'streak_7', 'topics_25', 'first_mock']
  };
}
