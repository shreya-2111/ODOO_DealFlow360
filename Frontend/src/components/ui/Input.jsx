import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white border rounded-lg text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-3 py-2 ${
            error ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 text-slate-900'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white border rounded-lg text-sm transition-colors text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 px-3 py-2 ${
          error ? 'border-rose-400 text-rose-900' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
}

export function TextArea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        className={`w-full bg-white border rounded-lg text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 p-3 ${
          error ? 'border-rose-400 text-rose-900' : 'border-slate-300 text-slate-900'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
    </div>
  );
}
