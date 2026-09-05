import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, TextArea } from '../../components/ui/Input';
import {
  Package,
  FileSpreadsheet,
  Percent,
  GitBranch,
  Building,
  Repeat,
  Plus,
  Edit2,
  Save,
  Search
} from 'lucide-react';

export function GovernanceSettings() {
  const { products, setProducts, warehouses } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('products');

  // --- 1. Products Section State ---
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    type: 'one_time',
    basePrice: 50000,
    unitCost: 30000,
    stock: 20,
    description: ''
  });

  // --- 2. Price Lists State (Empty for pure UI)
  const [priceLists] = useState([]);

  // --- 3. Discount Tiers State ---
  const [discountTiers] = useState([
    { id: 'T1', tier: 'Tier 1 — Standard Rep', minDiscount: 0, maxDiscount: 10, approvalRequired: 'No Approval Needed', approver: 'Self / Sales Rep' },
    { id: 'T2', tier: 'Tier 2 — Manager Gate', minDiscount: 10.1, maxDiscount: 20, approvalRequired: 'Sales Manager Approval', approver: 'Priya Patel (Sales Manager)' },
    { id: 'T3', tier: 'Tier 3 — Finance Exception', minDiscount: 20.1, maxDiscount: 35, approvalRequired: 'Finance & Controller Gate', approver: 'Rajesh Verma (Finance / Ops)' },
    { id: 'T4', tier: 'Tier 4 — Executive Signoff', minDiscount: 35.1, maxDiscount: 50, approvalRequired: 'VP Revenue & CFO Signoff', approver: 'Executive Committee' }
  ]);

  // --- 4. Approval Chains State ---
  const [approvalChains] = useState([
    {
      id: 'AC-1',
      name: 'Standard Concession Chain (<20% Discount)',
      steps: ['Sales Rep Submission', 'Sales Manager Approval'],
      condition: 'Discount between 10% and 20% OR Quote total < ₹10 Lakh',
      status: 'Active'
    },
    {
      id: 'AC-2',
      name: 'High-Risk Multi-Gate Chain (>20% or >₹10L)',
      steps: ['Sales Rep Submission', 'Sales Manager Approval', 'Finance / Operations Controller'],
      condition: 'Discount > 20% OR Hardware breach OR Order > ₹10 Lakh',
      status: 'Active'
    },
    {
      id: 'AC-3',
      name: 'Customer Re-Approval Loop',
      steps: ['Customer Counter Submitted', 'Sales Manager Review', 'Finance Signoff (if breach)'],
      condition: 'Customer portal counter-discount exceeds original approved baseline',
      status: 'Active'
    }
  ]);

  // --- 6. Subscription Plans State ---
  const [subscriptionPlans] = useState([
    {
      id: 'PLAN-BI',
      name: 'Business Analytics & BI Suite',
      price: 12000,
      cadence: 'monthly',
      features: 'Executive Dashboards, Real-time ingestion, Export tools, 15 User seats',
      status: 'Active'
    },
    {
      id: 'PLAN-STRG',
      name: 'Cloud Storage Pro (10TB)',
      price: 4500,
      cadence: 'monthly',
      features: 'S3-compatible, Ransomware protection, Immutable backups, 99.999% SLA',
      status: 'Active'
    },
    {
      id: 'PLAN-AMC',
      name: '24/7 Managed AMC Support SLA',
      price: 8500,
      cadence: 'monthly',
      features: '30-min response SLA, On-site engineer visit, Spare nodes, Dedicated TAM',
      status: 'Active'
    },
    {
      id: 'PLAN-SEC',
      name: 'Security Antivirus Endpoint Shield',
      price: 1500,
      cadence: 'monthly',
      features: 'Zero-trust endpoint detection, Behavioral anti-malware, Central cloud console',
      status: 'Active'
    }
  ]);

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Hardware',
      type: 'one_time',
      basePrice: 50000,
      unitCost: 30000,
      stock: 25,
      description: ''
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    setProductForm({ ...p });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productForm } : p)));
      addToast(`Product ${productForm.name} updated successfully!`, 'success');
    } else {
      const newPrd = {
        id: `PRD-${products.length + 101}`,
        ...productForm,
        margin: (((productForm.basePrice - productForm.unitCost) / productForm.basePrice) * 100).toFixed(1)
      };
      setProducts((prev) => [...prev, newPrd]);
      addToast(`New product ${newPrd.name} added to master catalog!`, 'success');
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold uppercase">
              Admin & Governance OS
            </span>
            <span className="text-xs text-slate-400">• Master Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Platform Governance & Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure product catalog, price lists, discount tiers, approval chains, regional warehouses & SaaS plans
          </p>
        </div>
      </div>

      {/* 6 TABS NAV (Requirement 19) */}
      <Card>
        <div className="border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'products', label: '1. Products Master', icon: Package, count: products.length },
            { id: 'pricelists', label: '2. Price Lists', icon: FileSpreadsheet, count: priceLists.length },
            { id: 'discounttiers', label: '3. Discount Tiers', icon: Percent, count: discountTiers.length },
            { id: 'approvalchains', label: '4. Approval Chains', icon: GitBranch, count: approvalChains.length },
            { id: 'warehouses', label: '5. Warehouses', icon: Building, count: warehouses.length },
            { id: 'subscriptions', label: '6. Subscription Plans', icon: Repeat, count: subscriptionPlans.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${
                  isActive
                    ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRODUCTS MASTER */}
        {activeTab === 'products' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by SKU or title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleOpenAddProduct}
              >
                Add Product
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="px-5 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 font-mono">SKU</th>
                    <th className="px-4 py-3 text-right">Price (INR ₹)</th>
                    <th className="px-4 py-3 text-right">Unit Cost</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        No products configured in catalog. Click "Add Product" above to create one.
                      </td>
                    </tr>
                  ) : (
                    products
                      .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                          <td className="px-4 py-3.5">
                            <Badge variant="default" size="sm">{p.category}</Badge>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-600">{p.sku}</td>
                          <td className="px-4 py-3.5 text-right font-black text-slate-900">
                            ₹{p.basePrice?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5 text-right text-slate-600">
                            ₹{p.unitCost?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-slate-800">{p.stock}</td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Edit2}
                              onClick={() => handleEditProduct(p)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRICE LISTS */}
        {activeTab === 'pricelists' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Commercial Price Lists</h3>
                <p className="text-xs text-slate-500">Segmented pricing rules in Indian Rupees (INR ₹)</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  addToast('Price list creation wizard opened', 'info');
                }}
              >
                Create Price List
              </Button>
            </div>

            {priceLists.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No custom price lists configured. Click "Create Price List" to establish pricing tiers.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priceLists.map((pl) => (
                  <div key={pl.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" size="sm">{pl.currency}</Badge>
                      <Badge variant="success" size="sm">{pl.status}</Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{pl.name}</h4>
                    <p className="text-slate-600 text-[11px]">Segment: {pl.segment}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                      <span>{pl.productCount} Products Configured</span>
                      <span className="font-medium text-brand-700">Effective: {pl.effectiveDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISCOUNT TIERS */}
        {activeTab === 'discounttiers' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Governance Discount Tiers & Authorization Limits</h3>
                <p className="text-xs text-slate-500">Define minimum/maximum discount ranges and associated approver gates</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="px-5 py-3">Discount Tier</th>
                    <th className="px-4 py-3 text-center">Minimum Discount</th>
                    <th className="px-4 py-3 text-center">Maximum Discount</th>
                    <th className="px-4 py-3">Approval Requirement</th>
                    <th className="px-5 py-3">Designated Approver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discountTiers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{t.tier}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{t.minDiscount}%</td>
                      <td className="px-4 py-3.5 text-center font-bold text-brand-700">{t.maxDiscount}%</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={t.maxDiscount <= 10 ? 'success' : t.maxDiscount <= 20 ? 'warning' : 'danger'} size="sm">
                          {t.approvalRequired}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{t.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: APPROVAL CHAINS */}
        {activeTab === 'approvalchains' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Autonomous Multi-Gate Approval Chains</h3>
                <p className="text-xs text-slate-500">Configure Sales Manager → Finance escalation workflows and conditions</p>
              </div>
            </div>

            <div className="space-y-3">
              {approvalChains.map((ac) => (
                <div key={ac.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{ac.name}</span>
                    <Badge variant="brand" size="sm">{ac.status}</Badge>
                  </div>
                  <p className="text-slate-600">
                    <strong>Trigger Condition:</strong> {ac.condition}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Chain Sequence:</span>
                    {ac.steps.map((s, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-800">
                          {s}
                        </span>
                        {idx < ac.steps.length - 1 && <span className="text-slate-400 font-bold">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WAREHOUSES */}
        {activeTab === 'warehouses' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Regional Warehouses & Logistics Hubs</h3>
                <p className="text-xs text-slate-500">Manage fulfillment depots, regional inventory, and priority split order</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouses.map((wh) => (
                <div key={wh.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-slate-900 text-sm">{wh.name}</span>
                    </div>
                    <Badge variant="brand" size="sm">Priority #{wh.priority || 1}</Badge>
                  </div>
                  <p className="text-slate-600 text-[11px]">{wh.location}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-700">
                    <span>Total Stock: <strong>{wh.stockCount || 850} units</strong></span>
                    <span className="text-emerald-700 font-bold">Shipment Cost: ₹{wh.shipmentCostPerUnit || 400}/unit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SUBSCRIPTION PLANS */}
        {activeTab === 'subscriptions' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recurring SaaS & Support Plans Master</h3>
                <p className="text-xs text-slate-500">Manage plan pricing, billing cadences, and SLA features</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                    <Badge variant="success" size="sm">{plan.status}</Badge>
                  </div>
                  <div className="text-base font-black text-brand-700">
                    ₹{plan.price.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/ {plan.cadence}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Included Features:</strong> {plan.features}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Add Master Product to Catalog'}
        description="Configure commercial SKU, pricing, unit cost, and stock in INR ₹"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Save} onClick={handleSaveProduct}>
              Save Product
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-3 text-left text-xs">
          <Input
            label="Product Title"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              options={[
                { value: 'Hardware', label: 'Hardware' },
                { value: 'Subscriptions', label: 'Subscriptions' },
                { value: 'Services', label: 'Services' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Selling Price (₹)"
              type="number"
              min="0"
              value={productForm.basePrice}
              onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })}
              required
            />
            <Input
              label="Unit Cost (₹)"
              type="number"
              min="0"
              value={productForm.unitCost}
              onChange={(e) => setProductForm({ ...productForm, unitCost: Number(e.target.value) })}
              required
            />
            <Input
              label="Stock Qty"
              type="number"
              min="0"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
              required
            />
          </div>

          <TextArea
            label="Product Specifications & SLA Details"
            rows={2}
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
