import React, { useState } from 'react';
import { SyllabusTopic, TopicUserData, TopicStatus, DifficultyLevel, ConfidenceLevel } from '../types';
import { getSubjectById } from '../data/syllabus';
import { X, CheckCircle, Clock, BookOpen, RotateCcw, Award, Save, Play, Plus, Trash2 } from 'lucide-react';

interface TopicModalProps {
  topic: SyllabusTopic;
  userData: TopicUserData;
  onClose: () => void;
  onUpdateStatus: (newStatus: TopicStatus) => void;
  onSaveTopicDetails: (details: Partial<TopicUserData>) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  topic,
  userData,
  onClose,
  onUpdateStatus,
  onSaveTopicDetails
}) => {
  const subject = getSubjectById(topic.subjectId);

  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>(userData.difficulty);
  const [confidence, setConfidence] = useState<ConfidenceLevel | undefined>(userData.confidence);
  const [studyHours, setStudyHours] = useState<number>(userData.studyHours || 0);
  const [notes, setNotes] = useState<string>(userData.notes || '');
  const [pyqsAttempted, setPyqsAttempted] = useState<number>(userData.pyqsAttempted || 0);
  const [pyqsCorrect, setPyqsCorrect] = useState<number>(userData.pyqsCorrect || 0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveTopicDetails({
      difficulty,
      confidence,
      studyHours: Number(studyHours),
      notes,
      pyqsAttempted: Number(pyqsAttempted),
      pyqsCorrect: Number(pyqsCorrect)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleQuickAddHours = (hrs: number) => {
    const updated = Math.round((Number(studyHours) + hrs) * 10) / 10;
    setStudyHours(updated);
  };

  const handleQuickAddPYQ = (att: number, corr: number) => {
    setPyqsAttempted((prev) => prev + att);
    setPyqsCorrect((prev) => prev + corr);
  };

  const pyqAccuracy = pyqsAttempted > 0 ? Math.round((pyqsCorrect / pyqsAttempted) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1a36] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0d162f] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <span>{subject?.name}</span>
              <span className="text-slate-500">·</span>
              <span className="uppercase text-slate-400">{topic.importance} Importance</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              {topic.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status Bar & Quick Toggle */}
          <div className="bg-[#0b1329] p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Current Status:</span>
              <div className="flex items-center gap-2">
                {userData.status === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    COMPLETED
                  </span>
                )}
                {userData.status === 'in_progress' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    IN PROGRESS
                  </span>
                )}
                {userData.status === 'not_started' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    NOT STARTED
                  </span>
                )}

                {userData.completedAt && (
                  <span className="text-xs text-slate-400 font-mono">
                    Finished on {new Date(userData.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Quick 1-Click State Buttons */}
            <div className="flex items-center gap-2">
              {userData.status !== 'completed' ? (
                <button
                  onClick={() => onUpdateStatus('completed')}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Completed
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus('not_started')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Undo Completion
                </button>
              )}

              {userData.status === 'not_started' && (
                <button
                  onClick={() => onUpdateStatus('in_progress')}
                  className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer transition-all active:scale-95"
                >
                  Start Studying
                </button>
              )}
            </div>
          </div>

          {/* Subtopics Checklist / Scope */}
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Official Syllabus Subtopics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topic.subtopics.map((sub, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-300 bg-[#0b1329]/50 p-2.5 rounded-lg border border-slate-800/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty & Confidence Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="bg-[#0b1329]/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      difficulty === level
                        ? level === 'easy'
                          ? 'bg-emerald-600 text-white'
                          : level === 'medium'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-[#0b1329]/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Self Confidence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setConfidence(level)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      confidence === level
                        ? level === 'high'
                          ? 'bg-blue-600 text-white'
                          : level === 'medium'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700 text-amber-300'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Study Hours & PYQ Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Study Hours */}
            <div className="bg-[#0b1329]/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Total Study Hours: <span className="font-mono text-white">{studyHours} hrs</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={studyHours}
                  onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 rounded-lg bg-[#0f1a36] border border-slate-700 text-sm font-mono text-white text-center focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleQuickAddHours(0.5)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddHours(1)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddHours(2)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  +2h
                </button>
              </div>
            </div>

            {/* PYQ Performance */}
            <div className="bg-[#0b1329]/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  PYQ Practice
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">
                  Accuracy: {pyqAccuracy}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-slate-400 block mb-1">Attempted:</span>
                  <input
                    type="number"
                    min="0"
                    value={pyqsAttempted}
                    onChange={(e) => setPyqsAttempted(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0f1a36] border border-slate-700 text-sm font-mono text-white text-center"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Correct:</span>
                  <input
                    type="number"
                    min="0"
                    value={pyqsCorrect}
                    onChange={(e) => setPyqsCorrect(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0f1a36] border border-slate-700 text-sm font-mono text-white text-center"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAddPYQ(5, 4)}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                >
                  +5 Solved (4 Correct)
                </button>
              </div>
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Personal Notes, Formulas & Observations
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record key formulas, derivations, shortcuts, or concepts that were confusing during practice..."
              className="w-full p-3 rounded-xl bg-[#0b1329] border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Revision History */}
          {userData.revisionHistory && userData.revisionHistory.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Spaced Revision History ({userData.revisionHistory.length} completed)
              </h4>
              <div className="space-y-1.5">
                {userData.revisionHistory.map((rev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0b1329]/40 border border-slate-800 text-slate-300 font-mono"
                  >
                    <span>Revision #{i + 1} on {rev.date}</span>
                    <span className="text-slate-400">{rev.notes || 'Completed'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d162f] flex items-center justify-between shrink-0">
          <div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Changes Saved!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
