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
  Receipt
} from 'lucide-react';

export function BillingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptions } = useData();
  const { addToast } = useToast();

  const sub = subscriptions.find((s) => s.id === id);

  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState('Premium 24x7 AMC Plan');

  if (!sub) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Subscription Not Found</h2>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/subscriptions')}>
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  const handleTogglePause = () => {
    setIsPauseModalOpen(false);
    addToast(
      sub.status === 'Active'
        ? `Subscription ${sub.id} paused. Automated billing suspended.`
        : `Subscription ${sub.id} resumed.`,
      'info'
    );
  };

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(false);
    addToast(`Contract upgraded to ${upgradeTier}! Next invoice prorated in INR.`, 'success');
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={sub.status === 'Active' ? Pause : Play}
            onClick={() => setIsPauseModalOpen(true)}
          >
            {sub.status === 'Active' ? 'Pause Billing' : 'Resume Billing'}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={ArrowUpRight}
            onClick={() => setIsUpgradeModalOpen(true)}
          >
            Upgrade / Adjust SLA
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
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Renewal Date</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{sub.renewalDate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Payment Channel</span>
            <div className="text-xs font-bold text-slate-900 mt-2 truncate">{sub.paymentMethod}</div>
          </CardContent>
        </Card>
      </div>

      {/* Two Clear Sections: One-Time CapEx Items vs Recurring Subscription Items */}
      <div className="space-y-6">
        {/* Section 1: Delivered One-Time Lines */}
        <Card>
          <CardHeader
            title="1. One-Time Delivered Line Items (CapEx)"
            description="One-off hardware server nodes, appliances, and deployment services associated with this deal"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Delivered Solution Item</th>
                  <th className="px-4 py-3">Delivered On</th>
                  <th className="px-4 py-3">Billing Status</th>
                  <th className="px-5 py-3 text-right">Invoiced Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sub.oneTimeItemsDelivered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                      No one-time hardware items attached to this pure SaaS subscription.
                    </td>
                  </tr>
                ) : (
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
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section 2: Recurring Subscription Lines & Schedule */}
        <Card>
          <CardHeader
            title="2. Ongoing Recurring Subscription Schedule (OpEx)"
            description="Automated monthly cadence, AMC coverage, and upcoming invoice batches"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Billing Cycle Period</th>
                  <th className="px-4 py-3">Plan / Description</th>
                  <th className="px-4 py-3">Invoice Ref</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Cycle Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sub.recurringSchedule.map((cycle, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-emerald-600" />
                      <span>{cycle.period}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{sub.planName}</td>
                    <td className="px-4 py-3.5 font-mono text-brand-600">
                      {cycle.invoiceId || <span className="text-slate-400">Scheduled</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={cycle.status === 'Paid' ? 'success' : 'default'} size="sm" dot>
                        {cycle.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      ₹{cycle.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

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

      {/* Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade SLA / Expand Subscription"
        description="Adjust endpoint capacity or elevate support tier"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpgrade}>
              Apply Contract Amendment
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <Select
            label="Target Service Level Agreement"
            value={upgradeTier}
            onChange={(e) => setUpgradeTier(e.target.value)}
            options={[
              { value: 'Premium 24x7 AMC Plan', label: 'Premium 24x7 AMC Plan (30-min response + Spare Nodes) - +₹4,500/mo' },
              { value: 'Enterprise 500 Endpoints', label: 'Expand Security Antivirus to 500 Seats - +₹15,000/mo' },
              { value: 'Dedicated Network Engineer Retainer', label: 'Dedicated Network Engineer Retainer - +₹35,000/mo' }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
