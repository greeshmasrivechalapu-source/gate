import { AppState, TopicUserData, TopicStatus, DifficultyLevel, ConfidenceLevel, PYQRecord, MockTestRecord, MistakeRecord, DailyStudyTask } from '../types';
import { getInitialAppState, DEFAULT_BADGES } from '../data/defaultData';
import { ALL_TOPICS, getTopicById } from '../data/syllabus';

const STORAGE_KEY = 'lets_crack_gate_da_2027_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    // Ensure all current syllabus topics exist in topicData
    ALL_TOPICS.forEach((topic) => {
      if (!parsed.topicData[topic.id]) {
        parsed.topicData[topic.id] = {
          topicId: topic.id,
          status: 'not_started',
          studyHours: 0,
          notes: '',
          pyqsAttempted: 0,
          pyqsCorrect: 0,
          revisionCount: 0,
          revisionHistory: []
        };
      }
    });
    return parsed;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getInitialAppState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportAppStateAsJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importAppStateFromJson(jsonString: string): AppState {
  const parsed = JSON.parse(jsonString) as AppState;
  if (!parsed.topicData || !parsed.profile) {
    throw new Error('Invalid GATE DA state format');
  }
  saveAppState(parsed);
  return parsed;
}

export function resetAppStateToDefault(): AppState {
  const initial = getInitialAppState();
  saveAppState(initial);
  return initial;
}

// Spaced repetition intervals in days: 1, 3, 7, 14, 30
export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export function getNextRevisionDate(revisionCount: number, baseDate = new Date()): string {
  const intervalIndex = Math.min(revisionCount, REVISION_INTERVALS_DAYS.length - 1);
  const daysToAdd = REVISION_INTERVALS_DAYS[intervalIndex];
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate.toISOString().split('T')[0];
}

export function updateTopicStatus(
  state: AppState,
  topicId: string,
  newStatus: TopicStatus
): AppState {
  const current = state.topicData[topicId];
  if (!current) return state;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowIso = now.toISOString();

  const updatedTopic: TopicUserData = { ...current, status: newStatus };

  if (newStatus === 'completed') {
    if (!current.completedAt) {
      updatedTopic.completedAt = nowIso;
    }
    if (!current.startDate) {
      updatedTopic.startDate = current.startDate || nowIso;
    }
    // Schedule first spaced revision if not scheduled
    if (!updatedTopic.nextRevisionDue) {
      updatedTopic.nextRevisionDue = getNextRevisionDate(0, now);
    }
    if (updatedTopic.studyHours === 0) {
      const topicInfo = getTopicById(topicId);
      updatedTopic.studyHours = topicInfo?.estimatedHours || 4;
    }
  } else if (newStatus === 'in_progress') {
    if (!current.startDate) {
      updatedTopic.startDate = nowIso;
    }
    // When reverting to in_progress, keep completedAt null
    updatedTopic.completedAt = null;
  } else {
    // not_started (undo)
    updatedTopic.startDate = null;
    updatedTopic.completedAt = null;
    updatedTopic.nextRevisionDue = null;
  }

  const newTopicData = { ...state.topicData, [topicId]: updatedTopic };
  const updatedState = { ...state, topicData: newTopicData };

  // Check badges
  return checkAndUnlockBadges(updatedState);
}

export function logRevisionCompleted(
  state: AppState,
  topicId: string,
  notes?: string
): AppState {
  const current = state.topicData[topicId];
  if (!current) return state;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const newRevCount = (current.revisionCount || 0) + 1;
  const nextDue = getNextRevisionDate(newRevCount, now);

  const newHistory = [
    ...(current.revisionHistory || []),
    { date: todayStr, notes: notes || `Spaced revision #${newRevCount} completed` }
  ];

  const updatedTopic: TopicUserData = {
    ...current,
    revisionCount: newRevCount,
    lastRevisedAt: now.toISOString(),
    nextRevisionDue: nextDue,
    revisionHistory: newHistory
  };

  const newTopicData = { ...state.topicData, [topicId]: updatedTopic };

  // Also log in today's dailyLog
  const existingLog = state.dailyLogs[todayStr] || {
    date: todayStr,
    studyMinutes: 30,
    completedTopics: [],
    completedRevisions: [],
    pyqsAttempted: 0,
    pyqsCorrect: 0
  };

  const updatedLog = {
    ...existingLog,
    completedRevisions: Array.from(new Set([...existingLog.completedRevisions, topicId])),
    studyMinutes: existingLog.studyMinutes + 30
  };

  return {
    ...state,
    topicData: newTopicData,
    dailyLogs: {
      ...state.dailyLogs,
      [todayStr]: updatedLog
    }
  };
}

export function checkAndUnlockBadges(state: AppState): AppState {
  const completedCount = Object.values(state.topicData).filter(
    (t) => t.status === 'completed'
  ).length;
  const totalPYQs = state.pyqs.reduce((acc, p) => acc + p.attempted, 0);
  const totalMocks = state.mockTests.length;
  const currentStreak = state.studyStreak.current;
  const totalTopics = ALL_TOPICS.length;

  const unlocked = new Set(state.unlockedBadges);
  let changed = false;

  if (completedCount >= 1 && !unlocked.has('first_topic')) {
    unlocked.add('first_topic');
    changed = true;
  }
  if (completedCount >= 25 && !unlocked.has('topics_25')) {
    unlocked.add('topics_25');
    changed = true;
  }
  if (completedCount >= Math.floor(totalTopics / 2) && !unlocked.has('halfway_50')) {
    unlocked.add('halfway_50');
    changed = true;
  }
  if (currentStreak >= 7 && !unlocked.has('streak_7')) {
    unlocked.add('streak_7');
    changed = true;
  }
  if (currentStreak >= 30 && !unlocked.has('streak_30')) {
    unlocked.add('streak_30');
    changed = true;
  }
  if (totalMocks >= 1 && !unlocked.has('first_mock')) {
    unlocked.add('first_mock');
    changed = true;
  }
  if (totalPYQs >= 100 && !unlocked.has('pyq_100')) {
    unlocked.add('pyq_100');
    changed = true;
  }

  if (changed) {
    return { ...state, unlockedBadges: Array.from(unlocked) };
  }
  return state;
}
