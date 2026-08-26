import React from 'react';

const typeConfig = {
  error:   { bg: 'bg-rose-950/40',    border: 'border-rose-800/60',   text: 'text-rose-300',   icon: '⚠️' },
  success: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/60',text: 'text-emerald-300', icon: '✅' },
  info:    { bg: 'bg-indigo-950/40',  border: 'border-indigo-800/60', text: 'text-indigo-300',  icon: 'ℹ️' },
  warning: { bg: 'bg-amber-950/40',   border: 'border-amber-800/60',  text: 'text-amber-300',   icon: '⚠️' },
};

export const Alert = ({ children, type = 'error', className = '' }) => {
  const cfg = typeConfig[type] || typeConfig.info;
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-medium ${cfg.bg} ${cfg.border} ${cfg.text} ${className}`}>
      <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
};
