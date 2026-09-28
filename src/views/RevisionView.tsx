import React, { useState } from 'react';
import { AppState, TopicUserData } from '../types';
import { ALL_TOPICS, getSubjectById, getTopicById } from '../data/syllabus';
import { REVISION_INTERVALS_DAYS } from '../utils/storage';
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  Check,
  History,
  AlertCircle
} from 'lucide-react';

interface RevisionViewProps {
  state: AppState;
  onLogRevision: (topicId: string, notes?: string) => void;
  onOpenTopic: (topicId: string) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  state,
  onLogRevision,
  onOpenTopic
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [revisionNotesInput, setRevisionNotesInput] = useState<Record<string, string>>({});

  // Categorize revisions
  const allCompletedTopics = ALL_TOPICS.filter((t) => {
    const u = state.topicData[t.id];
    return u && u.status === 'completed';
  });

  const dueTodayOrOverdue: { topic: typeof ALL_TOPICS[0]; userData: TopicUserData; isOverdue: boolean }[] = [];
  const upcomingRevisions: { topic: typeof ALL_TOPICS[0]; userData: TopicUserData }[] = [];

  allCompletedTopics.forEach((topic) => {
    const u = state.topicData[topic.id];
    if (!u.nextRevisionDue) return;

    if (u.nextRevisionDue <= todayStr) {
      dueTodayOrOverdue.push({
        topic,
        userData: u,
        isOverdue: u.nextRevisionDue < todayStr
      });
    } else {
      upcomingRevisions.push({
        topic,
        userData: u
      });
    }
  });

  // Sort due topics: overdue first
  dueTodayOrOverdue.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return (a.userData.nextRevisionDue || '').localeCompare(b.userData.nextRevisionDue || '');
  });

  // Sort upcoming by due date ascending
  upcomingRevisions.sort((a, b) => {
    return (a.userData.nextRevisionDue || '').localeCompare(b.userData.nextRevisionDue || '');
  });

  const handleCompleteRevision = (topicId: string) => {
    const note = revisionNotesInput[topicId] || 'Completed spaced repetition review.';
    onLogRevision(topicId, note);
    setRevisionNotesInput((prev) => ({ ...prev, [topicId]: '' }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Spaced Repetition Revision Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic intervals: 1d ➔ 3d ➔ 7d ➔ 14d ➔ 30d. Lock knowledge into permanent memory.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f1a36] border border-slate-800 text-xs">
          <span className="text-slate-400">Total In Revision Queue:</span>
          <span className="font-mono font-bold text-blue-400 tabular-nums">
            {allCompletedTopics.length} Completed Topics
          </span>
        </div>
      </div>

      {/* Interval Reference Banner */}
      <div className="p-4 rounded-xl bg-[#0f1a36]/60 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold text-slate-300">Spaced Repetition Schedule:</span>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {REVISION_INTERVALS_DAYS.map((days, idx) => (
            <div key={days} className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center">
                #{idx + 1}
              </span>
              <span className="font-mono text-white">{days} Day{days > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revisions Due Section */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                TODAY'S REVISION ({dueTodayOrOverdue.length})
              </h3>
              <p className="text-xs text-slate-400">
                Topics scheduled for review today based on spaced retention algorithms.
              </p>
            </div>
          </div>
        </div>

        {dueTodayOrOverdue.length === 0 ? (
          <div className="text-center py-10 rounded-xl bg-[#0b1329]/40 border border-slate-800 text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-200">No revisions currently due!</p>
            <p className="mt-1">All completed topics have satisfied their spaced review intervals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dueTodayOrOverdue.map(({ topic, userData, isOverdue }) => {
              const subject = getSubjectById(topic.subjectId);
              const revNum = (userData.revisionCount || 0) + 1;

              return (
                <div
                  key={topic.id}
                  className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="font-semibold"
                        style={{ color: subject?.color || '#3b82f6' }}
                      >
                        {subject?.shortName}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-blue-400 font-semibold">
                        Revision #{revNum}
                      </span>
                      {isOverdue && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            OVERDUE
                          </span>
                        </>
                      )}
                    </div>

                    <h4
                      onClick={() => onOpenTopic(topic.id)}
                      className="text-base font-bold text-white hover:text-blue-300 cursor-pointer transition-colors"
                    >
                      {topic.name}
                    </h4>

                    {userData.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        Notes: "{userData.notes}"
                      </p>
                    )}
                  </div>

                  {/* Complete Revision Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenTopic(topic.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      View Notes
                    </button>
                    <button
                      onClick={() => handleCompleteRevision(topic.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Revision Completed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Revisions Queue */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Upcoming Spaced Revisions ({upcomingRevisions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Future review dates calculated automatically to optimize long-term retention.
            </p>
          </div>
        </div>

        {upcomingRevisions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No upcoming revisions scheduled yet. Complete topics in the syllabus to trigger spaced revisions.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingRevisions.slice(0, 9).map(({ topic, userData }) => {
              const subject = getSubjectById(topic.subjectId);

              return (
                <div
                  key={topic.id}
                  onClick={() => onOpenTopic(topic.id)}
                  className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span
                        className="font-semibold text-[11px]"
                        style={{ color: subject?.color || '#3b82f6' }}
                      >
                        {subject?.shortName}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        Due {userData.nextRevisionDue}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {topic.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{userData.revisionCount} revisions done</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
