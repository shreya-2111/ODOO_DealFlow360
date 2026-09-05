import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Send } from 'lucide-react';

export function DealHealth() {
  const navigate = useNavigate();
  const { quotations, calculateQuoteFinancials } = useData();
  const { addToast } = useToast();

  // Deal Health Telemetry Datasets (Empty for pure UI)
  const [stalledDeals] = useState([]);
  const [discountAnomalies] = useState([]);
  const [deliverySlippages] = useState([]);

  const handleNudge = (entityName, repName) => {
    addToast(`Automated reminder & pipeline nudge sent to ${repName} for ${entityName}!`, 'info');
  };

  const handleEscalate = (entityName) => {
    addToast(`Escalated ${entityName} to Sales Manager Priya Patel & Controller Rajesh Verma for priority resolution.`, 'warning');
  };

  // 6 KPI Calculations (Requirement 17)
  const totalActiveDeals = quotations.length;
  const stalledDealsCount = stalledDeals.length;
  const atRiskDealsCount = quotations.filter((q) => (q.riskScore || 0) >= 60).length;
  const discountAnomaliesCount = discountAnomalies.length;
  const deliverySlippagesCount = deliverySlippages.length;
  const totalPipelineValue = quotations.reduce((sum, q) => {
    const fin = calculateQuoteFinancials(q.items, q.customerTier, q.orderDiscountPercent);
    return sum + fin.totalAmount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold uppercase">
              Deal Health & Risk Center
            </span>
            <span className="text-xs text-slate-400">• Real-Time Early Warning System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Deal Health Intelligence Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor stalled deals, discount governance anomalies, fulfillment delays, and risk exposure (INR ₹)
          </p>
        </div>
      </div>

      {/* 6 KPI CARDS (Requirement 17) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Active Deals */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Total Active Deals
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalActiveDeals}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Across all stages</span>
          </CardContent>
        </Card>

        {/* KPI 2: Stalled Deals */}
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block truncate">
              Stalled Deals
            </span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {stalledDealsCount}
            </div>
            <span className="text-[10px] text-amber-700 mt-0.5 block">&gt;3 days inactive</span>
          </CardContent>
        </Card>

        {/* KPI 3: At-Risk Deals */}
        <Card className="border-rose-200 bg-rose-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block truncate">
              At-Risk Deals
            </span>
            <div className="text-2xl font-black text-rose-900 mt-1">
              {atRiskDealsCount}
            </div>
            <span className="text-[10px] text-rose-700 mt-0.5 block">Risk score &ge; 60</span>
          </CardContent>
        </Card>

        {/* KPI 4: Discount Anomalies */}
        <Card className="border-purple-200 bg-purple-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block truncate">
              Discount Anomalies
            </span>
            <div className="text-2xl font-black text-purple-900 mt-1">
              {discountAnomaliesCount}
            </div>
            <span className="text-[10px] text-purple-700 mt-0.5 block">Exceeds ceiling</span>
          </CardContent>
        </Card>

        {/* KPI 5: Delivery Slippages */}
        <Card className="border-blue-200 bg-blue-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block truncate">
              Delivery Slippages
            </span>
            <div className="text-2xl font-black text-blue-900 mt-1">
              {deliverySlippagesCount}
            </div>
            <span className="text-[10px] text-blue-700 mt-0.5 block">Carrier delay risk</span>
          </CardContent>
        </Card>

        {/* KPI 6: Pipeline Value */}
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block truncate">
              Pipeline Value
            </span>
            <div className="text-xl font-black text-emerald-950 mt-1">
              ₹{(totalPipelineValue / 100000).toFixed(1)}L
            </div>
            <span className="text-[10px] text-emerald-700 mt-0.5 block">Total Net in CPQ</span>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 1: STALLED DEALS TABLE (Requirement 17) */}
      <Card>
        <CardHeader
          title="1. Stalled Deals (Inactive Beyond Threshold)"
          description="Quotations with no activity beyond configured SLA period requiring immediate rep follow-up"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Customer</th>
                <th className="px-4 py-3">Quote Number</th>
                <th className="px-4 py-3 text-right">Amount (INR ₹)</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3 text-center">Days Stalled</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stalledDeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    All deals progressing on schedule. No stalled opportunities detected beyond SLA limits.
                  </td>
                </tr>
              ) : (
                stalledDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => navigate(`/quotations/${deal.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {deal.customer}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-brand-700 font-bold">
                      {deal.id}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-900">
                      ₹{deal.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{deal.lastActivity}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="warning" size="sm">
                        {deal.daysStalled} Days Idle
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{deal.owner}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Send}
                          onClick={() => handleNudge(deal.customer, deal.owner)}
                        >
                          Nudge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEscalate(deal.customer)}
                        >
                          Escalate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 2: DISCOUNT ANOMALY ALERTS TABLE (Requirement 17) */}
      <Card>
        <CardHeader
          title="2. Discount Anomaly Alerts (Governance Violations)"
          description="Discount concessions significantly higher than account category benchmark and peer reps"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Sales Rep</th>
                <th className="px-4 py-3">Customer & Quote</th>
                <th className="px-4 py-3 text-center">Requested Discount</th>
                <th className="px-4 py-3 text-center">Historical Average</th>
                <th className="px-4 py-3 text-center">Difference</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discountAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Governance compliant. No discount concessions exceeding policy thresholds.
                  </td>
                </tr>
              ) : (
                discountAnomalies.map((anom) => (
                  <tr
                    key={anom.id}
                    onClick={() => navigate(`/approvals/${anom.quoteId}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-800">{anom.rep}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {anom.customer}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{anom.quoteId}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {anom.discount}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-600 font-semibold">{anom.historicalAvg}%</td>
                    <td className="px-4 py-3.5 text-center font-bold text-rose-600">{anom.difference}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="danger" size="sm">
                        {anom.risk} Risk
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleNudge(anom.customer, anom.rep)}
                        >
                          Nudge
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEscalate(`${anom.customer} (${anom.discount}% discount)`)}
                        >
                          Escalate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 3: DELIVERY PROMISE SLIPPAGE TABLE (Requirement 17) */}
      <Card>
        <CardHeader
          title="3. Delivery Promise Slippages (Logistics & Supply Chain SLA)"
          description="Customer orders at risk of missing expected arrival commitments due to depot stock routing"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Customer</th>
                <th className="px-4 py-3">Order Ref</th>
                <th className="px-4 py-3">Expected Delivery Date</th>
                <th className="px-4 py-3">Current Estimate</th>
                <th className="px-4 py-3 text-center">Projected Delay</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliverySlippages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    All multi-depot shipments and logistics promises on track.
                  </td>
                </tr>
              ) : (
                deliverySlippages.map((slip) => (
                  <tr
                    key={slip.id}
                    onClick={() => navigate('/fulfillment')}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {slip.customer}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-brand-700 font-bold">{slip.orderId}</td>
                    <td className="px-4 py-3.5 text-slate-600">{slip.expectedDate}</td>
                    <td className="px-4 py-3.5 font-semibold text-rose-700">{slip.currentEstimate}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={slip.risk === 'Medium' ? 'warning' : 'default'} size="sm">
                        {slip.delay}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleNudge(slip.customer, 'Logistics Lead')}
                        >
                          Nudge
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEscalate(`Delivery for ${slip.customer}`)}
                        >
                          Escalate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
