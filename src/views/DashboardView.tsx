import React from 'react';
import { AppState, DailyStudyTask } from '../types';
import { calculateOverallStats, calculateSubjectStats } from '../utils/progress';
import { detectWeakTopics } from '../utils/weakTopics';
import { CountdownHeader } from '../components/CountdownHeader';
import { SubjectCard } from '../components/SubjectCard';
import {
  Flame,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
  Check
} from 'lucide-react';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (view: string) => void;
  onOpenSubject: (subjectId: string) => void;
  onOpenTopic: (topicId: string) => void;
  onToggleTask: (dateStr: string, taskId: string) => void;
  onLogRevision: (topicId: string) => void;
  onOpenSmartRecommendation: () => void;
  onOpenBadges: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenSubject,
  onOpenTopic,
  onToggleTask,
  onLogRevision,
  onOpenSmartRecommendation,
  onOpenBadges
}) => {
  const overall = calculateOverallStats(state);
  const subjectStats = calculateSubjectStats(state);
  const weakTopics = detectWeakTopics(state);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.dailyTasks[todayStr] || [];
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;

  // Spaced revision topics due today
  const revisionsDueToday = Object.values(state.topicData).filter(
    (t) => t.status === 'completed' && t.nextRevisionDue && t.nextRevisionDue <= todayStr
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Countdown Header */}
      <CountdownHeader
        examDateIso={state.profile.examDate}
        onOpenSettings={() => onNavigate('settings')}
      />

      {/* 2. Overall Syllabus Progress Banner */}
      <div className="rounded-2xl bg-[#0f1a36] border border-slate-800 p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <span>Overall Preparation Progress</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono">
                {overall.completedTopics} of {overall.totalTopics} Topics Completed
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums">
              {overall.overallPercentage}%
            </h2>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-[#0b1329] border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Completed</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {overall.completedTopics}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#0b1329] border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">In Progress</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {overall.inProgressTopics}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#0b1329] border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Remaining</span>
              <span className="text-base font-bold font-mono text-slate-300">
                {overall.notStartedTopics}
              </span>
            </div>

            <button
              onClick={onOpenBadges}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>{state.unlockedBadges.length} Badges</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${overall.overallPercentage}%` }}
          />
        </div>
      </div>

      {/* 3. Core Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div
          onClick={() => onNavigate('study_plan')}
          className="p-4 rounded-2xl bg-[#0f1a36]/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {overall.currentStreak} Days
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Longest: {overall.longestStreak} days
            </p>
          </div>
        </div>

        {/* Study Hours */}
        <div
          onClick={() => onNavigate('analytics')}
          className="p-4 rounded-2xl bg-[#0f1a36]/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Total Study Hours</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {overall.totalStudyHours}h
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Target: {state.profile.dailyStudyHours}h daily
            </p>
          </div>
        </div>

        {/* Revisions Due */}
        <div
          onClick={() => onNavigate('revision')}
          className="p-4 rounded-2xl bg-[#0f1a36]/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">Revisions Due</span>
            <RotateCcw className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
              {overall.revisionDueCount} Topics
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Spaced repetition queue
            </p>
          </div>
        </div>

        {/* PYQ Performance */}
        <div
          onClick={() => onNavigate('pyqs')}
          className="p-4 rounded-2xl bg-[#0f1a36]/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold">PYQ Accuracy</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {overall.pyqAccuracy}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {overall.pyqsCorrect} / {overall.pyqsAttempted} correct
            </p>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Row: Today's Target Plan & Today's Revisions Due */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Target Plan */}
        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Today's Target Plan</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                    {completedTodayTasks} / {todayTasks.length} Done
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check off tasks as you finish study blocks today.
                </p>
              </div>

              <button
                onClick={onOpenSmartRecommendation}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Smart Plan</span>
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No tasks scheduled for today yet.
                <button
                  onClick={onOpenSmartRecommendation}
                  className="block mx-auto mt-2 text-blue-400 font-semibold underline"
                >
                  Generate today's recommendation
                </button>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(todayStr, task.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-[#0b1329]/50 border-emerald-500/30 text-slate-400'
                        : 'bg-[#0b1329] border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            task.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.topicName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {task.subjectName} · {task.targetMinutes} mins ({task.type.toUpperCase()})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTopic(task.topicId);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">
              Target: {state.profile.dailyStudyHours} hours
            </span>
            <button
              onClick={() => onNavigate('study_plan')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Full Study Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Revision Due Today */}
        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Revisions Due Today</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                    {revisionsDueToday.length} Pending
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  1d, 3d, 7d, 14d, 30d spaced repetition algorithm
                </p>
              </div>

              <button
                onClick={() => onNavigate('revision')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View Schedule
              </button>
            </div>

            {revisionsDueToday.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                🎉 No revisions pending today! All spaced topics are up to date.
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {revisionsDueToday.slice(0, 4).map((userTopic) => {
                  const topicObj = state.topicData[userTopic.topicId];
                  return (
                    <div
                      key={userTopic.topicId}
                      className="p-3 rounded-xl bg-[#0b1329] border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {userTopic.topicId}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Revision #{userTopic.revisionCount + 1} due today
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onLogRevision(userTopic.topicId)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Mark Revised
                        </button>
                        <button
                          onClick={() => onOpenTopic(userTopic.topicId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">
              Spaced repetition locks knowledge in long-term memory
            </span>
            <button
              onClick={() => onNavigate('revision')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Revision Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Weak Topics Spotlight (Data-Driven) */}
      {weakTopics.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider">
                Weak Topics Requiring Attention ({weakTopics.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('mistakes')}
              className="text-xs text-rose-300 hover:text-rose-100 font-semibold"
            >
              Open Mistake Book
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakTopics.slice(0, 3).map((item) => (
              <div
                key={item.topic.id}
                onClick={() => onOpenTopic(item.topic.id)}
                className="p-3.5 rounded-xl bg-[#0b1329] border border-rose-900/40 hover:border-rose-700 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-rose-400 uppercase">
                    {item.subjectName}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                    {item.topic.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {item.reasons.join(' · ')}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-rose-300 font-medium">
                  <span>Drill this topic</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Subjects Dashboard Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              GATE DA 2027 Subjects Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Select any subject to view full syllabus checklist, status, and notes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View All Topics</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectStats.map((stats) => (
            <SubjectCard
              key={stats.subject.id}
              stats={stats}
              onOpenSubject={onOpenSubject}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
