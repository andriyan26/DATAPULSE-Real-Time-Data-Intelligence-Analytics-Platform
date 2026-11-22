import React, { useState, useEffect } from 'react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface RadialProgressProps {
  score: number;
  label?: string;
  sublabel?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  score = 98.4,
  label = 'Progres Kualitas Data',
  sublabel = 'Tingkat Integritas',
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  // Animate stroke smoothly over 1.4s
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{label}</h3>
        <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
          Terverifikasi
        </span>
      </div>

      <div className="flex items-center justify-center py-2 relative">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100 dark:text-white/5"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="var(--brand-500)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1200 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            <AnimatedCounter value={score} decimals={1} suffix="%" duration={1400} />
          </span>
          <span className="text-[10px] text-slate-400">{sublabel}</span>
        </div>
      </div>

      <div className="text-center pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
        Continuous validation engine active
      </div>
    </div>
  );
};
