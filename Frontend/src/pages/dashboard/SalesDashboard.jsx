import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  IndianRupee,
  CheckSquare,
  Truck,
  Repeat,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Building2,
  Package,
  Layers
} from 'lucide-react';

export function SalesDashboard() {
  const navigate = useNavigate();
  const { quotations, fulfillmentOrders, subscriptions, dealHealth, calculateQuoteFinancials } = useData();
  const { currentUser } = useAuth();

  // Financial aggregates in INR
  const totalPipeline = quotations.reduce((acc, q) => {
    const fin = calculateQuoteFinancials(q.items, q.customerTier);
    return acc + fin.totalAmount;
  }, 0);

  const pendingApprovals = quotations.filter((q) => q.status === 'Pending Approval');
  const highRiskApprovals = pendingApprovals.filter((q) => q.riskLevel === 'HIGH');
  const activeSubscriptionsMrr = subscriptions.reduce((acc, s) => acc + (s.status === 'Active' ? s.mrr : 0), 0);
  const pendingOrders = fulfillmentOrders.filter((f) => f.status !== 'Dispatched');

  const stats = [
    {
      title: 'Active Deal Pipeline',
      value: `₹${(totalPipeline / 100000).toFixed(2)} Lakh`,
      detail: `${quotations.length} active opportunities (₹${Math.round(totalPipeline).toLocaleString('en-IN')})`,
      icon: IndianRupee,
      iconColor: 'text-brand-600 bg-brand-50',
      change: '+14.2% vs last month',
      trend: 'up',
      onClick: () => navigate('/quotations'),
    },
    {
      title: 'Approvals Queue',
      value: pendingApprovals.length.toString(),
      detail: `${highRiskApprovals.length} high-risk breach flags`,
      icon: CheckSquare,
      iconColor: 'text-amber-600 bg-amber-50',
      change: highRiskApprovals.length > 0 ? 'Requires VP Signoff' : 'On Track',
      trend: highRiskApprovals.length > 0 ? 'warn' : 'up',
      onClick: () => navigate('/approvals'),
    },
    {
      title: 'Monthly Recurring (MRR)',
      value: `₹${Math.round(activeSubscriptionsMrr).toLocaleString('en-IN')}`,
      detail: `${subscriptions.length} active AMC/Cloud accounts`,
      icon: Repeat,
      iconColor: 'text-emerald-600 bg-emerald-50',
      change: '99.4% retention rate',
      trend: 'up',
      onClick: () => navigate('/subscriptions'),
    },
    {
      title: 'Pending Fulfillment',
      value: pendingOrders.length.toString(),
      detail: 'Multi-warehouse stock orders',
      icon: Truck,
      iconColor: 'text-blue-600 bg-blue-50',
      change: '2 items backordered',
      trend: 'warn',
      onClick: () => navigate('/fulfillment'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome back, {currentUser.name}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-semibold border border-brand-200 hidden sm:inline-block">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Deal CPQ, Multi-Warehouse Fulfillment & Governance Overview (INR ₹)
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            icon={CheckSquare}
            onClick={() => navigate('/approvals')}
          >
            Review Approvals ({pendingApprovals.length})
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/quotations')}
          >
            New Quotation
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              hover
              onClick={stat.onClick}
              className="cursor-pointer border-slate-200/90"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{stat.title}</span>
                  <div className={`p-2 rounded-xl ${stat.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.detail}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      stat.trend === 'up'
                        ? 'text-emerald-700'
                        : stat.trend === 'warn'
                        ? 'text-amber-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Pipeline Breakdown + Action Required Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Quotations Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Recent Deal Pipeline & CPQ Activity"
              description="Live status, risk scores, and discount violation monitoring"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate('/quotations')}
                >
                  View All Deals
                </Button>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-5 py-3">Quote ID & Customer</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Risk Level</th>
                    <th className="px-4 py-3 text-right">Quote Value (INR)</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((quote) => {
                    const fin = calculateQuoteFinancials(quote.items, quote.customerTier);
                    const isPending = quote.status === 'Pending Approval';
                    const isDraft = quote.status === 'Draft';
                    const isApproved = quote.status === 'Approved';
                    const isConfirmed = quote.status === 'Confirmed';

                    const statusVariant = isConfirmed
                      ? 'success'
                      : isApproved
                      ? 'brand'
                      : isPending
                      ? 'warning'
                      : 'default';

                    const riskVariant =
                      quote.riskLevel === 'HIGH'
                        ? 'danger'
                        : quote.riskLevel === 'MEDIUM'
                        ? 'warning'
                        : 'success';

                    return (
                      <tr
                        key={quote.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/quotations/${quote.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                            {quote.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{quote.id}</span>
                            <span>•</span>
                            <span>{quote.contactPerson}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={statusVariant} size="sm" dot>
                            {quote.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={riskVariant} size="sm">
                            {quote.riskLevel} RISK
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                          ₹{Math.round(fin.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quotations/${quote.id}`);
                            }}
                          >
                            Open CPQ
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Multi-Warehouse Stock Status Widget */}
          <Card>
            <CardHeader
              title="Indian Regional Warehouses & Inventory Health"
              description="Stock distribution across Mumbai, Bengaluru, and Delhi-NCR mega-hubs"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate('/fulfillment')}
                >
                  Manage Stock
                </Button>
              }
            />
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Mumbai Mega-Hub (Bhiwandi)</span>
                    <span className="text-emerald-700">76% Cap</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">17 Servers Avail</div>
                  <div className="mt-1 text-[11px] text-slate-500">32 active shipments in transit</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Bengaluru Tech Depot (Whitefield)</span>
                    <span className="text-brand-700">62% Cap</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">8 Servers Avail</div>
                  <div className="mt-1 text-[11px] text-slate-500">21 active shipments in transit</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Delhi-NCR Depot (Gurugram)</span>
                    <span className="text-amber-700">54% Cap</span>
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">1 Server Avail</div>
                  <div className="mt-1 text-[11px] text-amber-700 font-medium">Low buffer threshold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Action Required & Deal Health Flags */}
        <div className="space-y-6">
          {/* Action Required Callout */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader
              title="Urgent Actions Required"
              description="Pending decisions blocking revenue recognition"
            />
            <CardContent className="p-5 pt-0 space-y-3">
              {highRiskApprovals.map((hr) => (
                <div
                  key={hr.id}
                  onClick={() => navigate(`/approvals/${hr.id}`)}
                  className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs cursor-pointer hover:border-amber-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="danger" size="sm">Breach Alert</Badge>
                    <span className="text-[10px] text-slate-400 font-medium">{hr.id}</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-900">{hr.customerName}</div>
                  <p className="text-[11px] text-amber-800 mt-1 line-clamp-2">
                    {hr.discountBreachSummary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Rep: {hr.salesRep}</span>
                    <span className="font-semibold text-brand-600 flex items-center gap-0.5">
                      Review <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}

              <div
                onClick={() => navigate('/fulfillment')}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="warning" size="sm">Backorder</Badge>
                  <span className="text-[10px] text-slate-400">Order FO-9048</span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900">Reliance Infotech Ltd</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  2 Dell Server units require split allocation from Bengaluru tech center.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Suresh Kumar (Ops)</span>
                  <span className="font-semibold text-brand-600 flex items-center gap-0.5">
                    Allocate <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deal Health & Anomaly Summary */}
          <Card>
            <CardHeader
              title="Deal Health AI Monitor"
              description="Stalled deals & discounting deviations"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate('/health')}
                >
                  Health View
                </Button>
              }
            />
            <CardContent className="p-5 pt-0 space-y-3">
              {dealHealth.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate">{item.customerName}</span>
                    <Badge variant={item.severity === 'High' ? 'danger' : 'warning'} size="sm">
                      {item.severity} Risk
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{item.riskType}</p>
                  <div className="mt-2 text-[10px] text-slate-400 bg-white p-2 rounded border border-slate-100">
                    💡 <span className="font-medium text-slate-700">Recommended:</span> {item.suggestedAction}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
