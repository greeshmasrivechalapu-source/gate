import React, { useState } from 'react';
import { AppState, DailyStudyTask } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock, BookOpen, AlertCircle, X } from 'lucide-react';

interface CalendarViewProps {
  state: AppState;
  onOpenTopic: (topicId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ state, onOpenTopic }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Pad previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonthDate = new Date(year, month - 1, d);
    days.push({
      dateStr: prevMonthDate.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Pad next month
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextDay = 1;
  while (days.length < totalCells) {
    const nextDate = new Date(year, month + 1, nextDay);
    days.push({
      dateStr: nextDate.toISOString().split('T')[0],
      dayNum: nextDay,
      isCurrentMonth: false
    });
    nextDay++;
  }

  const selectedTasks = selectedDateStr ? state.dailyTasks[selectedDateStr] || [] : [];
  const selectedLog = selectedDateStr ? state.dailyLogs[selectedDateStr] : null;
  const selectedMocks = selectedDateStr
    ? state.mockTests.filter((m) => m.date === selectedDateStr)
    : [];
  const selectedPYQs = selectedDateStr
    ? state.pyqs.filter((p) => p.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Preparation Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track planned topics, completed modules, study hours, and mock exams by date.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-[#0f1a36] border border-slate-800 rounded-xl p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-white px-3 min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-[#0f1a36]/60 p-3 rounded-xl border border-slate-800">
        <span className="text-slate-400 font-semibold">Activity Indicators:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>🟢 Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>🔵 Planned Task</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>🟣 Mock Test</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>🟡 PYQ Practice</span>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl bg-[#0f1a36] border border-slate-800 p-4 md:p-6 shadow-xl overflow-hidden">
        {/* Day-of-week Headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, idx) => {
            const tasks = state.dailyTasks[day.dateStr] || [];
            const log = state.dailyLogs[day.dateStr];
            const hasCompleted = tasks.some((t) => t.completed) || (log && log.studyMinutes > 0);
            const hasPlanned = tasks.some((t) => !t.completed);
            const hasMock = state.mockTests.some((m) => m.date === day.dateStr);
            const hasPyq = state.pyqs.some((p) => p.date === day.dateStr);

            const isSelected = selectedDateStr === day.dateStr;
            const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20'
                    : day.isCurrentMonth
                    ? 'bg-[#0b1329] border-slate-800 hover:border-slate-700'
                    : 'bg-[#0b1329]/40 border-slate-800/40 opacity-40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                        : isSelected
                        ? 'text-blue-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {log && log.studyMinutes > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      {Math.round((log.studyMinutes / 60) * 10) / 10}h
                    </span>
                  )}
                </div>

                {/* Dots / Indicators */}
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {hasCompleted && (
                    <span
                      title="Completed Activity"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                  )}
                  {hasPlanned && (
                    <span
                      title="Planned Task"
                      className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    />
                  )}
                  {hasMock && (
                    <span
                      title="Mock Test"
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    />
                  )}
                  {hasPyq && (
                    <span
                      title="PYQs Solved"
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Detail Drawer / Box */}
      {selectedDateStr && (
        <div className="p-5 rounded-2xl bg-[#0f1a36] border border-blue-900/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Activity Details for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>
            {selectedLog && (
              <span className="text-xs font-mono font-semibold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                Logged Study Time: {Math.floor(selectedLog.studyMinutes / 60)}h {selectedLog.studyMinutes % 60}m
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Planned & Completed Tasks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Tasks ({selectedTasks.length})
              </h4>
              {selectedTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No tasks logged for this date.</p>
              ) : (
                selectedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#0b1329] border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className={`font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.topicName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {t.subjectName} · {t.targetMinutes}m ({t.type.toUpperCase()})
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {t.completed ? 'DONE' : 'PLANNED'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Mocks and PYQs logged on this date */}
            <div className="space-y-3">
              {selectedMocks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1.5">
                    Mock Tests
                  </h4>
                  {selectedMocks.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-[#0b1329] border border-purple-900/40 text-xs flex justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[11px] text-slate-400">{m.timeTakenMinutes} mins taken</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-purple-400 text-sm">
                          {m.marksObtained} / {m.totalMarks}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {Math.round((m.marksObtained / m.totalMarks) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPYQs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                    PYQ Sessions
                  </h4>
                  {selectedPYQs.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#0b1329] border border-amber-900/40 text-xs flex justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{p.topicName}</p>
                        <p className="text-[11px] text-slate-400">
                          {p.correct} correct of {p.attempted} attempted
                        </p>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {p.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedMocks.length === 0 && selectedPYQs.length === 0 && (
                <div className="text-xs text-slate-400 italic">
                  No mock tests or separate PYQ sessions recorded for this day.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
