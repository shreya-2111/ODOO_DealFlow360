import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_QUOTATIONS,
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_FULFILLMENT_ORDERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  DEAL_HEALTH_METRICS,
  GOVERNANCE_RULES,
  UPSELL_RECOMMENDATIONS
} from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [quotations, setQuotations] = useState(INITIAL_QUOTATIONS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [fulfillmentOrders, setFulfillmentOrders] = useState(INITIAL_FULFILLMENT_ORDERS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [dealHealth, setDealHealth] = useState(DEAL_HEALTH_METRICS);
  const [governanceRules, setGovernanceRules] = useState(GOVERNANCE_RULES);

  // Helper calculation for quote totals & breaches
  const calculateQuoteFinancials = (items = [], customerTier = 'Silver Tier') => {
    let subtotal = 0;
    let totalCost = 0;
    let totalDiscountAmount = 0;
    let totalTax = 0;
    let hasBreach = false;
    let breachDetails = [];

    const tierLimit = governanceRules.tierCeilings[customerTier] || 10;

    items.forEach((item) => {
      const lineTotalBeforeDiscount = (item.unitPrice || 0) * (item.quantity || 1);
      const discount = item.discountPercent || 0;
      const discountVal = (lineTotalBeforeDiscount * discount) / 100;
      const lineNet = lineTotalBeforeDiscount - discountVal;
      const lineCost = (item.unitCost || 0) * (item.quantity || 1);
      const lineTax = (lineNet * (item.taxRate || 0)) / 100;

      subtotal += lineTotalBeforeDiscount;
      totalDiscountAmount += discountVal;
      totalCost += lineCost;
      totalTax += lineTax;

      // Check category ceiling breach
      const categoryCeiling = governanceRules.categoryCeilings[item.category] || tierLimit;
      if (discount > categoryCeiling) {
        hasBreach = true;
        const diff = (discount - categoryCeiling).toFixed(0);
        breachDetails.push(`${item.category} (${item.productName}): ${discount}% discount (+${diff}% breach over ${categoryCeiling}% limit)`);
      }
    });

    const netAmount = subtotal - totalDiscountAmount;
    const totalAmount = netAmount + totalTax;
    const grossMargin = netAmount > 0 ? (((netAmount - totalCost) / netAmount) * 100).toFixed(1) : 0;
    const grossProfit = netAmount - totalCost;

    return {
      subtotal,
      totalDiscountAmount,
      netAmount,
      totalTax,
      totalAmount,
      totalCost,
      grossMargin: Number(grossMargin),
      grossProfit,
      hasBreach,
      breachDetails,
      riskLevel: hasBreach ? 'HIGH' : totalAmount > 75000 ? 'MEDIUM' : 'LOW'
    };
  };

  // Update Quotation
  const updateQuotation = (id, updatedFields) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const merged = { ...q, ...updatedFields };
          const fin = calculateQuoteFinancials(merged.items, merged.customerTier);
          return {
            ...merged,
            riskLevel: fin.riskLevel,
            discountBreachSummary: fin.breachDetails.join(' | ') || 'Within standard tier limits'
          };
        }
        return q;
      })
    );
  };

  // Add new quotation
  const addQuotation = (newQuote) => {
    const fin = calculateQuoteFinancials(newQuote.items, newQuote.customerTier);
    const quoteWithStats = {
      ...newQuote,
      riskLevel: fin.riskLevel,
      discountBreachSummary: fin.breachDetails.join(' | ') || 'Within standard tier limits'
    };
    setQuotations((prev) => [quoteWithStats, ...prev]);
    return quoteWithStats;
  };

  // Submit quotation for approval
  const submitQuoteForApproval = (quoteId, repName) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const fin = calculateQuoteFinancials(q.items, q.customerTier);
          const newSteps = q.approvalSteps.map((step, idx) => {
            if (idx === 0) return { ...step, status: 'approved', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) };
            if (idx === 1) return { ...step, status: 'pending' };
            return step;
          });
          const newLogs = [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: repName,
              action: `Submitted quotation for formal approval (${fin.riskLevel} Risk)`
            },
            ...q.auditLogs
          ];
          return {
            ...q,
            status: 'Pending Approval',
            approvalSteps: newSteps,
            auditLogs: newLogs
          };
        }
        return q;
      })
    );
  };

  // Approve Quotation Step
  const approveQuoteStep = (quoteId, actorName, roleTitle, comments = '') => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          let updatedStatus = q.status;
          const newSteps = [...q.approvalSteps];
          const pendingIdx = newSteps.findIndex((s) => s.status === 'pending');

          if (pendingIdx !== -1) {
            newSteps[pendingIdx] = {
              ...newSteps[pendingIdx],
              status: 'approved',
              user: actorName,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };

            if (pendingIdx + 1 < newSteps.length) {
              if (pendingIdx + 1 === newSteps.length - 1) {
                // Next is customer confirmation
                newSteps[pendingIdx + 1].status = 'pending';
                updatedStatus = 'Approved';
              } else {
                newSteps[pendingIdx + 1].status = 'pending';
              }
            } else {
              updatedStatus = 'Confirmed';
            }
          }

          const newLogs = [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: `${actorName} (${roleTitle})`,
              action: `Approved quotation. ${comments ? `Note: "${comments}"` : ''}`
            },
            ...q.auditLogs
          ];

          return {
            ...q,
            status: updatedStatus,
            approvalSteps: newSteps,
            auditLogs: newLogs
          };
        }
        return q;
      })
    );
  };

  // Return Quotation for Revision
  const returnQuoteForRevision = (quoteId, actorName, roleTitle, revisionReason) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newSteps = q.approvalSteps.map((step, idx) => {
            if (idx === 0) return { ...step, status: 'pending' };
            return { ...step, status: 'upcoming' };
          });
          const newLogs = [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: `${actorName} (${roleTitle})`,
              action: `Returned quotation for revision. Reason: "${revisionReason}"`
            },
            ...q.auditLogs
          ];
          return {
            ...q,
            status: 'Draft',
            approvalSteps: newSteps,
            auditLogs: newLogs
          };
        }
        return q;
      })
    );
  };

  // Customer portal accept / counter offer
  const customerSubmitCounterOffer = (quoteId, counterDiscount, customerNote) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          // Adjust first item discount
          const updatedItems = q.items.map((it, idx) => (idx === 0 ? { ...it, discountPercent: Number(counterDiscount) } : it));
          const fin = calculateQuoteFinancials(updatedItems, q.customerTier);
          const newLogs = [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: `${q.contactPerson} (Customer)`,
              action: `Requested counter discount (${counterDiscount}%). Note: "${customerNote}". Re-routed to VP Approval.`
            },
            ...q.auditLogs
          ];
          const newSteps = [
            { stepNumber: 1, role: 'Customer Counter-Offer Submitted', user: q.contactPerson, status: 'approved', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) },
            { stepNumber: 2, role: 'Sales VP Regional Approval', user: 'Sarah Chen', status: 'pending', timestamp: null },
            { stepNumber: 3, role: 'Finance Controller', user: 'Marcus Vance', status: 'upcoming', timestamp: null },
            { stepNumber: 4, role: 'Customer Final Signing', user: q.contactPerson, status: 'upcoming', timestamp: null }
          ];
          return {
            ...q,
            status: 'Pending Approval',
            items: updatedItems,
            riskLevel: 'HIGH',
            customerNotes: customerNote,
            approvalSteps: newSteps,
            auditLogs: newLogs,
            discountBreachSummary: fin.breachDetails.join(' | ') || `Customer counter requested: ${counterDiscount}%`
          };
        }
        return q;
      })
    );
  };

  const customerSignAndAcceptQuote = (quoteId, signature) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          const newSteps = q.approvalSteps.map((s) => ({ ...s, status: 'approved', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }));
          const newLogs = [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: `${q.contactPerson} (Customer)`,
              action: `Digitally signed and accepted contract (Signed as: ${signature})`
            },
            ...q.auditLogs
          ];
          return {
            ...q,
            status: 'Confirmed',
            approvalSteps: newSteps,
            auditLogs: newLogs
          };
        }
        return q;
      })
    );
  };

  // Allocate stock in fulfillment order
  const allocateStock = (orderId, lineId, warehouseId, qtyToAllocate) => {
    setFulfillmentOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedLines = order.lines.map((line) => {
            if (line.lineId === lineId) {
              const wh = warehouses.find((w) => w.id === warehouseId);
              const whName = wh ? wh.name : warehouseId;
              const existingAlloc = line.allocations.find((a) => a.warehouseId === warehouseId);
              let newAllocations = [];
              if (existingAlloc) {
                newAllocations = line.allocations.map((a) => (a.warehouseId === warehouseId ? { ...a, qty: a.qty + qtyToAllocate } : a));
              } else {
                newAllocations = [...line.allocations, { warehouseId, warehouseName: whName, qty: qtyToAllocate, status: 'Allocated' }];
              }
              const totalAllocated = newAllocations.reduce((sum, a) => sum + a.qty, 0);
              const backorderedQty = Math.max(0, line.requiredQty - totalAllocated);
              return {
                ...line,
                allocations: newAllocations,
                backorderedQty
              };
            }
            return line;
          });

          // Check overall order status
          const allLinesFilled = updatedLines.every((l) => l.backorderedQty === 0);
          return {
            ...order,
            lines: updatedLines,
            status: allLinesFilled ? 'Ready to Ship' : 'Partially Allocated'
          };
        }
        return order;
      })
    );
  };

  // Dispatch fulfillment order
  const dispatchOrder = (orderId, carrier, tracking) => {
    setFulfillmentOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Dispatched', shippingCarrier: carrier, trackingNumber: tracking } : o))
    );
  };

  // Invoicing stage progression
  const updateInvoiceReconciliation = (invoiceId, stage) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const isPaid = stage === 'Paid';
          return {
            ...inv,
            reconciliationStage: stage,
            status: isPaid ? 'Paid' : stage === 'Invoiced' ? 'Unpaid' : 'Draft',
            paidAmount: isPaid ? inv.amount : inv.paidAmount
          };
        }
        return inv;
      })
    );
  };

  // Deal Health actions
  const resolveAnomaly = (id, resolutionMessage) => {
    setDealHealth((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        quotations,
        products,
        warehouses,
        fulfillmentOrders,
        subscriptions,
        invoices,
        dealHealth,
        governanceRules,
        upsellRecommendations: UPSELL_RECOMMENDATIONS,
        calculateQuoteFinancials,
        updateQuotation,
        addQuotation,
        submitQuoteForApproval,
        approveQuoteStep,
        returnQuoteForRevision,
        customerSubmitCounterOffer,
        customerSignAndAcceptQuote,
        allocateStock,
        dispatchOrder,
        updateInvoiceReconciliation,
        resolveAnomaly,
        setGovernanceRules,
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
