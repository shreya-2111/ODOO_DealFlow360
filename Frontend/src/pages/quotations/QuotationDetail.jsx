import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldAlert,
  IndianRupee,
  TrendingUp,
  FileCheck,
  ExternalLink,
  Info,
  Clock,
  Check
} from 'lucide-react';

export function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    quotations,
    products,
    updateQuotation,
    submitQuoteForApproval,
    calculateQuoteFinancials,
    upsellRecommendations,
    governanceRules
  } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const quote = quotations.find((q) => q.id === id);

  // Local state for interactive editing
  const [items, setItems] = useState(quote ? quote.items : []);
  const [customerNotes, setCustomerNotes] = useState(quote ? quote.notes : '');
  const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
  const [selectedAddProductId, setSelectedAddProductId] = useState(products[0]?.id || 'PRD-101');
  const [addLineQty, setAddLineQty] = useState(1);
  const [addLineDiscount, setAddLineDiscount] = useState(0);

  if (!quote) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Quotation not found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested ID {id} does not exist.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/quotations')}>
          Back to Quotations
        </Button>
      </div>
    );
  }

  const financials = calculateQuoteFinancials(items, quote.customerTier);

  // Handle line item changes
  const handleItemChange = (itemId, field, value) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, [field]: Number(value) };
      }
      return item;
    });
    setItems(updated);
    updateQuotation(quote.id, { items: updated });
  };

  const handleRemoveItem = (itemId) => {
    if (items.length <= 1) {
      addToast('A quotation must contain at least one line item', 'warning');
      return;
    }
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    updateQuotation(quote.id, { items: updated });
    addToast('Line item removed', 'info');
  };

  const handleAddLineItem = (e) => {
    e.preventDefault();
    const prd = products.find((p) => p.id === selectedAddProductId) || products[0];
    const newLine = {
      id: `item-${Date.now()}`,
      productId: prd.id,
      productName: prd.name,
      sku: prd.sku,
      category: prd.category,
      type: prd.type,
      cadence: prd.cadence || 'one_time',
      quantity: Number(addLineQty),
      unitPrice: prd.basePrice,
      unitCost: prd.unitCost,
      discountPercent: Number(addLineDiscount),
      taxRate: prd.taxRate
    };

    const updated = [...items, newLine];
    setItems(updated);
    updateQuotation(quote.id, { items: updated });
    setIsAddLineModalOpen(false);
    addToast(`Added ${prd.name} to quotation`, 'success');
  };

  const handleAddUpsell = (upsell) => {
    const prd = products.find((p) => p.id === upsell.targetProductId || p.sku === upsell.recommendedSku) || products[3];
    const newLine = {
      id: `item-${Date.now()}`,
      productId: prd.id,
      productName: upsell.recommendedProduct,
      sku: upsell.recommendedSku,
      category: prd.category || 'Cloud Subscriptions',
      type: prd.type || 'recurring',
      cadence: prd.cadence || 'monthly',
      quantity: 1,
      unitPrice: upsell.price,
      unitCost: prd.unitCost || 1000,
      discountPercent: 0,
      taxRate: prd.taxRate || 18.0
    };

    const updated = [...items, newLine];
    setItems(updated);
    updateQuotation(quote.id, { items: updated });
    addToast(`Attached recommended upsell: ${upsell.recommendedProduct}!`, 'success');
  };

  const handleSubmitApproval = () => {
    submitQuoteForApproval(quote.id, currentUser.name);
    addToast(
      financials.hasBreach
        ? `Quotation submitted! Flagged as HIGH RISK due to discount breaches and routed to Regional VP Priya Patel & Controller Rajesh Verma.`
        : `Quotation submitted for standard approval routing.`,
      financials.hasBreach ? 'warning' : 'success',
      5000
    );
    navigate('/approvals');
  };

  const handleSaveDraft = () => {
    updateQuotation(quote.id, { items, notes: customerNotes });
    addToast('Quotation draft saved successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Back & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/quotations')}
          >
            All Quotes
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{quote.id}</h1>
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
              <Badge
                variant={
                  financials.riskLevel === 'HIGH'
                    ? 'danger'
                    : financials.riskLevel === 'MEDIUM'
                    ? 'warning'
                    : 'success'
                }
                size="sm"
              >
                {financials.riskLevel} RISK
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account: <span className="font-semibold text-slate-800">{quote.customerName}</span> ({quote.customerTier}) • Rep: {quote.salesRep}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={handleSaveDraft}>
            Save Draft
          </Button>

          {quote.status === 'Draft' && (
            <Button
              variant={financials.hasBreach ? 'warning' : 'primary'}
              size="md"
              icon={Send}
              onClick={handleSubmitApproval}
            >
              {financials.hasBreach ? 'Submit (High Risk Route)' : 'Submit for Approval'}
            </Button>
          )}

          {quote.status === 'Approved' && (
            <Button
              variant="primary"
              size="md"
              icon={ExternalLink}
              onClick={() => {
                navigate('/portal');
                addToast('Switched to Customer Portal for negotiation & signing', 'info');
              }}
            >
              Open in Customer Portal
            </Button>
          )}

          {quote.status === 'Pending Approval' && (
            <Button
              variant="outline"
              size="md"
              icon={ShieldAlert}
              onClick={() => navigate(`/approvals/${quote.id}`)}
            >
              View in Approval Queue
            </Button>
          )}
        </div>
      </div>

      {/* Discount Breach Notification Callout if present */}
      {financials.hasBreach && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-950 text-sm">
              Governance Breach Detected: Discount Exceeds Authorized Category Ceilings
            </h4>
            <div className="mt-1 space-y-0.5 text-rose-800 font-medium">
              {financials.breachDetails.map((b, i) => (
                <div key={i}>• {b}</div>
              ))}
            </div>
            <p className="text-[11px] text-rose-700 mt-2">
              Submitting this quotation will automatically escalate to Regional VP Priya Patel & Finance Controller Rajesh Verma.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: CPQ Line Items Table + Financial Summary / Upsell widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive CPQ Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Configure, Price & Quote (CPQ) Lines (INR ₹)"
              description="Real-time discount validation against category ceilings"
              action={
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAddLineModalOpen(true)}
                >
                  Add Product Line
                </Button>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="px-4 py-3">Product & SKU</th>
                    <th className="px-3 py-3 w-20">Qty</th>
                    <th className="px-3 py-3">Unit Price (₹)</th>
                    <th className="px-3 py-3 w-28">Discount %</th>
                    <th className="px-3 py-3">Line Margin</th>
                    <th className="px-4 py-3 text-right">Line Total (₹)</th>
                    <th className="px-3 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const categoryCeiling = governanceRules.categoryCeilings[item.category] || 15;
                    const isBreach = item.discountPercent > categoryCeiling;
                    const lineSubtotal = item.unitPrice * item.quantity;
                    const discountVal = (lineSubtotal * item.discountPercent) / 100;
                    const lineNet = lineSubtotal - discountVal;
                    const lineCost = item.unitCost * item.quantity;
                    const marginPct = lineNet > 0 ? (((lineNet - lineCost) / lineNet) * 100).toFixed(0) : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-mono">{item.sku}</span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">{item.category}</span>
                            {item.cadence && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {item.cadence}
                              </span>
                            )}
                          </div>
                          {isBreach && (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3 h-3" /> Exceeds {categoryCeiling}% limit (+{item.discountPercent - categoryCeiling}%)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-3 py-3.5 font-semibold text-slate-700">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={item.discountPercent}
                              onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                              className={`w-20 rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-2 ${
                                isBreach
                                  ? 'bg-rose-50 border-rose-400 text-rose-700 ring-rose-200'
                                  : 'bg-white border border-slate-200 text-slate-900 focus:ring-brand-500'
                              }`}
                            />
                            <span className="text-slate-400 text-[11px] ml-1">%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`text-xs font-semibold ${
                              Number(marginPct) > 40
                                ? 'text-emerald-700'
                                : Number(marginPct) > 20
                                ? 'text-slate-700'
                                : 'text-rose-600'
                            }`}
                          >
                            {marginPct}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                          ₹{Math.round(lineNet).toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Remove Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Deal Notes & Customer Commitments */}
          <Card>
            <CardHeader title="Commercial Terms & Branch Deployment Specifics" />
            <CardContent className="p-5 pt-0">
              <TextArea
                rows={3}
                placeholder="Include custom terms, installation addresses across Mumbai/Bengaluru, GSTIN details..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Audit & Workflow History */}
          <Card>
            <CardHeader title="Quotation Audit Log & Activity Trail" />
            <CardContent className="p-5 pt-0">
              <div className="space-y-3">
                {quote.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{log.actor}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Financial Summary & AI Upsell Recommendations */}
        <div className="space-y-6">
          {/* Real-time Financial Breakdown */}
          <Card className="border-slate-300 shadow-md">
            <CardHeader title="Commercial Financial Summary (INR)" />
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (List Price):</span>
                <span className="font-semibold text-slate-900">₹{Math.round(financials.subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-rose-700 font-medium">
                <span>Total Applied Discounts:</span>
                <span>-₹{Math.round(financials.totalDiscountAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Net Solution Value:</span>
                <span className="font-semibold text-slate-900">₹{Math.round(financials.netAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated GST (18%):</span>
                <span>₹{Math.round(financials.totalTax).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Quote Amount:</span>
                <span className="text-xl font-extrabold text-brand-700">
                  ₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 mt-2 space-y-1">
                <div className="flex justify-between text-emerald-900 font-bold">
                  <span>Gross Profit Margin:</span>
                  <span>{financials.grossMargin}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>Net Gross Margin (INR):</span>
                  <span>+₹{Math.round(financials.grossProfit).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upsell / Cross-Sell AI Recommendation Widget */}
          <Card className="border-brand-200 bg-brand-50/20">
            <div className="p-4 border-b border-brand-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-900">AI Upsell Recommendations</span>
              </div>
              <Badge variant="brand" size="sm">Margin Booster</Badge>
            </div>
            <CardContent className="p-4 space-y-3">
              {upsellRecommendations.map((upsell) => (
                <div
                  key={upsell.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{upsell.recommendedProduct}</div>
                      <span className="text-[10px] text-slate-500">{upsell.recommendedSku}</span>
                    </div>
                    <Badge variant="success" size="sm">{upsell.marginContribution}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">{upsell.rationale}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-900">+₹{upsell.price.toLocaleString('en-IN')}/mo</span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleAddUpsell(upsell)}
                    >
                      Attach Add-on
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Line Item Modal */}
      <Modal
        isOpen={isAddLineModalOpen}
        onClose={() => setIsAddLineModalOpen(false)}
        title="Add Product / Service Line"
        description="Select from master catalog and set initial quantity & discount"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddLineModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLineItem}>
              Add Line Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLineItem} className="space-y-4 text-left">
          <Select
            label="Product / SKU"
            value={selectedAddProductId}
            onChange={(e) => setSelectedAddProductId(e.target.value)}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.category}) - ₹${p.basePrice.toLocaleString('en-IN')}`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={addLineQty}
              onChange={(e) => setAddLineQty(e.target.value)}
            />
            <Input
              label="Discount %"
              type="number"
              min="0"
              max="90"
              value={addLineDiscount}
              onChange={(e) => setAddLineDiscount(e.target.value)}
              helperText="Discount ceilings apply by category"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
