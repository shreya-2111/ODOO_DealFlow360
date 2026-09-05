import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, TextArea } from '../../components/ui/Input';
import {
  Plus,
  Search,
  ArrowRight
} from 'lucide-react';

export function ProductCatalog() {
  const navigate = useNavigate();
  const { products, setProducts } = useData();
  const { addToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product state in INR
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [type, setType] = useState('one_time');
  const [basePrice, setBasePrice] = useState(55000);
  const [unitCost, setUnitCost] = useState(32000);
  const [description, setDescription] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!name || !sku) {
      addToast('Please specify product name and SKU', 'warning');
      return;
    }

    const newProd = {
      id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name,
      sku,
      category,
      type,
      cadence: type === 'recurring' ? 'monthly' : undefined,
      basePrice: Number(basePrice),
      unitCost: Number(unitCost),
      taxRate: 18.0, // 18% GST
      inventoryCount: 40,
      leadTimeDays: category === 'Hardware' ? 3 : 0,
      description: description || 'Configured master SKU in INR',
      variants: [
        { id: 'v1', name: 'Standard Edition', sku: `${sku}-STD`, priceDelta: 0 }
      ],
      currencyPricing: {
        INR: Number(basePrice),
        USD: Math.round(Number(basePrice) / 83),
        EUR: Math.round(Number(basePrice) / 90)
      }
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    addToast(`Product ${name} (${sku}) created in INR and added to CPQ catalog!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Product Master & Pricing Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure SKUs, GST pricelists, product variants, and gross margin guardrails (INR ₹)
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Product SKU
        </Button>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Hardware Solutions', count: products.filter((p) => p.category === 'Hardware').length, desc: 'Max 15% discount limit' },
          { label: 'Cloud Subscriptions & AMC', count: products.filter((p) => p.category === 'Cloud Subscriptions').length, desc: 'Max 20% discount limit' },
          { label: 'Professional Services', count: products.filter((p) => p.category === 'Professional Services').length, desc: 'Max 10% discount limit' },
          { label: 'Accessories & Cabling', count: products.filter((p) => p.category === 'Accessories').length, desc: 'Max 25% discount limit' },
        ].map((cat, idx) => (
          <Card key={idx} className="border-slate-200">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-slate-700">{cat.label}</span>
              <div className="mt-2 text-xl font-bold text-slate-900">{cat.count} Active Items</div>
              <p className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product List Card */}
      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Cloud Subscriptions">Cloud Subscriptions</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="px-5 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Billing Cadence</th>
                <th className="px-4 py-3 text-right">Base List (INR ₹)</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-right">Target Margin</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No products in catalog. Click "Add New Product" above to configure your enterprise offerings.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                const marginPct = p.basePrice > 0 ? (((p.basePrice - p.unitCost) / p.basePrice) * 100).toFixed(0) : 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.sku} • {p.id}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="default" size="sm">
                        {p.category}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <span className="capitalize font-medium text-slate-700">
                        {p.type === 'recurring' ? `${p.cadence} Subscription` : 'One-time CapEx'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-slate-900">
                      ₹{p.basePrice.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-500">
                      ₹{p.unitCost.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-emerald-700">
                      {marginPct}%
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${p.id}`);
                        }}
                      >
                        Configure SKU
                      </Button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Master Product SKU"
        description="Register new hardware, recurring license, or service offering in INR"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProduct}>
              Save to Catalog
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-left">
          <Input
            label="Product Title"
            placeholder="e.g. Cisco Gigabit Managed Switch 24-Port"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Master SKU Code"
              placeholder="e.g. HW-NET-CS24"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
            <Select
              label="Product Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Hardware', label: 'Hardware' },
                { value: 'Cloud Subscriptions', label: 'Cloud Subscriptions' },
                { value: 'Professional Services', label: 'Professional Services' },
                { value: 'Accessories', label: 'Accessories' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Base List Price (INR ₹)"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
            <Input
              label="Standard Unit Cost (INR ₹)"
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
            />
          </div>

          <Select
            label="Revenue Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'one_time', label: 'One-Time Delivery (CapEx)' },
              { value: 'recurring', label: 'Monthly Recurring Subscription (OpEx)' }
            ]}
          />

          <TextArea
            label="Product Description & Technical Specifications"
            placeholder="Key technical specs, memory, throughput, SLA..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </form>
      </Modal>
    </div>
  );
}
