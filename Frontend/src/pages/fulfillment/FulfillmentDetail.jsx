import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import {
  ArrowLeft,
  Truck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Send,
  MapPin,
  Calendar,
  Layers,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Package
} from 'lucide-react';

export function FulfillmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fulfillmentOrders, warehouses, allocateStock, dispatchOrder } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const order = (fulfillmentOrders || []).find((o) => o.id === id || o.orderId === id);

  // Warehouse Split table state (Requirement 13)
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [splitRows, setSplitRows] = useState([
    { warehouseId: 'WH-MUMBAI', warehouse: 'Mumbai Mega-Hub', quantity: 1, shipments: 1, estimatedCost: 700 },
    { warehouseId: 'WH-AHMEDABAD', warehouse: 'Ahmedabad Warehouse', quantity: 1, shipments: 1, estimatedCost: 450 }
  ]);
  const [hasNewStockArrived, setHasNewStockArrived] = useState(false);

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [carrier, setCarrier] = useState('BlueDart Express Logistics');
  const [tracking, setTracking] = useState('BD-882901244IN');

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Fulfillment Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Order {id} could not be located.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/fulfillment')}>
          Back to Fulfillment
        </Button>
      </div>
    );
  }

  const isDispatched = order.status === 'Dispatched';
  const totalAllocated = splitRows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
  const totalSplitCost = splitRows.reduce((sum, r) => sum + Number(r.estimatedCost || 0), 0);

  const handleAcceptSuggestedSplit = () => {
    setIsManualOverride(false);
    setSplitRows([
      { warehouseId: 'WH-AHMEDABAD', warehouse: 'Ahmedabad Warehouse', quantity: 3, shipments: 1, estimatedCost: 1350 },
      { warehouseId: 'WH-MUMBAI', warehouse: 'Mumbai Warehouse', quantity: 2, shipments: 1, estimatedCost: 700 },
      { warehouseId: 'WH-DELHI', warehouse: 'Delhi Warehouse', quantity: 0, shipments: 0, estimatedCost: 0 },
      { warehouseId: 'WH-BLR', warehouse: 'Bengaluru Hub', quantity: 0, shipments: 0, estimatedCost: 0 }
    ]);
    addToast('Optimal regional warehouse split accepted! Transport costs minimized.', 'success');
  };

  const handleSplitQuantityChange = (warehouseId, newQty) => {
    const qty = Math.max(0, Number(newQty));
    setSplitRows((prev) =>
      prev.map((r) => {
        if (r.warehouseId === warehouseId) {
          const costPerUnit = r.warehouseId === 'WH-AHMEDABAD' ? 450 : r.warehouseId === 'WH-MUMBAI' ? 350 : 500;
          return {
            ...r,
            quantity: qty,
            shipments: qty > 0 ? 1 : 0,
            estimatedCost: qty * costPerUnit
          };
        }
        return r;
      })
    );
  };

  const handleConsolidateBackorder = () => {
    setSplitRows([
      { warehouseId: 'WH-AHMEDABAD', warehouse: 'Ahmedabad Warehouse', quantity: 5, shipments: 1, estimatedCost: 2250 },
      { warehouseId: 'WH-MUMBAI', warehouse: 'Mumbai Warehouse', quantity: 0, shipments: 0, estimatedCost: 0 },
      { warehouseId: 'WH-DELHI', warehouse: 'Delhi Warehouse', quantity: 0, shipments: 0, estimatedCost: 0 },
      { warehouseId: 'WH-BLR', warehouse: 'Bengaluru Hub', quantity: 0, shipments: 0, estimatedCost: 0 }
    ]);
    setHasNewStockArrived(false);
    addToast('Backorder consolidated into single shipment from Ahmedabad Warehouse! Saved ₹700 in freight.', 'success');
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    dispatchOrder(order.id, carrier, tracking);
    setIsDispatchModalOpen(false);
    addToast(`Shipment dispatched! Tracking #${tracking} generated. Reconciled in Invoicing.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/fulfillment')}
          >
            Fulfillment Queue
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{order.id}</h1>
              <Badge
                variant={isDispatched ? 'success' : order.status === 'Ready to Ship' ? 'brand' : 'warning'}
                size="sm"
                dot
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-800">{order.customerName}</strong> • Origin Quotation: {order.quoteId}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isDispatched && (
            <Button
              variant="primary"
              size="md"
              icon={Send}
              onClick={() => setIsDispatchModalOpen(true)}
            >
              Confirm Dispatch & Tracking
            </Button>
          )}
        </div>
      </div>

      {/* Fulfillment Status & Delivery Timeline Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-slate-700">Fulfillment Lifecycle Progress</span>
            <span className="text-slate-400">Target Delivery: <strong className="text-slate-800">{order.estimatedDelivery}</strong></span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              1. Order Confirmed ✓
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              2. Warehouse Split ✓
            </div>
            <div className={`p-2 rounded-lg font-bold border ${isDispatched ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`}>
              3. Ready to Ship {isDispatched ? '✓' : '●'}
            </div>
            <div className={`p-2 rounded-lg font-bold border ${isDispatched ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              4. In Transit {isDispatched ? '✓' : '○'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Delivery Destination</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{order.destination}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Target SLA Arrival</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{order.estimatedDelivery}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Carrier & Tracking</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {order.shippingCarrier || carrier} {order.trackingNumber && `(${order.trackingNumber})`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contextual Prompt: Stock Arrived Notification (Requirement 13) */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold text-blue-950">New Stock Replenished at Ahmedabad Hub (+25 Units arrived)</span>
            <p className="text-[11px] text-blue-700 mt-0.5">
              You can now consolidate all items into a single warehouse shipment instead of multi-hub splits.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Package}
          onClick={handleConsolidateBackorder}
        >
          Consolidate Remaining Backorder
        </Button>
      </div>

      {/* RECOMMENDED WAREHOUSE SPLIT TABLE (Requirement 13) */}
      <Card>
        <CardHeader
          title="Recommended Warehouse Split Table"
          description="Algorithmic split optimization based on proximity, shipping rates, and real-time depot stock"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant={!isManualOverride ? 'primary' : 'secondary'}
                size="sm"
                icon={Check}
                onClick={handleAcceptSuggestedSplit}
              >
                Accept Suggested Split
              </Button>
              <Button
                variant={isManualOverride ? 'primary' : 'secondary'}
                size="sm"
                icon={Edit3}
                onClick={() => setIsManualOverride(!isManualOverride)}
              >
                {isManualOverride ? 'Lock Quantities' : 'Manual Override'}
              </Button>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Warehouse</th>
                <th className="px-4 py-3 text-center">Allocated Quantity</th>
                <th className="px-4 py-3 text-center">Shipment Count</th>
                <th className="px-4 py-3 text-right">Estimated Cost (INR ₹)</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {splitRows.map((row) => (
                <tr key={row.warehouseId} className="hover:bg-slate-50/70">
                  {/* Warehouse Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{row.warehouse}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{row.warehouseId}</div>
                      </div>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-3.5 text-center">
                    {isManualOverride ? (
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={row.quantity}
                        onChange={(e) => handleSplitQuantityChange(row.warehouseId, e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold text-xs bg-white border border-brand-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    ) : (
                      <span className="font-black text-slate-900 text-sm">{row.quantity} Units</span>
                    )}
                  </td>

                  {/* Shipment Count */}
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                    {row.shipments} {row.shipments === 1 ? 'Dispatch' : 'Dispatches'}
                  </td>

                  {/* Estimated Cost */}
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                    ₹{row.estimatedCost.toLocaleString('en-IN')}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 text-right">
                    {row.quantity > 0 ? (
                      <Badge variant="success" size="sm">
                        Stock Allocated
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        No Items
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/90 font-bold border-t border-slate-200 text-slate-900">
                <td className="px-5 py-3">Total Sourced Fulfillment:</td>
                <td className="px-4 py-3 text-center text-brand-700 font-black">{totalAllocated} Units</td>
                <td className="px-4 py-3 text-center">
                  {splitRows.reduce((sum, r) => sum + r.shipments, 0)} Dispatches
                </td>
                <td className="px-4 py-3 text-right text-brand-700">
                  ₹{totalSplitCost.toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-3 text-right">
                  <Badge variant="brand" size="sm">100% Ready</Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Dispatch Confirmation Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Confirm Carrier Dispatch"
        description="Generate bill of lading, assign carrier tracking, and update ERP status"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={Truck} onClick={handleDispatch}>
              Authorize Dispatch
            </Button>
          </>
        }
      >
        <form onSubmit={handleDispatch} className="space-y-4 text-left">
          <Input
            label="Freight / Courier Carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            required
          />
          <Input
            label="Master Tracking / Waybill Number"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500">
            Dispatching this shipment generates the invoice and informs the customer via the Portal.
          </p>
        </form>
      </Modal>
    </div>
  );
}
