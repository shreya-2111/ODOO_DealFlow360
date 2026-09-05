import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Truck,
  Repeat,
  Globe,
  Receipt,
  Activity,
  BarChart3,
  Package,
  Sliders,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { quotations, fulfillmentOrders, subscriptions, dealHealth } = useData();
  const { isCustomer } = useAuth();

  const pendingApprovalsCount = quotations.filter((q) => q.status === 'Pending Approval').length;
  const pendingFulfillmentCount = fulfillmentOrders.filter((f) => f.status === 'Pending Allocation' || f.status === 'Partially Allocated').length;
  const atRiskDealsCount = dealHealth.length;

  const navSections = [
    {
      title: 'Sales & CPQ',
      items: [
        { name: 'Sales Command', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Quotations (CPQ)', path: '/quotations', icon: FileSpreadsheet, badge: quotations.length },
        { name: 'Approvals Queue', path: '/approvals', icon: CheckSquare, badge: pendingApprovalsCount, badgeColor: 'bg-amber-100 text-amber-800' },
      ],
    },
    {
      title: 'Operations & Billing',
      items: [
        { name: 'Fulfillment & Stock', path: '/fulfillment', icon: Truck, badge: pendingFulfillmentCount, badgeColor: 'bg-blue-100 text-blue-800' },
        { name: 'Subscriptions', path: '/subscriptions', icon: Repeat, badge: subscriptions.length },
        { name: 'Invoices Ledger', path: '/invoices', icon: Receipt },
      ],
    },
    {
      title: 'Customer & Health',
      items: [
        { name: 'Customer Portal', path: '/portal', icon: Globe, highlight: true },
        { name: 'Deal Health & Risk', path: '/health', icon: Activity, badge: atRiskDealsCount, badgeColor: 'bg-rose-100 text-rose-800' },
        { name: 'Executive Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Catalog & Governance',
      items: [
        { name: 'Product Catalog', path: '/products', icon: Package },
        { name: 'Governance Rules', path: '/governance', icon: Sliders },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-black text-lg">
              360
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base leading-none tracking-tight flex items-center gap-1.5">
                DealFlow<span className="text-brand-600">360</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5 block">
                B2B CPQ & Revenue OS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold border-l-3 border-brand-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${item.highlight && !isActive ? 'text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            item.badgeColor || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer info & active engine status */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Rule Engine Active
            </span>
            <span className="font-semibold text-slate-700">v2.4.0</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Multi-Warehouse CPQ & Subscriptions
          </div>
        </div>
      </aside>
    </>
  );
}
