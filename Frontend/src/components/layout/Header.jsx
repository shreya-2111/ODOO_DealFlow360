import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  UserCheck,
  Building,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export function Header({ onToggleSidebar }) {
  const { currentUser, switchRole, roles, tenant, setTenant } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleSelect = (roleId) => {
    switchRole(roleId);
    setRoleMenuOpen(false);
    const selected = roles.find((r) => r.id === roleId);
    addToast(`Switched persona to ${selected.name} (${selected.role})`, 'info', 3000);

    if (roleId === 'customer') {
      navigate('/portal');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToast(`Searching DealFlow360 records for "${searchQuery}"...`, 'info', 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left side: Mobile menu toggle + Global search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Fast Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotations, SKUs, customers, invoices (Press '/' to focus)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </form>
      </div>

      {/* Right side: Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="hidden md:inline text-slate-400">Persona:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-800 rounded font-medium">
              {currentUser.id === 'customer' ? 'Customer' : currentUser.role.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Role dropdown menu */}
          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-modal border border-slate-200 z-40 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Persona & Role
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Instantly test permissions & approval workflows
                  </p>
                </div>
                <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
                  {roles.map((r) => {
                    const isSelected = r.id === currentUser.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                          isSelected ? 'bg-brand-50 text-brand-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-medium text-slate-900">{r.name}</div>
                            <div className="text-[11px] text-slate-500">{r.role}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Customer Portal Switch Button */}
        {currentUser.id !== 'customer' && (
          <button
            onClick={() => {
              switchRole('customer');
              navigate('/portal');
              addToast('Switched to external Customer Portal view', 'info');
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={() => addToast('No unread critical system alerts at this moment', 'info')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
          />
        </div>
      </div>
    </header>
  );
}
