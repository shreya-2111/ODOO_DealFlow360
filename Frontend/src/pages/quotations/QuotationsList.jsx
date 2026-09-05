import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, TextArea } from '../../components/ui/Input';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Building,
  IndianRupee
} from 'lucide-react';

export function QuotationsList() {
  const navigate = useNavigate();
  const { quotations, addQuotation, products, calculateQuoteFinancials } = useData();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeStageTab, setActiveStageTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New quotation form state
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [customerTier, setCustomerTier] = useState('Enterprise Tier');
  const [currency, setCurrency] = useState('INR');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'PRD-101');
  const [initialQty, setInitialQty] = useState(1);
  const [initialDiscount, setInitialDiscount] = useState(5);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Filtering
  const filteredQuotations = quotations.filter((q) => {
    const matchesStage =
      activeStageTab === 'ALL' ||
      (activeStageTab === 'DRAFT' && q.status === 'Draft') ||
      (activeStageTab === 'PENDING' && q.status === 'Pending Approval') ||
      (activeStageTab === 'APPROVED' && q.status === 'Approved') ||
      (activeStageTab === 'CONFIRMED' && q.status === 'Confirmed');

    const matchesTier = tierFilter === 'ALL' || q.customerTier === tierFilter;

    const matchesSearch =
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.salesRep.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStage && matchesTier && matchesSearch;
  });

  const handleCreateQuote = (e) => {
    e.preventDefault();
    if (!customerName || !contactPerson) {
      addToast('Please provide customer name and primary contact person', 'warning');
      return;
    }

    const prd = products.find((p) => p.id === selectedProductId) || products[0];
    const newQuoteId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuote = {
      id: newQuoteId,
      customerName,
      contactPerson,
      contactEmail: contactEmail || `${contactPerson.toLowerCase().replace(/\s+/g, '.')}@${customerName.toLowerCase().replace(/\s+/g, '')}.in`,
      customerTier,
      salesRep: currentUser.name,
      status: 'Draft',
      createdAt: new Date().toISOString().substring(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      currency: 'INR',
      urgencyScore: 50,
      notes: quoteNotes || 'Initial proposal draft created in CPQ engine.',
      items: [
        {
          id: `item-${Date.now()}`,
          productId: prd.id,
          productName: prd.name,
          sku: prd.sku,
          category: prd.category,
          type: prd.type,
          cadence: prd.cadence || 'one_time',
          quantity: Number(initialQty),
          unitPrice: prd.basePrice,
          unitCost: prd.unitCost,
          discountPercent: Number(initialDiscount),
          taxRate: prd.taxRate
        }
      ],
      approvalSteps: [
        { stepNumber: 1, role: 'Sales Rep Submission', user: currentUser.name, status: 'pending', timestamp: null },
        { stepNumber: 2, role: 'Sales VP Regional Approval', user: 'Priya Patel', status: 'upcoming', timestamp: null },
        { stepNumber: 3, role: 'Finance Controller', user: 'Rajesh Verma', status: 'upcoming', timestamp: null },
        { stepNumber: 4, role: 'Customer Confirmation', user: contactPerson, status: 'upcoming', timestamp: null }
      ],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: currentUser.name,
          action: 'Created new quotation draft'
        }
      ],
      customerNotes: ''
    };

    addQuotation(newQuote);
    setIsNewModalOpen(false);
    addToast(`Quotation ${newQuoteId} created! Opening CPQ editor...`, 'success');
    navigate(`/quotations/${newQuoteId}`);
  };

  const stageCounts = {
    ALL: quotations.length,
    DRAFT: quotations.filter((q) => q.status === 'Draft').length,
    PENDING: quotations.filter((q) => q.status === 'Pending Approval').length,
    APPROVED: quotations.filter((q) => q.status === 'Approved').length,
    CONFIRMED: quotations.filter((q) => q.status === 'Confirmed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quotations & CPQ Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure line items, validate pricing tiers, apply discounts, and route for approvals (INR ₹)
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
            { id: 'DRAFT', label: 'Drafts', count: stageCounts.DRAFT },
            { id: 'PENDING', label: 'Pending Approval', count: stageCounts.PENDING, badgeClass: 'bg-amber-100 text-amber-800' },
            { id: 'APPROVED', label: 'Approved (Ready to Send)', count: stageCounts.APPROVED, badgeClass: 'bg-blue-100 text-blue-800' },
            { id: 'CONFIRMED', label: 'Confirmed / Won', count: stageCounts.CONFIRMED, badgeClass: 'bg-emerald-100 text-emerald-800' },
          ].map((tab) => {
            const isActive = activeStageTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStageTab(tab.id)}
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
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quote #, client, rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Tier:
            </span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="Enterprise Tier">Enterprise Tier (20% ceiling)</option>
              <option value="Gold Tier">Gold Tier (15% ceiling)</option>
              <option value="Silver Tier">Silver Tier (10% ceiling)</option>
              <option value="Bronze Tier">Bronze Tier (5% ceiling)</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Quote ID & Customer</th>
                <th className="px-4 py-3">Customer Tier</th>
                <th className="px-4 py-3">Sales Rep</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Net (INR)</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No quotations found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => {
                  const fin = calculateQuoteFinancials(quote.items, quote.customerTier);
                  const isPending = quote.status === 'Pending Approval';
                  const isDraft = quote.status === 'Draft';
                  const isApproved = quote.status === 'Approved';
                  const isConfirmed = quote.status === 'Confirmed';

                  const statusVariant = isConfirmed
                    ? 'success'
                    : isApproved
                    ? 'brand'
                    : isPending
                    ? 'warning'
                    : 'default';

                  const riskVariant =
                    quote.riskLevel === 'HIGH'
                      ? 'danger'
                      : quote.riskLevel === 'MEDIUM'
                      ? 'warning'
                      : 'success';

                  return (
                    <tr
                      key={quote.id}
                      onClick={() => navigate(`/quotations/${quote.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {quote.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-slate-500 font-semibold">{quote.id}</span>
                          <span>•</span>
                          <span>{quote.contactPerson}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="default" size="sm">
                          {quote.customerTier}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">
                        {quote.salesRep}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={riskVariant} size="sm">
                            {quote.riskLevel} RISK
                          </Badge>
                          {quote.riskLevel === 'HIGH' && (
                            <span className="text-[10px] text-rose-600 font-medium">
                              Discount breach flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant} size="sm" dot>
                          {quote.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          ₹{Math.round(fin.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Margin: <span className="text-emerald-700 font-semibold">{fin.grossMargin}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quotations/${quote.id}`);
                            }}
                          >
                            Configure CPQ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Quotation Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Quotation (CPQ)"
        description="Initialize customer proposal and configure primary solution line"
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
