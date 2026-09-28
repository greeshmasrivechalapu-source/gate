import React, { useState } from 'react';
import { AppState, UserProfile } from '../types';
import {
  exportAppStateAsJson,
  importAppStateFromJson,
  resetAppStateToDefault
} from '../utils/storage';
import {
  Settings,
  User,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Smartphone,
  Server,
  Key,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetData: () => void;
  onImportData: (importedState: AppState) => void;
  onOpenOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateProfile,
  onResetData,
  onImportData,
  onOpenOnboarding
}) => {
  const [profile, setProfile] = useState<UserProfile>(state.profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Authentication demo state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authEmail, setAuthEmail] = useState('greeshmasrivechalapu@gmail.com');
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = () => {
    const jsonStr = exportAppStateAsJson(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GATE_DA_2027_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importAppStateFromJson(content);
        onImportData(imported);
        setImportError(null);
        alert('Data successfully imported and restored!');
      } catch (err) {
        setImportError('Failed to parse backup JSON. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all progress back to sample default data?')) {
      onResetData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Application Settings & User Profile
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure exam date, daily commitments, data backup/restore, and deployment credentials.
        </p>
      </div>

      {/* User Profile & Examination Parameters */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-400" />
          <span>Aspirant Profile & GATE Target</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Your Name / Title</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Examination Paper</label>
              <input
                type="text"
                value={profile.paper}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329]/50 border border-slate-800 text-slate-400 text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                GATE 2027 Examination Date (Official Slot)
              </label>
              <input
                type="datetime-local"
                value={profile.examDate.slice(0, 16)}
                onChange={(e) => setProfile({ ...profile, examDate: e.target.value + ':00' })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard schedule: First Saturday of February 2027 (Configurable if IIT updates slots).
              </span>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Daily Study Target</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={profile.dailyStudyHours}
                  onChange={(e) => setProfile({ ...profile, dailyStudyHours: parseFloat(e.target.value) || 4 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-3.5 top-3 text-xs text-slate-500">hours / day</span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Target Score (out of 100)</label>
              <input
                type="number"
                min="30"
                max="100"
                value={profile.targetScore}
                onChange={(e) => setProfile({ ...profile, targetScore: parseInt(e.target.value) || 75 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Target All India Rank (AIR)</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={profile.targetRank}
                onChange={(e) => setProfile({ ...profile, targetRank: parseInt(e.target.value) || 50 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1329] border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Profile updated successfully!
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account Authentication & Security */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Aspirant Authentication (Local / Cloud Ready)</span>
        </h3>

        <div className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-white">Signed in as: {authEmail}</span>
            </div>
            <p className="text-slate-400 mt-0.5">
              Local session active. Architecture ready for Firebase Auth / Supabase integration.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMsg('Password reset instructions dispatched to your email.');
                setTimeout(() => setAuthMsg(null), 3000);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => {
                alert('Session logged out in demo mode. Re-authenticated automatically.');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 font-semibold"
            >
              Log Out
            </button>
          </div>
        </div>

        {authMsg && (
          <p className="text-xs text-blue-400 font-medium">{authMsg}</p>
        )}
      </div>

      {/* Data Backup, Export & Reset */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          <span>Data Storage, Export & Recovery</span>
        </h3>

        <p className="text-xs text-slate-400">
          All your syllabus topics, study hours, PYQs, mock tests, and streak data are automatically persisted in your local browser storage. Export a JSON backup to transfer your progress across devices.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={onOpenOnboarding}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Restart Onboarding Wizard
          </button>

          <button
            onClick={handleResetConfirm}
            className="px-4 py-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default State</span>
          </button>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* Deployment & Android Guide */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#0f1a36] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>Deployment & Android PWA / TWA Instructions</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              1. Web Deployment (Vercel / Cloud Run / Netlify)
            </h4>
            <p className="text-slate-400">
              Run <code className="text-blue-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">npm run build</code>. The output directory is <code className="text-blue-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">dist/</code>. Deploy with any static host or Node server with zero external dependencies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1329] border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              2. Android Mobile App (PWA & Bubblewrap TWA)
            </h4>
            <p className="text-slate-400">
              This app is mobile-first and optimized for Android Chrome / Samsung Internet.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
              <li>
                <strong>Option A (Direct PWA Install):</strong> On Android Chrome, tap ⋮ (menu) ➔ "Add to Home screen" / "Install App". It launches as a fullscreen native app with offline cache.
              </li>
              <li>
                <strong>Option B (Google Play Store TWA):</strong> Use Google's official <code className="text-emerald-300 bg-slate-900 px-1 rounded font-mono">@bubblewrap/cli</code> to generate a signed Android APK / AAB package:
                <pre className="mt-1 p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto">
                  npx @bubblewrap/cli init --manifest=https://YOUR_DOMAIN/manifest.json{"\n"}
                  npx @bubblewrap/cli build
                </pre>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
