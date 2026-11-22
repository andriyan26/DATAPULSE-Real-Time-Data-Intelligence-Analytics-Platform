import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentColor = 'forest' | 'ocean' | 'plum' | 'ember';
export type WeekStartDay = 'Sunday' | 'Monday';
export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  weekStart: WeekStartDay;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentColor) => void;
  setWeekStart: (day: WeekStartDay) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('datapulse_theme_mode') as ThemeMode) || 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('datapulse_theme_accent') as AccentColor) || 'forest';
  });

  const [weekStart, setWeekStartState] = useState<WeekStartDay>(() => {
    return (localStorage.getItem('datapulse_week_start') as WeekStartDay) || 'Monday';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('datapulse_theme_mode', mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    localStorage.setItem('datapulse_theme_accent', accent);
  }, [accent]);

  const setMode = (newMode: ThemeMode) => setModeState(newMode);
  const toggleMode = () => setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const setAccent = (newAccent: AccentColor) => setAccentState(newAccent);

  const setWeekStart = (day: WeekStartDay) => {
    setWeekStartState(day);
    localStorage.setItem('datapulse_week_start', day);
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, weekStart, setMode, toggleMode, setAccent, setWeekStart }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

