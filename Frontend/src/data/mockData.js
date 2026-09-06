// DealFlow360 - Production-Grade Mock Dataset (INR ₹ & 5 User Roles)

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
    team: 'Acme Corp / Reliance Infotech',
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
    name: 'Enterprise Laptop Pro 16"',
    sku: 'HW-LAP-PRO16',
    category: 'Hardware',
    type: 'one_time',
    basePrice: 125000,
    unitCost: 82000,
    taxRate: 18.0,
    stock: 45,
    margin: 34.4,
    description: 'High-performance M3 Pro/Intel Core i9 enterprise laptop with 32GB RAM & 1TB NVMe SSD.'
  },
  {
    id: 'PRD-102',
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
    id: 'PRD-103',
    name: 'Cloud Storage Pro (10TB Dedicated)',
    sku: 'SaaS-STRG-10TB',
    category: 'Subscriptions',
    type: 'recurring',
    cadence: 'monthly',
    basePrice: 4500,
    unitCost: 800,
    taxRate: 18.0,
    stock: 9999,
    margin: 82.2,
    description: 'S3-compatible immutable enterprise cloud backup with ransomware protection & 99.999% SLA.'
  },
  {
    id: 'PRD-104',
    name: 'Business Analytics & BI Suite',
    sku: 'SaaS-BI-SUITE',
    category: 'Subscriptions',
    type: 'recurring',
    cadence: 'monthly',
    basePrice: 12000,
    unitCost: 2400,
    taxRate: 18.0,
    stock: 9999,
    margin: 80.0,
    description: 'Executive dashboards, real-time data ingestion, automated revenue forecasting, and export tools.'
  },
  {
    id: 'PRD-105',
    name: 'On-Site Network Setup & Architecture',
    sku: 'SVC-DEPLOY-L3',
    category: 'Services',
    type: 'one_time',
    basePrice: 48000,
    unitCost: 22000,
    taxRate: 18.0,
    stock: 99,
    margin: 54.1,
    description: 'Senior systems engineer on-site: cluster configuration, structured cabling, router/firewall cutover.'
  },
  {
    id: 'PRD-106',
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
    description: 'Annual Maintenance Contract with 30-min response SLA, replacement parts coverage & dedicated TAM.'
  },
  {
    id: 'PRD-107',
    name: 'Security Antivirus Endpoint Shield',
    sku: 'SaaS-SEC-PRO',
    category: 'Subscriptions',
    type: 'recurring',
    cadence: 'monthly',
    basePrice: 1500,
    unitCost: 250,
    taxRate: 18.0,
    stock: 9999,
    margin: 83.3,
    description: 'Zero-trust endpoint detection, behavioral anti-malware, and automated remediation.'
  },
  {
    id: 'PRD-108',
    name: 'Cat-6 Gigabit Optical Cable Bundle (10x)',
    sku: 'ACC-OPT-10X',
    category: 'Hardware',
    type: 'one_time',
    basePrice: 6500,
    unitCost: 3200,
    taxRate: 18.0,
    stock: 140,
    margin: 50.7,
    description: 'Low-loss gold-plated optical fiber patch cords designed for high-density server racks.'
  }
];

export const UPSELL_SUGGESTIONS = [
  {
    id: 'UP-1',
    productId: 'PRD-106',
    name: '24/7 Managed AMC Support & Priority SLA',
    sku: 'SLA-247-PREM',
    category: 'Subscriptions',
    price: 8500,
    marginDelta: '+82.3% Margin',
    promotionTag: 'High Attach Rate (94%)',
    reason: 'Frequently co-purchased with Enterprise Laptops and Dell PowerEdge Servers for hardware warranty.'
  },
  {
    id: 'UP-2',
    productId: 'PRD-103',
    name: 'Cloud Storage Pro (10TB Dedicated)',
    sku: 'SaaS-STRG-10TB',
    category: 'Subscriptions',
    price: 4500,
    marginDelta: '+82.2% Margin',
    promotionTag: 'Q3 Bundle Promo',
    reason: 'Customers bundle immutable cloud backup to protect server telemetry and file systems.'
  },
  {
    id: 'UP-3',
    productId: 'PRD-108',
    name: 'Cat-6 Gigabit Optical Cable Bundle (10x)',
    sku: 'ACC-OPT-10X',
    category: 'Hardware',
    price: 6500,
    marginDelta: '+50.7% Margin',
    promotionTag: 'Essential Accessory',
    reason: 'Prevents cabling bottlenecks during rack server deployment.'
  }
];

export const INITIAL_WAREHOUSES = [
  {
    id: 'WH-AHMEDABAD',
    name: 'Ahmedabad Warehouse',
    location: 'Sanand Industrial Estate, Ahmedabad, Gujarat',
    stockCount: 850,
    priority: 1,
    shipmentCostPerUnit: 450,
    stockLevels: {
      'PRD-101': 18,
      'PRD-102': 8,
      'PRD-108': 45
    }
  },
  {
    id: 'WH-MUMBAI',
    name: 'Mumbai Mega-Hub',
    location: 'Bhiwandi Logistics Park, Mumbai, Maharashtra',
    stockCount: 1420,
    priority: 2,
    shipmentCostPerUnit: 350,
    stockLevels: {
      'PRD-101': 22,
      'PRD-102': 12,
      'PRD-108': 65
    }
  },
  {
    id: 'WH-DELHI',
    name: 'Delhi-NCR Depot',
    location: 'Bilaspur Logistics Hub, Gurugram, Haryana',
    stockCount: 920,
    priority: 3,
    shipmentCostPerUnit: 500,
    stockLevels: {
      'PRD-101': 10,
      'PRD-102': 4,
      'PRD-108': 30
    }
  },
  {
    id: 'WH-BLR',
    name: 'Bengaluru Tech Center',
    location: 'Whitefield Industrial Zone, Bengaluru, Karnataka',
    stockCount: 1100,
    priority: 4,
    shipmentCostPerUnit: 400,
    stockLevels: {
      'PRD-101': 12,
      'PRD-102': 6,
      'PRD-108': 40
    }
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: 'QT-2026-901',
    customer: 'Acme Corp',
    contactPerson: 'Rohit Singhania (CTO)',
    contactEmail: 'rohit@acmecorp.in',
    customerTier: 'Enterprise Tier',
    salesRep: 'Amit Sharma',
    stage: 'Draft',
    approvalStatus: 'Not Submitted',
    createdDate: '2026-09-04',
    validUntil: '2026-10-04',
    riskScore: 25,
    daysInactive: 1,
    orderDiscountPercent: 5,
    customerNotes: 'Initial proposal for new product engineering wing.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-101',
        name: 'Enterprise Laptop Pro 16"',
        sku: 'HW-LAP-PRO16',
        category: 'Hardware',
        type: 'one_time',
        quantity: 5,
        unitPrice: 125000,
        unitCost: 82000,
        discountPercent: 5,
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-107',
        name: 'Security Antivirus Endpoint Shield',
        sku: 'SaaS-SEC-PRO',
        category: 'Subscriptions',
        type: 'recurring',
        cadence: 'monthly',
        quantity: 50,
        unitPrice: 1500,
        unitCost: 250,
        discountPercent: 10,
        taxRate: 18.0
      }
    ],
    timeline: [
      { sender: 'Amit Sharma (Sales Rep)', action: 'Created quotation draft', timestamp: '2026-09-04 10:30', note: 'Standard commercial discount applied.' }
    ]
  },
  {
    id: 'QT-2026-882',
    customer: 'Beta Industries',
    contactPerson: 'Harsh Vardhan (VP Infra)',
    contactEmail: 'h.vardhan@betaind.in',
    customerTier: 'Gold Tier',
    salesRep: 'Amit Sharma',
    stage: 'Pending Approval',
    approvalStatus: 'Pending Manager Approval',
    createdDate: '2026-09-02',
    validUntil: '2026-10-02',
    riskScore: 78,
    daysInactive: 3,
    orderDiscountPercent: 0,
    customerNotes: 'Requested 18% concession on deployment services.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-102',
        name: 'Dell PowerEdge Rack Server Node 2U',
        sku: 'HW-SRV-DELL2U',
        category: 'Hardware',
        type: 'one_time',
        quantity: 4,
        unitPrice: 280000,
        unitCost: 185000,
        discountPercent: 12, // within 15% limit
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-105',
        name: 'On-Site Network Setup & Architecture',
        sku: 'SVC-DEPLOY-L3',
        category: 'Services',
        type: 'one_time',
        quantity: 2,
        unitPrice: 48000,
        unitCost: 22000,
        discountPercent: 18, // BREACH: 18% vs 10% ceiling
        taxRate: 18.0
      },
      {
        id: 'item-3',
        productId: 'PRD-106',
        name: '24/7 Managed AMC Support & Priority SLA',
        sku: 'SLA-247-PREM',
        category: 'Subscriptions',
        type: 'recurring',
        cadence: 'monthly',
        quantity: 1,
        unitPrice: 8500,
        unitCost: 1500,
        discountPercent: 10,
        taxRate: 18.0
      }
    ],
    approvalSteps: [
      { role: 'Sales Rep Submission', reviewer: 'Amit Sharma', status: 'approved', timestamp: '2026-09-02 14:00', comments: 'Volume discount requested by Beta Industries.' },
      { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'pending', timestamp: null, comments: 'Under review for Q3 quota.' },
      { role: 'Finance / Operations Controller', reviewer: 'Rajesh Verma', status: 'upcoming', timestamp: null, comments: 'Triggered if total exceeds ₹10 Lakh.' }
    ],
    timeline: [
      { sender: 'Amit Sharma (Sales Rep)', action: 'Submitted quote with 18% services discount', timestamp: '2026-09-02 14:00', note: 'Discount breach flagged by governance rules.' }
    ]
  },
  {
    id: 'QT-2026-874',
    customer: 'Globex Ltd',
    contactPerson: 'Meera Kapoor (Director Procurement)',
    contactEmail: 'meera.k@globexltd.com',
    customerTier: 'Silver Tier',
    salesRep: 'Amit Sharma',
    stage: 'Approved',
    approvalStatus: 'Approved by Sales Manager',
    createdDate: '2026-08-28',
    validUntil: '2026-09-28',
    riskScore: 35,
    daysInactive: 2,
    orderDiscountPercent: 0,
    customerNotes: 'Ready for customer electronic signature via Portal.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-101',
        name: 'Enterprise Laptop Pro 16"',
        sku: 'HW-LAP-PRO16',
        category: 'Hardware',
        type: 'one_time',
        quantity: 6,
        unitPrice: 125000,
        unitCost: 82000,
        discountPercent: 10,
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-108',
        name: 'Cat-6 Gigabit Optical Cable Bundle (10x)',
        sku: 'ACC-OPT-10X',
        category: 'Hardware',
        type: 'one_time',
        quantity: 4,
        unitPrice: 6500,
        unitCost: 3200,
        discountPercent: 12,
        taxRate: 18.0
      }
    ],
    approvalSteps: [
      { role: 'Sales Rep Submission', reviewer: 'Amit Sharma', status: 'approved', timestamp: '2026-08-28 09:00', comments: 'Standard proposal submitted.' },
      { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'approved', timestamp: '2026-08-28 11:30', comments: 'Approved under Silver Tier 10% ceiling.' }
    ],
    timeline: [
      { sender: 'Priya Patel (Sales Manager)', action: 'Approved quotation', timestamp: '2026-08-28 11:30', note: 'Terms within governance policy.' }
    ]
  },
  {
    id: 'QT-2026-860',
    customer: 'Nova Systems',
    contactPerson: 'Vikram Malhotra',
    contactEmail: 'v.malhotra@novasystems.in',
    customerTier: 'Enterprise Tier',
    salesRep: 'Amit Sharma',
    stage: 'Under Negotiation',
    approvalStatus: 'Customer Counter Submitted',
    createdDate: '2026-08-25',
    validUntil: '2026-09-25',
    riskScore: 82,
    daysInactive: 1,
    orderDiscountPercent: 0,
    customerNotes: 'Customer counter: requesting 20% discount on Business Analytics suite.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-104',
        name: 'Business Analytics & BI Suite',
        sku: 'SaaS-BI-SUITE',
        category: 'Subscriptions',
        type: 'recurring',
        cadence: 'monthly',
        quantity: 1,
        unitPrice: 12000,
        unitCost: 2400,
        discountPercent: 20, // customer counter
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-105',
        name: 'On-Site Network Setup & Architecture',
        sku: 'SVC-DEPLOY-L3',
        category: 'Services',
        type: 'one_time',
        quantity: 1,
        unitPrice: 48000,
        unitCost: 22000,
        discountPercent: 15, // re-routed to manager
        taxRate: 18.0
      }
    ],
    approvalSteps: [
      { role: 'Customer Counter Submitted', reviewer: 'Vikram Malhotra', status: 'approved', timestamp: '2026-08-26 15:00', comments: 'Requested 20% BI discount with 24-month lock-in.' },
      { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'pending', timestamp: null, comments: 'Re-evaluating counter concession.' }
    ],
    timeline: [
      { sender: 'Amit Sharma (Sales Rep)', action: 'Sent initial quotation (10% discount)', timestamp: '2026-08-25 11:00', note: 'Quote delivered to Nova Systems portal.' },
      { sender: 'Vikram Malhotra (Customer)', action: 'Requested 20% discount on BI Suite', timestamp: '2026-08-26 15:00', note: 'Counter discount triggers re-approval.' }
    ]
  },
  {
    id: 'QT-2026-845',
    customer: 'Vertex Technologies',
    contactPerson: 'Ananya Deshmukh',
    contactEmail: 'ananya.d@vertextech.in',
    customerTier: 'Enterprise Tier',
    salesRep: 'Amit Sharma',
    stage: 'Confirmed',
    approvalStatus: 'Fully Approved & Signed',
    createdDate: '2026-08-20',
    validUntil: '2026-09-20',
    riskScore: 15,
    daysInactive: 0,
    orderDiscountPercent: 0,
    customerNotes: 'Digitally signed and ready for fulfillment warehouse allocation.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-102',
        name: 'Dell PowerEdge Rack Server Node 2U',
        sku: 'HW-SRV-DELL2U',
        category: 'Hardware',
        type: 'one_time',
        quantity: 6,
        unitPrice: 280000,
        unitCost: 185000,
        discountPercent: 8,
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-106',
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
      { role: 'Sales Rep Submission', reviewer: 'Amit Sharma', status: 'approved', timestamp: '2026-08-20 10:00', comments: 'Enterprise package.' },
      { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'approved', timestamp: '2026-08-21 09:30', comments: 'Approved.' },
      { role: 'Finance Controller', reviewer: 'Rajesh Verma', status: 'approved', timestamp: '2026-08-21 14:00', comments: 'Credit line verified.' },
      { role: 'Customer E-Signature', reviewer: 'Ananya Deshmukh', status: 'approved', timestamp: '2026-08-22 11:15', comments: 'Contract signed digitally.' }
    ],
    timeline: [
      { sender: 'Ananya Deshmukh (Customer)', action: 'Digitally accepted contract terms', timestamp: '2026-08-22 11:15', note: 'Converted to active order FO-9042.' }
    ]
  }
];

export const INITIAL_FULFILLMENT_SPLITS = [
  {
    orderId: 'FO-9042',
    quoteId: 'QT-2026-845',
    customer: 'Vertex Technologies',
    destination: 'Bengaluru IT Park, Electronic City, Karnataka',
    status: 'Partially Allocated',
    orderDate: '2026-08-22',
    estimatedDelivery: '2026-09-12',
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-102',
        name: 'Dell PowerEdge Rack Server Node 2U',
        requiredQty: 6,
        splits: [
          { warehouse: 'Mumbai Mega-Hub', qty: 4, shipmentCount: 1, cost: 1400 },
          { warehouse: 'Ahmedabad Warehouse', qty: 2, shipmentCount: 1, cost: 900 }
        ],
        backorderedQty: 0
      }
    ]
  },
  {
    orderId: 'FO-9045',
    quoteId: 'QT-2026-874',
    customer: 'Globex Ltd',
    destination: 'Ghodbunder Road, Thane, Mumbai, Maharashtra',
    status: 'Ready to Ship',
    orderDate: '2026-08-28',
    estimatedDelivery: '2026-09-08',
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-101',
        name: 'Enterprise Laptop Pro 16"',
        requiredQty: 6,
        splits: [
          { warehouse: 'Mumbai Mega-Hub', qty: 6, shipmentCount: 1, cost: 2100 }
        ],
        backorderedQty: 0
      }
    ]
  },
  {
    orderId: 'FO-9048',
    quoteId: 'QT-2026-882',
    customer: 'Beta Industries',
    destination: 'Cyber City, Gurugram, Delhi-NCR',
    status: 'Pending Split Allocation',
    orderDate: '2026-09-03',
    estimatedDelivery: '2026-09-25',
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-102',
        name: 'Dell PowerEdge Rack Server Node 2U',
        requiredQty: 4,
        splits: [
          { warehouse: 'Delhi-NCR Depot', qty: 2, shipmentCount: 1, cost: 1000 }
        ],
        backorderedQty: 2
      }
    ]
  }
];

export const INITIAL_SUBSCRIPTIONS_BILLING = [
  {
    id: 'SUB-4019',
    customer: 'Vertex Technologies',
    planName: '24/7 Managed AMC Support & Priority SLA',
    productId: 'PRD-106',
    billingCadence: 'Monthly',
    recurringPrice: 8075.00, // 8500 - 5% discount
    nextBillingDate: '2026-10-01',
    status: 'Active',
    startDate: '2026-08-22',
    renewalDate: '2027-08-22',
    oneTimeItems: [
      { name: 'Dell PowerEdge Rack Server Node 2U (x6)', total: 1545600, deliveredDate: '2026-08-28' }
    ],
    recurringItems: [
      { name: '24/7 Managed AMC Support', quantity: 1, frequency: 'Monthly', recurringPrice: 8075, nextDate: '2026-10-01', status: 'Active' }
    ],
    billingSchedule: [
      { period: 'Sep 2026', amount: 8075.00, status: 'Paid', invoiceId: 'INV-2026-091' },
      { period: 'Oct 2026', amount: 8075.00, status: 'Scheduled', invoiceId: null },
      { period: 'Nov 2026', amount: 8075.00, status: 'Scheduled', invoiceId: null }
    ]
  },
  {
    id: 'SUB-4022',
    customer: 'Nova Systems',
    planName: 'Business Analytics Suite (5 Seats) + Cloud Storage',
    productId: 'PRD-104',
    billingCadence: 'Monthly',
    recurringPrice: 13600.00,
    nextBillingDate: '2026-09-30',
    status: 'Active',
    startDate: '2026-06-15',
    renewalDate: '2027-06-15',
    oneTimeItems: [
      { name: 'On-Site Setup & System Architecture', total: 48000, deliveredDate: '2026-06-20' }
    ],
    recurringItems: [
      { name: 'Business Analytics & BI Suite', quantity: 1, frequency: 'Monthly', recurringPrice: 9600, nextDate: '2026-09-30', status: 'Active' },
      { name: 'Cloud Storage Pro (10TB Dedicated)', quantity: 1, frequency: 'Monthly', recurringPrice: 4000, nextDate: '2026-09-30', status: 'Active' }
    ],
    billingSchedule: [
      { period: 'Aug 2026', amount: 13600.00, status: 'Paid', invoiceId: 'INV-2026-074' },
      { period: 'Sep 2026', amount: 13600.00, status: 'Scheduled', invoiceId: null }
    ]
  }
];

export const DEAL_HEALTH_DATA = {
  kpis: {
    totalActiveDeals: 14,
    stalledDeals: 3,
    atRiskDeals: 2,
    discountAnomalies: 2,
    deliverySlippages: 1,
    pipelineValue: 4850000
  },
  stalledDeals: [
    {
      id: 'ST-1',
      customer: 'HDFC Bank Digital',
      quote: 'QT-2026-798',
      amount: 252000,
      lastActivity: '2026-08-27',
      daysStalled: 9,
      owner: 'Amit Sharma',
      anomaly: 'No touchpoint registered since initial spec creation.'
    },
    {
      id: 'ST-2',
      customer: 'Zomato Operations',
      quote: 'QT-2026-784',
      amount: 148000,
      lastActivity: '2026-08-26',
      daysStalled: 10,
      owner: 'Amit Sharma',
      anomaly: 'Customer proposal viewed but pending commercial signoff.'
    }
  ],
  discountAnomalies: [
    {
      id: 'DA-1',
      rep: 'Amit Sharma',
      customer: 'Beta Industries',
      discount: 18.0,
      historicalAvg: 8.5,
      diff: '+9.5%',
      risk: 'HIGH'
    },
    {
      id: 'DA-2',
      rep: 'Amit Sharma',
      customer: 'Nova Systems',
      discount: 20.0,
      historicalAvg: 11.0,
      diff: '+9.0%',
      risk: 'HIGH'
    }
  ],
  deliverySlippages: [
    {
      id: 'DS-1',
      customer: 'Beta Industries',
      order: 'FO-9048',
      expectedDate: '2026-09-15',
      currentEstimate: '2026-09-25',
      delay: '+10 Days (Backorder on PowerEdge 2U)'
    }
  ]
};

export const GOVERNANCE_RULES = {
  tierCeilings: {
    'Bronze Tier': 5,
    'Silver Tier': 10,
    'Gold Tier': 15,
    'Enterprise Tier': 20,
  },
  categoryCeilings: {
    'Hardware': 15,
    'Subscriptions': 20,
    'Services': 10,
  },
  approvalChains: [
    { rule: 'Discount Breach > 5% above category ceiling', chain: 'Sales Manager (Priya Patel)' },
    { rule: 'Discount Breach > 10% or Total Value > ₹10,00,000', chain: 'Sales Manager → Finance / Ops (Rajesh Verma)' },
    { rule: 'Negative Gross Margin Line Item', chain: 'Executive Board Escalation' }
  ]
};
