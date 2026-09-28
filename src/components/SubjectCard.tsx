import React from 'react';
import { SubjectStats } from '../utils/progress';
import { ChevronRight, Sparkles } from 'lucide-react';

interface SubjectCardProps {
  stats: SubjectStats;
  onOpenSubject: (subjectId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ stats, onOpenSubject }) => {
  const { subject, totalTopics, completedTopics, inProgressTopics, notStartedTopics, revisionDueTopics, percentage } = stats;

  return (
    <div
      onClick={() => onOpenSubject(subject.id)}
      className="group relative rounded-2xl bg-[#0f1a36]/80 hover:bg-[#122044] border border-slate-800 hover:border-blue-500/40 p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-blue-900/10 flex flex-col justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
              {subject.name}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 shrink-0 font-medium">
            {subject.weightageEstimated}
          </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4">
          {subject.description}
        </p>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Completion</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {percentage}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: subject.color
              }}
            />
          </div>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-300 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-400">Done:</span>
            <span className="font-mono text-emerald-400 tabular-nums">{completedTopics}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-slate-400">Doing:</span>
            <span className="font-mono text-amber-400 tabular-nums">{inProgressTopics}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-400">Pending:</span>
            <span className="font-mono text-slate-400 tabular-nums">{notStartedTopics}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="text-slate-400">Revise:</span>
            <span className="font-mono text-blue-400 tabular-nums">{revisionDueTopics}</span>
          </div>
        </div>
      </div>

      {/* Card Action footer */}
      <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
        <span className="font-mono text-slate-400">
          {completedTopics} / {totalTopics} topics
        </span>
        <div className="flex items-center gap-1">
          <span>Open Subject</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};
