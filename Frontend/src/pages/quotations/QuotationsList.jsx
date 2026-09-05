import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, TextArea } from '../../components/ui/Input';
import {
  Plus,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  User
} from 'lucide-react';

export function QuotationsList() {
  const navigate = useNavigate();
  const { quotations, addQuotation, products, calculateQuoteFinancials } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeStageTab, setActiveStageTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [amountFilter, setAmountFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New quotation form state
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [customerTier, setCustomerTier] = useState('Enterprise Tier');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'PRD-101');
  const [initialQty, setInitialQty] = useState(1);
  const [initialDiscount, setInitialDiscount] = useState(5);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Extract unique customer names for filter
  const uniqueCustomers = useMemo(() => {
    const list = quotations.map((q) => q.customer || q.customerName).filter(Boolean);
    return Array.from(new Set(list));
  }, [quotations]);

  // Filtering and Sorting
  const filteredAndSortedQuotations = useMemo(() => {
    return quotations
      .filter((q) => {
        const stage = q.stage || q.status || 'Draft';
        const customer = q.customer || q.customerName || '';
        const rep = q.salesRep || '';
        const id = q.id || '';
        const fin = calculateQuoteFinancials(q.items, q.customerTier, q.orderDiscountPercent);

        // Stage filter
        if (activeStageTab !== 'ALL' && stage !== activeStageTab) {
          return false;
        }

        // Customer filter
        if (customerFilter !== 'ALL' && customer !== customerFilter) {
          return false;
        }

        // Amount filter
        if (amountFilter === 'under_1l' && fin.totalAmount >= 100000) return false;
        if (amountFilter === '1l_5l' && (fin.totalAmount < 100000 || fin.totalAmount > 500000)) return false;
        if (amountFilter === 'above_5l' && fin.totalAmount <= 500000) return false;

        // Search query
        if (searchQuery.trim()) {
          const qText = searchQuery.toLowerCase();
          const match =
            customer.toLowerCase().includes(qText) ||
            id.toLowerCase().includes(qText) ||
            rep.toLowerCase().includes(qText) ||
            (q.contactPerson && q.contactPerson.toLowerCase().includes(qText));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const finA = calculateQuoteFinancials(a.items, a.customerTier, a.orderDiscountPercent);
        const finB = calculateQuoteFinancials(b.items, b.customerTier, b.orderDiscountPercent);
        const dateA = new Date(a.createdDate || a.createdAt || '2026-01-01');
        const dateB = new Date(b.createdDate || b.createdAt || '2026-01-01');
        const riskA = a.riskScore !== undefined ? a.riskScore : 30;
        const riskB = b.riskScore !== undefined ? b.riskScore : 30;

        if (sortBy === 'date_desc') return dateB - dateA;
        if (sortBy === 'date_asc') return dateA - dateB;
        if (sortBy === 'amount_desc') return finB.totalAmount - finA.totalAmount;
        if (sortBy === 'amount_asc') return finA.totalAmount - finB.totalAmount;
        if (sortBy === 'risk_desc') return riskB - riskA;
        if (sortBy === 'customer_asc') return (a.customer || '').localeCompare(b.customer || '');
        return 0;
      });
  }, [quotations, activeStageTab, customerFilter, amountFilter, searchQuery, sortBy, calculateQuoteFinancials]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedQuotations.length / pageSize));
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedQuotations.slice(start, start + pageSize);
  }, [filteredAndSortedQuotations, currentPage, pageSize]);

  const handleCreateQuote = (e) => {
    e.preventDefault();
    if (!customerName || !contactPerson) {
      addToast('Please provide customer name and primary contact person', 'warning');
      return;
    }

    const prd = products.find((p) => p.id === selectedProductId) || products[0] || {
      id: 'PRD-CUSTOM',
      name: 'Custom Product / Service',
      sku: 'GEN-SRV-01',
      category: 'Hardware',
      type: 'one_time',
      cadence: 'one_time',
      basePrice: 50000,
      unitCost: 30000,
      taxRate: 18.0
    };
    const newQuoteId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuote = {
      id: newQuoteId,
      customer: customerName,
      customerName,
      contactPerson,
      contactEmail: contactEmail || `${contactPerson.toLowerCase().replace(/\s+/g, '.')}@${customerName.toLowerCase().replace(/\s+/g, '')}.in`,
      customerTier,
      salesRep: currentUser.name,
      stage: 'Draft',
      status: 'Draft',
      approvalStatus: 'Not Submitted',
      createdDate: new Date().toISOString().substring(0, 10),
      createdAt: new Date().toISOString().substring(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      currency: 'INR',
      riskScore: 20,
      daysInactive: 0,
      orderDiscountPercent: 0,
      customerNotes: quoteNotes || 'Initial proposal draft created in CPQ engine.',
      items: [
        {
          id: `item-${Date.now()}`,
          productId: prd.id,
          name: prd.name,
          productName: prd.name,
          sku: prd.sku,
          category: prd.category,
          type: prd.type,
          cadence: prd.cadence || 'one_time',
          quantity: Number(initialQty),
          unitPrice: prd.basePrice,
          unitCost: prd.unitCost,
          discountPercent: Number(initialDiscount),
          taxRate: prd.taxRate || 18.0
        }
      ],
      approvalSteps: [
        { role: 'Sales Rep Submission', reviewer: currentUser.name, status: 'approved', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), comments: 'Draft quotation configured.' },
        { role: 'Sales Manager Approval', reviewer: 'Priya Patel', status: 'pending', timestamp: null, comments: 'Under standard review.' }
      ],
      timeline: [
        { sender: `${currentUser.name} (Sales Rep)`, action: 'Created quotation draft', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: 'Initial proposal created.' }
      ]
    };

    addQuotation(newQuote);
    setIsNewModalOpen(false);
    addToast(`Quotation ${newQuoteId} created! Opening CPQ editor...`, 'success');
    navigate(`/quotations/${newQuoteId}`);
  };

  const stageCounts = {
    ALL: quotations.length,
    Draft: quotations.filter((q) => (q.stage || q.status) === 'Draft').length,
    'Pending Approval': quotations.filter((q) => (q.stage || q.status) === 'Pending Approval').length,
    Approved: quotations.filter((q) => (q.stage || q.status) === 'Approved').length,
    'Under Negotiation': quotations.filter((q) => (q.stage || q.status) === 'Under Negotiation').length,
    Confirmed: quotations.filter((q) => (q.stage || q.status) === 'Confirmed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase">
              B1 — Quotations Workspace
            </span>
            <span className="text-xs text-slate-400">• Currency: INR (₹)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            B2B Quotations Master List
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-tier deals, track approval workflows, audit risk scores, and launch CPQ editor
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsNewModalOpen(true)}
        >
          Create Quotation
        </Button>
      </div>

      {/* Main Container Card */}
      <Card>
        {/* Stage Filter Tabs */}
        <div className="border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Quotations', count: stageCounts.ALL },
            { id: 'Draft', label: 'Drafts', count: stageCounts.Draft },
            { id: 'Pending Approval', label: 'Pending Approval', count: stageCounts['Pending Approval'], badgeClass: 'bg-amber-100 text-amber-800' },
            { id: 'Approved', label: 'Approved', count: stageCounts.Approved, badgeClass: 'bg-blue-100 text-blue-800' },
            { id: 'Under Negotiation', label: 'Under Negotiation', count: stageCounts['Under Negotiation'], badgeClass: 'bg-purple-100 text-purple-800' },
            { id: 'Confirmed', label: 'Confirmed', count: stageCounts.Confirmed, badgeClass: 'bg-emerald-100 text-emerald-800' },
          ].map((tab) => {
            const isActive = activeStageTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveStageTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${
                  isActive
                    ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.badgeClass || (isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quote #, customer, rep..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap">Customer:</span>
            <select
              value={customerFilter}
              onChange={(e) => {
                setCustomerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="ALL">All Customers</option>
              {uniqueCustomers.map((cust) => (
                <option key={cust} value={cust}>{cust}</option>
              ))}
            </select>
          </div>

          {/* Amount Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap">Amount:</span>
            <select
              value={amountFilter}
              onChange={(e) => {
                setAmountFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="ALL">All Amounts</option>
              <option value="under_1l">Under ₹1 Lakh</option>
              <option value="1l_5l">₹1 Lakh - ₹5 Lakh</option>
              <option value="above_5l">Above ₹5 Lakh</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="date_desc">Created Date (Newest)</option>
              <option value="date_asc">Created Date (Oldest)</option>
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
              <option value="risk_desc">Risk Score (High to Low)</option>
              <option value="customer_asc">Customer Name (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Quote Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Amount (INR ₹)</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Approval Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Sales Representative</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No quotations found matching your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((quote) => {
                  const fin = calculateQuoteFinancials(quote.items, quote.customerTier, quote.orderDiscountPercent);
                  const stage = quote.stage || quote.status || 'Draft';
                  const cust = quote.customer || quote.customerName || 'Account';
                  const date = quote.createdDate || quote.createdAt || '2026-09-01';
                  const rep = quote.salesRep || 'Sales Rep';
                  const risk = quote.riskScore !== undefined ? quote.riskScore : 30;

                  const stageVariant =
                    stage === 'Confirmed'
                      ? 'success'
                      : stage === 'Approved'
                      ? 'brand'
                      : stage === 'Pending Approval'
                      ? 'warning'
                      : stage === 'Under Negotiation'
                      ? 'purple'
                      : 'default';

                  const riskVariant =
                    risk >= 70
                      ? 'danger'
                      : risk >= 40
                      ? 'warning'
                      : 'success';

                  return (
                    <tr
                      key={quote.id}
                      onClick={() => navigate(`/quotations/${quote.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Quote Number */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {quote.id}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {quote.customerTier || 'Enterprise'}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{cust}</div>
                        {quote.contactPerson && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {quote.contactPerson}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          ₹{Math.round(fin.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Margin: <span className="text-emerald-700 font-semibold">{fin.grossMargin}%</span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="px-4 py-3.5">
                        <Badge variant={stageVariant} size="sm" dot>
                          {stage}
                        </Badge>
                      </td>

                      {/* Approval Status */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-700 font-medium block">
                          {quote.approvalStatus || (stage === 'Draft' ? 'Draft (Not Submitted)' : 'In Progress')}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{date}</span>
                        </div>
                      </td>

                      {/* Sales Representative */}
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rep}</span>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={riskVariant} size="sm">
                            {risk}/100
                          </Badge>
                          {risk >= 70 && (
                            <span className="text-[10px] text-rose-600 font-bold">High Risk</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quotations/${quote.id}`);
                          }}
                        >
                          Open CPQ
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredAndSortedQuotations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredAndSortedQuotations.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">
              {filteredAndSortedQuotations.length}
            </span>{' '}
            quotations
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={ChevronRight}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* New Quotation Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Quotation (CPQ)"
        description="Initialize customer proposal and configure primary solution line in INR ₹"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateQuote}>
              Create & Open CPQ
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateQuote} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer / Account Name"
              placeholder="e.g. Reliance Infotech Ltd"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input
              label="Primary Contact Person"
              placeholder="e.g. Vikram Malhotra (VP Tech)"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              placeholder="v.malhotra@relianceinfotech.in"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Select
              label="Account Tier (Ceiling Limit)"
              value={customerTier}
              onChange={(e) => setCustomerTier(e.target.value)}
              options={[
                { value: 'Enterprise Tier', label: 'Enterprise Tier (Max 20% discount)' },
                { value: 'Gold Tier', label: 'Gold Tier (Max 15% discount)' },
                { value: 'Silver Tier', label: 'Silver Tier (Max 10% discount)' },
                { value: 'Bronze Tier', label: 'Bronze Tier (Max 5% discount)' },
              ]}
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Initial Solution Line
            </div>

            <Select
              label="Product / Service"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.sku}) - ₹${p.basePrice.toLocaleString('en-IN')}`,
              }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={initialQty}
                onChange={(e) => setInitialQty(e.target.value)}
              />
              <Input
                label="Discount (%)"
                type="number"
                min="0"
                max="90"
                value={initialDiscount}
                onChange={(e) => setInitialDiscount(e.target.value)}
                helperText="Live threshold checking will apply in CPQ"
              />
            </div>
          </div>

          <TextArea
            label="Deal Context & Commercial Notes"
            placeholder="Special delivery schedule, branch locations, GST requirements..."
            value={quoteNotes}
            onChange={(e) => setQuoteNotes(e.target.value)}
            rows={2}
          />
        </form>
      </Modal>
    </div>
  );
}
