import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, TextArea } from '../../components/ui/Input';
import {
  Globe,
  FileCheck,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  ArrowRight,
  Download,
  IndianRupee,
  HelpCircle,
  Edit,
  Sparkles,
  Clock
} from 'lucide-react';

export function CustomerPortal() {
  const navigate = useNavigate();
  const {
    quotations,
    updateQuotation,
    customerSubmitNegotiation,
    customerConfirmQuote,
    calculateQuoteFinancials
  } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [selectedQuoteId, setSelectedQuoteId] = useState(quotations[0]?.id || 'QT-2026-901');

  // Modals state (Requirement 15)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isLineChangeModalOpen, setIsLineChangeModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Active line target
  const [activeLineItem, setActiveLineItem] = useState(null);
  const [lineQuestion, setLineQuestion] = useState('');
  const [requestedLineQty, setRequestedLineQty] = useState(1);

  // Negotiation panel form (Requirement 15)
  const [negotiationComment, setNegotiationComment] = useState('We would like to finalize this deal this week if you can accommodate a 20% discount on Business Analytics suite.');
  const [requestedChange, setRequestedChange] = useState('24-month contract lock-in with annual pre-payment');
  const [counterDiscount, setCounterDiscount] = useState(20);
  const [signerName, setSignerName] = useState('Vikram Malhotra, VP Technology');

  const quote = quotations.find((q) => q.id === selectedQuoteId) || quotations[0];
  const financials = quote ? calculateQuoteFinancials(quote.items, quote.customerTier, quote.orderDiscountPercent) : null;

  // Handle Asking a line-level Question
  const handleSendQuestion = (e) => {
    e.preventDefault();
    if (!lineQuestion.trim()) {
      addToast('Please enter your question', 'warning');
      return;
    }
    const updatedTimeline = [
      ...(quote.timeline || []),
      {
        sender: `${quote.customer || 'Customer'} (You)`,
        action: `Asked a question on ${activeLineItem?.name || 'product'}: "${lineQuestion}"`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: 'Sent to account executive'
      }
    ];
    updateQuotation(quote.id, { timeline: updatedTimeline });
    setIsQuestionModalOpen(false);
    setLineQuestion('');
    addToast(`Question sent to Sales Rep ${quote.salesRep}! You will receive a response shortly.`, 'success');
  };

  // Handle Requesting a Line Change
  const handleRequestLineChange = (e) => {
    e.preventDefault();
    const updatedTimeline = [
      ...(quote.timeline || []),
      {
        sender: `${quote.customer || 'Customer'} (You)`,
        action: `Requested quantity modification for ${activeLineItem?.name}: change to ${requestedLineQty} units`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: 'Pending sales rep confirmation'
      }
    ];
    updateQuotation(quote.id, {
      stage: 'Under Negotiation',
      timeline: updatedTimeline
    });
    setIsLineChangeModalOpen(false);
    addToast(`Change request submitted for ${activeLineItem?.name}. Quote marked as Under Negotiation.`, 'info');
  };

  // Handle Negotiation Panel Submission (Requirement 15 & 16)
  const handleNegotiationSubmit = (e) => {
    e.preventDefault();
    if (!negotiationComment.trim()) {
      addToast('Please enter a negotiation comment', 'warning');
      return;
    }

    // Re-approval Logic (Requirement 16)
    // If counter discount > 15%, triggers Manager + Finance re-approval
    const exceedsThreshold = counterDiscount > 15;

    customerSubmitNegotiation(quote.id, {
      comment: negotiationComment,
      requestedChange,
      counterDiscount: Number(counterDiscount),
      exceedsThreshold
    });

    addToast(
      exceedsThreshold
        ? `Negotiation submitted! Counter discount (${counterDiscount}%) exceeds threshold -> Auto-routed to Sales Manager Priya Patel & Finance Controller Rajesh Verma.`
        : `Negotiation submitted within allowable threshold! Moving towards fulfillment.`,
      exceedsThreshold ? 'warning' : 'success',
      6000
    );
  };

  // Confirm Final Terms (Requirement 15 & 16)
  const handleConfirmQuote = (e) => {
    e.preventDefault();
    if (!signerName.trim()) {
      addToast('Please enter your full legal name for digital signature', 'warning');
      return;
    }
    customerConfirmQuote(quote.id, signerName);
    setIsSignModalOpen(false);
    addToast(`Contract confirmed and digitally executed! Order routed directly to Fulfillment.`, 'success', 5000);
  };

  return (
    <div className="space-y-6">
      {/* Customer Portal Top Header (Distinct Customer Look - Requirement 15) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
              360
            </div>
            <span className="font-bold text-slate-900 text-base">DealFlow360 Customer Portal</span>
            <span className="text-xs text-slate-400">• Buyer Experience</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Quotation & Commercial Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer: <strong className="text-slate-800">{quote.customer || quote.customerName}</strong> • Lead Contact: {quote.contactPerson}
          </p>
        </div>

        {/* Quotation Status Indicator & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Proposal Status:</span>
            <Badge
              variant={
                quote.stage === 'Confirmed'
                  ? 'success'
                  : quote.stage === 'Under Negotiation'
                  ? 'purple'
                  : quote.stage === 'Approved'
                  ? 'brand'
                  : 'default'
              }
              size="md"
              dot
            >
              {quote.stage === 'Approved' ? 'Sent (Ready for Signature)' : quote.stage}
            </Badge>
          </div>

          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <select
              value={selectedQuoteId}
              onChange={(e) => setSelectedQuoteId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} - {q.customer || q.customerName} ({q.stage})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {quote && financials && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: Quotation Document & Line Item Details */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">{quote.id}</span>
                    <Badge variant="default" size="sm">{quote.customerTier || 'Enterprise'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sales Representative: <strong className="text-slate-800">{quote.salesRep}</strong> • Valid Until: {quote.validUntil}
                  </p>
                </div>

                {quote.stage !== 'Confirmed' ? (
                  <Button
                    variant="success"
                    size="md"
                    icon={FileCheck}
                    onClick={() => setIsSignModalOpen(true)}
                  >
                    Confirm & Sign Quotation
                  </Button>
                ) : (
                  <Badge variant="success" size="lg">
                    ✓ Contract Digitally Confirmed
                  </Badge>
                )}
              </div>

              {/* Product Lines Table with Line-Level Actions (Requirement 15) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                      <th className="px-5 py-3">Product / Solution Line</th>
                      <th className="px-3 py-3 text-center">Quantity</th>
                      <th className="px-3 py-3 text-right">Unit Price</th>
                      <th className="px-3 py-3 text-center">Discount</th>
                      <th className="px-4 py-3 text-right">Total Net (INR ₹)</th>
                      <th className="px-5 py-3 text-right">Line Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((item) => {
                      const lineSubtotal = item.unitPrice * item.quantity;
                      const lineNet = lineSubtotal - (lineSubtotal * (item.discountPercent || 0)) / 100;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{item.name || item.productName}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {item.sku} • {item.category}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-4 text-right text-slate-600">
                            ₹{item.unitPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className="font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs">
                              {item.discountPercent || 0}% Off
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-black text-slate-900">
                            ₹{Math.round(lineNet).toLocaleString('en-IN')}
                          </td>

                          {/* Line Level Actions: Ask a Question or Request Change (Requirement 15) */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveLineItem(item);
                                  setIsQuestionModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 rounded-md transition-colors"
                              >
                                Ask Question
                              </button>
                              <button
                                onClick={() => {
                                  setActiveLineItem(item);
                                  setRequestedLineQty(item.quantity);
                                  setIsLineChangeModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-brand-700 bg-slate-100 hover:bg-brand-50 rounded-md transition-colors"
                              >
                                Request Change
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SLA and Commercial Commitments */}
              <div className="p-5 bg-slate-50/60 border-t border-slate-100 text-xs space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                  Commercial Deliverables & Terms
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Hardware Fulfillment:</strong> Multi-hub delivery from Mumbai/Ahmedabad facilities.<br />
                  • <strong>Statutory Compliance:</strong> Tax invoice with full 18% GST Input Credit claim.<br />
                  • <strong>Support SLA:</strong> 24/7 Managed AMC Support with guaranteed 30-min response SLA.
                </p>
              </div>
            </Card>

            {/* CUSTOMER NEGOTIATION PANEL (Requirement 15) */}
            <Card className="border-indigo-200 bg-indigo-50/20">
              <CardHeader
                title="Customer Negotiation & Counter-Terms Panel"
                description="Submit commercial amendments, counter discounts, or contract concessions directly to the deal desk"
              />
              <CardContent className="p-5 pt-0">
                <form onSubmit={handleNegotiationSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Counter Discount Proposal (%)"
                      type="number"
                      min="0"
                      max="50"
                      value={counterDiscount}
                      onChange={(e) => setCounterDiscount(e.target.value)}
                      helperText=">15% discount will route to Sales VP & Finance for re-approval"
                    />

                    <Input
                      label="Requested Contract Modification / Term"
                      placeholder="e.g. 24-Month commitment with annual upfront payment"
                      value={requestedChange}
                      onChange={(e) => setRequestedChange(e.target.value)}
                    />
                  </div>

                  <TextArea
                    label="Negotiation Message / Business Justification"
                    rows={2}
                    value={negotiationComment}
                    onChange={(e) => setNegotiationComment(e.target.value)}
                    placeholder="Describe specific volume commitments, budget ceilings, or technical requests..."
                    required
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-500">
                      Submitting counter-terms automatically updates quotation status to{' '}
                      <strong className="text-purple-700">Under Negotiation</strong>.
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        icon={Send}
                      >
                        Submit Request
                      </Button>
                      <Button
                        type="button"
                        variant="success"
                        size="md"
                        icon={CheckCircle2}
                        onClick={() => setIsSignModalOpen(true)}
                      >
                        Confirm Quotation
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT 4 COLS: Commercial Totals & Negotiation Timeline (Requirement 15) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Summary Card */}
            <Card className="border-slate-300 shadow-md">
              <CardHeader title="Total Solution Investment (INR ₹)" />
              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>List Price Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Math.round(financials.subtotal).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Commercial Discount:</span>
                  <span>-₹{Math.round(financials.totalDiscountAmount).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Applicable GST (18%):</span>
                  <span>₹{Math.round(financials.totalTax).toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Net Investment:</span>
                  <span className="text-xl font-black text-brand-700">
                    ₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-3">
                  {quote.stage !== 'Confirmed' ? (
                    <Button
                      variant="success"
                      size="lg"
                      className="w-full justify-center shadow-md font-bold text-sm"
                      icon={FileCheck}
                      onClick={() => setIsSignModalOpen(true)}
                    >
                      Confirm & Sign Quotation
                    </Button>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <div className="text-xs font-bold text-emerald-900">Contract Confirmed</div>
                      <span className="text-[10px] text-emerald-700">Signed by {quote.contactPerson}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* NEGOTIATION TIMELINE (Requirement 15: Customer request -> Rep response -> Customer counter -> Confirmation) */}
            <Card>
              <CardHeader
                title="Negotiation Timeline"
                description="Chronological log of customer proposals, counter-discounts, and approvals"
              />
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {(quote.timeline || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="relative pl-5 pb-4 border-l-2 border-slate-200 last:border-transparent last:pb-0 text-xs"
                    >
                      <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white" />
                      <div className="font-bold text-slate-900">{step.sender}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.timestamp}
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">{step.action}</p>
                      {step.note && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">"{step.note}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Line Item: Ask Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={`Ask a Question on ${activeLineItem?.name || 'Line Item'}`}
        description="Your question will be sent directly to the account lead"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSendQuestion}>
              Submit Question
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendQuestion} className="space-y-4 text-left">
          <TextArea
            label="Your Question / Specification Inquiry"
            placeholder="e.g. Can we confirm if the Dell server includes redundant power supply units and 3-year warranty?"
            value={lineQuestion}
            onChange={(e) => setLineQuestion(e.target.value)}
            required
            rows={3}
          />
        </form>
      </Modal>

      {/* Line Item: Request Change Modal */}
      <Modal
        isOpen={isLineChangeModalOpen}
        onClose={() => setIsLineChangeModalOpen(false)}
        title={`Request Modification: ${activeLineItem?.name || 'Line Item'}`}
        description="Specify requested adjustments to quantity or specifications"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLineChangeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Edit} onClick={handleRequestLineChange}>
              Submit Change Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleRequestLineChange} className="space-y-4 text-left">
          <Input
            label="Requested New Quantity"
            type="number"
            min="1"
            max="100"
            value={requestedLineQty}
            onChange={(e) => setRequestedLineQty(e.target.value)}
          />
        </form>
      </Modal>

      {/* Confirm & Sign Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Electronic Contract Execution & Confirmation"
        description="Legally binding digital acceptance of proposal terms (India IT Act 2000)"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={FileCheck} onClick={handleConfirmQuote}>
              Confirm Signature & Execute
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmQuote} className="space-y-4 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            By typing your full name below, you accept the commercial terms and pricing of quotation <strong>{quote?.id}</strong> for a total amount of <strong>₹{Math.round(financials?.totalAmount || 0).toLocaleString('en-IN')}</strong>.
          </p>

          <Input
            label="Authorized Signatory Name & Title"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            required
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted with SHA-256 digital certificate. Triggers fulfillment pipeline upon signoff.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
