import { PlannerConfig, PlannerPhase, AppState } from '../types';
import { ALL_TOPICS } from '../data/syllabus';

export function generatePreparationPlan(
  config: PlannerConfig,
  examDateIso: string,
  startDate = new Date()
): PlannerPhase[] {
  const examDate = new Date(examDateIso);
  const totalDaysRemaining = Math.max(
    14,
    Math.floor((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Divide time realistically across the 5 phases:
  // Phase 1 (Syllabus Completion): 52% of remaining time
  // Phase 2 (First Revision): 18% of remaining time
  // Phase 3 (PYQs & Topic Tests): 14% of remaining time
  // Phase 4 (Full Mock Tests): 10% of remaining time
  // Phase 5 (Final Rapid Revision): 6% of remaining time

  const p1Days = Math.max(7, Math.floor(totalDaysRemaining * 0.52));
  const p2Days = Math.max(3, Math.floor(totalDaysRemaining * 0.18));
  const p3Days = Math.max(3, Math.floor(totalDaysRemaining * 0.14));
  const p4Days = Math.max(3, Math.floor(totalDaysRemaining * 0.10));
  const p5Days = Math.max(2, totalDaysRemaining - (p1Days + p2Days + p3Days + p4Days));

  const addDays = (d: Date, days: number): Date => {
    const next = new Date(d);
    next.setDate(next.getDate() + days);
    return next;
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let currentCursor = new Date(startDate);

  // Phase 1
  const p1Start = new Date(currentCursor);
  const p1End = addDays(p1Start, p1Days - 1);
  currentCursor = addDays(p1End, 1);

  // Phase 2
  const p2Start = new Date(currentCursor);
  const p2End = addDays(p2Start, p2Days - 1);
  currentCursor = addDays(p2End, 1);

  // Phase 3
  const p3Start = new Date(currentCursor);
  const p3End = addDays(p3Start, p3Days - 1);
  currentCursor = addDays(p3End, 1);

  // Phase 4
  const p4Start = new Date(currentCursor);
  const p4End = addDays(p4Start, p4Days - 1);
  currentCursor = addDays(p4End, 1);

  // Phase 5
  const p5Start = new Date(currentCursor);
  const p5End = examDate;

  return [
    {
      phaseNumber: 1,
      name: 'PHASE 1',
      title: 'Complete the Syllabus',
      description: 'Master core concepts across all 8 GATE DA subjects. Build strong conceptual foundation in Linear Algebra, Probability, Calculus, Python DSA, DBMS, ML, and AI.',
      startDate: formatDate(p1Start),
      endDate: formatDate(p1End),
      totalDays: p1Days,
      focus: 'Concept lectures, standard derivations, chapter-end exercises.',
      completed: false
    },
    {
      phaseNumber: 2,
      name: 'PHASE 2',
      title: 'First Revision & Sectional Drills',
      description: 'Systematic revisit of all completed subjects using spaced repetition. Consolidate short notes, formulas, and edge cases.',
      startDate: formatDate(p2Start),
      endDate: formatDate(p2End),
      totalDays: p2Days,
      focus: 'Subject revision tests, formula sheets, solving difficult concept doubts.',
      completed: false
    },
    {
      phaseNumber: 3,
      name: 'PHASE 3',
      title: 'Previous Year Questions (PYQs)',
      description: 'Solve GATE DA 2024, 2025, 2026 official papers plus relevant GATE CS math, algorithms, DBMS, and AI questions.',
      startDate: formatDate(p3Start),
      endDate: formatDate(p3End),
      totalDays: p3Days,
      focus: 'Timed PYQ practice, accuracy tracking, adding missed concepts to Mistake Book.',
      completed: false
    },
    {
      phaseNumber: 4,
      name: 'PHASE 4',
      title: 'Full-Length Mock Tests',
      description: 'Take 10 to 15 full-length 3-hour GATE DA mock tests in official exam slots (9:30 AM - 12:30 PM / 2:30 PM - 5:30 PM).',
      startDate: formatDate(p4Start),
      endDate: formatDate(p4End),
      totalDays: p4Days,
      focus: 'Virtual calculator speed, negative marking control, time management strategy.',
      completed: false
    },
    {
      phaseNumber: 5,
      name: 'PHASE 5',
      title: 'Final Rapid Revision & Formula Mastery',
      description: 'Final brush-up of formula cards, high-yield theorem cheat sheets, and reviewing all entries in MY MISTAKES.',
      startDate: formatDate(p5Start),
      endDate: formatDate(p5End),
      totalDays: p5Days,
      focus: 'Mistake book review, mental calm, exam day readiness.',
      completed: false
    }
  ];
}

export function checkPlanPace(state: AppState): {
  isBehind: boolean;
  message: string;
  suggestedAction: string;
} {
  const completedCount = Object.values(state.topicData).filter(
    (t) => t.status === 'completed'
  ).length;
  const totalTopics = ALL_TOPICS.length;
  const remainingTopics = totalTopics - completedCount;

  const now = new Date();
  const exam = new Date(state.profile.examDate);
  const daysLeft = Math.max(1, Math.floor((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const topicsPerDayNeeded = Math.round((remainingTopics / (daysLeft * 0.55)) * 10) / 10;

  if (topicsPerDayNeeded > 1.8 && remainingTopics > 30) {
    return {
      isBehind: true,
      message: `Pace Alert: You need to complete ~${topicsPerDayNeeded} topics per day to finish Phase 1 with sufficient revision buffer.`,
      suggestedAction: `Consider increasing daily study target by 1 hour or prioritizing high-weightage subjects like Probability, Linear Algebra, and Machine Learning.`
    };
  }

  return {
    isBehind: false,
    message: `You are on track! Remaining topics: ${remainingTopics} across ${daysLeft} days until GATE DA 2027.`,
    suggestedAction: 'Keep up the consistent daily target and review spaced repetitions.'
  };
}
