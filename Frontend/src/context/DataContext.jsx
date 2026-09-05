import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_QUOTATIONS,
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_FULFILLMENT_SPLITS,
  INITIAL_SUBSCRIPTIONS_BILLING,
  DEAL_HEALTH_DATA,
  GOVERNANCE_RULES,
  UPSELL_SUGGESTIONS
} from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [quotations, setQuotations] = useState(INITIAL_QUOTATIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [fulfillmentSplits, setFulfillmentSplits] = useState(INITIAL_FULFILLMENT_SPLITS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS_BILLING);
  const [dealHealth, setDealHealth] = useState(DEAL_HEALTH_DATA);
  const [governanceRules, setGovernanceRules] = useState(GOVERNANCE_RULES);
  const [upsellSuggestions, setUpsellSuggestions] = useState(UPSELL_SUGGESTIONS);

  // Financial & Margin & Risk Score Calculation engine
  const calculateQuoteFinancials = (items = [], customerTier = 'Silver Tier', orderDiscountPercent = 0) => {
    let subtotal = 0;
    let totalCost = 0;
    let lineDiscountAmount = 0;
    let hasBreach = false;
    let breachDetails = [];
    let riskPoints = 0;

    const tierLimit = governanceRules.tierCeilings[customerTier] || 10;

    items.forEach((item) => {
      const lineSubtotal = (item.unitPrice || 0) * (item.quantity || 1);
      const lineDiscPct = item.discountPercent || 0;
      const lineDiscVal = (lineSubtotal * lineDiscPct) / 100;
      const lineNet = lineSubtotal - lineDiscVal;
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

    // Order-level discount
    const discountedAfterLines = subtotal - lineDiscountAmount;
    const orderDiscountAmount = (discountedAfterLines * (orderDiscountPercent || 0)) / 100;
    const netAmount = discountedAfterLines - orderDiscountAmount;
    const totalDiscountAmount = lineDiscountAmount + orderDiscountAmount;

    // GST 18%
    const totalTax = netAmount * 0.18;
    const totalAmount = netAmount + totalTax;

    const grossProfit = netAmount - totalCost;
    const grossMargin = netAmount > 0 ? (((netAmount - totalCost) / netAmount) * 100).toFixed(1) : 0;

    if (orderDiscountPercent > 5) riskPoints += 15;
    if (totalAmount > 1000000) riskPoints += 20; // High value order > ₹10 Lakh
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

  // Add / Update Quotation
  const addQuotation = (newQuote) => {
    const fin = calculateQuoteFinancials(newQuote.items, newQuote.customerTier, newQuote.orderDiscountPercent);
    const quoteWithStats = {
      ...newQuote,
      riskScore: fin.riskScore
    };
    setQuotations((prev) => [quoteWithStats, ...prev]);
    return quoteWithStats;
  };

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

  // Submit quotation for approval
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

  // Approval step action
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

  // Reject / Return Quote
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

  // Customer Portal Interactions & Re-Approval Trigger Logic
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

  const customerSubmitNegotiation = (quoteId, requestedDiscount, comment) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          // Adjust first hardware line discount to match counter
          const updatedItems = q.items.map((it, idx) => (idx === 0 ? { ...it, discountPercent: Number(requestedDiscount) } : it));
          const fin = calculateQuoteFinancials(updatedItems, q.customerTier, q.orderDiscountPercent);

          const newTimeline = [
            { sender: `${q.customer} (Customer)`, action: `Submitted counter negotiation (${requestedDiscount}%). Note: "${comment}"`, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Re-approval triggered.' },
            ...(q.timeline || [])
          ];

          // If counter exceeds threshold, automatically routes back to Sales Manager and Finance
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

  const customerConfirmQuotation = (quoteId, signerName) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newTimeline = [
            { sender: `${signerName} (Customer)`, action: 'Confirmed final quotation terms and digitally signed agreement', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Directly routing to Fulfillment.' },
            ...(q.timeline || [])
          ];
          return {
            ...q,
            stage: 'Confirmed',
            approvalStatus: 'Signed by Customer',
            timeline: newTimeline
          };
        }
        return q;
      })
    );
  };

  // Fulfillment Split actions
  const acceptWarehouseSplit = (orderId) => {
    setFulfillmentSplits((prev) =>
      prev.map((f) => (f.orderId === orderId ? { ...f, status: 'Ready to Ship' } : f))
    );
  };

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

  // Subscriptions & Proration calculations
  const modifySubscriptionQuantity = (subId, newQuantity) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const prevPrice = s.recurringPrice;
          const unitRate = prevPrice / (s.recurringItems[0]?.quantity || 1);
          const newPrice = unitRate * newQuantity;
          const prorationAdjustment = Math.round((newPrice - prevPrice) * 0.5); // 15 days remaining in month

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

  const cancelSubscription = (subId) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'Cancelled' } : s))
    );
  };

  // Admin CRUD
  const adminAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const adminUpdateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

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
        subscriptions,
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
        acceptWarehouseSplit,
        overrideWarehouseSplit,
        consolidateBackorder,
        modifySubscriptionQuantity,
        cancelSubscription,
        adminAddProduct,
        adminUpdateProduct,
        adminSaveGovernance,
        setQuotations,
        setProducts
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
