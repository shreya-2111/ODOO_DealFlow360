import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Repeat,
  IndianRupee,
  Calendar,
  CreditCard,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function SubscriptionsList() {
  const navigate = useNavigate();
  const { subscriptions } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const totalMrr = subscriptions.reduce((sum, s) => sum + (s.status === 'Active' ? s.mrr : 0), 0);
  const totalArr = subscriptions.reduce((sum, s) => sum + (s.status === 'Active' ? s.arr : 0), 0);

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Subscriptions & Recurring Revenue (INR ₹)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Contract renewals, MRR lifecycle management, and separated one-time vs recurring billing lines
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Total Active MRR</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹{Math.round(totalMrr).toLocaleString('en-IN')}/mo
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">+8.4% Net Expansion MRR</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Contracted ARR (Annual)</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              ₹{Math.round(totalArr).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Annualized contract run-rate</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Upcoming Q3 Renewals</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {subscriptions.filter((s) => s.status === 'Pending Renewal').length} Contracts
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">Action required for renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table Card */}
      <Card>
        <CardHeader
          title="Active AMC & SaaS Contract Agreements"
          description="Click any contract to inspect line item splitting and scheduled billing cycles"
        />

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by contract ID, account, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Contract ID & Customer</th>
                <th className="px-4 py-3">Plan / Product</th>
                <th className="px-4 py-3">Cadence</th>
                <th className="px-4 py-3 text-right">MRR Rate (INR)</th>
                <th className="px-4 py-3">Renewal Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.map((sub) => {
                const isActive = sub.status === 'Active';
                return (
                  <tr
                    key={sub.id}
                    onClick={() => navigate(`/subscriptions/${sub.id}`)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {sub.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{sub.id}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <div className="text-[11px] text-slate-400">{sub.paymentMethod}</div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="default" size="sm">
                        {sub.billingCadence}
                      </Badge>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{Math.round(sub.mrr).toLocaleString('en-IN')}/mo
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ARR: ₹{Math.round(sub.arr).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-700">{sub.renewalDate}</div>
                      <div className="text-[10px] text-slate-400">
                        {sub.autoRenew ? 'Auto-renews enabled' : 'Manual renewal'}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant={isActive ? 'success' : 'warning'} size="sm" dot>
                        {sub.status}
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
                          navigate(`/subscriptions/${sub.id}`);
                        }}
                      >
                        Billing Detail
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
