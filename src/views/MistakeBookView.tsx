import React, { useState } from 'react';
import { AppState, MistakeRecord } from '../types';
import { ALL_SUBJECTS, ALL_TOPICS } from '../data/syllabus';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Trash2,
  BookOpen,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';

interface MistakeBookViewProps {
  state: AppState;
  onAddMistake: (mistake: Omit<MistakeRecord, 'id' | 'reviewed'>) => void;
  onToggleReviewed: (id: string) => void;
  onDeleteMistake: (id: string) => void;
  onOpenTopic: (topicId: string) => void;
}

export const MistakeBookView: React.FC<MistakeBookViewProps> = ({
  state,
  onAddMistake,
  onToggleReviewed,
  onDeleteMistake,
  onOpenTopic
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjectId, setSubjectId] = useState(ALL_SUBJECTS[0].id);
  const [topicId, setTopicId] = useState(ALL_SUBJECTS[0].topics[0].id);
  const [question, setQuestion] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [reasonForMistake, setReasonForMistake] = useState('');
  const [correctConcept, setCorrectConcept] = useState('');

  const [filterReviewed, setFilterReviewed] = useState<'all' | 'unreviewed' | 'reviewed'>('all');

  const currentSubjectTopics = ALL_TOPICS.filter((t) => t.subjectId === subjectId);

  const handleSubjectChange = (subId: string) => {
    setSubjectId(subId);
    const subTopics = ALL_TOPICS.filter((t) => t.subjectId === subId);
    if (subTopics.length > 0) {
      setTopicId(subTopics[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const topic = ALL_TOPICS.find((t) => t.id === topicId);
    const todayStr = new Date().toISOString().split('T')[0];

    onAddMistake({
      date: todayStr,
      subjectId,
      topicId,
      topicName: topic?.name || topicId,
      question: question.trim(),
      myAnswer: myAnswer.trim(),
      correctAnswer: correctAnswer.trim(),
      reasonForMistake: reasonForMistake.trim(),
      correctConcept: correctConcept.trim()
    });

    setShowAddModal(false);
    setQuestion('');
    setMyAnswer('');
    setCorrectAnswer('');
    setReasonForMistake('');
    setCorrectConcept('');
  };

  const mistakesToReview = state.mistakes.filter((m) => !m.reviewed);
  const reviewedCount = state.mistakes.filter((m) => m.reviewed).length;

  const filteredMistakes = state.mistakes.filter((m) => {
    if (filterReviewed === 'unreviewed') return !m.reviewed;
    if (filterReviewed === 'reviewed') return m.reviewed;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            MY MISTAKES (Error Log & Conceptual Vault)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log why you got questions wrong and study the correct concept to ensure zero repeat mistakes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Mistake</span>
        </button>
      </div>

      {/* Review Today Spotlight Banner */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Mistakes to Review Today ({mistakesToReview.length} Pending)
            </h3>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Reviewing logged mistakes before tests is proven to improve GATE rank by 25+ marks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#0b1329] rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterReviewed('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterReviewed === 'all' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({state.mistakes.length})
            </button>
            <button
              onClick={() => setFilterReviewed('unreviewed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterReviewed === 'unreviewed' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs Review ({mistakesToReview.length})
            </button>
            <button
              onClick={() => setFilterReviewed('reviewed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterReviewed === 'reviewed' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mastered ({reviewedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-4">
        {filteredMistakes.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-[#0f1a36]/50 border border-slate-800 text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-200">No mistakes found for this filter!</p>
            <p className="mt-1">Keep solving PYQs and mock tests. Record tricky pitfalls here.</p>
          </div>
        ) : (
          filteredMistakes.map((item) => {
            const sub = ALL_SUBJECTS.find((s) => s.id === item.subjectId);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  item.reviewed
                    ? 'bg-[#0f1a36]/50 border-slate-800/80 opacity-80'
                    : 'bg-[#0f1a36] border-amber-900/40 shadow-lg'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="font-bold"
                      style={{ color: sub?.color || '#3b82f6' }}
                    >
                      {sub?.shortName}
                    </span>
                    <span className="text-slate-600">·</span>
                    <button
                      onClick={() => onOpenTopic(item.topicId)}
                      className="font-semibold text-white hover:text-blue-300 transition-colors"
                    >
                      {item.topicName}
                    </button>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-400">{item.date}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onToggleReviewed(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.reviewed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{item.reviewed ? 'Concept Mastered' : 'Mark as Reviewed'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteMistake(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Question:
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {item.question}
                  </p>
                </div>

                {/* Answers Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs">
                    <span className="font-bold text-rose-400 block mb-1">
                      ❌ What I Answered:
                    </span>
                    <p className="text-slate-200">{item.myAnswer}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs">
                    <span className="font-bold text-emerald-400 block mb-1">
                      ✅ Correct Answer:
                    </span>
                    <p className="text-slate-200">{item.correctAnswer}</p>
                  </div>
                </div>

                {/* Why I made mistake & Correct Concept */}
                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <span className="font-bold text-amber-400">Why I Made the Mistake: </span>
                    <span className="text-slate-300">{item.reasonForMistake}</span>
                  </div>

                  <div>
                    <span className="font-bold text-blue-400">Correct Concept / Rule to Remember: </span>
                    <span className="text-slate-200 font-medium">{item.correctConcept}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Mistake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0f1a36] border border-slate-700 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Record Question in Mistake Book</h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">The Question / Problem</label>
                <textarea
                  rows={3}
                  placeholder="Paste question statement or describe test problem..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-rose-400 block mb-1 font-semibold">What I Answered (Incorrect)</label>
                  <textarea
                    rows={2}
                    placeholder="My erroneous choice or numerical answer..."
                    value={myAnswer}
                    onChange={(e) => setMyAnswer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-emerald-400 block mb-1 font-semibold">Correct Answer</label>
                  <textarea
                    rows={2}
                    placeholder="Official correct answer..."
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-amber-400 block mb-1 font-semibold">Why I Made the Mistake</label>
                <input
                  type="text"
                  placeholder="e.g. Calculation error, misread question, false assumption about eigenvalues"
                  value={reasonForMistake}
                  onChange={(e) => setReasonForMistake(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-blue-400 block mb-1 font-semibold">Correct Concept / Formula to Remember</label>
                <textarea
                  rows={2}
                  placeholder="The exact theorem, derivation, or shortcut rule to avoid this error..."
                  value={correctConcept}
                  onChange={(e) => setCorrectConcept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                  required
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Save into Mistake Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
