import React, { useState, useEffect } from 'react';
import { Pause, Play, Square, Activity } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const RealTimePulseWidget: React.FC = () => {
  const { isPaused, togglePauseStream, latencyMs } = useSocket();

  // Digital Monospace timer state matching Video 2 (starts around 01:24:08)
  const [secondsElapsed, setSecondsElapsed] = useState(5048); // 01:24:08

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10141e] via-[#0f121a] to-[#0a0d13] border border-white/10 shadow-lg text-white flex flex-col justify-between relative overflow-hidden group">
      
      {/* Background Organic Wave Texture matching Video 2 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-organic-pattern" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 tracking-wide">Pelacak Waktu Sesi (Time Tracker)</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
          {isPaused ? 'DIJEDA' : 'STREAMING AKTIF'}
        </span>
      </div>

      {/* Monospace Digital Timer Display matching Video 2 (e.g. 01:24:08) */}
      <div className="relative z-10 py-3 text-center">
        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-white select-all">
          {formatTime(secondsElapsed)}
        </div>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">
          Latensi mesin: {latencyMs}ms • Aliran socket real-time
        </p>
      </div>

      {/* Action Controls (Pause / Play & Stop red circle from Video 2) */}
      <div className="relative z-10 flex items-center justify-center gap-3 pt-2">
        {/* Toggle Pause / Resume Button */}
        <button
          onClick={togglePauseStream}
          title={isPaused ? 'Resume stream' : 'Pause stream'}
          className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-200 transition-all shadow-md active:scale-95"
        >
          {isPaused ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>

        {/* Red Stop / Reset Button from Video 2 */}
        <button
          onClick={() => {
            if (!isPaused) togglePauseStream();
            setSecondsElapsed(0);
          }}
          title="Reset timer"
          className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>

    </div>
  );
};

