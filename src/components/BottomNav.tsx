import React from 'react';
import { LayoutDashboard, BookOpen, CalendarCheck, RotateCcw, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenMoreMenu: () => void;
  revisionDueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenMoreMenu,
  revisionDueCount
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1329]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 shadow-2xl">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* Subjects */}
        <button
          onClick={() => onNavigate('subjects')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'subjects' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Syllabus</span>
        </button>

        {/* Daily Study Plan */}
        <button
          onClick={() => onNavigate('study_plan')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'study_plan' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Plan</span>
        </button>

        {/* Revision with count indicator */}
        <button
          onClick={() => onNavigate('revision')}
          className={`relative flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'revision' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <RotateCcw className="w-5 h-5" />
            {revisionDueCount > 0 && (
              <span className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-[9px] font-bold text-white">
                {revisionDueCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Revision</span>
        </button>

        {/* More Menu */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            ['pyqs', 'mock_tests', 'mistakes', 'analytics', 'notes', 'calendar', 'settings'].includes(activeView)
              ? 'text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </div>
    </nav>
  );
};
