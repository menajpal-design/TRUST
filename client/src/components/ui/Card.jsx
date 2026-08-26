import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-900/70 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-xl p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};
