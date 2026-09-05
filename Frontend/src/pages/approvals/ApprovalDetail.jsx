import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
  ExternalLink,
  IndianRupee,
  Check,
  X,
  Send,
  Sparkles
} from 'lucide-react';

export function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    quotations,
    updateQuotation,
    calculateQuoteFinancials,
    governanceRules
  } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const quote = quotations.find((q) => q.id === id);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [actionComments, setActionComments] = useState('');

  if (!quote) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Quotation Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested quotation ID {id} does not exist.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/approvals')}>
          Back to Approvals Queue
        </Button>
      </div>
    );
  }

  const financials = calculateQuoteFinancials(quote.items, quote.customerTier, quote.orderDiscountPercent);
  const customerName = quote.customer || quote.customerName || 'Account';
  const stage = quote.stage || quote.status || 'Draft';
  const isPending = stage === 'Pending Approval' || stage === 'Under Negotiation';
  const isHighRisk = (quote.riskScore || 30) >= 70;
  const requiresFinanceGate = financials.hasBreach || financials.totalAmount > 1000000;

  // Build 3-gate approval timeline (Requirement 12: Sales Rep -> Sales Manager -> Finance / Operations conditional)
  const approvalSteps = [
    {
      role: 'Sales Rep Submission',
      reviewer: quote.salesRep || 'Amit Sharma',
      status: 'approved',
      timestamp: quote.createdDate || '2026-09-02 10:30',
      comments: 'Standard quotation prepared in CPQ editor.'
    },
    {
      role: 'Sales Manager Review',
      reviewer: 'Priya Patel (Sales Manager)',
      status: stage === 'Approved' || stage === 'Confirmed' ? 'approved' : 'pending',
      timestamp: stage === 'Approved' || stage === 'Confirmed' ? '2026-09-02 14:00' : null,
      comments: stage === 'Approved' ? 'Commercial concession approved under regional delegation.' : 'Awaiting managerial authorization.'
    }
  ];

  // Conditional Finance gate (Requirement 12: Finance should only appear when required)
  if (requiresFinanceGate) {
    approvalSteps.push({
      role: 'Finance / Operations Controller',
      reviewer: 'Rajesh Verma (Controller)',
      status: stage === 'Confirmed' ? 'approved' : 'upcoming',
      timestamp: stage === 'Confirmed' ? '2026-09-02 16:30' : null,
      comments: 'Required due to discount breach (>15% limit) or deal value > ₹10 Lakh.'
    });
  }

  // Action: Approve
  const handleApprove = () => {
    const updatedTimeline = [
      ...(quote.timeline || []),
      {
        sender: `${currentUser.name} (${currentUser.role})`,
        action: 'Approved quotation commercial terms',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: actionComments || 'Approved in governance review.'
      }
    ];

    updateQuotation(quote.id, {
      stage: 'Approved',
      status: 'Approved',
      approvalStatus: `Approved by ${currentUser.name}`,
      timeline: updatedTimeline
    });

    setIsApproveModalOpen(false);
    setActionComments('');
    addToast(`Quotation ${quote.id} successfully APPROVED by ${currentUser.name}! Customer portal unlocked.`, 'success', 5000);
  };

  // Action: Reject
  const handleReject = () => {
    const updatedTimeline = [
      ...(quote.timeline || []),
      {
        sender: `${currentUser.name} (${currentUser.role})`,
        action: 'Rejected quotation terms',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: actionComments || 'Rejected: concession exceeds margin tolerance.'
      }
    ];

    updateQuotation(quote.id, {
      stage: 'Draft',
      status: 'Rejected',
      approvalStatus: `Rejected by ${currentUser.name}`,
      timeline: updatedTimeline
    });

    setIsRejectModalOpen(false);
    setActionComments('');
    addToast(`Quotation ${quote.id} REJECTED. Rep notified to adjust pricing.`, 'danger', 5000);
  };

  // Action: Return for Revision
  const handleReturnForRevision = () => {
    const updatedTimeline = [
      ...(quote.timeline || []),
      {
        sender: `${currentUser.name} (${currentUser.role})`,
        action: 'Returned quotation for revision',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: actionComments || 'Please reduce services discount to <=10%.'
      }
    ];

    updateQuotation(quote.id, {
      stage: 'Draft',
      status: 'Draft',
      approvalStatus: `Returned for revision by ${currentUser.name}`,
      timeline: updatedTimeline
    });

    setIsReturnModalOpen(false);
    setActionComments('');
    addToast(`Quotation ${quote.id} returned to ${quote.salesRep} for commercial revision.`, 'info', 5000);
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
                variant={
                  stage === 'Confirmed'
                    ? 'success'
                    : stage === 'Approved'
                    ? 'brand'
                    : stage === 'Pending Approval'
                    ? 'warning'
                    : 'default'
                }
                size="sm"
                dot
              >
                {stage}
              </Badge>
              <Badge
                variant={isHighRisk ? 'danger' : 'warning'}
                size="sm"
              >
                Risk Score: {quote.riskScore || 30}/100
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account: <strong className="text-slate-800">{customerName}</strong> ({quote.customerTier}) • Rep: {quote.salesRep}
            </p>
          </div>
        </div>

        {/* Action Buttons (Requirement 12: Approve, Reject, Return for Revision) */}
        <div className="flex flex-wrap items-center gap-2">
          {isPending ? (
            <>
              <Button
                variant="outline"
                size="md"
                icon={RotateCcw}
                onClick={() => setIsReturnModalOpen(true)}
              >
                Return for Revision
              </Button>
              <Button
                variant="danger"
                size="md"
                icon={XCircle}
                onClick={() => setIsRejectModalOpen(true)}
              >
                Reject
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

      {/* QUOTATION SUMMARY STRIP (Requirement 12: Customer, Quote amount, Total discount, Discount %, Margin, Risk score) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Customer */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate">{customerName}</div>
            <span className="text-[10px] text-slate-500">{quote.customerTier}</span>
          </CardContent>
        </Card>

        {/* Quote Amount */}
        <Card className="border-brand-200 bg-brand-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">Quote Amount</span>
            <div className="text-base font-black text-brand-900 mt-1">
              ₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">Net with 18% GST</span>
          </CardContent>
        </Card>

        {/* Total Discount Amount */}
        <Card className="border-rose-200 bg-rose-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Total Discount</span>
            <div className="text-base font-black text-rose-900 mt-1">
              ₹{Math.round(financials.totalDiscountAmount).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-rose-700">Line + Order Concession</span>
          </CardContent>
        </Card>

        {/* Discount Percentage */}
        <Card className="border-amber-200 bg-amber-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Discount %</span>
            <div className="text-base font-black text-amber-900 mt-1">
              {financials.totalDiscountAmount > 0 ? (((financials.totalDiscountAmount) / (financials.subtotal)) * 100).toFixed(1) : '0.0'}%
            </div>
            <span className="text-[10px] text-amber-700">Blended concession</span>
          </CardContent>
        </Card>

        {/* Margin % */}
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Gross Margin</span>
            <div className="text-base font-black text-emerald-900 mt-1">
              {financials.grossMargin}%
            </div>
            <span className="text-[10px] text-emerald-700">₹{Math.round(financials.grossProfit).toLocaleString('en-IN')} profit</span>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Score</span>
            <div className="text-base font-black text-slate-900 mt-1">
              {quote.riskScore || 30}/100
            </div>
            <span className={`text-[10px] font-semibold ${isHighRisk ? 'text-rose-600' : 'text-emerald-700'}`}>
              {isHighRisk ? 'High Risk Breach' : 'Standard Risk'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* VISUAL APPROVAL TIMELINE (Requirement 12: Sales Rep -> Sales Manager -> Finance / Operations) */}
      <Card>
        <CardHeader
          title="Multi-Gate Approval Sequence"
          description={`Sequential signoff chain: Sales Rep → Sales Manager ${requiresFinanceGate ? '→ Finance / Operations Gate' : ''}`}
        />
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approvalSteps.map((step, idx) => {
              const isDone = step.status === 'approved';
              const isCurrent = step.status === 'pending';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : isCurrent
                      ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Gate #{idx + 1}
                    </span>
                    <Badge variant={isDone ? 'success' : isCurrent ? 'warning' : 'default'} size="sm">
                      {isDone ? 'Approved ✓' : isCurrent ? 'Under Review ●' : 'Upcoming Gate'}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-1">{step.role}</h4>
                  <p className="text-xs text-slate-700 font-medium">{step.reviewer}</p>

                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                    <div className="text-slate-500">
                      Timestamp: <strong className="text-slate-700">{step.timestamp || 'Pending Signoff'}</strong>
                    </div>
                    <div className="text-slate-600 italic">
                      "{step.comments}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Line Items & Audit Trail Section (Requirement 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Commercial Line Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader
              title="Quotation Line Items & Concession Analysis"
              description="Review line discounts against authorized category ceilings"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="px-5 py-3">Product / SKU</th>
                    <th className="px-3 py-3 text-center">Qty</th>
                    <th className="px-3 py-3 text-right">List Price</th>
                    <th className="px-3 py-3 text-center">Discount</th>
                    <th className="px-3 py-3 text-center">Margin</th>
                    <th className="px-5 py-3 text-right">Net Amount (INR ₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.items.map((item) => {
                    const lineSubtotal = item.unitPrice * item.quantity;
                    const lineNet = lineSubtotal - (lineSubtotal * (item.discountPercent || 0)) / 100;
                    const lineCost = (item.unitCost || 0) * item.quantity;
                    const lineMargin = lineNet > 0 ? (((lineNet - lineCost) / lineNet) * 100).toFixed(0) : 0;
                    const categoryCeiling = governanceRules.categoryCeilings[item.category] || 15;
                    const isBreach = (item.discountPercent || 0) > categoryCeiling;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{item.name || item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku} • {item.category}</div>
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="px-3 py-3.5 text-right text-slate-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              isBreach ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {item.discountPercent || 0}%
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center font-semibold text-emerald-700">{lineMargin}%</td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-900">
                          ₹{Math.round(lineNet).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: FULL AUDIT TRAIL (Requirement 12: Action, User, Timestamp, Comments) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader
              title="Approval Audit Trail & Log"
              description="Complete chronological activity history with user signatures"
            />
            <CardContent className="p-5 pt-0">
              <div className="space-y-3">
                {(quote.timeline || []).map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{log.sender}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{log.action}</p>
                    {log.note && (
                      <p className="text-[11px] text-slate-500 italic">"{log.note}"</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* APPROVE MODAL */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title={`Authorize & Approve ${quote.id}`}
        description={`Confirm commercial signoff as ${currentUser.name} (${currentUser.role})`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={CheckCircle2} onClick={handleApprove}>
              Authorize Approval
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left text-xs">
          <p className="text-slate-600">
            By authorizing this deal, you approve a total value of{' '}
            <strong className="text-slate-900">₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}</strong> at a blended{' '}
            <strong className="text-emerald-700">{financials.grossMargin}% Gross Margin</strong>.
          </p>
          <TextArea
            label="Approval Comments / Conditions"
            placeholder="e.g. Approved under Q3 strategic quota allowance."
            value={actionComments}
            onChange={(e) => setActionComments(e.target.value)}
            rows={2}
          />
        </div>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Quotation ${quote.id}`}
        description="Deny discount terms and return proposal to draft"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={XCircle} onClick={handleReject}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left text-xs">
          <TextArea
            label="Reason for Rejection"
            placeholder="e.g. Services concession exceeds allowable gross margin floor of 45%."
            value={actionComments}
            onChange={(e) => setActionComments(e.target.value)}
            required
            rows={3}
          />
        </div>
      </Modal>

      {/* RETURN FOR REVISION MODAL */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title={`Return ${quote.id} for Commercial Revision`}
        description="Notify sales rep to adjust discounts before resubmission"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={RotateCcw} onClick={handleReturnForRevision}>
              Send Back for Revision
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left text-xs">
          <TextArea
            label="Revision Instructions for Sales Rep"
            placeholder="e.g. Please decrease services discount from 18% to 10% or bundle 24/7 AMC Support to defend deal margin."
            value={actionComments}
            onChange={(e) => setActionComments(e.target.value)}
            required
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
