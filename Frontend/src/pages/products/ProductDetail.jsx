import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  ArrowLeft,
  Package,
  Layers,
  Globe,
  Plus,
  ShieldCheck,
  IndianRupee,
  TrendingUp
} from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, governanceRules } = useData();
  const { addToast } = useToast();

  const product = products.find((p) => p.id === id);

  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [variantName, setVariantName] = useState('');
  const [variantSku, setVariantSku] = useState('');
  const [variantDelta, setVariantDelta] = useState(25000);

  if (!product) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/products')}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  const categoryCeiling = governanceRules.categoryCeilings[product.category] || 15;
  const marginPct = product.basePrice > 0 ? (((product.basePrice - product.unitCost) / product.basePrice) * 100).toFixed(0) : 0;

  const handleAddVariant = (e) => {
    e.preventDefault();
    if (!variantName) {
      addToast('Please provide a variant title', 'warning');
      return;
    }
    product.variants.push({
      id: `v-${Date.now()}`,
      name: variantName,
      sku: variantSku || `${product.sku}-VAR`,
      priceDelta: Number(variantDelta)
    });
    setIsAddVariantModalOpen(false);
    addToast(`Added variant ${variantName} to ${product.name}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/products')}
          >
            Catalog
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
              <Badge variant="brand" size="sm">
                {product.category}
              </Badge>
              <Badge variant="default" size="sm">
                {product.sku}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Product ID: {product.id} • Lead Time: {product.leadTimeDays} days • Max Discount Ceiling: {categoryCeiling}%
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddVariantModalOpen(true)}
        >
          Add SKU Variant
        </Button>
      </div>

      {/* Description & KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Base List Price (INR)</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{product.basePrice.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Standard Unit Cost</span>
            <div className="text-xl font-bold text-slate-700 mt-1">
              ₹{product.unitCost.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Gross Margin %</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              {marginPct}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Governance Ceiling</span>
            <div className="text-xl font-bold text-amber-700 mt-1">
              Max {categoryCeiling}% Off
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description Note */}
      <Card>
        <CardHeader title="Product Overview & Specifications" />
        <CardContent className="p-5 pt-0 text-xs text-slate-600 leading-relaxed">
          {product.description}
        </CardContent>
      </Card>

      {/* Grid: Variant Matrix + Multi-Currency Pricelist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variant Configuration Matrix */}
        <Card>
          <CardHeader
            title="Configurable SKU Variants"
            description="Hardware memory, storage tiers & licensing options in CPQ"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Variant Specification</th>
                  <th className="px-4 py-3">Variant SKU</th>
                  <th className="px-5 py-3 text-right">Price Delta (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.variants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{v.name}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{v.sku}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-brand-700">
                      {v.priceDelta > 0 ? `+₹${v.priceDelta.toLocaleString('en-IN')}` : 'Base Price Included'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Multi-Currency Matrix */}
        <Card>
          <CardHeader
            title="Multi-Currency Tier Pricelist"
            description="Automatic currency rate parity across Indian and international sales regions"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Currency</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-5 py-3 text-right">Standard List Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" /> INR (₹)
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">India Domestic (Base Currency)</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-brand-600" /> USD ($)
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">North America & Global Direct</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                    ${Math.round(product.basePrice / 83).toLocaleString()}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" /> EUR (€)
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">European Union EMEA</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                    €{Math.round(product.basePrice / 90).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Variant Modal */}
      <Modal
        isOpen={isAddVariantModalOpen}
        onClose={() => setIsAddVariantModalOpen(false)}
        title={`Add Variant to ${product.name}`}
        description="Define new hardware spec, capacity tier, or service variant in INR"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddVariantModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddVariant}>
              Save Variant
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddVariant} className="space-y-4 text-left">
          <Input
            label="Variant Name"
            placeholder="e.g. 256GB ECC RAM / 8TB NVMe High-Capacity"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            required
          />
          <Input
            label="Variant Sub-SKU"
            placeholder="e.g. HW-SRV-DELL-8TB"
            value={variantSku}
            onChange={(e) => setVariantSku(e.target.value)}
          />
          <Input
            label="Price Delta (INR ₹)"
            type="number"
            value={variantDelta}
            onChange={(e) => setVariantDelta(e.target.value)}
            helperText="Amount added to base product price in CPQ"
            required
          />
        </form>
      </Modal>
    </div>
  );
}
