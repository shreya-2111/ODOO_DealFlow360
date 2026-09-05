# DealFlow360 - B2B Deal Management, CPQ & Revenue Orchestration

DealFlow360 is an enterprise B2B SaaS platform for Deal Management, CPQ (Configure, Price, Quote), Multi-Gate Approvals, Multi-Warehouse Stock Fulfillment, Subscriptions, GST Invoicing, and Deal Health monitoring in Indian Rupees (INR ₹).

## Repository Architecture

```
d:/ODOO_DealFlow360/
├── frontend/                     # React.js + Vite + Tailwind CSS B2B Application
│   ├── src/
│   │   ├── components/           # Reusable UI, Forms, Stepper, Tabs, Layout (Sidebar & Header)
│   │   ├── pages/                # 18 Complete Product Screens & Workflows
│   │   │   ├── auth/             # Login / Register with Role Selector Dropdown
│   │   │   ├── dashboard/        # Sales Command Center
│   │   │   ├── quotations/       # Quotations Pipeline & Interactive CPQ
│   │   │   ├── approvals/        # Approvals Queue & 4-Gate Stepper
│   │   │   ├── fulfillment/      # Multi-Warehouse Stock & Split Sourcing
│   │   │   ├── subscriptions/    # Recurring Subscriptions & Billing Detail
│   │   │   ├── portal/           # Customer Collaboration & Negotiation Portal
│   │   │   ├── invoices/         # GST Invoices & 4-Stage Reconciliation
│   │   │   ├── health/           # Deal Health & Risk Intelligence
│   │   │   ├── reports/          # Executive Analytics & Turnaround Times
│   │   │   ├── products/         # Master SKU Catalog & Variants
│   │   │   └── settings/         # Governance Rules & Ceilings
│   │   ├── context/              # AuthContext, DataContext, ToastContext
│   │   └── data/                 # Realistic Indian Business Mock Dataset (INR ₹)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
```

## Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.
