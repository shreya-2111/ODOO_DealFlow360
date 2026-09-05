// DealFlow360 - Clean UI Data Schema (Pure UI Template without Dummy Records)
// Provides clean schemas and structure for 5 enterprise personas and governance rules

export const USER_ROLES = [
  {
    id: 'sales_rep',
    name: 'Sales Representative',
    role: 'Sales Representative',
    team: 'Enterprise Direct',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Creates quotes, configures products, and tracks approval & fulfillment'
  },
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    role: 'Sales Manager / Approver',
    team: 'Regional Revenue Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    description: 'Reviews discount thresholds, approves/rejects quotations, monitors deal health'
  },
  {
    id: 'finance_ops',
    name: 'Finance Controller',
    role: 'Finance / Operations',
    team: 'Treasury & Supply Chain',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    description: 'Handles 2nd-level commercial approvals, warehouse splits, and billing reconciliations'
  },
  {
    id: 'customer',
    name: 'Customer Portal User',
    role: 'Customer / Portal User',
    team: 'Client Enterprise',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    description: 'Reviews proposals, clarifies line items, negotiates counter discounts, signs agreements'
  },
  {
    id: 'admin',
    name: 'Platform Administrator',
    role: 'Admin',
    team: 'Platform Governance & IT',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    description: 'Manages master catalog, price lists, discount tiers, warehouses, and approval policies'
  }
];

// Master Products Catalog (Empty for pure UI)
export const INITIAL_PRODUCTS = [];

// Upsell Recommendations (Empty for pure UI)
export const UPSELL_SUGGESTIONS = [];

// Multi-Warehouse Distribution Hubs (Empty for pure UI)
export const INITIAL_WAREHOUSES = [];

// Deal Quotations (Empty for pure UI)
export const INITIAL_QUOTATIONS = [];

// Multi-Warehouse Fulfillment Orders (Empty for pure UI)
export const INITIAL_FULFILLMENT_SPLITS = [];

// Recurring Contracts & Billing Schedules (Empty for pure UI)
export const INITIAL_SUBSCRIPTIONS_BILLING = [];

// Invoices & Revenue Reconciliation Ledger (Empty for pure UI)
export const INITIAL_INVOICES = [];

// Real-time Deal Health Telemetry (Zeroed for pure UI)
export const DEAL_HEALTH_DATA = {
  kpis: {
    totalActiveDeals: 0,
    stalledDeals: 0,
    atRiskDeals: 0,
    discountAnomalies: 0,
    deliverySlippages: 0,
    pipelineValue: 0
  },
  stalledDeals: [],
  discountAnomalies: [],
  deliverySlippages: []
};

// CPQ Governance and Discount Ceiling Policies
export const GOVERNANCE_RULES = {
  tierCeilings: {
    'Bronze Tier': 5,
    'Silver Tier': 10,
    'Gold Tier': 15,
    'Enterprise Tier': 20
  },
  categoryCeilings: {
    'Hardware': 15,
    'Subscriptions': 20,
    'Services': 10
  },
  approvalChains: [
    { rule: 'Discount Breach > 2% above tier ceiling', chain: 'Sales Manager Approval' },
    { rule: 'Discount Breach > 10% or Total Value > ₹10,00,000', chain: 'Sales Manager → Finance Controller' },
    { rule: 'Negative Gross Margin Line Item', chain: 'Executive Board Escalation' }
  ]
};
