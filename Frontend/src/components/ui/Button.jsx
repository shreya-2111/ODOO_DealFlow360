import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus:ring-brand-500 border border-brand-700/20',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-subtle hover:border-slate-300 focus:ring-slate-400',
    outline: 'border border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-700/20',
    ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus:ring-slate-300',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4.5 py-2.5 gap-2.5',
    icon: 'p-2 text-slate-500 hover:text-slate-800',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
    </button>
  );
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  const dotColors = {
    default: 'bg-slate-400',
    brand: 'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

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
