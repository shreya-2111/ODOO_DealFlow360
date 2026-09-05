// DealFlow360 - Comprehensive Realistic Indian Business Dataset (INR ₹)

export const USER_ROLES = [
  { id: 'sales_rep', name: 'Amit Sharma', role: 'Sales Representative', team: 'Enterprise Direct India', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'sales_manager', name: 'Priya Patel', role: 'Regional Sales VP', team: 'India Revenue Ops', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
  { id: 'finance_officer', name: 'Rajesh Verma', role: 'Finance Officer & Controller', team: 'Treasury & Revenue Ops', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'ops_lead', name: 'Suresh Kumar', role: 'Fulfillment & Warehouse Lead', team: 'Supply Chain Operations', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'admin', name: 'Neha Gupta', role: 'System Administrator', team: 'IT Governance', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80' },
  { id: 'customer', name: 'Vikram Malhotra', role: 'VP Technology (Customer)', team: 'Reliance Infotech Ltd', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' }
];

export const GOVERNANCE_RULES = {
  tierCeilings: {
    'Bronze Tier': 5,
    'Silver Tier': 10,
    'Gold Tier': 15,
    'Enterprise Tier': 20,
  },
  categoryCeilings: {
    'Hardware': 15,
    'Cloud Subscriptions': 20,
    'Professional Services': 10,
    'Accessories': 25,
  },
  approvalTriggers: [
    { rule: 'Discount Breach > 5% above category ceiling', level: 'Sales Manager Approval (Priya Patel)' },
    { rule: 'Discount Breach > 10% or Total Value > ₹10,00,000', level: 'Dual VP & Finance Controller (Rajesh Verma)' },
    { rule: 'Negative Gross Margin Line Item', level: 'Executive Board Approval' }
  ]
};

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-101',
    name: 'Dell PowerEdge Rack Server Node',
    sku: 'HW-SRV-DELL',
    category: 'Hardware',
    type: 'one_time',
    basePrice: 250000,
    unitCost: 165000,
    taxRate: 18.0, // 18% GST
    inventoryCount: 38,
    leadTimeDays: 4,
    description: 'Dual Intel Xeon processor, 128GB ECC RAM, 4TB NVMe SSD with redundant power supply.',
    variants: [
      { id: 'v1', name: '128GB RAM / 4TB NVMe (Standard)', sku: 'HW-SRV-STD', priceDelta: 0 },
      { id: 'v2', name: '256GB RAM / 8TB NVMe (Performance)', sku: 'HW-SRV-PERF', priceDelta: 65000 },
      { id: 'v3', name: '512GB RAM / 16TB NVMe (Enterprise)', sku: 'HW-SRV-ENT', priceDelta: 140000 }
    ],
    currencyPricing: { INR: 250000, USD: 3000, EUR: 2800 }
  },
  {
    id: 'PRD-102',
    name: 'QuickHeal / Cloud Security Pro Suite',
    sku: 'SaaS-SEC-PRO',
    category: 'Cloud Subscriptions',
    type: 'recurring',
    cadence: 'monthly',
    basePrice: 1500,
    unitCost: 250,
    taxRate: 18.0,
    inventoryCount: 9999,
    leadTimeDays: 0,
    description: 'Endpoint detection, cloud antivirus, ransomware shield, and SIEM security monitoring.',
    variants: [
      { id: 'v1', name: 'Per-Endpoint License (Monthly)', sku: 'SaaS-SEC-MO', priceDelta: 0 },
      { id: 'v2', name: 'Annual Site License (1-Year Pre-pay)', sku: 'SaaS-SEC-ANN', priceDelta: 14500 }
    ],
    currencyPricing: { INR: 1500, USD: 18, EUR: 16 }
  },
  {
    id: 'PRD-103',
    name: 'On-Site Network Setup & Office Deployment',
    sku: 'SVC-DEPLOY-L3',
    category: 'Professional Services',
    type: 'one_time',
    basePrice: 45000,
    unitCost: 22000,
    taxRate: 18.0,
    inventoryCount: 99,
    leadTimeDays: 3,
    description: 'Senior network engineer on-site: router setup, firewall configuration, structured cabling & testing.',
    variants: [
      { id: 'v1', name: 'Standard Office Setup (1-2 Days)', sku: 'SVC-DEP-STD', priceDelta: 0 },
      { id: 'v2', name: 'Multi-Floor Complex Setup (5 Days)', sku: 'SVC-DEP-EXT', priceDelta: 40000 }
    ],
    currencyPricing: { INR: 45000, USD: 540, EUR: 500 }
  },
  {
    id: 'PRD-104',
    name: '24/7 AMC Support & Priority SLA Plan',
    sku: 'SLA-247-PREM',
    category: 'Cloud Subscriptions',
    type: 'recurring',
    cadence: 'monthly',
    basePrice: 8500,
    unitCost: 1500,
    taxRate: 18.0,
    inventoryCount: 9999,
    leadTimeDays: 0,
    description: 'Annual Maintenance Contract with 30-min response SLA, replacement parts coverage & dedicated engineer.',
    variants: [
      { id: 'v1', name: 'Standard Business Hours (9am-6pm)', sku: 'SLA-STD', priceDelta: -3000 },
      { id: 'v2', name: 'Premium 24x7 Coverage', sku: 'SLA-PLAT', priceDelta: 0 }
    ],
    currencyPricing: { INR: 8500, USD: 105, EUR: 95 }
  },
  {
    id: 'PRD-105',
    name: 'Samsung 43-Inch 4K Commercial Display',
    sku: 'HW-DSP-4K43',
    category: 'Hardware',
    type: 'one_time',
    basePrice: 42000,
    unitCost: 28000,
    taxRate: 18.0,
    inventoryCount: 22,
    leadTimeDays: 2,
    description: '4K UHD commercial display for office conference rooms, CCTV monitoring, and presentation walls.',
    variants: [
      { id: 'v1', name: '43" Commercial Single Panel', sku: 'HW-DSP-43', priceDelta: 0 },
      { id: 'v2', name: '55" Ultra Bright Conference Display', sku: 'HW-DSP-55', priceDelta: 24000 }
    ],
    currencyPricing: { INR: 42000, USD: 500, EUR: 460 }
  },
  {
    id: 'PRD-106',
    name: 'D-Link Cat-6 Optical Networking Cable Bundle (Pack of 10)',
    sku: 'ACC-OPT-CAB',
    category: 'Accessories',
    type: 'one_time',
    basePrice: 6500,
    unitCost: 3200,
    taxRate: 18.0,
    inventoryCount: 140,
    leadTimeDays: 1,
    description: 'High-speed gigabit optical fiber cables with gold-plated connectors for server racks.',
    variants: [
      { id: 'v1', name: '10x 5-Meter Cables', sku: 'ACC-CAB-5M', priceDelta: 0 },
      { id: 'v2', name: '10x 15-Meter Cables', sku: 'ACC-CAB-15M', priceDelta: 3500 }
    ],
    currencyPricing: { INR: 6500, USD: 80, EUR: 72 }
  }
];

export const INITIAL_WAREHOUSES = [
  {
    id: 'WH-MUMBAI',
    name: 'Mumbai Mega-Hub (Bhiwandi)',
    location: 'Bhiwandi, Mumbai, Maharashtra',
    totalCapacity: '15,000 units',
    utilization: 76,
    activeShipmentsToday: 32,
    stockLevels: {
      'PRD-101': { inStock: 25, reserved: 8, available: 17 },
      'PRD-105': { inStock: 14, reserved: 4, available: 10 },
      'PRD-106': { inStock: 110, reserved: 25, available: 85 },
    }
  },
  {
    id: 'WH-BLR',
    name: 'Bengaluru Tech Logistics Center',
    location: 'Whitefield, Bengaluru, Karnataka',
    totalCapacity: '10,000 units',
    utilization: 62,
    activeShipmentsToday: 21,
    stockLevels: {
      'PRD-101': { inStock: 10, reserved: 2, available: 8 },
      'PRD-105': { inStock: 6, reserved: 2, available: 4 },
      'PRD-106': { inStock: 20, reserved: 5, available: 15 },
    }
  },
  {
    id: 'WH-NCR',
    name: 'Delhi-NCR Distribution Depot',
    location: 'Gurugram, Haryana',
    totalCapacity: '8,000 units',
    utilization: 54,
    activeShipmentsToday: 14,
    stockLevels: {
      'PRD-101': { inStock: 3, reserved: 2, available: 1 },
      'PRD-105': { inStock: 2, reserved: 2, available: 0 },
      'PRD-106': { inStock: 10, reserved: 2, available: 8 },
    }
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: 'QT-2026-8812',
    customerName: 'Reliance Infotech Ltd',
    contactPerson: 'Vikram Malhotra (VP Tech)',
    contactEmail: 'v.malhotra@relianceinfotech.in',
    customerTier: 'Enterprise Tier',
    salesRep: 'Amit Sharma',
    status: 'Pending Approval',
    createdAt: '2026-09-02',
    validUntil: '2026-10-02',
    currency: 'INR',
    riskLevel: 'HIGH',
    urgencyScore: 92,
    discountBreachSummary: 'Professional Services discounted at 18% (+8% breach over 10% ceiling)',
    notes: 'Customer requesting accelerated data center installation and multi-branch deployment.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-101',
        productName: 'Dell PowerEdge Rack Server Node',
        sku: 'HW-SRV-PERF',
        category: 'Hardware',
        type: 'one_time',
        quantity: 4,
        unitPrice: 315000,
        unitCost: 195000,
        discountPercent: 12, // within 15% limit
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-102',
        productName: 'QuickHeal / Cloud Security Pro Suite',
        sku: 'SaaS-SEC-PRO',
        category: 'Cloud Subscriptions',
        type: 'recurring',
        cadence: 'monthly',
        quantity: 150,
        unitPrice: 1500,
        unitCost: 250,
        discountPercent: 18, // within 20% limit
        taxRate: 18.0
      },
      {
        id: 'item-3',
        productId: 'PRD-103',
        productName: 'On-Site Network Setup & Office Deployment',
        sku: 'SVC-DEPLOY-L3',
        category: 'Professional Services',
        type: 'one_time',
        quantity: 2,
        unitPrice: 45000,
        unitCost: 22000,
        discountPercent: 18, // BREACH! Limit is 10% (+8% breach)
        taxRate: 18.0
      },
      {
        id: 'item-4',
        productId: 'PRD-104',
        productName: '24/7 AMC Support & Priority SLA Plan',
        sku: 'SLA-247-PREM',
        category: 'Cloud Subscriptions',
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
      { stepNumber: 1, role: 'Sales Rep Submission', user: 'Amit Sharma', status: 'approved', timestamp: '2026-09-02 14:20' },
      { stepNumber: 2, role: 'Sales VP Regional Approval', user: 'Priya Patel', status: 'pending', timestamp: null },
      { stepNumber: 3, role: 'Finance Officer & Controller', user: 'Rajesh Verma', status: 'upcoming', timestamp: null },
      { stepNumber: 4, role: 'Customer Digital Signing', user: 'Vikram Malhotra', status: 'upcoming', timestamp: null }
    ],
    auditLogs: [
      { id: 'log-1', timestamp: '2026-09-02 14:15', actor: 'Amit Sharma (Rep)', action: 'Created quotation draft with corporate volume discount' },
      { id: 'log-2', timestamp: '2026-09-02 14:20', actor: 'Governance Rule Engine', action: 'Triggered High-Risk approval routing due to Professional Services 18% discount' }
    ],
    customerNotes: 'We require server delivery and installation kickoff in Mumbai and Bengaluru by next month.'
  },
  {
    id: 'QT-2026-8809',
    customerName: 'Tata Consultancy Cloud Services',
    contactPerson: 'Ananya Deshmukh (Director IT)',
    contactEmail: 'ananya.d@tcscloud.in',
    customerTier: 'Gold Tier',
    salesRep: 'Amit Sharma',
    status: 'Approved',
    createdAt: '2026-08-30',
    validUntil: '2026-09-30',
    currency: 'INR',
    riskLevel: 'LOW',
    urgencyScore: 40,
    discountBreachSummary: 'Within standard tier limits',
    notes: 'Approved terms; ready for customer e-signature via portal.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-101',
        productName: 'Dell PowerEdge Rack Server Node',
        sku: 'HW-SRV-STD',
        category: 'Hardware',
        type: 'one_time',
        quantity: 2,
        unitPrice: 250000,
        unitCost: 165000,
        discountPercent: 10,
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-106',
        productName: 'D-Link Cat-6 Optical Cable Bundle (Pack of 10)',
        sku: 'ACC-OPT-CAB',
        category: 'Accessories',
        type: 'one_time',
        quantity: 5,
        unitPrice: 6500,
        unitCost: 3200,
        discountPercent: 12,
        taxRate: 18.0
      }
    ],
    approvalSteps: [
      { stepNumber: 1, role: 'Sales Rep Submission', user: 'Amit Sharma', status: 'approved', timestamp: '2026-08-30 09:12' },
      { stepNumber: 2, role: 'Sales VP Regional Approval', user: 'Priya Patel', status: 'approved', timestamp: '2026-08-30 11:45' },
      { stepNumber: 3, role: 'Finance Controller', user: 'Auto-Approved (< ₹10 Lakh)', status: 'approved', timestamp: '2026-08-30 11:45' },
      { stepNumber: 4, role: 'Customer Confirmation', user: 'Ananya Deshmukh', status: 'pending', timestamp: null }
    ],
    auditLogs: [
      { id: 'log-1', timestamp: '2026-08-30 09:12', actor: 'Amit Sharma', action: 'Drafted quotation' },
      { id: 'log-2', timestamp: '2026-08-30 11:45', actor: 'Priya Patel', action: 'Approved terms for customer delivery' }
    ],
    customerNotes: 'Deliver to TCS Olympus campus, Thane.'
  },
  {
    id: 'QT-2026-8798',
    customerName: 'HDFC Bank Digital Solutions',
    contactPerson: 'Sanjay Nair',
    contactEmail: 'sanjay.nair@hdfcbankdigital.com',
    customerTier: 'Silver Tier',
    salesRep: 'Amit Sharma',
    status: 'Draft',
    createdAt: '2026-09-04',
    validUntil: '2026-10-04',
    currency: 'INR',
    riskLevel: 'MEDIUM',
    urgencyScore: 68,
    discountBreachSummary: 'Hardware discount 14% near 15% ceiling',
    notes: 'Quotation for branch surveillance display screens.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-105',
        productName: 'Samsung 43-Inch 4K Commercial Display',
        sku: 'HW-DSP-4K43',
        category: 'Hardware',
        type: 'one_time',
        quantity: 6,
        unitPrice: 42000,
        unitCost: 28000,
        discountPercent: 14,
        taxRate: 18.0
      }
    ],
    approvalSteps: [
      { stepNumber: 1, role: 'Draft Phase', user: 'Amit Sharma', status: 'pending', timestamp: null },
      { stepNumber: 2, role: 'Sales VP Approval', user: 'Priya Patel', status: 'upcoming', timestamp: null },
      { stepNumber: 3, role: 'Finance Controller', user: 'Rajesh Verma', status: 'upcoming', timestamp: null },
      { stepNumber: 4, role: 'Customer Confirmation', user: 'Sanjay Nair', status: 'upcoming', timestamp: null }
    ],
    auditLogs: [
      { id: 'log-1', timestamp: '2026-09-04 16:30', actor: 'Amit Sharma', action: 'Initiated quotation draft' }
    ],
    customerNotes: ''
  },
  {
    id: 'QT-2026-8760',
    customerName: 'Infosys Cloud Labs',
    contactPerson: 'Deepak Reddy',
    contactEmail: 'deepak.reddy@infosyslabs.com',
    customerTier: 'Enterprise Tier',
    salesRep: 'Amit Sharma',
    status: 'Confirmed',
    createdAt: '2026-08-20',
    validUntil: '2026-09-20',
    currency: 'INR',
    riskLevel: 'LOW',
    urgencyScore: 10,
    discountBreachSummary: 'Standard Enterprise pricing',
    notes: 'Closed deal; converted to Fulfillment and Recurring AMC Billing ledger.',
    items: [
      {
        id: 'item-1',
        productId: 'PRD-101',
        productName: 'Dell PowerEdge Rack Server Node',
        sku: 'HW-SRV-ENT',
        category: 'Hardware',
        type: 'one_time',
        quantity: 6,
        unitPrice: 390000,
        unitCost: 250000,
        discountPercent: 8,
        taxRate: 18.0
      },
      {
        id: 'item-2',
        productId: 'PRD-104',
        productName: '24/7 AMC Support & Priority SLA Plan',
        sku: 'SLA-247-PREM',
        category: 'Cloud Subscriptions',
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
      { stepNumber: 1, role: 'Rep Submission', user: 'Amit Sharma', status: 'approved', timestamp: '2026-08-20 10:00' },
      { stepNumber: 2, role: 'Sales VP Approval', user: 'Priya Patel', status: 'approved', timestamp: '2026-08-21 09:30' },
      { stepNumber: 3, role: 'Finance Officer', user: 'Rajesh Verma', status: 'approved', timestamp: '2026-08-21 14:00' },
      { stepNumber: 4, role: 'Customer Digital Signing', user: 'Deepak Reddy', status: 'approved', timestamp: '2026-08-22 11:15' }
    ],
    auditLogs: [
      { id: 'log-1', timestamp: '2026-08-20 10:00', actor: 'Amit Sharma', action: 'Created quotation' },
      { id: 'log-2', timestamp: '2026-08-22 11:15', actor: 'Deepak Reddy', action: 'Digitally accepted contract via Customer Portal' }
    ],
    customerNotes: 'Deliver to Electronic City Phase 1, Bengaluru.'
  }
];

export const INITIAL_FULFILLMENT_ORDERS = [
  {
    id: 'FO-9042',
    quoteId: 'QT-2026-8760',
    customerName: 'Infosys Cloud Labs',
    destination: 'Infosys Campus, Electronic City, Bengaluru, Karnataka',
    orderDate: '2026-08-22',
    estimatedDelivery: '2026-09-12',
    status: 'Partially Allocated',
    shippingCarrier: 'BlueDart Express Logistics',
    trackingNumber: 'BLR-9982341908',
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-101',
        productName: 'Dell PowerEdge Rack Server Node',
        requiredQty: 6,
        allocations: [
          { warehouseId: 'WH-BLR', warehouseName: 'Bengaluru Tech Logistics Center', qty: 4, status: 'Allocated' },
          { warehouseId: 'WH-MUMBAI', warehouseName: 'Mumbai Mega-Hub (Bhiwandi)', qty: 2, status: 'Allocated' }
        ],
        backorderedQty: 0
      }
    ]
  },
  {
    id: 'FO-9045',
    quoteId: 'QT-2026-8809',
    customerName: 'Tata Consultancy Cloud Services',
    destination: 'TCS Olympus, Ghodbunder Rd, Thane, Mumbai, Maharashtra',
    orderDate: '2026-08-31',
    estimatedDelivery: '2026-09-08',
    status: 'Ready to Ship',
    shippingCarrier: 'Delhivery Surface Freight',
    trackingNumber: 'DEL-9921448102',
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-101',
        productName: 'Dell PowerEdge Rack Server Node',
        requiredQty: 2,
        allocations: [
          { warehouseId: 'WH-MUMBAI', warehouseName: 'Mumbai Mega-Hub (Bhiwandi)', qty: 2, status: 'Allocated' }
        ],
        backorderedQty: 0
      },
      {
        lineId: 'fol-2',
        productId: 'PRD-106',
        productName: 'D-Link Cat-6 Optical Cable Bundle',
        requiredQty: 5,
        allocations: [
          { warehouseId: 'WH-MUMBAI', warehouseName: 'Mumbai Mega-Hub (Bhiwandi)', qty: 5, status: 'Allocated' }
        ],
        backorderedQty: 0
      }
    ]
  },
  {
    id: 'FO-9048',
    quoteId: 'QT-2026-8812',
    customerName: 'Reliance Infotech Ltd',
    destination: 'Reliance Corporate Park, Navi Mumbai, Maharashtra',
    orderDate: '2026-09-03',
    estimatedDelivery: '2026-09-25',
    status: 'Pending Allocation',
    shippingCarrier: 'TBD upon approval',
    trackingNumber: null,
    lines: [
      {
        lineId: 'fol-1',
        productId: 'PRD-101',
        productName: 'Dell PowerEdge Rack Server Node',
        requiredQty: 4,
        allocations: [
          { warehouseId: 'WH-MUMBAI', warehouseName: 'Mumbai Mega-Hub (Bhiwandi)', qty: 2, status: 'Allocated' }
        ],
        backorderedQty: 2
      }
    ]
  }
];

export const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'SUB-4019',
    customerName: 'Infosys Cloud Labs',
    planName: '24/7 AMC Support & Priority SLA Plan',
    productId: 'PRD-104',
    billingCadence: 'Monthly',
    mrr: 8075.00, // 8500 - 5% discount
    arr: 96900.00,
    startDate: '2026-08-22',
    renewalDate: '2027-08-22',
    status: 'Active',
    paymentMethod: 'HDFC Corporate Auto-Debit (*4821)',
    autoRenew: true,
    oneTimeItemsDelivered: [
      { name: 'Dell PowerEdge Rack Server Node (x6)', total: 2152800, deliveredOn: '2026-08-28' }
    ],
    recurringSchedule: [
      { period: 'Sep 2026', amount: 8075.00, status: 'Paid', invoiceId: 'INV-2026-091' },
      { period: 'Oct 2026', amount: 8075.00, status: 'Scheduled', invoiceId: null },
      { period: 'Nov 2026', amount: 8075.00, status: 'Scheduled', invoiceId: null }
    ]
  },
  {
    id: 'SUB-4022',
    customerName: 'Wipro Enterprise Systems',
    planName: 'Cloud Security Antivirus Suite (200 Endpoints)',
    productId: 'PRD-102',
    billingCadence: 'Monthly',
    mrr: 246000.00,
    arr: 2952000.00,
    startDate: '2026-06-15',
    renewalDate: '2027-06-15',
    status: 'Active',
    paymentMethod: 'NEFT / RTGS Net 30',
    autoRenew: true,
    oneTimeItemsDelivered: [
      { name: 'On-Site Network Setup & Configuration', total: 45000, deliveredOn: '2026-06-20' }
    ],
    recurringSchedule: [
      { period: 'Sep 2026', amount: 246000.00, status: 'Paid', invoiceId: 'INV-2026-084' },
      { period: 'Oct 2026', amount: 246000.00, status: 'Scheduled', invoiceId: null }
    ]
  },
  {
    id: 'SUB-4015',
    customerName: 'Zomato Tech Operations',
    planName: 'Cloud Security Pro + 24/7 AMC Plan',
    productId: 'PRD-102',
    billingCadence: 'Monthly',
    mrr: 38000.00,
    arr: 456000.00,
    startDate: '2026-01-10',
    renewalDate: '2026-09-30',
    status: 'Pending Renewal',
    paymentMethod: 'ICICI Corporate Card (*9011)',
    autoRenew: false,
    oneTimeItemsDelivered: [],
    recurringSchedule: [
      { period: 'Aug 2026', amount: 38000.00, status: 'Paid', invoiceId: 'INV-2026-071' },
      { period: 'Sep 2026', amount: 38000.00, status: 'Pending Payment', invoiceId: 'INV-2026-095' }
    ]
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'INV-2026-091',
    quoteId: 'QT-2026-8760',
    customerName: 'Infosys Cloud Labs',
    issueDate: '2026-08-28',
    dueDate: '2026-09-28',
    amount: 2551044.00, // including 18% GST
    paidAmount: 2551044.00,
    status: 'Paid',
    reconciliationStage: 'Paid',
    paymentMethod: 'NEFT Direct Bank Transfer #UTR-HDFC998124',
    shippedItemsProof: [
      { sku: 'HW-SRV-ENT', description: 'Dell PowerEdge Rack Server Node (x6)', verifiedShipped: true, carrierTracking: 'BLR-9982341908' },
      { sku: 'SLA-247-PREM', description: '24/7 AMC Support & SLA Month 1', verifiedShipped: true, carrierTracking: 'N/A (SLA Activated)' }
    ]
  },
  {
    id: 'INV-2026-095',
    quoteId: 'QT-2026-8809',
    customerName: 'Tata Consultancy Cloud Services',
    issueDate: '2026-09-01',
    dueDate: '2026-10-01',
    amount: 564748.00,
    paidAmount: 0.00,
    status: 'Unpaid',
    reconciliationStage: 'Invoiced',
    paymentMethod: 'Net 30 Invoicing (RTGS)',
    shippedItemsProof: [
      { sku: 'HW-SRV-STD', description: 'Dell PowerEdge Rack Server Node (x2)', verifiedShipped: true, carrierTracking: 'DEL-9921448102' },
      { sku: 'ACC-OPT-CAB', description: 'D-Link Cat-6 Cable Bundle (x5)', verifiedShipped: true, carrierTracking: 'DEL-9921448102' }
    ]
  },
  {
    id: 'INV-2026-099',
    quoteId: 'QT-2026-8812',
    customerName: 'Reliance Infotech Ltd',
    issueDate: '2026-09-04',
    dueDate: '2026-10-04',
    amount: 1585272.00,
    paidAmount: 0.00,
    status: 'Draft',
    reconciliationStage: 'Order Confirmed',
    paymentMethod: 'Pending Delivery Reconciliation',
    shippedItemsProof: [
      { sku: 'HW-SRV-PERF', description: 'Dell PowerEdge Rack Server Node (x4)', verifiedShipped: false, carrierTracking: 'Pending Dispatch' },
      { sku: 'SVC-DEPLOY-L3', description: 'On-Site Network Setup (x2)', verifiedShipped: false, carrierTracking: 'Pending Schedule' }
    ]
  }
];

export const DEAL_HEALTH_METRICS = [
  {
    id: 'DH-1',
    quoteId: 'QT-2026-8812',
    dealName: 'Reliance Infotech Data Center Upgrade',
    customerName: 'Reliance Infotech Ltd',
    dealValue: 1585272,
    riskType: 'Discount Anomaly & High-Value Hold',
    severity: 'High',
    idleDays: 4,
    repName: 'Amit Sharma',
    anomalyDetail: 'Professional services discounted 18% vs 10% category ceiling. Total value exceeds ₹10 Lakh threshold.',
    suggestedAction: 'Escalate to VP Priya Patel & Controller Rajesh Verma for concession signoff'
  },
  {
    id: 'DH-2',
    quoteId: 'QT-2026-8798',
    dealName: 'HDFC Branch Display Expansion',
    customerName: 'HDFC Bank Digital Solutions',
    dealValue: 252000,
    riskType: 'Stalled In Draft (>7 Days)',
    severity: 'Medium',
    idleDays: 8,
    repName: 'Amit Sharma',
    anomalyDetail: 'No customer touchpoint registered since initial spec creation 8 days ago.',
    suggestedAction: 'Send automated follow-up proposal with 14-day validity guarantee'
  },
  {
    id: 'DH-3',
    quoteId: 'QT-2026-8744',
    dealName: 'L&T Infotech Hardware Upgrade',
    customerName: 'Larsen & Toubro Infotech',
    dealValue: 1850000,
    riskType: 'Mumbai Mega-Hub Stock Lead Time Slippage',
    severity: 'High',
    idleDays: 3,
    repName: 'Suresh Kumar (Ops)',
    anomalyDetail: 'Mumbai Mega-Hub backorder on PowerEdge nodes may delay delivery past SLA.',
    suggestedAction: 'Initiate split-fulfillment routing via Bengaluru Depot'
  }
];

export const UPSELL_RECOMMENDATIONS = [
  {
    id: 'UP-1',
    targetProductId: 'PRD-101',
    recommendedProduct: '24/7 AMC Support & Priority SLA Plan',
    recommendedSku: 'SLA-247-PREM',
    price: 8500,
    marginContribution: '+82% Gross Margin',
    rationale: '94% of Enterprise Server buyers add 24/7 AMC for on-site hardware warranty protection.',
    badge: 'High Value Add-on'
  },
  {
    id: 'UP-2',
    targetProductId: 'PRD-101',
    recommendedProduct: 'D-Link Cat-6 Optical Cable Bundle (Pack of 10)',
    recommendedSku: 'ACC-OPT-CAB',
    price: 6500,
    marginContribution: '+51% Gross Margin',
    rationale: 'Avoid optical cable bottlenecks during rack server installation.',
    badge: 'Frequently Paired'
  },
  {
    id: 'UP-3',
    targetProductId: 'PRD-103',
    recommendedProduct: 'QuickHeal / Cloud Security Pro Suite',
    recommendedSku: 'SaaS-SEC-PRO',
    price: 1500,
    marginContribution: '+83% Recurring Margin',
    rationale: 'Bundle continuous antivirus and endpoint defense post on-site deployment.',
    badge: 'Recurring Revenue'
  }
];
