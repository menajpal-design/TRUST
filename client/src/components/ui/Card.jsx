import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
};
