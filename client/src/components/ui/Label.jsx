import React from 'react';

export const Label = ({ children, className = '', ...props }) => {
  return (
    <label
      className={`block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
