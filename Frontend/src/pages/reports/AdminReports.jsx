import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart3,
  TrendingUp,
  Clock,
  IndianRupee,
  Download,
  Calendar,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';

export function AdminReports() {
  const { quotations, subscriptions } = useData();
  const { addToast } = useToast();
  const [timeRange, setTimeRange] = useState('Q3-2026');

  const handleExport = (format) => {
    addToast(`Generating executive ${format.toUpperCase()} performance report for ${timeRange}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Executive Performance & Revenue Intelligence (INR ₹)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pipeline cycle velocity, approval bottleneck analytics, and margin discount leakage
          </p>
        </div>

        {/* Filters & Export */}
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="Q3-2026">Current Quarter (Q3 2026)</option>
            <option value="Q2-2026">Previous Quarter (Q2 2026)</option>
            <option value="FY-2026">Full Year 2026-27</option>
          </select>
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Avg. Approval Turnaround</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">6.4 Hours</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">⚡ 42% faster than Q2 benchmark</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Average Deal Cycle</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">18.2 Days</div>
            <p className="text-[11px] text-slate-500 mt-1">From initial draft to customer signing</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Realized Gross Margin</span>
            <div className="mt-2 text-2xl font-bold text-emerald-700">48.6%</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">+3.2pt margin defense via CPQ</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500">Add-On Upsell Attach Rate</span>
            <div className="mt-2 text-2xl font-bold text-brand-700">64.0%</div>
            <p className="text-[11px] text-brand-700 font-semibold mt-1">AMC & Optical bundle recommendations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Analytical Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discount Leakage Breakdown by Category */}
        <Card>
          <CardHeader
            title="Discount Concession vs Ceiling Analysis"
            description="Comparison of realized discount percentages against governance thresholds"
          />
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Professional Services (Migration & Setup)</span>
                <span className="text-rose-700 font-bold">16.4% Avg Discount (Limit: 10%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '82%' }} />
              </div>
              <span className="text-[10px] text-slate-400">High breach frequency; consider updating service packaging.</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Enterprise Hardware & Commercial Displays</span>
                <span className="text-emerald-700 font-bold">11.2% Avg Discount (Limit: 15%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '56%' }} />
              </div>
              <span className="text-[10px] text-slate-400">Within safety threshold; strong hardware margins.</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Cloud Antivirus SaaS & AMC Plans</span>
                <span className="text-brand-700 font-bold">14.8% Avg Discount (Limit: 20%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: '60%' }} />
              </div>
              <span className="text-[10px] text-slate-400">Healthy recurring expansion rate.</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Attached Upsells */}
        <Card>
          <CardHeader
            title="Top Attached Upsell Recommendations"
            description="Add-on products contributing highest incremental Gross Profit in INR"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Recommended Add-on</th>
                  <th className="px-4 py-3">Attach %</th>
                  <th className="px-4 py-3">Incremental MRR/Deal</th>
                  <th className="px-5 py-3 text-right">Margin Boost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    24/7 AMC Support & Priority SLA Plan
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">74%</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">+₹8,500/mo</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-700">+82% Margin</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    D-Link Cat-6 Optical Cable Bundle (Pack of 10)
                  </td>
                  <td className="px-4 py-3.5 font-bold text-brand-700">62%</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">+₹6,500 CapEx</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-700">+51% Margin</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    QuickHeal / Cloud Security Pro Suite
                  </td>
                  <td className="px-4 py-3.5 font-bold text-indigo-700">51%</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">+₹1,500/mo</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-700">+83% Margin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
