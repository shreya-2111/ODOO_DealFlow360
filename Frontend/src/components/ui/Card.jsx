import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle ${
        hover ? 'hover:shadow-card-hover hover:border-slate-300 transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}>
      <div>
        <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
