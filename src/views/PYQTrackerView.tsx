import React, { useState } from 'react';
import { AppState, PYQRecord, DifficultyLevel } from '../types';
import { ALL_SUBJECTS, ALL_TOPICS } from '../data/syllabus';
import {
  FileQuestion,
  Plus,
  Target,
  BarChart2,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PYQTrackerViewProps {
  state: AppState;
  onAddPYQ: (record: Omit<PYQRecord, 'id' | 'accuracy'>) => void;
  onDeletePYQ: (id: string) => void;
}

export const PYQTrackerView: React.FC<PYQTrackerViewProps> = ({
  state,
  onAddPYQ,
  onDeletePYQ
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [year, setYear] = useState<number>(2024);
  const [subjectId, setSubjectId] = useState<string>(ALL_SUBJECTS[0].id);
  const [topicId, setTopicId] = useState<string>(ALL_SUBJECTS[0].topics[0].id);
  const [attempted, setAttempted] = useState<number>(10);
  const [correct, setCorrect] = useState<number>(8);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [notes, setNotes] = useState<string>('');

  // When subject changes, set topic to first topic in that subject
  const currentSubjectTopics = ALL_TOPICS.filter((t) => t.subjectId === subjectId);

  const handleSubjectChange = (newSubId: string) => {
    setSubjectId(newSubId);
    const subTopics = ALL_TOPICS.filter((t) => t.subjectId === newSubId);
    if (subTopics.length > 0) {
      setTopicId(subTopics[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = ALL_TOPICS.find((t) => t.id === topicId);
    const todayStr = new Date().toISOString().split('T')[0];

    onAddPYQ({
      year: Number(year),
      subjectId,
      topicId,
      topicName: topic?.name || topicId,
      attempted: Number(attempted),
      correct: Number(correct),
      difficulty,
      date: todayStr,
      notes: notes.trim()
    });

    setShowAddModal(false);
    setNotes('');
  };

  // Subject-wise aggregated PYQ performance
  const subjectPerformance = ALL_SUBJECTS.map((sub) => {
    const records = state.pyqs.filter((p) => p.subjectId === sub.id);
    const totalAttempted = records.reduce((sum, r) => sum + r.attempted, 0);
    const totalCorrect = records.reduce((sum, r) => sum + r.correct, 0);
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 1000) / 10 : 0;

    return {
      subject: sub,
      attempted: totalAttempted,
      correct: totalCorrect,
      accuracy,
      recordsCount: records.length
    };
  });

  const totalAttemptedAll = state.pyqs.reduce((s, p) => s + p.attempted, 0);
  const totalCorrectAll = state.pyqs.reduce((s, p) => s + p.correct, 0);
  const overallAccuracy = totalAttemptedAll > 0 ? Math.round((totalCorrectAll / totalAttemptedAll) * 1000) / 10 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            GATE DA Previous Year Questions (PYQ Tracker)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log official GATE DA 2024, 2025, 2026 questions & analyze subject-level accuracy.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log PYQ Session</span>
        </button>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Questions Attempted</span>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {totalAttemptedAll}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {state.pyqs.length} practice sessions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Questions Correct</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {totalCorrectAll}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {totalAttemptedAll - totalCorrectAll} incorrect answers
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Overall PYQ Accuracy</span>
          <div className="text-3xl font-extrabold font-mono text-blue-400 mt-1">
            {overallAccuracy}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Target accuracy: ≥ 80%
          </span>
        </div>
      </div>

      {/* Subject-wise Performance Table / Grid */}
      <div className="rounded-2xl bg-[#0f1a36] border border-slate-800 p-5 md:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">
          Subject-Wise PYQ Performance Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjectPerformance.map(({ subject, attempted, correct, accuracy, recordsCount }) => (
            <div
              key={subject.id}
              className="p-4 rounded-xl bg-[#0b1329] border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h4 className="text-xs font-bold text-white truncate">
                    {subject.name}
                  </h4>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Attempted:</span>
                    <span className="text-white">{attempted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Correct:</span>
                    <span className="text-emerald-400">{correct}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-sans">Accuracy:</span>
                <span
                  className={`font-mono font-bold ${
                    attempted === 0
                      ? 'text-slate-500'
                      : accuracy >= 75
                      ? 'text-emerald-400'
                      : accuracy >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {attempted > 0 ? `${accuracy}%` : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logged PYQ Sessions List */}
      <div className="rounded-2xl bg-[#0f1a36] border border-slate-800 p-5 md:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">
          Recorded PYQ Sessions ({state.pyqs.length})
        </h3>

        {state.pyqs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No PYQ sessions recorded yet. Click "Log PYQ Session" above to start tracking.
          </div>
        ) : (
          <div className="space-y-2.5">
            {state.pyqs.map((record) => {
              const sub = ALL_SUBJECTS.find((s) => s.id === record.subjectId);

              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-xl bg-[#0b1329] border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-mono font-bold text-blue-400">
                        GATE {record.year}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span
                        className="font-semibold"
                        style={{ color: sub?.color || '#3b82f6' }}
                      >
                        {sub?.shortName}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {record.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">
                      {record.topicName}
                    </h4>

                    {record.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {record.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                    <div className="text-right text-xs font-mono">
                      <div className="text-white font-bold">
                        {record.correct} / {record.attempted} Correct
                      </div>
                      <div
                        className={`text-[11px] font-bold ${
                          record.accuracy >= 80
                            ? 'text-emerald-400'
                            : record.accuracy >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {record.accuracy}% Accuracy
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletePYQ(record.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add PYQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1a36] border border-slate-700 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Log GATE DA Practice Session</h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">GATE Paper Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                  >
                    <option value={2024}>GATE DA 2024 (Official)</option>
                    <option value={2025}>GATE DA 2025 (Official)</option>
                    <option value={2026}>GATE DA 2026 (Official)</option>
                    <option value={2023}>GATE CS/Math Allied</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white capitalize"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                >
                  {ALL_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                >
                  {currentSubjectTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Questions Attempted</label>
                  <input
                    type="number"
                    min="1"
                    value={attempted}
                    onChange={(e) => setAttempted(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Questions Correct</label>
                  <input
                    type="number"
                    min="0"
                    max={attempted}
                    value={correct}
                    onChange={(e) => setCorrect(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Notes / Question Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Q.14, Q.29 (NAT question on probability matrix)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Save PYQ Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
