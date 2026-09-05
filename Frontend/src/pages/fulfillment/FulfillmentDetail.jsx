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
  PackageCheck,
  Send,
  Plus,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';

export function FulfillmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fulfillmentOrders, warehouses, allocateStock, dispatchOrder } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const order = fulfillmentOrders.find((o) => o.id === id);

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState(order?.lines[0]?.lineId || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('WH-EAST');
  const [allocQty, setAllocQty] = useState(2);
  const [carrier, setCarrier] = useState('FedEx Custom Critical Logistics');
  const [tracking, setTracking] = useState('FXC-882901244');

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Fulfillment Order Not Found</h2>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/fulfillment')}>
          Back to Fulfillment
        </Button>
      </div>
    );
  }

  const isReady = order.status === 'Ready to Ship';
  const isDispatched = order.status === 'Dispatched';

  const handleAllocate = (e) => {
    e.preventDefault();
    allocateStock(order.id, selectedLineId, selectedWarehouseId, Number(allocQty));
    setIsAllocateModalOpen(false);
    addToast(`Allocated ${allocQty} units from warehouse! Backorder reconciled.`, 'success');
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    dispatchOrder(order.id, carrier, tracking);
    setIsDispatchModalOpen(false);
    addToast(`Shipment dispatched! Tracking #${tracking} assigned. Invoicing unlocked.`, 'success');
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
                variant={
                  isDispatched
                    ? 'success'
                    : isReady
                    ? 'brand'
                    : 'warning'
                }
                size="sm"
                dot
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-800">{order.customerName}</strong> • Origin Quote: {order.quoteId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isDispatched && (
            <>
              <Button
                variant="secondary"
                size="md"
                icon={Plus}
                onClick={() => {
                  setSelectedLineId(order.lines[0]?.lineId);
                  setIsAllocateModalOpen(true);
                }}
              >
                Split Allocate Stock
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Send}
                disabled={order.status === 'Pending Allocation'}
                onClick={() => setIsDispatchModalOpen(true)}
              >
                Confirm Dispatch & Tracking
              </Button>
            </>
          )}
        </div>
      </div>

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
                {order.shippingCarrier} {order.trackingNumber && `(${order.trackingNumber})`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Warehouse Split Allocation Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Line Item Warehouse Allocation Matrix</h3>
          <span className="text-xs text-slate-500">
            Split across regional hubs to minimize transport delay
          </span>
        </div>

        {order.lines.map((line) => {
          const totalAllocated = line.allocations.reduce((sum, a) => sum + a.qty, 0);

          return (
            <Card key={line.lineId} className="border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{line.productName}</h4>
                  <p className="text-xs text-slate-500">
                    Product ID: {line.productId} • Total Required: <strong className="text-slate-800">{line.requiredQty} units</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-right">
                    <span className="text-slate-500">Allocated: </span>
                    <strong className="text-emerald-700">{totalAllocated}</strong> / {line.requiredQty}
                  </div>
                  {line.backorderedQty > 0 ? (
                    <Badge variant="danger" size="sm">
                      {line.backorderedQty} Backordered
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      100% Sourced
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Warehouse Sourcing Breakdown
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {line.allocations.map((alloc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building className="w-4 h-4 text-brand-600 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{alloc.warehouseName}</div>
                            <span className="text-[10px] text-slate-400">{alloc.warehouseId}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900 text-sm">{alloc.qty} Units</div>
                          <Badge variant="brand" size="sm">Allocated</Badge>
                        </div>
                      </div>
                    ))}

                    {line.backorderedQty > 0 && (
                      <div
                        onClick={() => {
                          setSelectedLineId(line.lineId);
                          setIsAllocateModalOpen(true);
                        }}
                        className="p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-bold text-amber-900 text-xs">Remaining Backorder</div>
                            <span className="text-[10px] text-amber-700">Click to split from East/West Hub</span>
                          </div>
                        </div>
                        <span className="font-bold text-amber-900 text-sm">{line.backorderedQty} Units</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Split Allocation Modal */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Split Sourcing Stock Allocation"
        description="Allocate inventory from secondary regional depot to fulfill remaining balance"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAllocate}>
              Confirm Allocation
            </Button>
          </>
        }
      >
        <form onSubmit={handleAllocate} className="space-y-4 text-left">
          <Select
            label="Source Regional Warehouse"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            options={warehouses.map((w) => ({
              value: w.id,
              label: `${w.name} (${w.location}) - Available: ${w.stockLevels['PRD-101']?.available || 10} units`,
            }))}
          />

          <Input
            label="Quantity to Allocate"
            type="number"
            min="1"
            max="20"
            value={allocQty}
            onChange={(e) => setAllocQty(e.target.value)}
            helperText="Stock will immediately be marked as Reserved"
          />
        </form>
      </Modal>

      {/* Dispatch Confirmation Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Confirm Carrier Dispatch"
        description="Generate bill of lading, assign carrier tracking, and update ERP"
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
            label="Freight / Shipping Carrier"
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
            Dispatching this shipment enables delivery reconciliation in the Invoicing Ledger and notifies customer via portal.
          </p>
        </form>
      </Modal>
    </div>
  );
}
