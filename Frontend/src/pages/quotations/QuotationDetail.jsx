import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImg from '../../assets/logo.png';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select, TextArea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldAlert,
  IndianRupee,
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  Package,
  Truck,
  FileCheck,
  ExternalLink
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
    upsellSuggestions,
    governanceRules
  } = useData();
  const { currentUser, isCustomer } = useAuth();
  const { addToast } = useToast();

  const quote = quotations.find((q) => q.id === id);

  // Local interactive states
  const [items, setItems] = useState(quote ? quote.items : []);
  const [orderDiscount, setOrderDiscount] = useState(quote?.orderDiscountPercent || 0);
  const [customerNotes, setCustomerNotes] = useState(quote ? quote.customerNotes : '');
  const [catalogCategory, setCatalogCategory] = useState('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [dismissedUpsells, setDismissedUpsells] = useState([]);

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

  const financials = calculateQuoteFinancials(items, quote.customerTier, orderDiscount);

  // Catalog filtered items
  const filteredCatalog = products.filter((p) => {
    const matchesCat = catalogCategory === 'ALL' || p.category === catalogCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Active upsells not yet dismissed or already added
  const activeUpsells = upsellSuggestions.filter((u) => !dismissedUpsells.includes(u.id));

  // Quantity controls
  const handleQuantityChange = (itemId, delta) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setItems(updated);
    updateQuotation(quote.id, { items: updated, orderDiscountPercent: orderDiscount });
  };

  const handleLineDiscountChange = (itemId, discountVal) => {
    const val = Math.max(0, Math.min(90, Number(discountVal)));
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, discountPercent: val };
      }
      return item;
    });
    setItems(updated);
    updateQuotation(quote.id, { items: updated, orderDiscountPercent: orderDiscount });
  };

  const handleRemoveItem = (itemId) => {
    if (items.length <= 1) {
      addToast('A quotation must contain at least one line item', 'warning');
      return;
    }
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    updateQuotation(quote.id, { items: updated, orderDiscountPercent: orderDiscount });
    addToast('Item removed from quotation cart', 'info');
  };

  // Add from catalog to cart
  const handleAddToCart = (product) => {
    const existing = items.find((i) => i.productId === product.id);
    let updated;
    if (existing) {
      updated = items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      addToast(`Increased ${product.name} quantity to ${existing.quantity + 1}`, 'success');
    } else {
      const newLine = {
        id: `item-${Date.now()}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        type: product.type,
        cadence: product.cadence,
        quantity: 1,
        unitPrice: product.basePrice,
        unitCost: product.unitCost,
        discountPercent: 0,
        taxRate: product.taxRate
      };
      updated = [...items, newLine];
      addToast(`Added ${product.name} to quotation cart!`, 'success');
    }
    setItems(updated);
    updateQuotation(quote.id, { items: updated, orderDiscountPercent: orderDiscount });
  };

  // Attach Upsell Recommendation
  const handleAttachUpsell = (upsell) => {
    const prd = products.find((p) => p.id === upsell.productId) || products[0];
    handleAddToCart(prd);
    setDismissedUpsells((prev) => [...prev, upsell.id]);
    addToast(`Attached recommended upsell: ${upsell.name}! Margin booster updated.`, 'success');
  };

  const handleDismissUpsell = (upsellId) => {
    setDismissedUpsells((prev) => [...prev, upsellId]);
    addToast('Upsell recommendation dismissed', 'info');
  };

  const handleSaveDraft = () => {
    updateQuotation(quote.id, { items, orderDiscountPercent: orderDiscount, customerNotes });
    addToast('Quotation draft saved successfully', 'success');
  };

  const handleSubmitForApproval = () => {
    submitQuoteForApproval(quote.id, currentUser.name);
    addToast(
      financials.hasBreach
        ? `Quotation submitted! High-risk discount breach routed to Sales Manager Priya Patel & Controller Rajesh Verma.`
        : `Quotation submitted for standard manager review.`,
      financials.hasBreach ? 'warning' : 'success',
      5000
    );
    navigate('/approvals');
  };

  const handleProceedToFulfillment = () => {
    updateQuotation(quote.id, { stage: 'Confirmed', approvalStatus: 'Confirmed & Ordered' });
    addToast('Quotation confirmed! Navigating to multi-warehouse split fulfillment...', 'success');
    navigate('/fulfillment');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/quotations')}
          >
            Quotations
          </Button>
          <img
            src={logoImg}
            alt="DealFlow360"
            className="h-10 w-10 object-contain rounded-xl border border-slate-200 bg-white shadow-2xs hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{quote.id}</h1>
              <Badge
                variant={
                  quote.stage === 'Confirmed'
                    ? 'success'
                    : quote.stage === 'Approved'
                    ? 'brand'
                    : quote.stage === 'Pending Approval'
                    ? 'warning'
                    : 'default'
                }
                size="sm"
                dot
              >
                {quote.stage}
              </Badge>
              <Badge
                variant={financials.riskScore >= 70 ? 'danger' : financials.riskScore >= 40 ? 'warning' : 'success'}
                size="sm"
              >
                Risk Score: {financials.riskScore}/100
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong className="text-slate-800">{quote.customer}</strong> ({quote.customerTier}) • Rep: {quote.salesRep}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={handleSaveDraft}>
            Save Draft
          </Button>

          {financials.requiresManagerApproval ? (
            <Button
              variant={financials.hasBreach ? 'warning' : 'primary'}
              size="md"
              icon={Send}
              onClick={handleSubmitForApproval}
            >
              Submit for Approval
            </Button>
          ) : (
            <Button
              variant="success"
              size="md"
              icon={Truck}
              onClick={handleProceedToFulfillment}
            >
              Proceed to Fulfillment
            </Button>
          )}

          {quote.stage === 'Approved' && (
            <Button
              variant="primary"
              size="md"
              icon={ExternalLink}
              onClick={() => navigate('/portal')}
            >
              Open in Customer Portal
            </Button>
          )}
        </div>
      </div>

      {/* Governance Breach Warning Banner */}
      {financials.hasBreach && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-950 text-sm">
              Governance Breach Alert: Concession Exceeds Category Limits
            </h4>
            <div className="mt-1 space-y-0.5 text-rose-800 font-medium">
              {financials.breachDetails.map((b, i) => (
                <div key={i}>• {b}</div>
              ))}
            </div>
            <p className="text-[11px] text-rose-700 mt-2">
              Requires dual authorization from Regional Sales VP Priya Patel & Controller Rajesh Verma before order confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Main Quotation Builder Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / MAIN AREA (Cols 1-7): Product Catalog */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader
              title="Product Master Catalog"
              description="Browse hardware, software subscriptions, and professional services"
              action={
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  {['ALL', 'Hardware', 'Services', 'Subscriptions'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCatalogCategory(cat)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        catalogCategory === cat ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              }
            />

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto">
              {filteredCatalog.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <Badge variant="default" size="sm">
                        {prod.category}
                      </Badge>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {prod.margin}% Margin
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">{prod.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.sku}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Stock: {prod.stock}</span>
                      <span className="font-bold text-slate-900 text-xs">
                        ₹{prod.basePrice.toLocaleString('en-IN')}
                        {prod.cadence && <span className="text-[10px] text-slate-400 font-normal">/mo</span>}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleAddToCart(prod)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upsell / Cross-Sell Panel (Requirement 11) */}
          {activeUpsells.length > 0 && (
            <Card className="border-brand-200 bg-brand-50/20">
              <div className="p-4 border-b border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-900">
                    AI Upsell & Cross-Sell Recommendations
                  </span>
                </div>
                <Badge variant="brand" size="sm">Margin Booster</Badge>
              </div>

              <div className="p-4 space-y-3">
                {activeUpsells.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{u.name}</span>
                        <Badge variant="success" size="sm">{u.marginDelta}</Badge>
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold">
                          {u.promotionTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{u.reason}</p>
                      <div className="font-bold text-brand-700">
                        ₹{u.price.toLocaleString('en-IN')} / month
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleAttachUpsell(u)}
                      >
                        Add to Quote
                      </Button>
                      <button
                        onClick={() => handleDismissUpsell(u.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT / SIDE CART (Cols 8-12): Quotation Cart & Live Margin Engine */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-300 shadow-md">
            <CardHeader
              title="Quotation Cart"
              description={`${items.length} items configured • Live margin validation`}
            />

            {/* Cart Items List */}
            <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {items.map((item) => {
                const lineSubtotal = item.unitPrice * item.quantity;
                const lineNet = lineSubtotal - (lineSubtotal * (item.discountPercent || 0)) / 100;
                const lineCost = item.unitCost * item.quantity;
                const lineMarginPct = lineNet > 0 ? (((lineNet - lineCost) / lineNet) * 100).toFixed(0) : 0;
                const categoryCeiling = governanceRules.categoryCeilings[item.category] || 15;
                const isBreach = item.discountPercent > categoryCeiling;

                return (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.sku} • ₹{item.unitPrice.toLocaleString('en-IN')} each
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Discount Input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500">Disc:</span>
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={item.discountPercent || 0}
                          onChange={(e) => handleLineDiscountChange(item.id, e.target.value)}
                          className={`w-14 px-1.5 py-0.5 text-xs text-center font-bold rounded border ${
                            isBreach ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                        <span className="text-slate-400 text-[10px]">%</span>
                      </div>

                      {/* Line Total & Margin */}
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ₹{Math.round(lineNet).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {lineMarginPct}% Margin
                        </div>
                      </div>
                    </div>

                    {isBreach && (
                      <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Exceeds {categoryCeiling}% ceiling (+{item.discountPercent - categoryCeiling}%)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order-Level Discount & Financial Summary */}
            <CardContent className="p-5 border-t border-slate-200 space-y-3 text-xs bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Order-Level Concession (%):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={orderDiscount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOrderDiscount(val);
                      updateQuotation(quote.id, { items, orderDiscountPercent: val });
                    }}
                    className="w-16 px-2 py-1 text-xs text-center font-bold bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="text-slate-500 font-semibold">%</span>
                </div>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Subtotal (List Price):</span>
                <span className="font-semibold text-slate-900">₹{Math.round(financials.subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Total Discounts (Line + Order):</span>
                <span>-₹{Math.round(financials.totalDiscountAmount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated GST (18%):</span>
                <span>₹{Math.round(financials.totalTax).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Quotation Value:</span>
                <span className="text-xl font-black text-brand-700">
                  ₹{Math.round(financials.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Dynamic Margin Indicator */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>Blended Gross Margin:</span>
                  <span className={financials.grossMargin < 25 ? 'text-rose-600' : 'text-emerald-700'}>
                    {financials.grossMargin}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      financials.grossMargin < 25 ? 'bg-rose-500' : financials.grossMargin < 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, financials.grossMargin))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Gross Profit: ₹{Math.round(financials.grossProfit).toLocaleString('en-IN')}</span>
                  <span>Risk Score: {financials.riskScore}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Spec Notes */}
          <Card>
            <CardHeader title="Commercial Spec & Customer Terms" />
            <CardContent className="p-4 pt-0">
              <TextArea
                rows={2}
                value={customerNotes}
                onChange={(e) => {
                  setCustomerNotes(e.target.value);
                  updateQuotation(quote.id, { customerNotes: e.target.value });
                }}
                placeholder="Include custom terms, installation dates, branch locations..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
