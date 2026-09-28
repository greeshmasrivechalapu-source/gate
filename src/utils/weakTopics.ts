import { AppState, SyllabusTopic } from '../types';
import { ALL_TOPICS, getSubjectById } from '../data/syllabus';

export interface WeakTopicAnalysis {
  topic: SyllabusTopic;
  subjectName: string;
  reasons: string[];
  severity: 'high' | 'medium';
  pyqAccuracy?: number;
  confidence?: string;
  difficulty?: string;
}

export function detectWeakTopics(state: AppState): WeakTopicAnalysis[] {
  const weakList: WeakTopicAnalysis[] = [];

  ALL_TOPICS.forEach((topic) => {
    const userData = state.topicData[topic.id];
    if (!userData) return;

    // Only analyze topics that have at least been started or have PYQs/mistakes logged
    const hasBeenTouched =
      userData.status === 'in_progress' ||
      userData.status === 'completed' ||
      userData.pyqsAttempted > 0;

    if (!hasBeenTouched) return;

    const reasons: string[] = [];
    let severity: 'high' | 'medium' = 'medium';

    // 1. Confidence check
    if (userData.confidence === 'low') {
      reasons.push('Low self-assessed confidence');
    }

    // 2. Difficulty marked hard
    if (userData.difficulty === 'hard') {
      reasons.push('Marked as high difficulty concept');
    }

    // 3. PYQ accuracy check
    let pyqAccuracy: number | undefined;
    if (userData.pyqsAttempted >= 5) {
      pyqAccuracy = Math.round((userData.pyqsCorrect / userData.pyqsAttempted) * 100);
      if (pyqAccuracy < 60) {
        reasons.push(`Low PYQ accuracy (${pyqAccuracy}% on ${userData.pyqsAttempted} questions)`);
        severity = 'high';
      }
    }

    // 4. Mistake book check
    const topicMistakes = state.mistakes.filter((m) => m.topicId === topic.id);
    if (topicMistakes.length >= 2) {
      reasons.push(`${topicMistakes.length} recorded errors in Mistake Book`);
      severity = 'high';
    } else if (topicMistakes.some((m) => !m.reviewed)) {
      reasons.push('Unreviewed mistake in Mistake Book');
    }

    // 5. Overdue revision
    const todayStr = new Date().toISOString().split('T')[0];
    if (userData.nextRevisionDue && userData.nextRevisionDue < todayStr) {
      reasons.push('Spaced revision is overdue');
    }

    // If 2 or more criteria met, or 1 critical criterion (accuracy < 60% with 5+ attempts)
    if (reasons.length >= 2 || (pyqAccuracy !== undefined && pyqAccuracy < 60)) {
      const subject = getSubjectById(topic.subjectId);
      weakList.push({
        topic,
        subjectName: subject?.shortName || subject?.name || 'GATE DA',
        reasons,
        severity,
        pyqAccuracy,
        confidence: userData.confidence,
        difficulty: userData.difficulty
      });
    }
  });

  // Sort by severity (high first) then by number of reasons descending
  return weakList.sort((a, b) => {
    if (a.severity === 'high' && b.severity !== 'high') return -1;
    if (b.severity === 'high' && a.severity !== 'high') return 1;
    return b.reasons.length - a.reasons.length;
  });
}
