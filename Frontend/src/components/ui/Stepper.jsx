import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export function Stepper({ steps = [], currentStepIndex = 0 }) {
  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isDone = step.status === 'approved' || idx < currentStepIndex;
          const isCurrent = step.status === 'pending' || idx === currentStepIndex;
          const isUpcoming = step.status === 'upcoming' || (!isDone && !isCurrent);
          const isRejected = step.status === 'rejected';

          return (
            <div key={idx} className="flex-1 relative flex flex-col items-center">
              {/* Connector line */}
              {idx !== 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 -translate-y-1/2 z-0 ${
                    isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step Circle */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 shadow-xs ${
                  isDone
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                    : isRejected
                    ? 'bg-rose-500 text-white ring-4 ring-rose-50'
                    : isCurrent
                    ? 'bg-brand-600 text-white ring-4 ring-brand-50'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : isRejected ? (
                  <AlertCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center max-w-[140px]">
                <p
                  className={`text-xs font-medium leading-tight ${
                    isDone
                      ? 'text-slate-900 font-semibold'
                      : isCurrent
                      ? 'text-brand-700 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.role || step.label}
                </p>
                {step.user && (
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{step.user}</p>
                )}
                {step.timestamp && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-slate-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${
              isActive
                ? 'border-brand-600 text-brand-600 bg-brand-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
