import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, BookOpen, Target, Clock, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialProfile.name || 'Aspirant');
  const [paper, setPaper] = useState(initialProfile.paper || 'GATE DA');
  const [dailyHours, setDailyHours] = useState(initialProfile.dailyStudyHours || 4);
  const [targetScore, setTargetScore] = useState(initialProfile.targetScore || 75);
  const [prepLevel, setPrepLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    initialProfile.preparationLevel || 'intermediate'
  );

  const handleFinish = () => {
    onComplete({
      ...initialProfile,
      name,
      paper,
      dailyStudyHours: Number(dailyHours),
      targetScore: Number(targetScore),
      preparationLevel: prepLevel,
      onboardingCompleted: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0f1a36] border border-blue-600/40 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Preparation Setup · Step {step} of 4
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  s === step ? 'bg-blue-500 w-8' : s < step ? 'bg-blue-800' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                LET'S CRACK GATE DA 2027
              </h2>
              <p className="text-sm font-medium text-blue-400 mt-1">
                “Complete the syllabus. Track your progress. Crack GATE DA 2027.”
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Your comprehensive, syllabus-grounded tracking dashboard for Graduate Aptitude Test in Engineering — Data Science & Artificial Intelligence.
            </p>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Start Preparation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Paper */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Select Your Examination Paper
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                We currently provide deep syllabus tracking for Data Science & AI.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div
                onClick={() => setPaper('GATE DA')}
                className="p-4 rounded-xl border-2 border-blue-500 bg-blue-950/30 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">GATE DA 2027</h4>
                    <p className="text-xs text-slate-400">
                      Data Science & Artificial Intelligence (75 Topics)
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-[#0b1329]/60 opacity-60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-500">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400">GATE CS / IT</h4>
                    <p className="text-xs text-slate-500">Computer Science & IT (Coming Soon)</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-mono">Future</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Enter details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Set Your Study Targets
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize your daily commitment and baseline preparation level.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Your Name / Alias
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aspirant Rahul"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Daily Study Target
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="16"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(parseFloat(e.target.value) || 4)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-500">hours</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target GATE Score (out of 100)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value) || 75)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Current Preparation Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPrepLevel(lvl)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        prepLevel === lvl
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                          : 'bg-[#0b1329] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Your preparation dashboard is ready!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                We've configured your syllabus checklist, automatic study planner, spaced repetition scheduler, and countdown for GATE DA 2027.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Aspirant:</span>
                <span className="font-semibold text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Target:</span>
                <span className="font-mono font-semibold text-blue-400">{dailyHours} Hours/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Score:</span>
                <span className="font-mono font-semibold text-emerald-400">{targetScore} / 100</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Enter Preparation Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
