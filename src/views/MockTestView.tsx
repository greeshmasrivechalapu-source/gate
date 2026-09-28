import React, { useState } from 'react';
import { AppState, MockTestRecord } from '../types';
import {
  TestTube,
  Plus,
  TrendingUp,
  Award,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface MockTestViewProps {
  state: AppState;
  onAddMockTest: (mock: Omit<MockTestRecord, 'id'>) => void;
  onDeleteMockTest: (id: string) => void;
}

export const MockTestView: React.FC<MockTestViewProps> = ({
  state,
  onAddMockTest,
  onDeleteMockTest
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [marksObtained, setMarksObtained] = useState<number>(65);
  const [correctCount, setCorrectCount] = useState<number>(45);
  const [incorrectCount, setIncorrectCount] = useState<number>(12);
  const [unattemptedCount, setUnattemptedCount] = useState<number>(8);
  const [timeTakenMinutes, setTimeTakenMinutes] = useState<number>(170);
  const [notes, setNotes] = useState('');

  const mocks = state.mockTests;
  const totalMocks = mocks.length;

  let averageScore = 0;
  let bestScore = 0;
  let recentScore = 0;

  if (totalMocks > 0) {
    const scores = mocks.map((m) => m.marksObtained);
    averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / totalMocks) * 10) / 10;
    bestScore = Math.round(Math.max(...scores) * 10) / 10;
    recentScore = Math.round(scores[scores.length - 1] * 10) / 10;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMockTest({
      name: name.trim(),
      date,
      totalMarks: Number(totalMarks),
      marksObtained: Number(marksObtained),
      correctCount: Number(correctCount),
      incorrectCount: Number(incorrectCount),
      unattemptedCount: Number(unattemptedCount),
      timeTakenMinutes: Number(timeTakenMinutes),
      notes: notes.trim()
    });

    setShowAddModal(false);
    setName('');
    setNotes('');
  };

  // SVG Line Chart Points calculation
  const chartHeight = 160;
  const chartWidth = 500;
  const maxScore = Math.max(100, ...mocks.map((m) => m.totalMarks));

  const points = mocks.map((m, idx) => {
    const x = mocks.length > 1 ? (idx / (mocks.length - 1)) * (chartWidth - 60) + 30 : chartWidth / 2;
    const y = chartHeight - (m.marksObtained / maxScore) * (chartHeight - 40) - 20;
    return { x, y, score: m.marksObtained, name: m.name, date: m.date };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            GATE DA Mock Test Tracker & Score Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log sectional and full-length 3-hour GATE tests, accuracy, negative marks, and score progression.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Mock Test Result</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Tests Attempted</span>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {totalMocks}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Target: {state.plannerConfig.targetMocks} tests
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Average Marks</span>
          <div className="text-3xl font-extrabold font-mono text-blue-400 mt-1">
            {averageScore}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Average across all attempts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Best Mock Score</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {bestScore}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Peak performance achieved
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1a36] border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Most Recent Score</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
            {recentScore}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Last test performance
          </span>
        </div>
      </div>

      {/* Score Trend Graph (Clean SVG Line Chart) */}
      <div className="rounded-2xl bg-[#0f1a36] border border-slate-800 p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Mock Test Score Trend Over Time
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Scale: 0 to {maxScore} Marks
          </span>
        </div>

        {mocks.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No mock tests recorded yet. Add your first mock test to visualize your score progression.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              {/* Grid lines */}
              {[25, 50, 75, 100].map((val) => {
                const y = chartHeight - (val / maxScore) * (chartHeight - 40) - 20;
                return (
                  <g key={val}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x="4"
                      y={y - 4}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val}M
                    </text>
                  </g>
                );
              })}

              {/* Trend line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#0f1a36"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pt.score}
                  </text>
                  <text
                    x={pt.x}
                    y={chartHeight - 4}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    Mock #{i + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Tests Table / List */}
      <div className="rounded-2xl bg-[#0f1a36] border border-slate-800 p-5 md:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">
          All Recorded Mock Tests ({mocks.length})
        </h3>

        {mocks.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No mock tests recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {mocks.map((test) => {
              const percentage = Math.round((test.marksObtained / test.totalMarks) * 100);
              const totalAttempted = test.correctCount + test.incorrectCount;
              const accuracy = totalAttempted > 0 ? Math.round((test.correctCount / totalAttempted) * 100) : 0;

              return (
                <div
                  key={test.id}
                  className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400">{test.date}</span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-blue-400 font-semibold">
                        {test.timeTakenMinutes} mins
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                      {test.name}
                    </h4>

                    {test.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        "{test.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    {/* Score badge */}
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-white">
                        {test.marksObtained} <span className="text-xs text-slate-500 font-normal">/ {test.totalMarks}</span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-emerald-400">
                        {percentage}% ({accuracy}% Accuracy)
                      </div>
                    </div>

                    {/* Breakdown counts */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                      <span className="text-emerald-400" title="Correct">
                        +{test.correctCount}
                      </span>
                      <span className="text-rose-400" title="Incorrect">
                        -{test.incorrectCount}
                      </span>
                      <span className="text-slate-500" title="Unattempted">
                        {test.unattemptedCount} unattempted
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteMockTest(test.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete mock test"
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

      {/* Add Mock Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1a36] border border-slate-700 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Log Mock Test Attempt</h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Test Name / Series</label>
                <input
                  type="text"
                  placeholder="e.g. MadeEasy Mock 3 / GATE DA Full Length 2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Time Taken (minutes)</label>
                  <input
                    type="number"
                    min="10"
                    value={timeTakenMinutes}
                    onChange={(e) => setTimeTakenMinutes(parseInt(e.target.value) || 180)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Total Marks</label>
                  <input
                    type="number"
                    min="10"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Marks Obtained (Net)</label>
                  <input
                    type="number"
                    step="0.33"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Correct</label>
                  <input
                    type="number"
                    min="0"
                    value={correctCount}
                    onChange={(e) => setCorrectCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono text-center"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Incorrect</label>
                  <input
                    type="number"
                    min="0"
                    value={incorrectCount}
                    onChange={(e) => setIncorrectCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono text-center"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Unattempted</label>
                  <input
                    type="number"
                    min="0"
                    value={unattemptedCount}
                    onChange={(e) => setUnattemptedCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Analysis / Observations</label>
                <input
                  type="text"
                  placeholder="e.g. Lost 4 marks in NAT numericals; strong in linear algebra"
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
                  Save Mock Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
