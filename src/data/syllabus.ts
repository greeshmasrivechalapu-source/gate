import syllabusJson from './gateDaSyllabus.json';
import { SyllabusSubject, SyllabusTopic } from '../types';

export const GATE_DA_SYLLABUS = syllabusJson;

export const ALL_SUBJECTS: SyllabusSubject[] = syllabusJson.subjects as SyllabusSubject[];

export const ALL_TOPICS: SyllabusTopic[] = ALL_SUBJECTS.flatMap((s) => s.topics);

export const TOPIC_MAP = new Map<string, SyllabusTopic>(
  ALL_TOPICS.map((t) => [t.id, t])
);

export const SUBJECT_MAP = new Map<string, SyllabusSubject>(
  ALL_SUBJECTS.map((s) => [s.id, s])
);

export function getTopicById(topicId: string): SyllabusTopic | undefined {
  return TOPIC_MAP.get(topicId);
}

export function getSubjectById(subjectId: string): SyllabusSubject | undefined {
  return SUBJECT_MAP.get(subjectId);
}

export function getSubjectByTopicId(topicId: string): SyllabusSubject | undefined {
  const topic = TOPIC_MAP.get(topicId);
  if (!topic) return undefined;
  return SUBJECT_MAP.get(topic.subjectId);
}

export const TOTAL_TOPICS_COUNT = ALL_TOPICS.length;
export const TOTAL_SUBJECTS_COUNT = ALL_SUBJECTS.length;
