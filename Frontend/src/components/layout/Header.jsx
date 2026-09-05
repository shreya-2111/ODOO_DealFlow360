import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Check,
  Building,
  UserCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';

export function Header({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, switchRole, roles } = useAuth();
  const { addToast } = useToast();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Breadcrumb / Title mapping
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { section: 'Sales', title: 'Dashboard & Workspace' };
    if (path === '/quotations') return { section: 'Sales', title: 'Quotations List' };
    if (path.startsWith('/quotations/')) return { section: 'Quotations', title: 'Quotation Builder (CPQ)' };
    if (path === '/pipeline') return { section: 'Sales', title: 'Sales Pipeline (Kanban)' };
    if (path === '/approvals') return { section: 'Governance', title: 'Approvals Queue' };
    if (path.startsWith('/approvals/')) return { section: 'Approvals', title: 'Approval Review & Timeline' };
    if (path === '/fulfillment') return { section: 'Operations', title: 'Warehouse Fulfillment & Splits' };
    if (path === '/subscriptions') return { section: 'Revenue', title: 'Subscriptions & Billing' };
    if (path === '/portal') return { section: 'Customer', title: 'Client Negotiation Portal' };
    if (path === '/health') return { section: 'Intelligence', title: 'Deal Health Dashboard' };
    if (path === '/reports') return { section: 'Analytics', title: 'Executive Reports' };
    if (path === '/settings') return { section: 'Admin', title: 'Platform & Governance Configuration' };
    return { section: 'Workspace', title: 'DealFlow360' };
  };

  const breadcrumb = getBreadcrumb();

  const handleRoleSelect = (roleId) => {
    switchRole(roleId);
    setRoleMenuOpen(false);
    const selected = roles.find((r) => r.id === roleId);
    addToast(`Switched persona to ${selected.name} (${selected.role})`, 'info', 3000);

    if (roleId === 'customer') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToast(`Searching quotations, SKUs, and accounts for "${searchQuery}"...`, 'info');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle + Logo + Breadcrumb & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <img
          src={logoImg}
          alt="DealFlow360"
          className="h-8 w-8 object-contain rounded-lg lg:hidden shrink-0 border border-slate-100 bg-white"
        />

        <div className="min-w-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <span>{breadcrumb.section}</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-600 font-semibold">{breadcrumb.title}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
            {breadcrumb.title}
          </h2>
        </div>
      </div>

      {/* Center/Right: Search, Role Persona Switcher, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Global Fast Search */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals, products, SKUs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="hidden lg:inline text-slate-400">Role:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-800 rounded font-semibold">
              {currentUser.id === 'customer' ? 'Customer' : currentUser.role.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-modal border border-slate-200 z-40 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Persona (5 Roles)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Test role-specific workflows and permission gates
                  </p>
                </div>
                <div className="p-1 space-y-0.5 max-h-80 overflow-y-auto">
                  {roles.map((r) => {
                    const isSelected = r.id === currentUser.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-colors ${
                          isSelected ? 'bg-brand-50 text-brand-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{r.name}</div>
                            <div className="text-[11px] text-slate-500">{r.role}</div>
                            <div className="text-[10px] text-slate-400">{r.description}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => addToast('System status: All governance rule engines operating normally in INR (₹).', 'info')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
        />
      </div>
    </header>
  );
}
