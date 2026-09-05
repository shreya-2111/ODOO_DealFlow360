import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';

import { AppLayout } from './components/layout/AppLayout';

// 18 Major Screens
import { LoginSignup } from './pages/auth/LoginSignup';
import { SalesDashboard } from './pages/dashboard/SalesDashboard';
import { QuotationsList } from './pages/quotations/QuotationsList';
import { QuotationDetail } from './pages/quotations/QuotationDetail';
import { ApprovalsList } from './pages/approvals/ApprovalsList';
import { ApprovalDetail } from './pages/approvals/ApprovalDetail';
import { FulfillmentList } from './pages/fulfillment/FulfillmentList';
import { FulfillmentDetail } from './pages/fulfillment/FulfillmentDetail';
import { SubscriptionsList } from './pages/subscriptions/SubscriptionsList';
import { BillingDetail } from './pages/subscriptions/BillingDetail';
import { CustomerPortal } from './pages/portal/CustomerPortal';
import { InvoicesList } from './pages/invoices/InvoicesList';
import { InvoiceDetail } from './pages/invoices/InvoiceDetail';
import { DealHealth } from './pages/health/DealHealth';
import { AdminReports } from './pages/reports/AdminReports';
import { ProductCatalog } from './pages/products/ProductCatalog';
import { ProductDetail } from './pages/products/ProductDetail';
import { GovernanceSettings } from './pages/settings/GovernanceSettings';
import { SalesPipeline } from './pages/pipeline/SalesPipeline';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Screen 1: Auth & Login/Register Page (First page on load) */}
              <Route path="/login" element={<LoginSignup />} />

              {/* Application Shell Wrapper */}
              <Route element={<AppLayout />}>
                {/* Screen 2: Sales Dashboard */}
                <Route path="/dashboard" element={<SalesDashboard />} />

                {/* Pipeline (Kanban) */}
                <Route path="/pipeline" element={<SalesPipeline />} />

                {/* Screens 3 & 4: Quotations & CPQ */}
                <Route path="/quotations" element={<QuotationsList />} />
                <Route path="/quotations/:id" element={<QuotationDetail />} />

                {/* Screens 5 & 6: Approvals */}
                <Route path="/approvals" element={<ApprovalsList />} />
                <Route path="/approvals/:id" element={<ApprovalDetail />} />

                {/* Screens 7 & 8: Fulfillment & Stock */}
                <Route path="/fulfillment" element={<FulfillmentList />} />
                <Route path="/fulfillment/:id" element={<FulfillmentDetail />} />

                {/* Screens 9 & 10: Subscriptions & Billing */}
                <Route path="/subscriptions" element={<SubscriptionsList />} />
                <Route path="/subscriptions/:id" element={<BillingDetail />} />

                {/* Screen 11: Customer Portal & Customers */}
                <Route path="/portal" element={<CustomerPortal />} />
                <Route path="/customers" element={<CustomerPortal />} />

                {/* Screens 12 & 13: Invoices Ledger & Reconciliation */}
                <Route path="/invoices" element={<InvoicesList />} />
                <Route path="/invoices/:id" element={<InvoiceDetail />} />

                {/* Screen 14: Deal Health & Risk */}
                <Route path="/health" element={<DealHealth />} />

                {/* Screen 15: Admin Reports */}
                <Route path="/reports" element={<AdminReports />} />

                {/* Screens 16 & 17: Product Master & Pricing */}
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:id" element={<ProductDetail />} />

                {/* Screen 18: Governance Rules & Admin Settings */}
                <Route path="/governance" element={<GovernanceSettings />} />
                <Route path="/settings" element={<GovernanceSettings />} />
              </Route>

              {/* Default landing page route -> display 1st Login / Register page */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
