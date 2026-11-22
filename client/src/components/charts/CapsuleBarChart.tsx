import React, { useState, useEffect } from 'react';
import { CapsuleDataPoint } from '../../types';

interface CapsuleBarChartProps {
  data: CapsuleDataPoint[];
  title?: string;
  subtitle?: string;
}

export const CapsuleBarChart: React.FC<CapsuleBarChartProps> = ({
  data,
  title = 'Analitik Proyek & Ingesti Data',
  subtitle = 'Aktivitas ingesti data selama 7 hari terakhir',
}) => {
  // Animate bars upwards smoothly upon mounting (1-2 seconds)
  const [isAnimated, setIsAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getDayIndo = (day: string) => {
    switch (day.toLowerCase()) {
      case 'mon': return 'Sen';
      case 'tue': return 'Sel';
      case 'wed': return 'Rab';
      case 'thu': return 'Kam';
      case 'fri': return 'Jum';
      case 'sat': return 'Sab';
      case 'sun': return 'Min';
      default: return day;
    }
  };

  const getDayFullIndo = (day: string) => {
    switch (day.toLowerCase()) {
      case 'mon': return 'Senin';
      case 'tue': return 'Selasa';
      case 'wed': return 'Rabu';
      case 'thu': return 'Kamis';
      case 'fri': return 'Jumat';
      case 'sat': return 'Sabtu';
      case 'sun': return 'Minggu';
      default: return day;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between transition-all duration-300 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          </h3>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
          Minggu Ini
        </span>
      </div>

      {/* Capsule Columns Container matching Video 2 */}
      <div className="flex items-end justify-between gap-2.5 h-44 pt-6 px-2 relative">
        {data.map((item, index) => {
          // Calculate heights
          const targetHeight1 = Math.min(Math.max(item.value1, 15), 100);
          const targetHeight2 = Math.min(Math.max(item.value2, 10), 80);

          // Animated heights (starts at 0%, grows to targetHeight)
          const currentHeight1 = isAnimated ? targetHeight1 : 0;
          const currentHeight2 = isAnimated ? targetHeight2 : 0;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.day}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
            >
              {/* Interactive Silky Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-30 px-2.5 py-1.5 rounded-xl bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono shadow-xl border border-white/10 dark:border-slate-200 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-bold font-sans text-brand-400 dark:text-brand-600">
                    {getDayFullIndo(item.label)} (Hari {item.day})
                  </div>
                  <div>Vol Ingesti: <span className="font-bold">{item.value1 * 42} data</span></div>
                  <div>Integritas: <span className="font-bold text-emerald-400 dark:text-emerald-600">{item.value2}%</span></div>
                </div>
              )}

              {/* Pillar Column */}
              <div className="w-8 sm:w-10 h-32 flex flex-col items-center justify-end relative transition-transform duration-200 group-hover:scale-105">
                
                {/* Secondary Capsule Pill inside/behind */}
                {item.status === 'solid' ? (
                  <div
                    className="w-full rounded-full relative flex flex-col justify-end overflow-hidden transition-all duration-1000 ease-out"
                    style={{
                      height: `${currentHeight1}%`,
                      transitionDelay: `${index * 80}ms`,
                      backgroundColor: item.active ? 'var(--brand-500)' : 'var(--brand-600)',
                      boxShadow: item.active || isHovered ? '0 0 20px var(--brand-glow)' : 'none',
                    }}
                  >
                    {/* Inner highlight or textured pattern */}
                    <div
                      className="w-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        height: `${currentHeight2}%`,
                        backgroundColor: 'rgba(255, 255, 255, 0.28)',
                      }}
                    />
                  </div>
                ) : item.status === 'striped' ? (
                  /* Striped / Segmented Pills (from Video 2) */
                  <div
                    className="w-full rounded-full border-2 border-dashed border-brand-500/50 flex flex-col justify-between p-1 transition-all duration-1000 ease-out"
                    style={{
                      height: `${currentHeight1}%`,
                      transitionDelay: `${index * 80}ms`,
                    }}
                  >
                    <div className="w-full h-2 rounded-full bg-brand-500/30" />
                    <div className="w-full h-2 rounded-full bg-brand-500/50" />
                    <div className="w-full h-2 rounded-full bg-brand-500/70" />
                  </div>
                ) : (
                  /* Outline Capsule Pillar (from Video 2) */
                  <div
                    className="w-full rounded-full border border-slate-300 dark:border-white/15 bg-slate-100/50 dark:bg-white/5 transition-all duration-1000 ease-out"
                    style={{
                      height: `${currentHeight1}%`,
                      transitionDelay: `${index * 80}ms`,
                    }}
                  />
                )}
              </div>

              {/* Day Label Below (1, 2, 3, 4, 5, 6, 7 matching Video 2) */}
              <div className="flex flex-col items-center">
                <span
                  className={`text-[11px] font-mono font-medium transition-colors ${
                    item.active || isHovered
                      ? 'text-brand-600 dark:text-brand-400 font-bold'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                >
                  {item.day}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">{getDayIndo(item.label)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
