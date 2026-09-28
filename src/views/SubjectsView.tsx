import React, { useState, useMemo } from 'react';
import { AppState, TopicStatus, SyllabusTopic } from '../types';
import { ALL_SUBJECTS, ALL_TOPICS, getSubjectById } from '../data/syllabus';
import { calculateSubjectStats } from '../utils/progress';
import {
  Search,
  CheckCircle,
  Clock,
  Circle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

interface SubjectsViewProps {
  state: AppState;
  selectedSubjectId?: string | null;
  onSelectSubjectId: (id: string | null) => void;
  onOpenTopic: (topicId: string) => void;
  onUpdateTopicStatus: (topicId: string, status: TopicStatus) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  state,
  selectedSubjectId,
  onSelectSubjectId,
  onOpenTopic,
  onUpdateTopicStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started' | 'revision_due'>('all');

  const subjectStats = useMemo(() => calculateSubjectStats(state), [state]);

  const activeSubjectStats = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjectStats.find((s) => s.subject.id === selectedSubjectId) || null;
  }, [selectedSubjectId, subjectStats]);

  const filteredTopics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return ALL_TOPICS.filter((topic) => {
      // Subject filter
      if (selectedSubjectId && topic.subjectId !== selectedSubjectId) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = topic.name.toLowerCase().includes(q);
        const matchesSubtopics = topic.subtopics?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesSubtopics) return false;
      }

      // Status filter
      const u = state.topicData[topic.id];
      const status: TopicStatus = u ? u.status : 'not_started';

      if (statusFilter === 'completed' && status !== 'completed') return false;
      if (statusFilter === 'in_progress' && status !== 'in_progress') return false;
      if (statusFilter === 'not_started' && status !== 'not_started') return false;
      if (statusFilter === 'revision_due') {
        const isDue = u && u.status === 'completed' && u.nextRevisionDue && u.nextRevisionDue <= todayStr;
        if (!isDue) return false;
      }

      return true;
    });
  }, [selectedSubjectId, searchQuery, statusFilter, state.topicData]);

  const handleNextStatus = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = state.topicData[topicId]?.status || 'not_started';
    if (current === 'not_started') {
      onUpdateTopicStatus(topicId, 'in_progress');
    } else if (current === 'in_progress') {
      onUpdateTopicStatus(topicId, 'completed');
    } else {
      // Completed -> undo back to not_started
      onUpdateTopicStatus(topicId, 'not_started');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Subject Pills */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              GATE DA 2027 Syllabus & Topic Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official syllabus checklist. Click topic to log notes, difficulty, and study hours.
            </p>
          </div>

          {activeSubjectStats && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0f1a36] border border-slate-800 text-xs">
              <span className="text-slate-400">Subject Progress:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {activeSubjectStats.percentage}% ({activeSubjectStats.completedTopics}/{activeSubjectStats.totalTopics})
              </span>
            </div>
          )}
        </div>

        {/* Subject Filter Tabs Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectSubjectId(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedSubjectId === null
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-[#0f1a36] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Subjects ({ALL_TOPICS.length})
          </button>

          {ALL_SUBJECTS.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            const stats = subjectStats.find((s) => s.subject.id === sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubjectId(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-[#0f1a36] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                <span>{sub.shortName}</span>
                {stats && (
                  <span className="font-mono text-[11px] opacity-75">
                    {stats.percentage}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, algorithms, theorems, keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f1a36] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#0f1a36] rounded-xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'completed', label: '🟢 Done' },
            { id: 'in_progress', label: '🟡 Doing' },
            { id: 'not_started', label: '🔴 Not Started' },
            { id: 'revision_due', label: '🔵 Revise' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setStatusFilter(btn.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === btn.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Count info */}
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Showing {filteredTopics.length} topics</span>
        <span className="text-[11px] text-slate-400">
          Tip: Click the status dot to cycle (Not Started ➔ In Progress ➔ Completed)
        </span>
      </div>

      {/* Topics List */}
      <div className="space-y-2.5">
        {filteredTopics.map((topic) => {
          const u = state.topicData[topic.id];
          const status: TopicStatus = u ? u.status : 'not_started';
          const subject = getSubjectById(topic.subjectId);
          const todayStr = new Date().toISOString().split('T')[0];
          const isRevisionDue = u?.status === 'completed' && u.nextRevisionDue && u.nextRevisionDue <= todayStr;

          return (
            <div
              key={topic.id}
              onClick={() => onOpenTopic(topic.id)}
              className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                status === 'completed'
                  ? 'bg-[#0f1a36]/60 border-emerald-950/40 hover:border-emerald-500/40'
                  : status === 'in_progress'
                  ? 'bg-[#0f1a36]/90 border-amber-950/40 hover:border-amber-500/40'
                  : 'bg-[#0f1a36]/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                {/* 1-Click Status Button */}
                <button
                  type="button"
                  title="Click to toggle topic status"
                  onClick={(e) => handleNextStatus(topic.id, e)}
                  className={`mt-0.5 sm:mt-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                    status === 'completed'
                      ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30'
                      : status === 'in_progress'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                      : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {status === 'completed' && <CheckCircle className="w-4 h-4" />}
                  {status === 'in_progress' && <Clock className="w-4 h-4" />}
                  {status === 'not_started' && <Circle className="w-4 h-4" />}
                </button>

                {/* Topic Metadata & Title */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs mb-0.5">
                    <span
                      className="font-semibold"
                      style={{ color: subject?.color || '#3b82f6' }}
                    >
                      {subject?.shortName}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {topic.importance}
                    </span>
                    {isRevisionDue && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                          REVISE DUE
                        </span>
                      </>
                    )}
                  </div>

                  <h3
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      status === 'completed'
                        ? 'text-slate-200'
                        : 'text-white group-hover:text-blue-300'
                    }`}
                  >
                    {topic.name}
                  </h3>

                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {topic.subtopics.join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side Stats & Quick Badges */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {u?.difficulty && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      u.difficulty === 'hard'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : u.difficulty === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {u.difficulty}
                  </span>
                )}

                {u?.confidence && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      u.confidence === 'high'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : u.confidence === 'medium'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {u.confidence} conf
                  </span>
                )}

                <div className="text-xs font-mono text-slate-400">
                  <span className="text-white font-bold">{u?.studyHours || 0}</span> / {topic.estimatedHours}h
                </div>

                <div className="p-1 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredTopics.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-[#0f1a36]/40 border border-slate-800 text-slate-400">
            <p className="text-sm font-semibold">No topics match your current filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                onSelectSubjectId(null);
              }}
              className="mt-2 text-xs text-blue-400 hover:underline font-medium"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
