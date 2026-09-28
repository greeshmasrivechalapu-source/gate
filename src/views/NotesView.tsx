import React, { useState } from 'react';
import { AppState } from '../types';
import { ALL_SUBJECTS, ALL_TOPICS } from '../data/syllabus';
import { BookMarked, Search, Plus, Save, Trash2, Tag, Copy, Check } from 'lucide-react';

interface NoteItem {
  id: string;
  subjectId: string;
  topicId: string;
  title: string;
  category: 'formula' | 'trick' | 'concept' | 'revision';
  content: string;
  createdAt: string;
}

interface NotesViewProps {
  state: AppState;
  onOpenTopic: (topicId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ state, onOpenTopic }) => {
  // Store notes in state, seeded with standard high-yield GATE DA formulas
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      subjectId: 'prob_stats',
      topicId: 'ps-04',
      title: "Bayes' Theorem & Law of Total Probability",
      category: 'formula',
      content: 'P(A|B) = [P(B|A) * P(A)] / P(B) where P(B) = sum_i [P(B|A_i) * P(A_i)]. Crucial for disease testing and Spam filter priors.',
      createdAt: '2026-09-15'
    },
    {
      id: 'note-2',
      subjectId: 'linear_algebra',
      topicId: 'la-07',
      title: 'Eigenvalues Trace & Determinant Trick',
      category: 'trick',
      content: '1. Sum of eigenvalues = Trace(A)\n2. Product of eigenvalues = Det(A)\n3. For 2x2 matrix: lambda^2 - Trace(A)*lambda + Det(A) = 0.',
      createdAt: '2026-09-18'
    },
    {
      id: 'note-3',
      subjectId: 'machine_learning',
      topicId: 'ml-01',
      title: 'Normal Equation & Ridge Regularization Formula',
      category: 'formula',
      content: 'OLS: w = (X^T X)^-1 X^T y\nRidge: w = (X^T X + lambda * I)^-1 X^T y. Adding lambda * I makes (X^T X + lambda*I) always invertible even if X^T X is singular!',
      createdAt: '2026-09-20'
    },
    {
      id: 'note-4',
      subjectId: 'machine_learning',
      topicId: 'ml-06',
      title: 'SVM Margin & Support Vectors Condition',
      category: 'concept',
      content: 'Margin width = 2 / ||w||. For soft-margin SVM: Large C penalizes slack heavily (harder margin, lower bias, higher variance). Small C allows more violations (wider margin, higher bias).',
      createdAt: '2026-09-22'
    },
    {
      id: 'note-5',
      subjectId: 'calculus_opt',
      topicId: 'co-05',
      title: 'Multivariable Hessian Second Derivative Test',
      category: 'concept',
      content: 'At critical point grad(f) = 0:\n- If Hessian is Positive Definite -> Local Min\n- If Hessian is Negative Definite -> Local Max\n- If indefinite (both positive & negative eigenvalues) -> Saddle point.',
      createdAt: '2026-09-24'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Note form
  const [newSubjectId, setNewSubjectId] = useState(ALL_SUBJECTS[0].id);
  const [newTopicId, setNewTopicId] = useState(ALL_SUBJECTS[0].topics[0].id);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'formula' | 'trick' | 'concept' | 'revision'>('formula');
  const [newContent, setNewContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subTopics = ALL_TOPICS.filter((t) => t.subjectId === newSubjectId);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: NoteItem = {
      id: `note-${Date.now()}`,
      subjectId: newSubjectId,
      topicId: newTopicId,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setNotes((prev) => [item, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredNotes = notes.filter((n) => {
    if (selectedSubjectId && n.subjectId !== selectedSubjectId) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = n.title.toLowerCase().includes(q);
      const matchesContent = n.content.toLowerCase().includes(q);
      if (!matchesTitle && !matchesContent) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Formula Sheet, Shortcuts & Notes Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personal quick-reference cards organized by GATE DA subject and topic.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Formula / Note</span>
        </button>
      </div>

      {/* Search & Subject Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas, shortcuts, theorems..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0f1a36] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#0f1a36] rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'formula', label: '📐 Formulas' },
              { id: 'trick', label: '⚡ Short Tricks' },
              { id: 'concept', label: '💡 Concepts' },
              { id: 'revision', label: '🔄 Revision' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject pills filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              selectedSubjectId === null
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'bg-[#0f1a36] text-slate-400 border border-slate-800'
            }`}
          >
            All Subjects
          </button>
          {ALL_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                selectedSubjectId === s.id
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'bg-[#0f1a36] text-slate-400 border border-slate-800'
              }`}
            >
              {s.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-2xl bg-[#0f1a36]/40 border border-slate-800 text-xs text-slate-400">
            No formulas or notes found for this search. Add your first note using the button above.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const sub = ALL_SUBJECTS.find((s) => s.id === note.subjectId);
            const topic = ALL_TOPICS.find((t) => t.id === note.topicId);

            return (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-[#0f1a36] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="font-bold"
                        style={{ color: sub?.color || '#3b82f6' }}
                      >
                        {sub?.shortName}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 truncate max-w-[150px]">
                        {topic?.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {note.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {note.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-[#0b1329] border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">Saved {note.createdAt}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(note.id, note.content)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                      title="Copy formula"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0f1a36] border border-slate-700 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Add Formula or Concept Card</h3>

            <form onSubmit={handleCreateNote} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      const t = ALL_TOPICS.filter((top) => top.subjectId === e.target.value);
                      if (t.length > 0) setNewTopicId(t[0].id);
                    }}
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
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                  >
                    <option value="formula">Formula</option>
                    <option value="trick">Short Trick / Shortcut</option>
                    <option value="concept">Concept / Derivation</option>
                    <option value="revision">Revision Summary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Associated Topic</label>
                <select
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                >
                  {subTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Card Title</label>
                <input
                  type="text"
                  placeholder="e.g. SVD Low-Rank Approximation Theorem"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Formula / Details</label>
                <textarea
                  rows={4}
                  placeholder="Write formulas, proofs, or memory aids..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b1329] border border-slate-700 text-white font-mono"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
