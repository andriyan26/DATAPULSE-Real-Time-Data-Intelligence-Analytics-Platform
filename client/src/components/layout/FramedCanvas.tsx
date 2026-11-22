import React from 'react';

export const FramedCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0c0f17] text-slate-900 dark:text-slate-100 flex flex-row transition-colors duration-200">
      {children}
    </div>
  );
};
