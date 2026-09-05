import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Activity,
  AlertTriangle,
  Clock,
  Send,
  Zap,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  User,
  IndianRupee
} from 'lucide-react';

export function DealHealth() {
  const navigate = useNavigate();
  const { dealHealth, resolveAnomaly } = useData();
  const { addToast } = useToast();

  const totalAtRiskValue = dealHealth.reduce((sum, d) => sum + d.dealValue, 0);

  const handleNudge = (item) => {
    addToast(`Automated reminder & pipeline nudge sent to ${item.repName}!`, 'info');
  };

  const handleEscalate = (item) => {
    addToast(`Escalated ${item.dealName} to Regional Sales VP Priya Patel for concession priority review.`, 'warning');
  };

  const handleResolve = (id) => {
    resolveAnomaly(id);
    addToast('Anomaly resolved and cleared from risk monitor.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Deal Health & Risk Intelligence
            </h1>
            <Badge variant="danger" size="sm">
              {dealHealth.length} Active Anomalies
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated anomaly detection: stalled opportunities, discounting benchmarks & stock lead time slippage (INR ₹)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-200 bg-rose-50/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800">At-Risk Pipeline Exposure</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-950">
              ₹{(totalAtRiskValue / 100000).toFixed(2)} Lakh
            </div>
            <p className="text-[11px] text-rose-700 font-medium mt-1">Across {dealHealth.length} flagged accounts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Average Idle Duration</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">5.0 Days</div>
            <p className="text-[11px] text-slate-500 mt-1">Threshold trigger: 7 days inactive</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Anomaly Resolution SLA</span>
            <div className="mt-2 text-2xl font-bold text-emerald-700">92% Under 24h</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Automated rep nudging active</p>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {dealHealth.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">All Deals Healthy</h3>
            <p className="text-xs text-slate-500 mt-1">No stalled deals or concession violations detected.</p>
          </Card>
        ) : (
          dealHealth.map((item) => (
            <Card key={item.id} className="border-slate-200 overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.severity === 'High' ? 'danger' : 'warning'} size="sm">
                      {item.severity} Severity
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-900">{item.quoteId}</span>
                    <span className="text-xs font-semibold text-slate-700">• {item.customerName}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{item.dealName}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.anomalyDetail}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <span>
                      Deal Value: <strong className="text-slate-900">₹{item.dealValue.toLocaleString('en-IN')}</strong>
                    </span>
                    <span>
                      Assigned Lead: <strong className="text-slate-900">{item.repName}</strong>
                    </span>
                    <span>
                      Idle Time: <strong className="text-amber-700">{item.idleDays} Days</strong>
                    </span>
                  </div>

                  {/* AI Suggested Remediation Callout */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      <strong>AI Remediation:</strong> {item.suggestedAction}
                    </span>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() => handleNudge(item)}
                  >
                    Nudge Sales Rep
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => handleEscalate(item)}
                  >
                    Escalate to VP
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolve(item.id)}
                  >
                    Dismiss / Mark Resolved
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
