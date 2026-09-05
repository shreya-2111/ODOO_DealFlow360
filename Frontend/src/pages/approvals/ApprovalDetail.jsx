import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { Modal } from '../../components/ui/Modal';
import { TextArea } from '../../components/ui/Input';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  Building,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';

export function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    quotations,
    approveQuoteStep,
    returnQuoteForRevision,
    calculateQuoteFinancials,
    governanceRules
  } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const quote = quotations.find((q) => q.id === id);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [returnReason, setReturnReason] = useState('');

  if (!quote) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Quotation not found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested ID {id} does not exist.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/approvals')}>
          Back to Approvals Queue
        </Button>
      </div>
    );
  }

  const financials = calculateQuoteFinancials(quote.items, quote.customerTier);
  const isPending = quote.status === 'Pending Approval';
  const pendingStep = quote.approvalSteps.find((s) => s.status === 'pending');

  const handleApprove = () => {
    approveQuoteStep(quote.id, currentUser.name, currentUser.role, approvalNotes);
    setIsApproveModalOpen(false);
    addToast(`Quotation ${quote.id} approved by ${currentUser.name}! Stage updated.`, 'success');
  };

  const handleReturn = () => {
    if (!returnReason.trim()) {
      addToast('Please specify a revision reason for the sales rep', 'warning');
      return;
    }
    returnQuoteForRevision(quote.id, currentUser.name, currentUser.role, returnReason);
    setIsReturnModalOpen(false);
    addToast(`Quotation ${quote.id} returned to ${quote.salesRep} for revision.`, 'info');
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
            onClick={() => navigate('/approvals')}
          >
            Approvals Queue
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{quote.id}</h1>
              <Badge
                variant={quote.riskLevel === 'HIGH' ? 'danger' : quote.riskLevel === 'MEDIUM' ? 'warning' : 'success'}
                size="sm"
              >
                {quote.riskLevel} RISK
              </Badge>
              <Badge
                variant={
                  quote.status === 'Confirmed'
                    ? 'success'
                    : quote.status === 'Approved'
                    ? 'brand'
                    : quote.status === 'Pending Approval'
                    ? 'warning'
                    : 'default'
                }
                size="sm"
                dot
              >
                {quote.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account: <strong className="text-slate-800">{quote.customerName}</strong> • Rep: {quote.salesRep} • Tier: {quote.customerTier}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <Button
                variant="secondary"
                size="md"
                icon={RotateCcw}
                onClick={() => setIsReturnModalOpen(true)}
              >
                Return for Revision
              </Button>
              <Button
                variant="success"
                size="md"
                icon={CheckCircle2}
                onClick={() => setIsApproveModalOpen(true)}
              >
                Approve Quotation
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="md"
              icon={FileSpreadsheet}
              onClick={() => navigate(`/quotations/${quote.id}`)}
            >
              Open in CPQ Editor
            </Button>
          )}
        </div>
      </div>

      {/* Stepper Card */}
      <Card>
        <CardHeader
          title="Multi-Gate Approval Progress"
          description={`Active Gate: ${pendingStep ? pendingStep.role : 'Fully Approved & Verified'}`}
        />
        <CardContent className="p-6">
          <Stepper steps={quote.approvalSteps} />
        </CardContent>
      </Card>

      {/* Flagged Breach Alert if HIGH Risk */}
      {financials.hasBreach && (
        <Card className="border-rose-300 bg-rose-50/30">
          <CardHeader
            title="Concession & Discount Breach Analysis (INR)"
            description="Automatic trigger caused by discount exceeding authorized governance ceilings"
          />
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border border-rose-200">
                <span className="text-[11px] font-semibold text-slate-500">Breach Summary</span>
                <p className="text-xs font-bold text-rose-700 mt-1">{quote.discountBreachSummary}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-rose-200">
                <span className="text-[11px] font-semibold text-slate-500">Blended Gross Margin</span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  {financials.grossMargin}% <span className="text-[10px] text-slate-400 font-normal">(₹{Math.round(financials.grossProfit).toLocaleString('en-IN')} gross profit)</span>
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-rose-200">
                <span className="text-[11px] font-semibold text-slate-500">Required Signoff Gate</span>
                <p className="text-xs font-bold text-slate-900 mt-1">Regional VP Priya Patel & Controller Rajesh Verma</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid: Line Items Snapshot + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Quotation Line Items & Commercial Terms"
              description="Review unit costs, quantities, and line margins before signing"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-5 py-3">Product / SKU</th>
                    <th className="px-3 py-3 text-center">Qty</th>
                    <th className="px-3 py-3">List Price</th>
                    <th className="px-3 py-3">Discount %</th>
                    <th className="px-3 py-3">Margin</th>
                    <th className="px-5 py-3 text-right">Net Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.items.map((item) => {
                    const categoryCeiling = governanceRules.categoryCeilings[item.category] || 15;
                    const isBreach = item.discountPercent > categoryCeiling;
                    const lineSubtotal = item.unitPrice * item.quantity;
                    const discountVal = (lineSubtotal * item.discountPercent) / 100;
                    const lineNet = lineSubtotal - discountVal;
                    const lineCost = item.unitCost * item.quantity;
                    const marginPct = lineNet > 0 ? (((lineNet - lineCost) / lineNet) * 100).toFixed(0) : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.sku} • {item.category}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="px-3 py-3.5 text-slate-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              isBreach ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {item.discountPercent}%
                          </span>
                        </td>
                        <td className="px-3 py-3.5 font-semibold text-slate-700">{marginPct}%</td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                          ₹{Math.round(lineNet).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Strip */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500">Customer Commit Notes: </span>
                <span className="font-medium text-slate-800">{quote.customerNotes || 'No custom notes.'}</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-slate-400">Total Net: </span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Margin: </span>
                  <span className="font-bold text-emerald-700 text-sm">{financials.grossMargin}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Audit Log */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Approval Audit Trail & Log" />
            <CardContent className="p-5 pt-0">
              <div className="space-y-4">
                {quote.auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-5 pb-4 border-l-2 border-slate-200 last:border-transparent last:pb-0 text-xs">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white" />
                    <div className="font-bold text-slate-900">{log.actor}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</div>
                    <p className="text-slate-600 mt-1">{log.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={`Authorize & Approve ${quote.id}`}
        description={`Confirm approval as ${currentUser.name} (${currentUser.role})`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={CheckCircle2} onClick={handleApprove}>
              Confirm Approval
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-600">
            By approving, you authorize the terms of this quotation for a total value of{' '}
            <strong className="text-slate-900">₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}</strong> at{' '}
            <strong className="text-emerald-700">{financials.grossMargin}% gross margin</strong>.
          </p>
          <TextArea
            label="Executive Comments / Concession Rationale (Optional)"
            placeholder="e.g. Concession authorized based on multi-site expansion in Mumbai and Bengaluru."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Return for Revision Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Return Quotation for Revision"
        description={`Send back to sales representative ${quote.salesRep}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={RotateCcw} onClick={handleReturn}>
              Return to Rep
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-600">
            The quotation will be reset to <strong>Draft</strong> status so the sales representative can adjust discounts or line configurations.
          </p>
          <TextArea
            label="Revision Instructions & Required Price Floor"
            placeholder="e.g. Please reduce Professional Services discount to 10% or add minimum 2-year AMC commitment."
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
