import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Scale,
  Zap,
  Info,
  IndianRupee
} from 'lucide-react';

export function GovernanceSettings() {
  const { governanceRules, setGovernanceRules } = useData();
  const { addToast } = useToast();

  const [tierCeilings, setTierCeilings] = useState({ ...governanceRules.tierCeilings });
  const [categoryCeilings, setCategoryCeilings] = useState({ ...governanceRules.categoryCeilings });

  const handleTierChange = (tier, val) => {
    setTierCeilings((prev) => ({ ...prev, [tier]: Number(val) }));
  };

  const handleCategoryChange = (cat, val) => {
    setCategoryCeilings((prev) => ({ ...prev, [cat]: Number(val) }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setGovernanceRules((prev) => ({
      ...prev,
      tierCeilings,
      categoryCeilings
    }));
    addToast('Governance discount rules and approval triggers updated across CPQ!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Governance, Discount Ceilings & Approval Rules
            </h1>
            <Badge variant="brand" size="sm">
              Live CPQ Engine Policy (INR ₹)
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated commercial concession thresholds, tier ceilings & multi-gate approval triggers
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Save}
          onClick={handleSaveSettings}
        >
          Save Policy Rules
        </Button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Customer Account Tier Ceilings */}
        <Card>
          <CardHeader
            title="1. Customer Account Tier Discount Ceilings"
            description="Maximum baseline concession allowance permitted for sales reps without escalation"
          />
          <CardContent className="p-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(tierCeilings).map(([tier, limit]) => (
                <div key={tier} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{tier}</span>
                    <Badge variant="brand" size="sm">{limit}% Max</Badge>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Max Authorized Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={limit}
                      onChange={(e) => handleTierChange(tier, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Product Category Ceilings */}
        <Card>
          <CardHeader
            title="2. Product Category Concession Ceilings"
            description="Category-specific limits protecting high-cost server hardware and on-site engineering margins"
          />
          <CardContent className="p-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(categoryCeilings).map(([category, limit]) => (
                <div key={category} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{category}</span>
                    <Badge variant="warning" size="sm">{limit}% Max</Badge>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Category Hard Ceiling (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={limit}
                      onChange={(e) => handleCategoryChange(category, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Automated Approval Chain Routing Trigger Matrix */}
        <Card>
          <CardHeader
            title="3. Approval Trigger Matrix & Escalation Gates"
            description="Autonomous routing policies when CPQ line items violate standard governance ceilings"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="px-5 py-3">Governance Rule Condition</th>
                  <th className="px-4 py-3">Required Approval Gate</th>
                  <th className="px-5 py-3 text-right">Enforcement Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {governanceRules.approvalTriggers.map((trig, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{trig.rule}</span>
                    </td>
                    <td className="px-4 py-4 font-bold text-brand-700">
                      {trig.level}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Badge variant="success" size="sm">
                        Strict Automated Gate
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Changes to these governance ceilings immediately take effect across all active CPQ quotation sessions and approval queues.
            </span>
          </div>
        </Card>
      </form>
    </div>
  );
}
