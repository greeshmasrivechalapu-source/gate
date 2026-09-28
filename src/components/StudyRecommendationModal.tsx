import React from 'react';
import { SmartRecommendationResult } from '../utils/smartRecommendations';
import { Sparkles, Clock, Check, ArrowRight, X, AlertCircle } from 'lucide-react';

interface StudyRecommendationModalProps {
  recommendation: SmartRecommendationResult;
  onClose: () => void;
  onApplyToTodayTasks: () => void;
}

export const StudyRecommendationModal: React.FC<StudyRecommendationModalProps> = ({
  recommendation,
  onClose,
  onApplyToTodayTasks
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0f1a36] border border-blue-600/40 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0d162f] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Today's Recommended Plan
              </h2>
              <p className="text-xs text-slate-400">
                Data-driven recommendation for {recommendation.dailyHours} study hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/40 text-xs text-blue-200">
            {recommendation.summaryMessage}
          </div>

          <div className="space-y-3">
            {recommendation.items.map((item, index) => {
              const badgeColors: Record<string, string> = {
                revision_due: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                weak_topic: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                core_remaining: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                pyq_drill: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              };

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {index + 1}.
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {item.subjectName}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          badgeColors[item.category] || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badgeLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {item.topicName}
                    </h4>

                    <p className="text-xs text-slate-400">
                      {item.rationale}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 sm:self-center px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-xs font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.allocatedMinutes} mins</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Total Targeted Allocation:</span>
            <span className="font-mono font-bold text-white">
              {Math.floor(recommendation.totalAllocatedMinutes / 60)}h{' '}
              {recommendation.totalAllocatedMinutes % 60}m
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-[#0d162f] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onApplyToTodayTasks}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply to Today's Study Target
          </button>
        </div>
      </div>
    </div>
  );
};
