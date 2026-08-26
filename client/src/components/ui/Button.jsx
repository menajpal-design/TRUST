import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-600/25',
    secondary: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 focus:ring-slate-600 border border-slate-700/80',
    outline:   'border border-indigo-500/60 text-indigo-400 hover:bg-indigo-950/60 hover:border-indigo-400 focus:ring-indigo-500',
    danger:    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white focus:ring-rose-500 shadow-lg shadow-rose-600/20',
    ghost:     'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 focus:ring-slate-600',
    success:   'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white focus:ring-emerald-500 shadow-lg shadow-emerald-600/20',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[11px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Please wait…</span>
        </>
      ) : children}
    </button>
  );
};
