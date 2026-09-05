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
  IndianRupee
} from 'lucide-react';

export function CustomerPortal() {
  const navigate = useNavigate();
  const {
    quotations,
    customerSubmitCounterOffer,
    customerSignAndAcceptQuote,
    calculateQuoteFinancials
  } = useData();
  const { currentUser, switchRole } = useAuth();
  const { addToast } = useToast();

  const [selectedQuoteId, setSelectedQuoteId] = useState(quotations[0]?.id || '');
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [counterDiscount, setCounterDiscount] = useState(18);
  const [counterNote, setCounterNote] = useState('We can commit to a 24-month contract if you can honor an 18% discount across Dell PowerEdge nodes.');
  const [signerName, setSignerName] = useState('Vikram Malhotra, VP of Technology');

  const quote = quotations.find((q) => q.id === selectedQuoteId) || quotations[0];
  const financials = quote ? calculateQuoteFinancials(quote.items, quote.customerTier) : null;

  const handleCounterSubmit = (e) => {
    e.preventDefault();
    customerSubmitCounterOffer(quote.id, counterDiscount, counterNote);
    setIsCounterModalOpen(false);
    addToast(
      `Counter-offer (${counterDiscount}%) submitted! Re-routed to Regional VP Priya Patel & Controller Rajesh Verma for review.`,
      'info',
      5000
    );
  };

  const handleSignQuote = (e) => {
    e.preventDefault();
    if (!signerName.trim()) {
      addToast('Please enter your full signature name', 'warning');
      return;
    }
    customerSignAndAcceptQuote(quote.id, signerName);
    setIsSignModalOpen(false);
    addToast(`Contract accepted and digitally signed! Order confirmed for fulfillment.`, 'success', 5000);
  };

  return (
    <div className="space-y-6">
      {/* Portal Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/20 text-brand-300">
              <Globe className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Customer Collaboration & Negotiation Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-2">
            Welcome, {quote.customerName}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Review commercial proposals, negotiate counter-terms, and sign electronic contracts (INR ₹)
          </p>
        </div>

        {/* Quote Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
          <label className="block text-[10px] text-slate-300 uppercase font-semibold mb-1">
            Viewing Proposal:
          </label>
          <select
            value={selectedQuoteId}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="bg-white text-slate-900 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none"
          >
            {quotations.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} - {q.customerName} (₹{Math.round(calculateQuoteFinancials(q.items, q.customerTier).totalAmount).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {quote && financials && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Quotation Document View */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base font-bold text-slate-900">{quote.id}</span>
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
                  <p className="text-xs text-slate-500 mt-1">
                    Prepared by Account Lead: <strong className="text-slate-800">{quote.salesRep}</strong> • Valid through: {quote.validUntil}
                  </p>
                </div>

                {/* Customer Action Bar */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => setIsCounterModalOpen(true)}
                  >
                    Request Counter-Terms
                  </Button>
                  {quote.status !== 'Confirmed' ? (
                    <Button
                      variant="success"
                      size="sm"
                      icon={FileCheck}
                      onClick={() => setIsSignModalOpen(true)}
                    >
                      Accept & Sign
                    </Button>
                  ) : (
                    <Badge variant="success" size="lg">
                      Digitally Signed & Confirmed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Line Items Presentation */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                      <th className="px-5 py-3">Solution Component</th>
                      <th className="px-3 py-3 text-center">Qty</th>
                      <th className="px-3 py-3">List Unit Price</th>
                      <th className="px-3 py-3">Your Discount</th>
                      <th className="px-5 py-3 text-right">Net Price (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((item) => {
                      const lineSubtotal = item.unitPrice * item.quantity;
                      const lineNet = lineSubtotal - (lineSubtotal * item.discountPercent) / 100;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{item.productName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              SKU: {item.sku} • {item.cadence ? `${item.cadence} subscription` : 'One-time CapEx'}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center font-bold text-slate-800">{item.quantity}</td>
                          <td className="px-3 py-4 text-slate-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-4">
                            <span className="font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs">
                              {item.discountPercent}% Off
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-bold text-slate-900">
                            ₹{Math.round(lineNet).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Commercial Terms & SLA Commitments */}
              <div className="p-6 bg-slate-50/60 border-t border-slate-100 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Commercial & Service Level Agreements (SLA)
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>Delivery & Deployment:</strong> Fast-track dispatch within 4 business days from Mumbai/Bengaluru hubs.<br />
                  • <strong>GST & E-Invoicing:</strong> Full 18% GST input tax credit invoice provided with reconciliation proof.<br />
                  • <strong>Support Coverage:</strong> 24/7 dedicated telephone support with 30-min on-site response.
                </p>
              </div>
            </Card>
          </div>

          {/* Right 1 Col: Total Net Value Card & Negotiation Trail */}
          <div className="space-y-6">
            <Card className="border-slate-300 shadow-md">
              <CardHeader title="Total Solution Investment (INR)" />
              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>List Price Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{Math.round(financials.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Account Savings:</span>
                  <span>-₹{Math.round(financials.totalDiscountAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated GST (18%):</span>
                  <span>₹{Math.round(financials.totalTax).toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Net Contract Total:</span>
                  <span className="text-2xl font-black text-brand-700">
                    ₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  {quote.status !== 'Confirmed' ? (
                    <Button
                      variant="success"
                      size="lg"
                      className="w-full justify-center shadow-md font-bold text-sm"
                      icon={FileCheck}
                      onClick={() => setIsSignModalOpen(true)}
                    >
                      Accept & Digitally Sign
                    </Button>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <div className="text-xs font-bold text-emerald-900">Contract Accepted</div>
                      <span className="text-[10px] text-emerald-700">Signed by {quote.contactPerson}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Negotiation History */}
            <Card>
              <CardHeader title="Negotiation & Comments Log" />
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {quote.auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{log.actor}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Counter-Offer Modal */}
      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Submit Counter-Proposal / Commercial Terms"
        description="Your proposal will immediately be routed to Regional Sales VP Priya Patel & Controller Rajesh Verma"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCounterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} onClick={handleCounterSubmit}>
              Submit Counter-Offer
            </Button>
          </>
        }
      >
        <form onSubmit={handleCounterSubmit} className="space-y-4 text-left">
          <Input
            label="Requested Target Discount (%)"
            type="number"
            min="0"
            max="40"
            value={counterDiscount}
            onChange={(e) => setCounterDiscount(e.target.value)}
            helperText="Applies to primary hardware and software lines"
          />
          <TextArea
            label="Business Rationale & Custom Terms"
            placeholder="e.g. In exchange for 18% discount, we will execute a 2-year contract with annual pre-payment."
            value={counterNote}
            onChange={(e) => setCounterNote(e.target.value)}
            required
            rows={3}
          />
        </form>
      </Modal>

      {/* Digital Signature Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Electronic Contract Execution"
        description="Legally binding digital acceptance of proposal terms (India IT Act 2000)"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={FileCheck} onClick={handleSignQuote}>
              Confirm Signature & Accept
            </Button>
          </>
        }
      >
        <form onSubmit={handleSignQuote} className="space-y-4 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            By typing your full legal name below, you confirm authorization to execute this agreement on behalf of <strong>{quote.customerName}</strong> for a total amount of <strong>₹{Math.round(financials?.totalAmount || 0).toLocaleString('en-IN')}</strong>.
          </p>

          <Input
            label="Authorized Signer Name & Title"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            required
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted with SHA-256 digital audit trail and timestamp certificate.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
