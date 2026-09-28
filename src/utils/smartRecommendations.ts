import { AppState, DailyStudyTask } from '../types';
import { ALL_TOPICS, getSubjectById, getTopicById } from '../data/syllabus';
import { detectWeakTopics } from './weakTopics';

export interface StudyRecommendationItem {
  id: string;
  subjectName: string;
  topicName: string;
  topicId: string;
  category: 'in_progress' | 'revision_due' | 'weak_topic' | 'core_remaining' | 'pyq_drill';
  badgeLabel: string;
  allocatedMinutes: number;
  rationale: string;
}

export interface SmartRecommendationResult {
  dailyHours: number;
  totalAllocatedMinutes: number;
  examDaysLeft: number;
  items: StudyRecommendationItem[];
  summaryMessage: string;
}

export function generateSmartStudyRecommendation(state: AppState): SmartRecommendationResult {
  const dailyHours = state.profile.dailyStudyHours || 4;
  let remainingMinutes = Math.round(dailyHours * 60);

  const todayStr = new Date().toISOString().split('T')[0];
  const exam = new Date(state.profile.examDate);
  const examDaysLeft = Math.max(1, Math.floor((exam.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const items: StudyRecommendationItem[] = [];

  // 1. Spaced Revision Due Today (Highest retention priority)
  const revisionsDue = ALL_TOPICS.filter((t) => {
    const u = state.topicData[t.id];
    return u && u.status === 'completed' && u.nextRevisionDue && u.nextRevisionDue <= todayStr;
  });

  if (revisionsDue.length > 0 && remainingMinutes >= 30) {
    const revTopic = revisionsDue[0];
    const sub = getSubjectById(revTopic.subjectId);
    const duration = Math.min(45, remainingMinutes);
    items.push({
      id: `rec-rev-${revTopic.id}`,
      subjectName: sub?.shortName || 'Revision',
      topicName: revTopic.name,
      topicId: revTopic.id,
      category: 'revision_due',
      badgeLabel: 'Spaced Revision Due',
      allocatedMinutes: duration,
      rationale: 'Active spaced repetition schedule due today to prevent exponential memory decay.'
    });
    remainingMinutes -= duration;
  }

  // 2. Weak Topic Drill (Targeting known blindspots)
  const weakTopics = detectWeakTopics(state);
  if (weakTopics.length > 0 && remainingMinutes >= 45) {
    const weak = weakTopics[0];
    const duration = Math.min(60, remainingMinutes);
    items.push({
      id: `rec-weak-${weak.topic.id}`,
      subjectName: weak.subjectName,
      topicName: weak.topic.name,
      topicId: weak.topic.id,
      category: 'weak_topic',
      badgeLabel: 'Weak Topic Drill',
      allocatedMinutes: duration,
      rationale: weak.reasons[0] || 'Targeted drill to address recorded mistakes and improve confidence.'
    });
    remainingMinutes -= duration;
  }

  // 3. Topics In-Progress (Momentum continuation)
  const inProgressTopics = ALL_TOPICS.filter((t) => {
    const u = state.topicData[t.id];
    return u && u.status === 'in_progress' && !items.some((item) => item.topicId === t.id);
  });

  if (inProgressTopics.length > 0 && remainingMinutes >= 45) {
    const currTopic = inProgressTopics[0];
    const sub = getSubjectById(currTopic.subjectId);
    const duration = Math.min(75, remainingMinutes);
    items.push({
      id: `rec-prog-${currTopic.id}`,
      subjectName: sub?.shortName || sub?.name || 'In Progress',
      topicName: currTopic.name,
      topicId: currTopic.id,
      category: 'in_progress',
      badgeLabel: 'Currently In Progress',
      allocatedMinutes: duration,
      rationale: 'Finish the active module, solve end-of-section practice problems, and mark as completed.'
    });
    remainingMinutes -= duration;
  }

  // 4. Core Not-Started Topics from high-weightage subjects
  if (remainingMinutes >= 45) {
    const notStartedCore = ALL_TOPICS.filter((t) => {
      const u = state.topicData[t.id];
      const isNotStarted = !u || u.status === 'not_started';
      return isNotStarted && t.importance === 'core' && !items.some((item) => item.topicId === t.id);
    });

    if (notStartedCore.length > 0) {
      const nextTopic = notStartedCore[0];
      const sub = getSubjectById(nextTopic.subjectId);
      const duration = Math.min(60, remainingMinutes);
      items.push({
        id: `rec-core-${nextTopic.id}`,
        subjectName: sub?.shortName || sub?.name || 'Syllabus',
        topicName: nextTopic.name,
        topicId: nextTopic.id,
        category: 'core_remaining',
        badgeLabel: 'Core Syllabus Topic',
        allocatedMinutes: duration,
        rationale: 'High-yield foundational topic with significant weightage in official GATE DA syllabus.'
      });
      remainingMinutes -= duration;
    }
  }

  // 5. PYQ Practice block
  if (remainingMinutes >= 30) {
    // Find completed topic that needs PYQ practice
    const completedWithoutManyPYQs = ALL_TOPICS.find((t) => {
      const u = state.topicData[t.id];
      return u && u.status === 'completed' && u.pyqsAttempted < 10;
    });

    const targetTopic = completedWithoutManyPYQs || ALL_TOPICS[0];
    const sub = getSubjectById(targetTopic.subjectId);

    items.push({
      id: `rec-pyq-${targetTopic.id}`,
      subjectName: sub?.shortName || 'PYQs',
      topicName: `${targetTopic.name} (PYQs)`,
      topicId: targetTopic.id,
      category: 'pyq_drill',
      badgeLabel: 'GATE PYQ Practice',
      allocatedMinutes: remainingMinutes,
      rationale: 'Timed numerical problem solving: test your conceptual accuracy and speed.'
    });
  }

  const totalAllocatedMinutes = items.reduce((sum, item) => sum + item.allocatedMinutes, 0);

  return {
    dailyHours,
    totalAllocatedMinutes,
    examDaysLeft,
    items,
    summaryMessage: `Personalized schedule optimized for ${dailyHours} hours based on remaining syllabus, spaced repetition, and accuracy metrics.`
  };
}

export function convertRecommendationsToDailyTasks(
  recommendations: StudyRecommendationItem[],
  dateStr = new Date().toISOString().split('T')[0]
): DailyStudyTask[] {
  return recommendations.map((item) => {
    let taskType: 'learn' | 'revision' | 'pyq' | 'mock' = 'learn';
    if (item.category === 'revision_due') taskType = 'revision';
    else if (item.category === 'pyq_drill') taskType = 'pyq';

    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: dateStr,
      topicId: item.topicId,
      subjectName: item.subjectName,
      topicName: item.topicName,
      type: taskType,
      targetMinutes: item.allocatedMinutes,
      completedMinutes: 0,
      completed: false
    };
  });
}
