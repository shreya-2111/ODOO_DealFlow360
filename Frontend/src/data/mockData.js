// DealFlow360 - Production-Grade Single Unified Dataset (INR ₹ & 5 User Roles)
// Exactly ONE cohesive deal flow spanning all 5 enterprise personas

export const USER_ROLES = [
  {
    id: 'sales_rep',
    name: 'Amit Sharma',
    role: 'Sales Representative',
    team: 'Enterprise Direct',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    description: 'Creates quotes, adds products/upsells, tracks approval & fulfillment'
  },
  {
    id: 'sales_manager',
    name: 'Priya Patel',
    role: 'Sales Manager / Approver',
    team: 'Regional Revenue Operations',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    description: 'Reviews discount thresholds, approves/rejects quotations, monitors deal health'
  },
  {
    id: 'finance_ops',
    name: 'Rajesh Verma',
    role: 'Finance / Operations',
    team: 'Treasury & Supply Chain',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    description: 'Handles 2nd-level approvals, warehouse splits, backorders, billing reconciliations'
  },
  {
    id: 'customer',
    name: 'Vikram Malhotra',
    role: 'Customer / Portal User',
    team: 'Acme Corp',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    description: 'Reviews quotes, asks line-item questions, negotiates counter discounts, signs terms'
  },
  {
    id: 'admin',
    name: 'Neha Gupta',
    role: 'Admin',
    team: 'Platform Governance & IT',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    description: 'Manages master products, price lists, discount tiers, warehouses, approval chains'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-101',
    name: 'Dell PowerEdge Rack Server Node 2U',
    sku: 'HW-SRV-DELL2U',
    category: 'Hardware',
    type: 'one_time',
    basePrice: 280000,
    unitCost: 185000,
    taxRate: 18.0,
    stock: 24,
    margin: 33.9,
    description: 'Dual Xeon Silver, 128GB ECC RAM, hot-swap redundant PSU, iDRAC9 Enterprise management.'
  },
  {
    id: 'PRD-102',
    name: '24/7 Managed AMC Support & Priority SLA',
    sku: 'SLA-247-PREM',
    category: 'Subscriptions',
    type: 'recurring',
    cadence: 'monthly',
    basePrice: 8500,
    unitCost: 1500,
    taxRate: 18.0,
    stock: 9999,
    margin: 82.3,
    description: 'Round-the-clock hardware RMA dispatch, priority 4-hour standby engineering, firmware patching.'
  },
  {
    id: 'PRD-103',
    name: 'On-Site System Architecture & Deployment',
    sku: 'SRV-ARCH-DEPLOY',
    category: 'Services',
    type: 'one_time',
    basePrice: 48000,
    unitCost: 22000,
    taxRate: 18.0,
    stock: 999,
    margin: 54.2,
    description: 'Certified datacenter architect on-site rack-mounting, redundant power testing, and hypervisor setup.'
  }
];

export const UPSELL_SUGGESTIONS = [
  {
    id: 'UP-1',
    productId: 'PRD-102',
    name: '24/7 Managed AMC Support & Priority SLA',
    sku: 'SLA-247-PREM',
    category: 'Subscriptions',
    price: 8500,
    marginDelta: '+82.3% Margin',
    promotionTag: 'High Attach Rate (94%)',
    reason: 'Frequently bundled with Dell PowerEdge Servers to guarantee 4-hour critical hardware replacement.'
  }
];

export const INITIAL_WAREHOUSES = [
  {
    id: 'WH-MUMBAI',
    name: 'Mumbai Mega-Hub',
    location: 'Bhiwandi Logistics Park, Mumbai, Maharashtra',
    stockCount: 14,
    priority: 1,
    shipmentCostPerUnit: 700,
    stockLevels: {
      'PRD-101': 10,
      'PRD-103': 99
    }
  },
  {
    id: 'WH-AHMEDABAD',
    name: 'Ahmedabad Warehouse',
    location: 'Sanand Industrial Estate, Ahmedabad, Gujarat',
    stockCount: 10,
    priority: 2,
    shipmentCostPerUnit: 450,
    stockLevels: {
      'PRD-101': 14,
      'PRD-103': 99
    }
  }
];

// Single Unified Quotation for the Entire Platform
export const INITIAL_QUOTATIONS = [
  {
    id: 'QT-2026-001',
    customer: 'Acme Corp',
    customerName: 'Acme Corp',
    contactPerson: 'Vikram Malhotra',
    contactEmail: 'vikram.m@acmecorp.in',
    customerTier: 'Silver Tier',
    salesRep: 'Amit Sharma',
    stage: 'Pending Approval',
    status: 'Pending Approval',
    approvalStatus: 'Pending Manager Approval',
    createdDate: '2026-09-02',
    validUntil: '2026-10-02',
    riskScore: 55,
    riskLevel: 'MEDIUM',
    daysInactive: 2,
    orderDiscountPercent: 0,
    discountBreachSummary: 'Dell PowerEdge Server discount (12%) exceeds Silver Tier ceiling (10%). Requires Priya Patel sign-off.',
    customerNotes: 'Acme Corp Datacenter Node Expansion. Requires 24-month hardware SLA coverage.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-101',
        name: 'Dell PowerEdge Rack Server Node 2U',
        sku: 'HW-SRV-DELL2U',
        category: 'Hardware',
        type: 'one_time',
        quantity: 2,
        unitPrice: 280000,
        unitCost: 185000,
        discountPercent: 12,
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-102',
        name: '24/7 Managed AMC Support & Priority SLA',
        sku: 'SLA-247-PREM',
        category: 'Subscriptions',
        type: 'recurring',
        cadence: 'monthly',
        quantity: 1,
        unitPrice: 8500,
        unitCost: 1500,
        discountPercent: 5,
        taxRate: 18.0
      }
    ],
    approvalSteps: [
      {
        role: 'Sales Rep Submission',
        reviewer: 'Amit Sharma',
        status: 'approved',
        timestamp: '2026-09-02 10:30',
        comments: 'Quotation configured with 12% concession for Acme Corp.'
      },
      {
        role: 'Sales Manager Approval',
        reviewer: 'Priya Patel',
        status: 'pending',
        timestamp: null,
        comments: 'Evaluating 12% discount against Silver Tier 10% ceiling.'
      },
      {
        role: 'Finance / Operations Controller',
        reviewer: 'Rajesh Verma',
        status: 'upcoming',
        timestamp: null,
        comments: 'Required for high-value deal review.'
      }
    ],
    timeline: [
      {
        sender: 'Amit Sharma (Sales Rep)',
        action: 'Created quotation QT-2026-001 with 12% discount on Server hardware',
        timestamp: '2026-09-02 10:30',
        note: 'Concession breaches Silver Tier 10% ceiling. Triggered automatic governance routing.'
      },
      {
        sender: 'System Governance',
        action: 'Routed to Priya Patel (Sales Manager) for Level-1 commercial approval',
        timestamp: '2026-09-02 10:31',
        note: 'Blended Risk Score: 55/100 (Medium Risk).'
      }
    ]
  }
];

// Single Unified Fulfillment Order
export const INITIAL_FULFILLMENT_SPLITS = [
  {
    id: 'FO-9001',
    orderId: 'FO-9001',
    quoteId: 'QT-2026-001',
    customer: 'Acme Corp',
    customerName: 'Acme Corp',
    destination: 'Sanand Industrial Estate, Ahmedabad, Gujarat',
    status: 'Partially Allocated',
    orderDate: '2026-09-02',
    estimatedDelivery: '2026-09-15',
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-101',
        name: 'Dell PowerEdge Rack Server Node 2U',
        requiredQty: 2,
        splits: [
          { warehouseId: 'WH-MUMBAI', warehouse: 'Mumbai Mega-Hub', qty: 1, shipmentCount: 1, cost: 700 },
          { warehouseId: 'WH-AHMEDABAD', warehouse: 'Ahmedabad Warehouse', qty: 1, shipmentCount: 1, cost: 450 }
        ],
        backorderedQty: 0
      }
    ]
  }
];

// Single Unified Subscription
export const INITIAL_SUBSCRIPTIONS_BILLING = [
  {
    id: 'SUB-1001',
    quoteId: 'QT-2026-001',
    customer: 'Acme Corp',
    customerName: 'Acme Corp',
    planName: '24/7 Managed AMC Support & Priority SLA',
    productId: 'PRD-102',
    billingCadence: 'Monthly',
    recurringPrice: 8075.00,
    mrr: 8075.00,
    arr: 96900.00,
    nextBillingDate: '2026-10-01',
    renewalDate: '2027-09-01',
    status: 'Active',
    startDate: '2026-09-02',
    oneTimeItems: [
      { name: 'Dell PowerEdge Rack Server Node 2U (x2)', total: 492800, deliveredDate: '2026-09-04' }
    ],
    recurringItems: [
      { name: '24/7 Managed AMC Support', quantity: 1, frequency: 'Monthly', recurringPrice: 8075, nextDate: '2026-10-01', status: 'Active' }
    ],
    billingSchedule: [
      { period: 'Sep 2026', amount: 8075.00, status: 'Paid', invoiceId: 'INV-2026-001' },
      { period: 'Oct 2026', amount: 8075.00, status: 'Scheduled', invoiceId: null }
    ]
  }
];

// Single Unified Invoice
export const INITIAL_INVOICES = [
  {
    id: 'INV-2026-001',
    quoteId: 'QT-2026-001',
    orderId: 'FO-9001',
    customer: 'Acme Corp',
    customerName: 'Acme Corp',
    amount: 591035,
    paidAmount: 0,
    status: 'Unpaid',
    issueDate: '2026-09-03',
    dueDate: '2026-10-03',
    reconciliationStage: 'Delivery Proof Verified',
    shippedItemsProof: [
      {
        sku: 'HW-SRV-DELL2U',
        description: 'Dell PowerEdge Rack Server Node 2U (x2 units)',
        carrierTracking: 'BLUEDART-882193',
        verifiedShipped: true
      }
    ]
  }
];

// Single Unified Deal Health Telemetry
export const DEAL_HEALTH_DATA = {
  kpis: {
    totalActiveDeals: 1,
    stalledDeals: 1,
    atRiskDeals: 1,
    discountAnomalies: 1,
    deliverySlippages: 0,
    pipelineValue: 591035
  },
  stalledDeals: [
    {
      id: 'ST-1',
      customer: 'Acme Corp',
      customerName: 'Acme Corp',
      quote: 'QT-2026-001',
      amount: 591035,
      lastActivity: '2026-09-02',
      daysStalled: 3,
      owner: 'Amit Sharma',
      anomaly: 'Awaiting managerial authorization on 12% server discount.'
    }
  ],
  discountAnomalies: [
    {
      id: 'DA-1',
      quoteId: 'QT-2026-001',
      rep: 'Amit Sharma',
      customer: 'Acme Corp',
      customerName: 'Acme Corp',
      discount: 12.0,
      historicalAvg: 8.0,
      diff: '+4.0% Breach',
      risk: 'MEDIUM'
    }
  ],
  deliverySlippages: []
};

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
    { rule: 'Discount Breach > 2% above tier ceiling', chain: 'Sales Manager (Priya Patel)' },
    { rule: 'Discount Breach > 10% or Total Value > ₹10,00,000', chain: 'Sales Manager → Finance Controller (Rajesh Verma)' },
    { rule: 'Negative Gross Margin Line Item', chain: 'Executive Board Escalation' }
  ]
};
