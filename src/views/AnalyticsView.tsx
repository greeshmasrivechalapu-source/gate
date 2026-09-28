import React from 'react';
import { AppState } from '../types';
import { calculateOverallStats, calculateSubjectStats } from '../utils/progress';
import { detectWeakTopics } from '../utils/weakTopics';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
  onOpenSubject: (subjectId: string) => void;
  onOpenTopic: (topicId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  state,
  onOpenSubject,
  onOpenTopic
}) => {
  const overall = calculateOverallStats(state);
  const subjectStats = calculateSubjectStats(state);
  const weakTopics = detectWeakTopics(state);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          GATE DA 2027 Analytics & Performance Metrics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Deep diagnostic breakdown of syllabus coverage, revision consistency, PYQ accuracy, and mock exams.
        </p>
      </div>

      {/* Top 4 Macro Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Syllabus Completion</span>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {overall.overallPercentage}%
          </div>
          <span className="text-xs text-emerald-400 font-mono mt-0.5 block">
            {overall.completedTopics} / {overall.totalTopics} topics
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Cumulative Study Hours</span>
          <div className="text-3xl font-extrabold font-mono text-blue-400 mt-1">
            {overall.totalStudyHours}h
          </div>
          <span className="text-xs text-slate-400 font-mono mt-0.5 block">
            {state.profile.dailyStudyHours}h daily target
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">PYQ Accuracy Rate</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {overall.pyqAccuracy}%
          </div>
          <span className="text-xs text-slate-400 font-mono mt-0.5 block">
            {overall.pyqsCorrect} of {overall.pyqsAttempted} correct
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Average Mock Score</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
            {overall.averageMockScore}
          </div>
          <span className="text-xs text-slate-400 font-mono mt-0.5 block">
            Best score: {overall.bestMockScore} / 100
          </span>
        </div>
      </div>

      {/* Subject-Wise Syllabus Completion Progress Bars */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Subject-Wise Syllabus Completion</span>
        </h3>

        <div className="space-y-3.5">
          {subjectStats.map((item) => (
            <div
              key={item.subject.id}
              onClick={() => onOpenSubject(item.subject.id)}
              className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <span className="font-bold text-white">{item.subject.name}</span>
                  <span className="text-slate-500 font-mono">({item.subject.weightageEstimated})</span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-white font-bold">{item.percentage}%</span>
                  <span className="text-slate-500 ml-2">
                    {item.completedTopics} / {item.totalTopics}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.subject.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Weak Topic Analysis & Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topic Analysis */}
        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Data-Driven Weak Topic Identification</span>
            </h3>
            <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {weakTopics.length} Identified
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Topics highlighted based on low PYQ accuracy (&lt;60%), repeated mistake records, or low self-assessed confidence.
          </p>

          {weakTopics.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No weak topics currently flagged! Continue solving PYQs and taking mock tests.
            </div>
          ) : (
            <div className="space-y-2.5">
              {weakTopics.map((item) => (
                <div
                  key={item.topic.id}
                  onClick={() => onOpenTopic(item.topic.id)}
                  className="p-3 rounded-xl bg-[#0b1329] border border-rose-900/30 hover:border-rose-700 transition-all cursor-pointer flex justify-between items-center"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-semibold text-rose-400 uppercase">
                      {item.subjectName}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.topic.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.reasons.join(' · ')}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-500/20 text-rose-300 shrink-0 font-mono">
                    {item.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study Consistency & Mock Tests Performance */}
        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Mock Test Performance Benchmarks</span>
          </h3>

          <div className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target Score for Top IITs:</span>
              <span className="font-mono font-bold text-emerald-400">
                {state.profile.targetScore} / 100
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Highest Mock Attempt:</span>
              <span className="font-mono font-bold text-white">
                {overall.bestMockScore} / 100
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Score Gap to Target:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.max(0, Math.round((state.profile.targetScore - overall.bestMockScore) * 10) / 10)} Marks
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Daily Study Target:</span>
              <span className="font-mono font-bold text-blue-400">
                {state.profile.dailyStudyHours} Hours
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Study Streak:</span>
              <span className="font-mono font-bold text-amber-400">
                {overall.currentStreak} Days
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs text-blue-300">
            💡 <strong className="text-white">Pro Tip for GATE DA:</strong> The Mathematics section (Probability, Linear Algebra, Calculus) accounts for nearly 40-42% of the total paper. Securing 35+ marks in Math is the primary differentiator for AIR &lt; 100.
          </div>
        </div>
      </div>
    </div>
  );
};
