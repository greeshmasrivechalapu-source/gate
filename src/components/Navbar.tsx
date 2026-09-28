import React from 'react';
import { Flame, Sparkles, User, Menu } from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  currentStreak: number;
  onOpenSmartRecommendation: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  currentStreak,
  onOpenSmartRecommendation,
  onOpenMobileMenu
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            LET'S CRACK GATE DA 2027
          </span>
        </button>
      </div>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeView === 'dashboard' ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('subjects')}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeView === 'subjects' ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => onNavigate('study_plan')}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeView === 'study_plan' ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Study Plan
        </button>
        <button
          onClick={() => onNavigate('revision')}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeView === 'revision' ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Revision
        </button>
        <button
          onClick={() => onNavigate('pyqs')}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeView === 'pyqs' ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          PYQs
        </button>
        <button
          onClick={() => onNavigate('mock_tests')}
          className={`hover:text-white transition-colors cursor-pointer ${
            activeView === 'mock_tests' ? 'text-blue-400 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Mocks
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-mono tabular-nums">{currentStreak}</span>
          <span className="hidden sm:inline">DAY STREAK</span>
        </div>

        {/* Smart What Should I Study CTA */}
        <button
          onClick={onOpenSmartRecommendation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden sm:inline">What to Study?</span>
          <span className="sm:hidden">Study AI</span>
        </button>

        {/* Profile / Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          aria-label="Settings and Profile"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Mobile menu trigger */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
            className="lg:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
