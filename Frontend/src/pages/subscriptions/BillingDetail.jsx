import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import {
  ArrowLeft,
  Repeat,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  FileText,
  Sliders,
  AlertCircle,
  XCircle
} from 'lucide-react';

export function BillingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptions } = useData();
  const { addToast } = useToast();

  const sub = subscriptions.find((s) => s.id === id);

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProrationModalOpen, setIsProrationModalOpen] = useState(false);

  // Mid-cycle quantity modification state (Requirement 14)
  const [currentSeats, setCurrentSeats] = useState(50);
  const [newSeats, setNewSeats] = useState(75);
  const [pricePerSeat] = useState(1500); // e.g. ₹1,500/seat/mo
  const daysInMonth = 30;
  const daysRemainingInCycle = 18;

  if (!sub) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Subscription Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested subscription ID {id} does not exist.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/subscriptions')}>
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  // Mid-cycle Proration Calculations (Requirement 14)
  const previousMonthlyAmount = currentSeats * pricePerSeat;
  const newMonthlyAmount = newSeats * pricePerSeat;
  const seatDelta = newSeats - currentSeats;
  const dailyRateDelta = (seatDelta * pricePerSeat) / daysInMonth;
  const prorationAdjustment = Math.round(dailyRateDelta * daysRemainingInCycle);
  const finalAdjustedCycleAmount = previousMonthlyAmount + prorationAdjustment;
  const isCredit = prorationAdjustment < 0;

  const handleTogglePause = () => {
    setIsPauseModalOpen(false);
    addToast(
      sub.status === 'Active'
        ? `Subscription ${sub.id} paused. Automated billing suspended.`
        : `Subscription ${sub.id} resumed.`,
      'info'
    );
  };

  const handleCancelSubscription = () => {
    setIsCancelModalOpen(false);
    addToast(`Subscription ${sub.id} cancelled. Services will terminate at end of billing cycle.`, 'warning');
  };

  const handleApplyProration = () => {
    setCurrentSeats(newSeats);
    setIsProrationModalOpen(false);
    addToast(
      isCredit
        ? `Mid-cycle downgrade saved! Credit Note CN-2026-088 of ₹${Math.abs(prorationAdjustment).toLocaleString('en-IN')} issued.`
        : `Mid-cycle adjustment applied! Prorated invoice INV-2026-904 of ₹${prorationAdjustment.toLocaleString('en-IN')} generated.`,
      'success'
    );
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
            onClick={() => navigate('/subscriptions')}
          >
            All Subscriptions
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{sub.id}</h1>
              <Badge variant={sub.status === 'Active' ? 'success' : 'warning'} size="sm" dot>
                {sub.status}
              </Badge>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold">
                {sub.billingCadence} Cadence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-800">{sub.customerName}</strong> • Plan: {sub.planName}
            </p>
          </div>
        </div>

        {/* Action Buttons (Requirement 14) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={Sliders}
            onClick={() => setIsProrationModalOpen(true)}
          >
            Change Quantity & Prorate
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={sub.status === 'Active' ? Pause : Play}
            onClick={() => setIsPauseModalOpen(true)}
          >
            {sub.status === 'Active' ? 'Pause Billing' : 'Resume'}
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={XCircle}
            onClick={() => setIsCancelModalOpen(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly Rate (MRR)</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{Math.round(sub.mrr).toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Annual Contract Value (ARR)</span>
            <div className="text-xl font-bold text-brand-700 mt-1">
              ₹{Math.round(sub.arr).toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Next Billing Date</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{sub.renewalDate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Units / Seats</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{currentSeats} Licenses</div>
          </CardContent>
        </Card>
      </div>

      {/* Two Clear Separated Sections: ONE-TIME ITEMS and RECURRING ITEMS (Requirement 14) */}
      <div className="space-y-6">
        {/* Section 1: ONE-TIME ITEMS */}
        <Card>
          <CardHeader
            title="1. ONE-TIME ITEMS (CapEx / Hardware & Deployments)"
            description="Upfront hardware nodes, initial structured cabling, and architecture setup fees"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Delivered Solution Item</th>
                  <th className="px-4 py-3">Delivered Date</th>
                  <th className="px-4 py-3">Billing Status</th>
                  <th className="px-5 py-3 text-right">Invoiced Total (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sub.oneTimeItemsDelivered && sub.oneTimeItemsDelivered.length > 0 ? (
                  sub.oneTimeItemsDelivered.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-brand-600" />
                        <span>{item.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{item.deliveredOn}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="success" size="sm" dot>
                          Reconciled & Invoiced
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                      No one-time hardware items attached to this standalone recurring subscription.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section 2: RECURRING ITEMS & BILLING SCHEDULE */}
        <Card>
          <CardHeader
            title="2. RECURRING ITEMS & BILLING SCHEDULE (OpEx)"
            description="Recurring software licenses, SLA support agreements, next invoices, and future cycles"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Product / Service</th>
                  <th className="px-4 py-3 text-center">Active Quantity</th>
                  <th className="px-4 py-3">Billing Frequency</th>
                  <th className="px-4 py-3">Recurring Price</th>
                  <th className="px-4 py-3">Next Billing Date</th>
                  <th className="px-4 py-3">Subscription Status</th>
                  <th className="px-5 py-3 text-right">Cycle Subtotal (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70 font-medium">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-emerald-600" />
                    <span>{sub.planName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-900">{currentSeats} Seats</td>
                  <td className="px-4 py-3.5 text-slate-700 capitalize">{sub.billingCadence}</td>
                  <td className="px-4 py-3.5 text-slate-700">₹{pricePerSeat.toLocaleString('en-IN')} / seat</td>
                  <td className="px-4 py-3.5 text-brand-700 font-semibold">{sub.renewalDate}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={sub.status === 'Active' ? 'success' : 'warning'} size="sm" dot>
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right font-black text-slate-900">
                    ₹{(currentSeats * pricePerSeat).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Billing Schedule: Current Period, Next Invoice, Future Invoices */}
          <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Upcoming Invoicing Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sub.recurringSchedule.map((cycle, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{cycle.period}</span>
                    <Badge variant={cycle.status === 'Paid' ? 'success' : 'default'} size="sm">
                      {cycle.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Ref: {cycle.invoiceId || 'Scheduled in Queue'}
                  </div>
                  <div className="text-sm font-black text-brand-700 pt-1">
                    ₹{cycle.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* MID-CYCLE PRORATION SUMMARY MODAL (Requirement 14) */}
      <Modal
        isOpen={isProrationModalOpen}
        onClose={() => setIsProrationModalOpen(false)}
        title="Modify Subscription & Mid-Cycle Proration Calculator"
        description="Adjust license seats with real-time pro-rata commercial credit/invoice adjustment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsProrationModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleApplyProration}>
              Apply Amendment & Issue {isCredit ? 'Credit Note' : 'Adjustment Invoice'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-left text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-semibold text-slate-600 block mb-1">Current Active Quantity:</span>
              <div className="p-2.5 bg-slate-100 rounded-lg font-bold text-slate-800 text-sm">
                {currentSeats} Units (₹{previousMonthlyAmount.toLocaleString('en-IN')}/mo)
              </div>
            </div>

            <div>
              <Input
                label="New Requested Quantity"
                type="number"
                min="1"
                max="500"
                value={newSeats}
                onChange={(e) => setNewSeats(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Days Remaining in Current Period:</span>
              <strong className="text-slate-900">{daysRemainingInCycle} of 30 days (60% remaining)</strong>
            </div>
            <div className="flex justify-between">
              <span>Unit Rate per Seat:</span>
              <strong className="text-slate-900">₹{pricePerSeat.toLocaleString('en-IN')} / month</strong>
            </div>
          </div>

          {/* PRORATION SUMMARY CARD (Requirement 14) */}
          <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40 space-y-2">
            <h4 className="font-bold text-brand-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-brand-600" /> Proration Summary (INR ₹)
            </h4>

            <div className="space-y-1.5 pt-2 border-t border-brand-100">
              <div className="flex justify-between text-slate-700">
                <span>Previous Monthly Amount:</span>
                <span className="font-semibold">₹{previousMonthlyAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>New Monthly Amount:</span>
                <span className="font-semibold">₹{newMonthlyAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-brand-800">
                <span>Proration Adjustment ({daysRemainingInCycle} days):</span>
                <span>{prorationAdjustment >= 0 ? `+₹${prorationAdjustment.toLocaleString('en-IN')}` : `-₹${Math.abs(prorationAdjustment).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="pt-2 border-t border-brand-200 flex justify-between text-sm font-black text-slate-900">
                <span>Final Adjusted Amount:</span>
                <span className="text-brand-700">₹{finalAdjustedCycleAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {isCredit ? (
              <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                ★ Partial Refund / Credit Note of <strong>₹{Math.abs(prorationAdjustment).toLocaleString('en-IN')}</strong> will be credited to customer ledger.
              </div>
            ) : (
              <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                ★ Prorated supplementary invoice of <strong>₹{prorationAdjustment.toLocaleString('en-IN')}</strong> will be generated immediately.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Pause Confirmation Modal */}
      <Modal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        title="Manage Subscription Billing Status"
        description="Pause automated recurring charge generation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPauseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleTogglePause}>
              Confirm Status Change
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Pausing this agreement will suspend upcoming invoice cycles for <strong>{sub.customerName}</strong> while keeping their account configuration preserved in the system.
        </p>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Recurring Contract"
        description="Terminate ongoing support and subscription services"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Keep Active
            </Button>
            <Button variant="danger" onClick={handleCancelSubscription}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Are you sure you want to cancel the subscription for <strong>{sub.customerName}</strong>? All automated monthly recurring renewals will end at the conclusion of the current period.
        </p>
      </Modal>
    </div>
  );
}
