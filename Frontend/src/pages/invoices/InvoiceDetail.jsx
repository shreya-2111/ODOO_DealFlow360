import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import {
  ArrowLeft,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  CreditCard,
  Truck,
  AlertTriangle,
  Building,
  FileCheck
} from 'lucide-react';

export function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, updateInvoiceReconciliation } = useData();
  const { addToast } = useToast();

  const invoice = invoices.find((i) => i.id === id);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('NEFT / RTGS Bank Transfer #UTR-HDFC998124');

  if (!invoice) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Invoice Not Found</h2>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const isPaid = invoice.reconciliationStage === 'Paid';
  const isInvoiced = invoice.reconciliationStage === 'Invoiced';
  const isShipped = invoice.reconciliationStage === 'Shipped';
  const isConfirmed = invoice.reconciliationStage === 'Order Confirmed';

  const reconciliationSteps = [
    {
      role: '1. Order Confirmed',
      status: 'approved',
      timestamp: invoice.issueDate
    },
    {
      role: '2. Shipped Proof Verified',
      status: (isShipped || isInvoiced || isPaid) ? 'approved' : 'pending',
      timestamp: (isShipped || isInvoiced || isPaid) ? 'Carrier Verified' : null
    },
    {
      role: '3. Invoiced & Delivered',
      status: (isInvoiced || isPaid) ? 'approved' : isShipped ? 'pending' : 'upcoming',
      timestamp: (isInvoiced || isPaid) ? invoice.issueDate : null
    },
    {
      role: '4. Paid & Reconciled',
      status: isPaid ? 'approved' : isInvoiced ? 'pending' : 'upcoming',
      timestamp: isPaid ? 'Bank Settled' : null
    }
  ];

  const handleAdvanceStage = () => {
    if (isConfirmed) {
      updateInvoiceReconciliation(invoice.id, 'Shipped');
      addToast('Fulfillment proof verified! Invoice ready for delivery.', 'success');
    } else if (isShipped) {
      updateInvoiceReconciliation(invoice.id, 'Invoiced');
      addToast('Invoice delivered to customer Net 30 accounts receivable.', 'success');
    } else if (isInvoiced) {
      setIsPaymentModalOpen(true);
    }
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    updateInvoiceReconciliation(invoice.id, 'Paid');
    setIsPaymentModalOpen(false);
    addToast(`Payment of ₹${Math.round(invoice.amount).toLocaleString('en-IN')} settled! Revenue recognized in GL.`, 'success');
  };

  const handleDownloadPDF = () => {
    addToast(`Generating and downloading GST Tax Invoice PDF for ${invoice.id}...`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/invoices')}
          >
            Invoices Ledger
          </Button>
          <img
            src="/logo.png"
            alt="DealFlow360"
            className="h-10 w-10 object-contain rounded-xl border border-slate-200 bg-white shadow-2xs hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{invoice.id}</h1>
              <Badge variant={isPaid ? 'success' : 'warning'} size="sm" dot>
                {invoice.status}
              </Badge>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold">
                Stage: {invoice.reconciliationStage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Billed to: <strong className="text-slate-800">{invoice.customerName}</strong> • Origin Quote: {invoice.quoteId}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={handleDownloadPDF}
          >
            Export GST PDF
          </Button>

          {!isPaid && (
            <Button
              variant="primary"
              size="md"
              icon={CheckCircle2}
              onClick={handleAdvanceStage}
            >
              {isConfirmed
                ? 'Verify Shipping Proof'
                : isShipped
                ? 'Issue Invoice to Client'
                : 'Record Cash Payment'}
            </Button>
          )}
        </div>
      </div>

      {/* 4-Stage Reconciliation Stepper */}
      <Card>
        <CardHeader
          title="4-Stage Delivery-Reconciliation Stepper"
          description="Strict matching rule: Invoicing is gated on physical fulfillment and delivery verification"
        />
        <CardContent className="p-6">
          <Stepper steps={reconciliationSteps} />
        </CardContent>
      </Card>

      {/* Main Grid: Shipped Items Proof + Invoice Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Delivery Verification Proof */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Verified Dispatch & Proof of Delivery Lines"
              description="Line items matched against warehouse dispatch telemetry"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-5 py-3">SKU & Item Description</th>
                    <th className="px-4 py-3">Waybill / Tracking</th>
                    <th className="px-4 py-3">Fulfillment Status</th>
                    <th className="px-5 py-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.shippedItemsProof.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{item.description}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {item.carrierTracking}
                      </td>
                      <td className="px-4 py-3.5">
                        {item.verifiedShipped ? (
                          <Badge variant="success" size="sm">
                            Shipped & Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Pending Dispatch
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {item.verifiedShipped ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reconciliation Rule Callout */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs flex items-center gap-2.5 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Indian GST E-Invoicing & Accounting Standards:</strong> Output tax invoice generated post verified physical dispatch.
              </span>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Invoice Financial Summary */}
        <div className="space-y-6">
          <Card className="border-slate-300 shadow-md">
            <CardHeader title="Tax Invoice Commercial Breakdown (INR)" />
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Issue Date:</span>
                <span className="font-semibold text-slate-900">{invoice.issueDate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Terms:</span>
                <span className="font-semibold text-slate-900">Net 30 Days</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Due Date:</span>
                <span className="font-semibold text-slate-900">{invoice.dueDate}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Invoice Amount:</span>
                <span className="text-xl font-extrabold text-brand-700">
                  ₹{Math.round(invoice.amount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mt-2 space-y-1">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Paid to Date:</span>
                  <span className="font-bold text-emerald-700">
                    ₹{Math.round(invoice.paidAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Settlement Channel:</span>
                  <span className="truncate max-w-[150px]">{invoice.paymentMethod}</span>
                </div>
              </div>

              {!isPaid && (
                <div className="pt-2">
                  <Button
                    variant="success"
                    size="md"
                    className="w-full justify-center"
                    icon={CreditCard}
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    Record Cash Settlement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Invoice Settlement"
        description="Mark invoice as fully settled in General Ledger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" icon={CheckCircle2} onClick={handleRecordPayment}>
              Confirm Payment Receipt
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-left">
          <p className="text-xs text-slate-600">
            Confirming settlement of <strong>₹{Math.round(invoice.amount).toLocaleString('en-IN')}</strong> for <strong>{invoice.customerName}</strong>.
          </p>

          <Input
            label="Transaction Reference / Bank UTR Number"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
