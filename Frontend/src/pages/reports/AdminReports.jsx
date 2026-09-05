import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Download,
  Calendar,
  Users,
  CheckSquare,
  Package
} from 'lucide-react';

export function AdminReports() {
  const { addToast } = useToast();

  // Filters (Requirement 18)
  const [periodFilter, setPeriodFilter] = useState('Q3-2026');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');

  const handleExport = (format) => {
    addToast(`Exporting ${format.toUpperCase()} executive reports for ${periodFilter}...`, 'info');
  };

  // Recharts Datasets (Requirement 18)
  const pipelineData = [
    { stage: 'Draft', value: 8.5, deals: 4 },
    { stage: 'Pending Approval', value: 14.45, deals: 2 },
    { stage: 'Approved', value: 9.8, deals: 3 },
    { stage: 'Under Negotiation', value: 5.2, deals: 2 },
    { stage: 'Confirmed', value: 18.5, deals: 5 },
    { stage: 'Fulfillment', value: 12.0, deals: 3 }
  ];

  const conversionFunnelData = [
    { step: 'Quotes Created', count: 48, conversionRate: '100%' },
    { step: 'Manager Approved', count: 38, conversionRate: '79%' },
    { step: 'Negotiated Terms', count: 32, conversionRate: '67%' },
    { step: 'Digitally Signed', count: 26, conversionRate: '54%' },
    { step: 'Fulfilled & Invoiced', count: 24, conversionRate: '50%' }
  ];

  const discountTrendData = [
    { month: 'Apr 2026', avgDiscount: 8.2, governanceLimit: 15.0, margin: 52.4 },
    { month: 'May 2026', avgDiscount: 10.5, governanceLimit: 15.0, margin: 49.8 },
    { month: 'Jun 2026', avgDiscount: 14.2, governanceLimit: 15.0, margin: 46.1 },
    { month: 'Jul 2026', avgDiscount: 12.0, governanceLimit: 15.0, margin: 48.5 },
    { month: 'Aug 2026', avgDiscount: 11.4, governanceLimit: 15.0, margin: 49.2 },
    { month: 'Sep 2026', avgDiscount: 9.8, governanceLimit: 15.0, margin: 51.0 }
  ];

  const turnaroundData = [
    { rep: 'Amit Sharma', managerHours: 3.5, financeHours: 4.2 },
    { rep: 'Rohan Deshmukh', managerHours: 5.1, financeHours: 6.8 },
    { rep: 'Neha Kapoor', managerHours: 2.8, financeHours: 3.4 },
    { rep: 'Vikram Joshi', managerHours: 4.2, financeHours: 5.0 }
  ];

  const revenueByMonthData = [
    { month: 'Apr', oneTime: 18.2, recurring: 6.5, total: 24.7 },
    { month: 'May', oneTime: 22.0, recurring: 8.0, total: 30.0 },
    { month: 'Jun', oneTime: 28.5, recurring: 9.5, total: 38.0 },
    { month: 'Jul', oneTime: 25.0, recurring: 11.0, total: 36.0 },
    { month: 'Aug', oneTime: 32.4, recurring: 12.8, total: 45.2 },
    { month: 'Sep', oneTime: 35.8, recurring: 14.5, total: 50.3 }
  ];

  const productPerformanceData = [
    { name: 'Hardware Servers & Laptops', value: 48, fill: '#3b82f6' },
    { name: 'Cloud Storage & BI Subscriptions', value: 28, fill: '#6366f1' },
    { name: 'On-Site Network Deployments', value: 16, fill: '#10b981' },
    { name: '24/7 AMC SLA Contracts', value: 8, fill: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase">
              Executive Analytics & Governance
            </span>
            <span className="text-xs text-slate-400">• Currency: INR (₹) in Lakhs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Reports & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline volume, conversion ratios, discount trends, SLA turnaround, and revenue performance
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
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
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR (Requirement 18: Period, Sales Team, Approval Status, Product) */}
      <Card className="border-slate-200 bg-slate-50/60">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Period Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Period:
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Q3-2026">Current Quarter (Q3 2026)</option>
              <option value="Q2-2026">Previous Quarter (Q2 2026)</option>
              <option value="FY-2026">Full Financial Year 2026-27</option>
            </select>
          </div>

          {/* Sales Team Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Sales Team:
            </label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Sales Teams</option>
              <option value="enterprise">Enterprise Direct (North/West)</option>
              <option value="regional">Regional Mid-Market (South/East)</option>
              <option value="channel">Strategic Channel Partners</option>
            </select>
          </div>

          {/* Approval Status Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" /> Approval Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Approval Stages</option>
              <option value="approved">Fully Approved Deals</option>
              <option value="pending">Pending Manager/Finance</option>
              <option value="breached">Discount Breach Exception</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-400" /> Product Category:
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Hardware">Hardware & Compute Nodes</option>
              <option value="Subscriptions">Software & Cloud Subscriptions</option>
              <option value="Services">Professional Deployment Services</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPI HIGHLIGHT STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg. Approval SLA</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">4.8 Hours</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">⚡ 38% faster than benchmark</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Quote-to-Win Ratio</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">54.2%</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">+4.8% increase in Q3</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Realized Gross Margin</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">49.4%</div>
            <p className="text-[11px] text-brand-700 font-semibold mt-1">Protected by CPQ governance</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Quarterly Revenue (Q3)</span>
            <div className="text-2xl font-black text-brand-700 mt-1">₹50.3 Lakh</div>
            <p className="text-[11px] text-slate-500 mt-1">71% CapEx / 29% Recurring OpEx</p>
          </CardContent>
        </Card>
      </div>

      {/* 6 RECHARTS ANALYTICAL GRAPHS (Requirement 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Sales Pipeline by Stage */}
        <Card>
          <CardHeader
            title="1. Sales Pipeline Distribution"
            description="Total deal valuation in ₹ Lakh across active pipeline stages"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="L" />
                  <Tooltip
                    formatter={(val) => [`₹${val} Lakh`, 'Pipeline Value']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
                  />
                  <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 2: Quote Conversion Funnel */}
        <Card>
          <CardHeader
            title="2. Quote Conversion & Drop-off Funnel"
            description="Stage conversion velocity from proposal draft to cash collection"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionFunnelData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="step" tick={{ fontSize: 10, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val, name, props) => [`${val} Deals (${props.payload.conversionRate})`, 'Volume']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 3: Discount Trends & Margin Defense */}
        <Card>
          <CardHeader
            title="3. Monthly Discount Trends vs Governance Ceiling"
            description="Average discount conceded vs category limits and gross margin defense"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={discountTrendData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    formatter={(val) => [`${val}%`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="avgDiscount" name="Avg Discount %" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="governanceLimit" name="Ceiling Limit (15%)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="margin" name="Gross Margin %" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 4: Approval Turnaround by Sales Representative */}
        <Card>
          <CardHeader
            title="4. Approval Turnaround Hours by Representative"
            description="Manager and Finance signoff duration in hours"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnaroundData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="rep" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="h" />
                  <Tooltip
                    formatter={(val) => [`${val} Hours`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="managerHours" name="Manager Approval (Hours)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="financeHours" name="Finance Gate (Hours)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 5: Revenue Trajectory (One-Time CapEx vs Recurring OpEx) */}
        <Card>
          <CardHeader
            title="5. Revenue Trajectory (CapEx vs OpEx)"
            description="Monthly realized revenue split (in ₹ Lakhs)"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonthData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="L" />
                  <Tooltip
                    formatter={(val) => [`₹${val} Lakh`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="oneTime" name="One-Time Hardware / CapEx" stackId="1" stroke="#3B82F6" fill="#93C5FD" />
                  <Area type="monotone" dataKey="recurring" name="Recurring Subscriptions / OpEx" stackId="1" stroke="#10B981" fill="#A7F3D0" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 6: Product Category Performance Share */}
        <Card>
          <CardHeader
            title="6. Product Category Revenue Contribution"
            description="Share of total gross bookings by solution vertical"
          />
          <CardContent className="p-4 pt-0">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productPerformanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}% Share`, 'Contribution']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #CBD5E1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
