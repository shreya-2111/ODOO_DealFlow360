import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

export function InvoicesList() {
  const navigate = useNavigate();
  const { invoices } = useData();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'PAID' && inv.status === 'Paid') ||
      (activeTab === 'UNPAID' && (inv.status === 'Unpaid' || inv.status === 'Draft')) ||
      (activeTab === 'OVERDUE' && inv.status === 'Overdue');

    const idStr = (inv.id || '').toLowerCase();
    const custStr = (inv.customer || inv.customerName || '').toLowerCase();
    const quoteStr = (inv.quoteId || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();

    const matchesSearch =
      idStr.includes(q) ||
      custStr.includes(q) ||
      quoteStr.includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            GST Invoices & Revenue Reconciliation Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            4-Stage Delivery-Reconciled Invoicing: matching physical dispatch against billing recognition (INR ₹)
          </p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Total Invoiced Volume</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹{Math.round(totalInvoiced).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across all confirmed deal ledger lines</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Collected Cash Revenue</span>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              ₹{Math.round(totalPaid).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">100% Reconciled against fulfillment</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Accounts Receivable (A/R Due)</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹{Math.round(totalOutstanding).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">Net 30 terms active</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table Card */}
      <Card>
        {/* Stage Filter Tabs */}
        <div className="border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Invoices', count: invoices.length },
            { id: 'UNPAID', label: 'Unpaid / In Transit', count: invoices.filter((i) => i.status !== 'Paid').length, badge: 'bg-amber-100 text-amber-800' },
            { id: 'PAID', label: 'Reconciled & Paid', count: invoices.filter((i) => i.status === 'Paid').length, badge: 'bg-emerald-100 text-emerald-800' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all -mb-px ${
                  isActive
                    ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.badge || (isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, customer, quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Invoice ID & Customer</th>
                <th className="px-4 py-3">Quote Ref</th>
                <th className="px-4 py-3">Issue / Due Date</th>
                <th className="px-4 py-3">Reconciliation Stage</th>
                <th className="px-4 py-3 text-right">Amount (INR)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No GST invoices generated. Confirmed orders ready for revenue recognition will populate this ledger.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'Paid';
                const isUnpaid = inv.status === 'Unpaid';

                return (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {inv.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{inv.id}</div>
                    </td>

                    <td className="px-4 py-4 font-mono text-slate-600">
                      {inv.quoteId}
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-slate-800 font-medium">Due: {inv.dueDate}</div>
                      <div className="text-[10px] text-slate-400">Issued: {inv.issueDate}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                        <span>{inv.reconciliationStage}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{Math.round(inv.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Paid: ₹{Math.round(inv.paidAmount).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant={isPaid ? 'success' : isUnpaid ? 'warning' : 'default'} size="sm" dot>
                        {inv.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${inv.id}`);
                        }}
                      >
                        Reconcile
                      </Button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
