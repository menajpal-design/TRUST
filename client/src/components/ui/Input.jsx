import React from 'react';

export const Input = React.forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
          error ? 'border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
