import React from 'react';

export const Input = React.forwardRef(({ className = '', error, label, ...props }, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-slate-100 placeholder-slate-500
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500/60
          ${error
            ? 'border-rose-500/70 focus:ring-rose-500/80 focus:border-rose-500/60'
            : 'border-slate-800/80 hover:border-slate-700'
          }
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
