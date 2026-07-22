import React from 'react';

export const Alert = ({ children, type = 'error', className = '' }) => {
  const styles = {
    error: 'bg-rose-950/50 border-rose-800/80 text-rose-300',
    success: 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300',
    info: 'bg-indigo-950/50 border-indigo-800/80 text-indigo-300'
  };

  return (
    <div className={`p-4 rounded-xl border text-sm font-medium ${styles[type]} ${className}`}>
      {children}
    </div>
  );
};
