import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Kanban,
  Users,
  Truck,
  Repeat,
  Activity,
  BarChart3,
  Sliders,
  Globe,
  CheckSquare,
  Package,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import logoImg from '../../assets/logo.png';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { currentUser, isSalesRep, isSalesManager, isFinanceOps, isCustomer, isAdmin } = useAuth();
  const { quotations, fulfillmentSplits, subscriptions, dealHealth } = useData();

  const pendingApprovalsCount = quotations.filter((q) => q.stage === 'Pending Approval').length;
  const activeFulfillmentCount = fulfillmentSplits.filter((f) => f.status !== 'Ready to Ship').length;
  const atRiskCount = dealHealth.kpis.atRiskDeals;

  // Build navigation dynamically based on logged in role
  const getNavItems = () => {
    if (isCustomer) {
      return [
        {
          title: 'Customer Portal',
          items: [
            { name: 'My Quotations & Orders', path: '/portal', icon: Globe, highlight: true }
          ]
        }
      ];
    }

    const sections = [];

    // Sales & CPQ
    const salesItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet, badge: quotations.length },
      { name: 'Sales Pipeline', path: '/pipeline', icon: Kanban }
    ];

    if (isSalesManager || isFinanceOps || isAdmin) {
      salesItems.push({
        name: 'Approvals Queue',
        path: '/approvals',
        icon: CheckSquare,
        badge: pendingApprovalsCount,
        badgeColor: 'bg-amber-100 text-amber-800'
      });
    }

    sections.push({ title: 'Sales & Pipeline', items: salesItems });

    // Operations & Revenue
    const opsItems = [];
    if (isFinanceOps || isSalesManager || isAdmin) {
      opsItems.push({
        name: 'Fulfillment / Splits',
        path: '/fulfillment',
        icon: Truck,
        badge: activeFulfillmentCount,
        badgeColor: 'bg-blue-100 text-blue-800'
      });
    }
    opsItems.push({ name: 'Subscriptions & Billing', path: '/subscriptions', icon: Repeat, badge: subscriptions.length });

    sections.push({ title: 'Operations & Billing', items: opsItems });

    // Intelligence & Governance
    const intelItems = [
      { name: 'Deal Health', path: '/health', icon: Activity, badge: atRiskCount, badgeColor: 'bg-rose-100 text-rose-800' },
      { name: 'Analytics Reports', path: '/reports', icon: BarChart3 }
    ];

    if (isAdmin || isSalesManager) {
      intelItems.push({ name: 'Admin Settings', path: '/settings', icon: Sliders });
    }

    // Quick Portal Preview
    intelItems.push({ name: 'Customer Portal View', path: '/portal', icon: Globe, highlight: true });

    sections.push({ title: 'Intelligence & Admin', items: intelItems });

    return sections;
  };

  const navSections = getNavItems();

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
            <img
              src={logoImg}
              alt="DealFlow360"
              className="h-9 w-9 object-contain rounded-lg shadow-2xs border border-slate-100 bg-white"
            />
            <div>
              <div className="font-bold text-slate-900 text-base leading-none tracking-tight flex items-center gap-1">
                DealFlow<span className="text-brand-600">360</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5 block">
                B2B CPQ & Revenue OS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                      } ${item.highlight && !isActive ? 'text-indigo-600 bg-indigo-50/40 hover:bg-indigo-50' : ''}`}
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

        {/* Active Role Indicator in Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              {currentUser.role.split('/')[0]}
            </span>
            <span className="text-[10px] text-brand-700 font-bold">INR (₹)</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {currentUser.name} • {currentUser.team}
          </div>
        </div>
      </aside>
    </>
  );
}
