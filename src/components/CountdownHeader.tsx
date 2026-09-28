import React, { useEffect, useState } from 'react';
import { getCountdownTime } from '../utils/progress';
import { Calendar, Clock } from 'lucide-react';

interface CountdownHeaderProps {
  examDateIso: string;
  onOpenSettings?: () => void;
}

export const CountdownHeader: React.FC<CountdownHeaderProps> = ({ examDateIso, onOpenSettings }) => {
  const [countdown, setCountdown] = useState(() => getCountdownTime(examDateIso));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownTime(examDateIso));
    }, 1000);
    return () => clearInterval(timer);
  }, [examDateIso]);

  const examFormatted = new Date(examDateIso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121c38] via-[#101932] to-[#0d152a] border border-blue-900/40 p-4 md:p-6 shadow-xl shadow-black/20">
      {/* Subtle radial ambient light */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Official Target: GATE DA 2027
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-normal">{examFormatted}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            COUNTDOWN TO GATE 2027
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
            Every day counts. Master concepts, solve PYQs, and revise consistently until examination day.
          </p>
        </div>

        {/* Live Countdown Clock Cards */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-col items-center justify-center min-w-[62px] sm:min-w-[72px] px-2.5 py-2 rounded-xl bg-[#0b1329]/90 border border-slate-800 shadow-inner">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {countdown.days}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
              Days
            </span>
          </div>

          <div className="text-xl font-bold text-slate-600">:</div>

          <div className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] px-2 py-2 rounded-xl bg-[#0b1329]/90 border border-slate-800 shadow-inner">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-400 tabular-nums">
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
              Hours
            </span>
          </div>

          <div className="text-xl font-bold text-slate-600">:</div>

          <div className="flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] px-2 py-2 rounded-xl bg-[#0b1329]/90 border border-slate-800 shadow-inner">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tabular-nums">
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
              Mins
            </span>
          </div>

          <div className="text-xl font-bold text-slate-600">:</div>

          <div className="flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] px-2 py-2 rounded-xl bg-[#0b1329]/90 border border-slate-800 shadow-inner">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
              {String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
              Secs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
