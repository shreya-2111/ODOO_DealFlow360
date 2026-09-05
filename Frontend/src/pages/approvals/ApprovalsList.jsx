import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter,
  Search,
  UserCheck,
  IndianRupee
} from 'lucide-react';

export function ApprovalsList() {
  const navigate = useNavigate();
  const { quotations, calculateQuoteFinancials } = useData();
  const { currentUser, isManager, isFinance } = useAuth();

  const [filterTab, setFilterTab] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingList = quotations.filter((q) => q.status === 'Pending Approval');
  const approvedList = quotations.filter((q) => q.status === 'Approved' || q.status === 'Confirmed');

  const displayedQuotes = (
    filterTab === 'PENDING'
      ? pendingList
      : filterTab === 'APPROVED'
      ? approvedList
      : quotations
  ).filter(
    (q) =>
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.salesRep.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Governance & Approvals Queue
            </h1>
            <Badge variant="warning" size="sm">
              {pendingList.length} Pending Actions
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Urgency-ranked deal reviews, concession threshold validation, and executive signoffs (INR ₹)
          </p>
        </div>

        {/* Persona Notice */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
          <UserCheck className="w-4 h-4 text-brand-600" />
          <span>Reviewing as: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})</span>
        </div>
      </div>

      {/* Main Approvals Card */}
      <Card>
        {/* Filter Tabs */}
        <div className="border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'PENDING', label: 'Pending Review', count: pendingList.length, badge: 'bg-amber-100 text-amber-800' },
            { id: 'APPROVED', label: 'Approved History', count: approvedList.length, badge: 'bg-emerald-100 text-emerald-800' },
            { id: 'ALL', label: 'All Reviews', count: quotations.length },
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
                <th className="px-5 py-3">Quote & Customer</th>
                <th className="px-4 py-3">Rep & Submitted</th>
                <th className="px-4 py-3">Risk & Breach Summary</th>
                <th className="px-4 py-3">Current Gate</th>
                <th className="px-4 py-3 text-right">Deal Value (INR)</th>
                <th className="px-5 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No approval requests found in this queue.
                  </td>
                </tr>
              ) : (
                displayedQuotes.map((quote) => {
                  const fin = calculateQuoteFinancials(quote.items, quote.customerTier);
                  const isHighRisk = quote.riskLevel === 'HIGH';
                  const pendingStep = quote.approvalSteps.find((s) => s.status === 'pending');

                  return (
                    <tr
                      key={quote.id}
                      onClick={() => navigate(`/approvals/${quote.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {quote.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-slate-600 font-semibold">{quote.id}</span>
                          <span>•</span>
                          <span>{quote.customerTier}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">{quote.salesRep}</div>
                        <div className="text-[11px] text-slate-400">{quote.createdAt}</div>
                      </td>

                      <td className="px-4 py-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isHighRisk ? 'danger' : quote.riskLevel === 'MEDIUM' ? 'warning' : 'success'}
                            size="sm"
                          >
                            {quote.riskLevel} RISK
                          </Badge>
                          {quote.urgencyScore && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              Urgency: {quote.urgencyScore}/100
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                          {quote.discountBreachSummary}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{pendingStep ? pendingStep.role : 'Completed'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          ₹{Math.round(fin.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Margin: <span className="text-emerald-700 font-semibold">{fin.grossMargin}%</span>
                        </div>
                      </td>

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
