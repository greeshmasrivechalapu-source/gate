import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Calendar,
  RotateCcw,
  FileQuestion,
  TestTube,
  AlertTriangle,
  BarChart3,
  BookMarked,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  revisionDueCount: number;
  weakTopicsCount: number;
  mistakesUnreviewedCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  revisionDueCount,
  weakTopicsCount,
  mistakesUnreviewedCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'study_plan', label: 'Study Plan', icon: CalendarCheck },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    {
      id: 'revision',
      label: 'Revision',
      icon: RotateCcw,
      badge: revisionDueCount > 0 ? revisionDueCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    { id: 'pyqs', label: 'PYQs Tracker', icon: FileQuestion },
    { id: 'mock_tests', label: 'Mock Tests', icon: TestTube },
    {
      id: 'mistakes',
      label: 'Mistake Book',
      icon: AlertTriangle,
      badge: mistakesUnreviewedCount > 0 ? mistakesUnreviewedCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notes', label: 'Formula & Notes', icon: BookMarked },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0b1329] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-tight text-white">
              GATE DA 2027
            </span>
            <span className="text-[11px] text-slate-400">Preparation Hub</span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Data Science & AI</p>
          <p className="text-[11px] text-slate-400 mt-0.5">IISc / IIT GATE Syllabus</p>
        </div>
      </aside>
    </>
  );
};
