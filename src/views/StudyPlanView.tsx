import React, { useState } from 'react';
import { AppState, DailyStudyTask, PlannerConfig } from '../types';
import { generatePreparationPlan, checkPlanPace } from '../utils/planner';
import { ALL_SUBJECTS, ALL_TOPICS } from '../data/syllabus';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Sliders,
  Check,
  Trash2
} from 'lucide-react';

interface StudyPlanViewProps {
  state: AppState;
  onUpdateConfig: (config: PlannerConfig) => void;
  onToggleTask: (dateStr: string, taskId: string) => void;
  onAddTask: (dateStr: string, task: Omit<DailyStudyTask, 'id' | 'completed'>) => void;
  onDeleteTask: (dateStr: string, taskId: string) => void;
  onOpenSmartRecommendation: () => void;
  onLogStudyMinutes: (dateStr: string, minutes: number) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  state,
  onUpdateConfig,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenSmartRecommendation,
  onLogStudyMinutes
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.dailyTasks[todayStr] || [];
  const todayLog = state.dailyLogs[todayStr] || {
    date: todayStr,
    studyMinutes: 0,
    completedTopics: [],
    completedRevisions: [],
    pyqsAttempted: 0,
    pyqsCorrect: 0
  };

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [dailyHours, setDailyHours] = useState(state.plannerConfig.dailyStudyHours);
  const [targetRevisions, setTargetRevisions] = useState(state.plannerConfig.targetRevisions);
  const [targetMocks, setTargetMocks] = useState(state.plannerConfig.targetMocks);

  // Custom task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(ALL_SUBJECTS[0].name);
  const [newTaskMinutes, setNewTaskMinutes] = useState(60);
  const [newTaskType, setNewTaskType] = useState<'learn' | 'revision' | 'pyq' | 'mock'>('learn');

  const phases = generatePreparationPlan(state.plannerConfig, state.profile.examDate);
  const pace = checkPlanPace(state);

  const completedTasksCount = todayTasks.filter((t) => t.completed).length;
  const targetTotalMinutes = todayTasks.reduce((sum, t) => sum + t.targetMinutes, 0) || Math.round(state.profile.dailyStudyHours * 60);
  const loggedMinutes = todayLog.studyMinutes || 0;

  const handleSaveConfig = () => {
    onUpdateConfig({
      ...state.plannerConfig,
      dailyStudyHours: Number(dailyHours),
      targetRevisions: Number(targetRevisions),
      targetMocks: Number(targetMocks),
      planGeneratedAt: todayStr
    });
    setShowConfigModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask(todayStr, {
      date: todayStr,
      topicId: 'custom',
      subjectName: newTaskSubject,
      topicName: newTaskTitle.trim(),
      type: newTaskType,
      targetMinutes: Number(newTaskMinutes),
      completedMinutes: 0
    });

    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            GATE DA 2027 Study Planner & Daily Target
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            5-Phase automated timeline with daily study targets and pace tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0f1a36] hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Planner</span>
          </button>

          <button
            onClick={onOpenSmartRecommendation}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Recommendations</span>
          </button>
        </div>
      </div>

      {/* Pace Alert Box */}
      {pace.isBehind ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-300">{pace.message}</h4>
            <p className="text-amber-200/80 mt-0.5">{pace.suggestedAction}</p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{pace.message}</span>
          </div>
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
            Pace: On Track
          </span>
        </div>
      )}

      {/* Today's Target Card */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
              Daily Study Target · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              TODAY'S PLAN
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0b1329] border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] block">Study Time</span>
              <span className="font-mono font-bold text-white">
                {Math.floor(loggedMinutes / 60)}h {loggedMinutes % 60}m
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-[#0b1329] border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px] block">Target</span>
              <span className="font-mono font-bold text-blue-400">
                {Math.floor(targetTotalMinutes / 60)}h {targetTotalMinutes % 60}m
              </span>
            </div>
          </div>
        </div>

        {/* Quick Log Hours Bar */}
        <div className="mb-5 p-3 rounded-xl bg-[#0b1329] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300">
            Log study session for today:
          </span>
          <div className="flex items-center gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => onLogStudyMinutes(todayStr, mins)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/30 text-xs font-mono font-semibold text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 transition-colors"
              >
                +{mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Checklist */}
        <div className="space-y-2.5">
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-[#0b1329]/40 border border-slate-800 text-slate-400 text-xs">
              <p className="font-semibold text-slate-300">No tasks on today's target list.</p>
              <p className="mt-1">Use the "Smart Recommendations" button or add custom tasks below.</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  task.completed
                    ? 'bg-[#0b1329]/50 border-emerald-500/30'
                    : 'bg-[#0b1329] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => onToggleTask(todayStr, task.id)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
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
                      className={`text-sm font-semibold truncate ${
                        task.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {task.topicName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{task.subjectName}</span>
                      <span>·</span>
                      <span className="uppercase text-blue-400 font-mono">{task.type}</span>
                      <span>·</span>
                      <span className="font-mono">{task.targetMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(todayStr, task.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* End of Day summary banner if all tasks completed */}
        {todayTasks.length > 0 && completedTasksCount === todayTasks.length && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span className="font-bold">
              🎉 Today's Progress: {completedTasksCount}/{todayTasks.length} Completed! Outstanding effort.
            </span>
            <span className="font-mono">
              Study Time: {Math.floor(loggedMinutes / 60)}h {loggedMinutes % 60}m
            </span>
          </div>
        )}

        {/* Add custom task inline form */}
        <form onSubmit={handleCreateTask} className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Add Custom Task to Today's Plan
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="e.g. Solve 10 questions on Bayes Theorem"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newTaskSubject}
              onChange={(e) => setNewTaskSubject(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.shortName}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                min="15"
                step="15"
                value={newTaskMinutes}
                onChange={(e) => setNewTaskMinutes(parseInt(e.target.value) || 30)}
                className="w-20 px-2 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-xs text-white text-center font-mono"
              />
              <button
                type="submit"
                className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 5-Phases Preparation Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              GATE DA 2027 5-Phase Preparation Roadmap
            </h3>
            <p className="text-xs text-slate-400">
              Systematic progression from initial concept coverage through final revision.
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {phases.map((phase) => (
            <div
              key={phase.phaseNumber}
              className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-400 font-mono">
                    {phase.name}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-slate-400">
                    {phase.startDate} to {phase.endDate} ({phase.totalDays} Days)
                  </span>
                </div>

                <h4 className="text-base font-bold text-white tracking-tight">
                  {phase.title}
                </h4>

                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {phase.description}
                </p>

                <div className="text-xs text-slate-300 pt-1">
                  <span className="text-blue-400 font-semibold">Focus Area: </span>
                  <span>{phase.focus}</span>
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {phase.phaseNumber === 1 ? 'ACTIVE PHASE' : 'UPCOMING'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planner Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f1a36] border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Customize Study Planner</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Study Hours per Day:
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Target Spaced Revisions Count:
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={targetRevisions}
                  onChange={(e) => setTargetRevisions(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Target Full-Length Mocks:
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={targetMocks}
                  onChange={(e) => setTargetMocks(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md"
              >
                Recalculate Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
