import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_QUOTATIONS,
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_FULFILLMENT_SPLITS,
  INITIAL_SUBSCRIPTIONS_BILLING,
  INITIAL_INVOICES,
  DEAL_HEALTH_DATA,
  GOVERNANCE_RULES,
  UPSELL_SUGGESTIONS
} from '../data/mockData';

const DataContext = createContext(null);

// Global data store holding unified mock records and state manipulation functions
export function DataProvider({ children }) {
  const [quotations, setQuotations] = useState(INITIAL_QUOTATIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [warehouses] = useState(INITIAL_WAREHOUSES);
  const [fulfillmentSplits, setFulfillmentSplits] = useState(INITIAL_FULFILLMENT_SPLITS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS_BILLING);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [dealHealth] = useState(DEAL_HEALTH_DATA);
  const [governanceRules, setGovernanceRules] = useState(GOVERNANCE_RULES);
  const [upsellSuggestions] = useState(UPSELL_SUGGESTIONS);

  // Calculate pricing, margins, tax, and governance risk score for quote items
  const calculateQuoteFinancials = (items = [], customerTier = 'Silver Tier', orderDiscountPercent = 0) => {
    let subtotal = 0;
    let totalCost = 0;
    let lineDiscountAmount = 0;
    let hasBreach = false;
    let breachDetails = [];
    let riskPoints = 0;

    const tierLimit = governanceRules.tierCeilings[customerTier] || 10;

    // Aggregate line item pricing and evaluate discount breaches
    items.forEach((item) => {
      const lineSubtotal = (item.unitPrice || 0) * (item.quantity || 1);
      const lineDiscPct = item.discountPercent || 0;
      const lineDiscVal = (lineSubtotal * lineDiscPct) / 100;
      const lineCost = (item.unitCost || 0) * (item.quantity || 1);

      subtotal += lineSubtotal;
      lineDiscountAmount += lineDiscVal;
      totalCost += lineCost;

      const categoryLimit = governanceRules.categoryCeilings[item.category] || tierLimit;
      if (lineDiscPct > categoryLimit) {
        hasBreach = true;
        const diff = lineDiscPct - categoryLimit;
        breachDetails.push(`${item.category} (${item.name}): ${lineDiscPct}% discount (+${diff}% breach over ${categoryLimit}% ceiling)`);
        riskPoints += diff * 4;
      }
    });

    // Compute net amount and apply order-level discount
    const discountedAfterLines = subtotal - lineDiscountAmount;
    const orderDiscountAmount = (discountedAfterLines * (orderDiscountPercent || 0)) / 100;
    const netAmount = discountedAfterLines - orderDiscountAmount;
    const totalDiscountAmount = lineDiscountAmount + orderDiscountAmount;

    // Calculate 18% GST and gross margin
    const totalTax = netAmount * 0.18;
    const totalAmount = netAmount + totalTax;
    const grossProfit = netAmount - totalCost;
    const grossMargin = netAmount > 0 ? (((netAmount - totalCost) / netAmount) * 100).toFixed(1) : 0;

    // Score deal risk based on discount depth and deal value
    if (orderDiscountPercent > 5) riskPoints += 15;
    if (totalAmount > 1000000) riskPoints += 20;
    if (Number(grossMargin) < 25) riskPoints += 25;

    const finalRiskScore = Math.min(100, Math.max(10, Math.round(riskPoints + 15)));

    return {
      subtotal,
      lineDiscountAmount,
      orderDiscountAmount,
      totalDiscountAmount,
      netAmount,
      totalTax,
      totalAmount,
      totalCost,
      grossProfit,
      grossMargin: Number(grossMargin),
      hasBreach,
      breachDetails,
      riskScore: finalRiskScore,
      requiresFinanceApproval: hasBreach || totalAmount > 1000000 || finalRiskScore >= 70,
      requiresManagerApproval: hasBreach || totalDiscountAmount > 0 || finalRiskScore >= 40
    };
  };

  // Add a new quotation to local state with calculated risk metrics
  const addQuotation = (newQuote) => {
    const fin = calculateQuoteFinancials(newQuote.items, newQuote.customerTier, newQuote.orderDiscountPercent);
    const quoteWithStats = {
      ...newQuote,
      riskScore: fin.riskScore
    };
    setQuotations((prev) => [quoteWithStats, ...prev]);
    return quoteWithStats;
  };

  // Update existing quotation fields and recalculate risk score
  const updateQuotation = (id, updatedFields) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const merged = { ...q, ...updatedFields };
          const fin = calculateQuoteFinancials(merged.items, merged.customerTier, merged.orderDiscountPercent);
          return {
            ...merged,
            riskScore: fin.riskScore
          };
        }
        return q;
      })
    );
  };

  // Submit quote into managerial and finance approval chain
  const submitQuoteForApproval = (quoteId, repName) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const fin = calculateQuoteFinancials(q.items, q.customerTier, q.orderDiscountPercent);

          const steps = [
            { role: 'Sales Rep Submission', reviewer: repName, status: 'approved', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), comments: 'Quotation submitted for review.' },
            { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'pending', timestamp: null, comments: 'Pending manager evaluation.' }
          ];

          if (fin.requiresFinanceApproval) {
            steps.push({ role: 'Finance / Operations Controller', reviewer: 'Rajesh Verma', status: 'upcoming', timestamp: null, comments: 'Required for high-value / discount breach.' });
          }

          const newTimeline = [
            { sender: `${repName} (Sales Rep)`, action: `Submitted quotation for formal approval (Risk Score: ${fin.riskScore})`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: fin.hasBreach ? 'Concession breach flagged.' : 'Standard review routing.' },
            ...(q.timeline || [])
          ];

          return {
            ...q,
            stage: 'Pending Approval',
            approvalStatus: 'Pending Manager Approval',
            approvalSteps: steps,
            timeline: newTimeline
          };
        }
        return q;
      })
    );
  };

  // Advance approval workflow to the next step or mark quotation fully approved
  const approveQuoteStep = (quoteId, reviewerName, roleTitle, comments = '') => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const steps = [...(q.approvalSteps || [])];
          const pendingIdx = steps.findIndex((s) => s.status === 'pending');
          let nextStage = q.stage;
          let nextStatus = q.approvalStatus;

          if (pendingIdx !== -1) {
            steps[pendingIdx] = {
              ...steps[pendingIdx],
              status: 'approved',
              reviewer: reviewerName,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              comments: comments || 'Approved terms.'
            };

            if (pendingIdx + 1 < steps.length) {
              steps[pendingIdx + 1].status = 'pending';
              nextStatus = `Pending ${steps[pendingIdx + 1].role}`;
            } else {
              nextStage = 'Approved';
              nextStatus = 'Approved by Management';
            }
          }

          const newTimeline = [
            { sender: `${reviewerName} (${roleTitle})`, action: 'Approved quotation step', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: comments || 'Approved within authority threshold.' },
            ...(q.timeline || [])
          ];

          return {
            ...q,
            stage: nextStage,
            approvalStatus: nextStatus,
            approvalSteps: steps,
            timeline: newTimeline
          };
        }
        return q;
      })
    );
  };

  // Reject quotation and record reason in timeline
  const rejectQuote = (quoteId, reviewerName, roleTitle, reason) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newTimeline = [
            { sender: `${reviewerName} (${roleTitle})`, action: `Rejected quotation. Reason: "${reason}"`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Quotation closed.' },
            ...(q.timeline || [])
          ];
          return {
            ...q,
            stage: 'Draft',
            approvalStatus: 'Rejected by Reviewer',
            timeline: newTimeline
          };
        }
        return q;
      })
    );
  };

  // Return quotation to draft for pricing revision
  const returnQuoteForRevision = (quoteId, reviewerName, roleTitle, reason) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newTimeline = [
            { sender: `${reviewerName} (${roleTitle})`, action: `Returned for revision: "${reason}"`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Rep must revise discount/pricing.' },
            ...(q.timeline || [])
          ];
          return {
            ...q,
            stage: 'Draft',
            approvalStatus: 'Returned for Revision',
            timeline: newTimeline
          };
        }
        return q;
      })
    );
  };

  // Post a customer question on a quote line item
  const customerAskLineQuestion = (quoteId, itemId, question) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newTimeline = [
            { sender: `${q.customer} (Customer)`, action: `Asked question on item: "${question}"`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Sales rep will follow up.' },
            ...(q.timeline || [])
          ];
          return { ...q, timeline: newTimeline };
        }
        return q;
      })
    );
  };

  // Submit customer counter-discount and trigger re-approval routing
  const customerSubmitNegotiation = (quoteId, requestedDiscount, comment) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const updatedItems = q.items.map((it, idx) => (idx === 0 ? { ...it, discountPercent: Number(requestedDiscount) } : it));
          const fin = calculateQuoteFinancials(updatedItems, q.customerTier, q.orderDiscountPercent);

          const newTimeline = [
            { sender: `${q.customer} (Customer)`, action: `Submitted counter negotiation (${requestedDiscount}%). Note: "${comment}"`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Re-approval triggered.' },
            ...(q.timeline || [])
          ];

          const reApprovalSteps = [
            { role: 'Customer Counter Submitted', reviewer: q.customer, status: 'approved', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), comments: comment },
            { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'pending', timestamp: null, comments: 'Evaluating counter terms.' }
          ];

          if (fin.requiresFinanceApproval) {
            reApprovalSteps.push({ role: 'Finance / Operations Controller', reviewer: 'Rajesh Verma', status: 'upcoming', timestamp: null, comments: 'Required for high counter concession.' });
          }

          return {
            ...q,
            stage: 'Under Negotiation',
            approvalStatus: 'Customer Counter Submitted',
            items: updatedItems,
            approvalSteps: reApprovalSteps,
            timeline: newTimeline
          };
        }
        return q;
      })
    );
  };

  // Digitally sign and confirm quotation
  const customerConfirmQuotation = (quoteId, signerName) => {
    let confirmedQuote = null;
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newTimeline = [
            { sender: `${signerName} (Customer)`, action: 'Confirmed final quotation terms and digitally signed agreement', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Directly routing to Fulfillment.' },
            ...(q.timeline || [])
          ];
          confirmedQuote = {
            ...q,
            stage: 'Confirmed',
            approvalStatus: 'Signed by Customer',
            timeline: newTimeline
          };
          return confirmedQuote;
        }
        return q;
      })
    );

    // Auto-create / route fulfillment order
    setFulfillmentSplits((prev) => {
      const exists = prev.some((f) => f.quoteId === quoteId);
      if (exists) return prev;
      const orderId = `FO-${quoteId.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
      const targetQuote = quotations.find((q) => q.id === quoteId);
      const items = targetQuote?.items || [];
      const newOrder = {
        id: orderId,
        orderId,
        quoteId,
        customer: targetQuote?.customer || targetQuote?.customerName || 'Customer',
        destination: 'Mumbai, Maharashtra',
        status: 'Ready to Ship',
        createdDate: new Date().toISOString().substring(0, 10),
        lines: items.map((it, idx) => ({
          lineId: `L-${idx + 1}`,
          sku: it.sku || `SKU-${idx + 1}`,
          name: it.name || it.productName || 'Product',
          requestedQty: it.quantity || 1,
          backorderedQty: 0,
          splits: [
            { warehouse: 'Mumbai Mega-Hub (Bhiwandi)', qty: it.quantity || 1, shipmentCount: 1, cost: 850 }
          ]
        }))
      };
      return [newOrder, ...prev];
    });
  };


  // Confirm warehouse allocation for shipping
  const acceptWarehouseSplit = (orderId) => {
    setFulfillmentSplits((prev) =>
      prev.map((f) => (f.orderId === orderId ? { ...f, status: 'Ready to Ship' } : f))
    );
  };

  // Override warehouse unit distribution
  const overrideWarehouseSplit = (orderId, lineId, warehouseName, newQty) => {
    setFulfillmentSplits((prev) =>
      prev.map((f) => {
        if (f.orderId === orderId) {
          const updatedLines = f.lines.map((l) => {
            if (l.lineId === lineId) {
              const updatedSplits = l.splits.map((s) => (s.warehouse === warehouseName ? { ...s, qty: Number(newQty) } : s));
              return { ...l, splits: updatedSplits };
            }
            return l;
          });
          return { ...f, lines: updatedLines };
        }
        return f;
      })
    );
  };

  // Consolidate backordered items into a designated warehouse
  const consolidateBackorder = (orderId, lineId, warehouseName) => {
    setFulfillmentSplits((prev) =>
      prev.map((f) => {
        if (f.orderId === orderId) {
          const updatedLines = f.lines.map((l) => {
            if (l.lineId === lineId) {
              const backordered = l.backorderedQty;
              const existing = l.splits.find((s) => s.warehouse === warehouseName);
              let newSplits = [];
              if (existing) {
                newSplits = l.splits.map((s) => (s.warehouse === warehouseName ? { ...s, qty: s.qty + backordered } : s));
              } else {
                newSplits = [...l.splits, { warehouse: warehouseName, qty: backordered, shipmentCount: 1, cost: 800 }];
              }
              return { ...l, splits: newSplits, backorderedQty: 0 };
            }
            return l;
          });
          return { ...f, lines: updatedLines, status: 'Ready to Ship' };
        }
        return f;
      })
    );
  };

  // Adjust subscription seat quantity and recurring monthly total
  const modifySubscriptionQuantity = (subId, newQuantity) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const prevPrice = s.recurringPrice;
          const unitRate = prevPrice / (s.recurringItems[0]?.quantity || 1);
          const newPrice = unitRate * newQuantity;

          return {
            ...s,
            recurringPrice: newPrice,
            recurringItems: s.recurringItems.map((it) => ({ ...it, quantity: newQuantity, recurringPrice: newPrice }))
          };
        }
        return s;
      })
    );
  };

  // Mark subscription status as cancelled
  const cancelSubscription = (subId) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'Cancelled' } : s))
    );
  };

  // Update invoice reconciliation lifecycle state
  const updateInvoiceReconciliation = (invoiceId, stage) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, reconciliationStage: stage, status: stage === 'Paid & Reconciled' ? 'Paid' : i.status } : i))
    );
  };

  // Add new product item to master catalog
  const adminAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Update product specs and pricing in catalog
  const adminUpdateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Save modified governance discount limits
  const adminSaveGovernance = (rules) => {
    setGovernanceRules(rules);
  };

  return (
    <DataContext.Provider
      value={{
        quotations,
        products,
        warehouses,
        fulfillmentSplits,
        fulfillmentOrders: fulfillmentSplits,
        subscriptions,
        invoices,
        dealHealth,
        governanceRules,
        upsellSuggestions,
        calculateQuoteFinancials,
        addQuotation,
        updateQuotation,
        submitQuoteForApproval,
        approveQuoteStep,
        rejectQuote,
        returnQuoteForRevision,
        customerAskLineQuestion,
        customerSubmitNegotiation,
        customerConfirmQuotation,
        customerConfirmQuote: customerConfirmQuotation,
        acceptWarehouseSplit,
        overrideWarehouseSplit,
        consolidateBackorder,
        modifySubscriptionQuantity,
        cancelSubscription,
        updateInvoiceReconciliation,
        adminAddProduct,
        adminUpdateProduct,
        adminSaveGovernance,
        setQuotations,
        setProducts,
        setInvoices
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Hook for accessing DealFlow360 data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
