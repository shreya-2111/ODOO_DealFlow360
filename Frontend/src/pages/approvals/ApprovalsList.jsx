import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Clock,
  ArrowRight,
  Search,
  UserCheck
} from 'lucide-react';

export function ApprovalsList() {
  const navigate = useNavigate();
  const { quotations, calculateQuoteFinancials } = useData();
  const { currentUser } = useAuth();

  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingList = quotations.filter((q) => (q.stage || q.status) === 'Pending Approval' || (q.stage || q.status) === 'Under Negotiation');
  const approvedList = quotations.filter((q) => (q.stage || q.status) === 'Approved' || (q.stage || q.status) === 'Confirmed');

  const displayedQuotes = (
    filterTab === 'PENDING'
      ? pendingList
      : filterTab === 'APPROVED'
      ? approvedList
      : quotations
  ).filter((q) => {
    const cust = (q.customer || q.customerName || '').toLowerCase();
    const id = (q.id || '').toLowerCase();
    const rep = (q.salesRep || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return cust.includes(query) || id.includes(query) || rep.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold uppercase">
              Multi-Gate Governance Desk
            </span>
            <span className="text-xs text-slate-400">• Currency: INR (₹)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Approvals & Concession Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review discount exceptions, evaluate margin defense, and execute multi-gate signoffs (Sales Rep → Manager → Finance)
          </p>
        </div>

        {/* Persona Notice */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
          <UserCheck className="w-4 h-4 text-brand-600" />
          <span>Reviewer: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})</span>
        </div>
      </div>

      {/* Main Approvals Card */}
      <Card>
        {/* Filter Tabs */}
        <div className="border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Reviews', count: quotations.length },
            { id: 'PENDING', label: 'Pending Review', count: pendingList.length, badge: 'bg-amber-100 text-amber-800' },
            { id: 'APPROVED', label: 'Approved History', count: approvedList.length, badge: 'bg-emerald-100 text-emerald-800' },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
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

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quote, account, rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Approvals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Quote Number & Customer</th>
                <th className="px-4 py-3">Sales Rep & Date</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Current Gate</th>
                <th className="px-4 py-3 text-right">Deal Total (INR ₹)</th>
                <th className="px-5 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No quotation reviews found in this queue view.
                  </td>
                </tr>
              ) : (
                displayedQuotes.map((quote) => {
                  const fin = calculateQuoteFinancials(quote.items, quote.customerTier, quote.orderDiscountPercent);
                  const cust = quote.customer || quote.customerName || 'Account';
                  const stage = quote.stage || quote.status || 'Draft';
                  const risk = quote.riskScore !== undefined ? quote.riskScore : (quote.riskLevel === 'HIGH' ? 80 : 25);
                  const isHighRisk = risk >= 70;
                  const steps = quote.approvalSteps || [];
                  const pendingStep = steps.find((s) => s.status === 'pending') || { role: stage === 'Approved' ? 'Fully Approved' : 'Sales Manager Approval' };

                  return (
                    <tr
                      key={quote.id}
                      onClick={() => navigate(`/approvals/${quote.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Quote ID & Customer */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {cust}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-slate-600 font-semibold">{quote.id}</span>
                          <span>•</span>
                          <span>{quote.customerTier || 'Enterprise Tier'}</span>
                        </div>
                      </td>

                      {/* Rep & Date */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">{quote.salesRep || 'Sales Rep'}</div>
                        <div className="text-[11px] text-slate-400">{quote.createdDate || quote.createdAt || '2026-09-02'}</div>
                      </td>

                      {/* Risk Assessment */}
                      <td className="px-4 py-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isHighRisk ? 'danger' : risk >= 40 ? 'warning' : 'success'}
                            size="sm"
                          >
                            Risk: {risk}/100
                          </Badge>
                          {fin.hasBreach && (
                            <span className="text-[10px] text-rose-600 font-bold">
                              Discount Breach
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {quote.approvalStatus || (fin.hasBreach ? 'Concession exceeds policy ceiling' : 'Standard review')}
                        </p>
                      </td>

                      {/* Current Gate */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{pendingStep.role || pendingStep.reviewer || stage}</span>
                        </div>
                      </td>

                      {/* Deal Total */}
                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          ₹{Math.round(fin.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Margin: <span className="text-emerald-700 font-semibold">{fin.grossMargin}%</span>
                        </div>
                      </td>

                      {/* Review Action */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          iconPosition="right"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/approvals/${quote.id}`);
                          }}
                        >
                          Review & Sign
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
