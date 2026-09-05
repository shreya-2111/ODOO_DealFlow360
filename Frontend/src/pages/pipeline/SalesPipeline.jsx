import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Kanban,
  FileSpreadsheet,
  RefreshCw,
  Sliders,
  LogOut,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  User,
  IndianRupee,
  Building
} from 'lucide-react';

export function SalesPipeline() {
  const navigate = useNavigate();
  const { quotations, calculateQuoteFinancials } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [isReloading, setIsReloading] = useState(false);

  const columns = [
    { id: 'Draft', title: 'Draft', color: 'bg-slate-100 text-slate-700' },
    { id: 'Pending Approval', title: 'Pending Approval', color: 'bg-amber-100 text-amber-800' },
    { id: 'Approved', title: 'Approved', color: 'bg-blue-100 text-blue-800' },
    { id: 'Under Negotiation', title: 'Under Negotiation', color: 'bg-purple-100 text-purple-800' },
    { id: 'Confirmed', title: 'Confirmed', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'Fulfillment', title: 'Fulfillment', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'Completed', title: 'Completed', color: 'bg-slate-200 text-slate-800' },
  ];

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
      addToast('Sales pipeline and quotation records reloaded from ERP.', 'success');
    }, 600);
  };

  const handleCloseWorkspace = () => {
    addToast('Closing sales workspace. Returning to login screen...', 'info');
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Header (B1 Sales Workspace) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase">
              B1 — Sales Workspace
            </span>
            <span className="text-xs text-slate-400">• Rep: {currentUser.name}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Sales Pipeline (Kanban Workflow)
          </h1>
        </div>

        {/* Workspace Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => navigate('/quotations')}
          >
            Quotations Table
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            disabled={isReloading}
            onClick={handleReload}
          >
            {isReloading ? 'Reloading...' : 'Reload Data'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Sliders}
            onClick={() => navigate('/settings')}
          >
            Go to Back-end
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={handleCloseWorkspace}
          >
            Close Workspace
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colQuotes = quotations.filter((q) => {
            const currentStage = q.stage || q.status;
            return currentStage === col.id;
          });

          const colTotal = colQuotes.reduce((sum, q) => {
            const fin = calculateQuoteFinancials(q.items, q.customerTier, q.orderDiscountPercent);
            return sum + fin.totalAmount;
          }, 0);

          return (
            <div
              key={col.id}
              className="flex-1 min-w-[280px] max-w-[320px] bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col max-h-[calc(100vh-240px)]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/80 bg-white rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{colQuotes.length}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-700">
                  ₹{Math.round(colTotal / 1000).toLocaleString('en-IN')}k
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {colQuotes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No deals in {col.title}
                  </div>
                ) : (
                  colQuotes.map((q) => {
                    const fin = calculateQuoteFinancials(q.items, q.customerTier, q.orderDiscountPercent);
                    const isHighRisk = q.riskScore >= 70;

                    return (
                      <div
                        key={q.id}
                        onClick={() => navigate(`/quotations/${q.id}`)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-subtle hover:shadow-card-hover hover:border-brand-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-600 group-hover:text-brand-600 transition-colors">
                            {q.id}
                          </span>
                          <Badge
                            variant={isHighRisk ? 'danger' : q.riskScore >= 40 ? 'warning' : 'success'}
                            size="sm"
                          >
                            Risk {q.riskScore}
                          </Badge>
                        </div>

                        <div className="font-bold text-slate-900 text-sm mt-1 truncate">
                          {q.customer}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{q.salesRep}</span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Deal Value</span>
                            <span className="font-black text-slate-900">
                              ₹{Math.round(fin.totalAmount).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Margin</span>
                            <span className="font-bold text-emerald-700">{fin.grossMargin}%</span>
                          </div>
                        </div>

                        {/* Inactive days indicator */}
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {q.daysInactive}d idle
                          </span>
                          <span className="text-brand-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Open <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
