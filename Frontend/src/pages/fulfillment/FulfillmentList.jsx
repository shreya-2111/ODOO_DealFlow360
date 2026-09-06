import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Truck,
  Building,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  SlidersHorizontal
} from 'lucide-react';

export function FulfillmentList() {
  const navigate = useNavigate();
  const { fulfillmentOrders, warehouses, products } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = fulfillmentOrders.filter((order) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'PENDING' && (order.status === 'Pending Allocation' || order.status === 'Partially Allocated')) ||
      (activeTab === 'READY' && order.status === 'Ready to Ship') ||
      (activeTab === 'DISPATCHED' && order.status === 'Dispatched');

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.quoteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.destination.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Multi-Warehouse Inventory & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock levels, multi-depot order routing, and backorder split allocation
          </p>
        </div>
      </div>

      {/* Warehouses Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{wh.location} • {wh.id}</p>
                </div>
                <Badge variant="brand" size="sm">
                  {wh.utilization}% Utilized
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Compute Blades X9:</span>
                  <span className="font-semibold text-slate-900">
                    {wh.stockLevels['PRD-101']?.available || 0} Avail{' '}
                    <span className="text-[10px] text-slate-400">({wh.stockLevels['PRD-101']?.inStock || 0} In Stock)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">4K NOC Displays:</span>
                  <span className="font-semibold text-slate-900">
                    {wh.stockLevels['PRD-105']?.available || 0} Avail{' '}
                    <span className="text-[10px] text-slate-400">({wh.stockLevels['PRD-105']?.inStock || 0} In Stock)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">100G Optical Packs:</span>
                  <span className="font-semibold text-slate-900">
                    {wh.stockLevels['PRD-106']?.available || 0} Avail
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Active Shipments Today:</span>
                <span className="font-bold text-brand-600">{wh.activeShipmentsToday}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fulfillment Orders Queue */}
      <Card>
        <div className="border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Shipments', count: fulfillmentOrders.length },
            { id: 'PENDING', label: 'Pending / Split Allocation', count: fulfillmentOrders.filter((f) => f.status !== 'Ready to Ship' && f.status !== 'Dispatched').length, badge: 'bg-amber-100 text-amber-800' },
            { id: 'READY', label: 'Ready to Dispatch', count: fulfillmentOrders.filter((f) => f.status === 'Ready to Ship').length, badge: 'bg-blue-100 text-blue-800' },
            { id: 'DISPATCHED', label: 'Dispatched & In Transit', count: fulfillmentOrders.filter((f) => f.status === 'Dispatched').length, badge: 'bg-emerald-100 text-emerald-800' },
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
              placeholder="Search by order #, account, quote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Fulfillment Order & Quote</th>
                <th className="px-4 py-3">Destination Facility</th>
                <th className="px-4 py-3">Item Allocation Details</th>
                <th className="px-4 py-3">Carrier / Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No fulfillment orders found in this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPending = order.status === 'Pending Allocation';
                  const isPartial = order.status === 'Partially Allocated';
                  const isReady = order.status === 'Ready to Ship';
                  const isDispatched = order.status === 'Dispatched';

                  const badgeVariant = isDispatched
                    ? 'success'
                    : isReady
                    ? 'brand'
                    : isPartial
                    ? 'warning'
                    : 'default';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/fulfillment/${order.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-slate-600 font-semibold">{order.id}</span>
                          <span>•</span>
                          <span>Quote: {order.quoteId}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-slate-800 font-medium">{order.destination}</div>
                        <div className="text-[11px] text-slate-400">Est. Delivery: {order.estimatedDelivery}</div>
                      </td>

                      <td className="px-4 py-4">
                        {order.lines.map((line, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-bold text-slate-900">{line.requiredQty}x</span>{' '}
                            <span className="text-slate-700">{line.productName}</span>
                            {line.backorderedQty > 0 && (
                              <span className="text-[10px] text-amber-700 font-bold ml-1.5">
                                ({line.backorderedQty} Backordered)
                              </span>
                            )}
                          </div>
                        ))}
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-slate-800 font-medium">{order.shippingCarrier || 'Carrier Pending'}</div>
                        {order.trackingNumber ? (
                          <span className="text-[10px] font-mono text-brand-600">{order.trackingNumber}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Not Dispatched</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={badgeVariant} size="sm" dot>
                          {order.status}
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
                            navigate(`/fulfillment/${order.id}`);
                          }}
                        >
                          Manage Split
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
