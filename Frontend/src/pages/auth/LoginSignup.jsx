import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ShieldCheck,
  ArrowRight,
  Building,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export function LoginSignup() {
  const { roles, switchRole, tenant, setTenant } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const [fullName, setFullName] = useState('Amit Sharma');
  const [tenantName, setLocalTenant] = useState('Tata & Reliance Enterprise Cloud');
  const [email, setEmail] = useState('amit.sharma@dealflow360.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    const r = roles.find((role) => role.id === roleId);
    if (r) {
      setFullName(r.name);
      if (roleId === 'sales_rep') setEmail('amit.sharma@dealflow360.in');
      else if (roleId === 'sales_manager') setEmail('priya.patel@dealflow360.in');
      else if (roleId === 'finance_officer') setEmail('rajesh.verma@dealflow360.in');
      else if (roleId === 'ops_lead') setEmail('suresh.kumar@dealflow360.in');
      else if (roleId === 'admin') setEmail('neha.gupta@dealflow360.in');
      else if (roleId === 'customer') setEmail('v.malhotra@relianceinfotech.in');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switchRole(selectedRole);
    setTenant(tenantName);

    const activeRoleObj = roles.find((r) => r.id === selectedRole);
    if (isRegisterMode) {
      addToast(`Account created! Logged in as ${fullName} (${activeRoleObj?.role})`, 'success');
    } else {
      addToast(`Welcome back, ${fullName}! (${activeRoleObj?.role})`, 'success');
    }

    if (selectedRole === 'customer') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Brand Logo & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-2xl shadow-md mb-2">
          360
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          DealFlow<span className="text-brand-600">360</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          B2B Deal Management, CPQ, Fulfillment & Billing OS (INR ₹)
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <Card className="border-slate-200/90 shadow-xl overflow-hidden">
          {/* Mode Switcher Tabs: Login vs Register */}
          <div className="flex border-b border-slate-200 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setIsRegisterMode(false)}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition-all ${
                !isRegisterMode
                  ? 'bg-white text-brand-700 border-b-2 border-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterMode(true)}
              className={`flex-1 py-3.5 text-center text-xs font-bold transition-all ${
                isRegisterMode
                  ? 'bg-white text-brand-700 border-b-2 border-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register / New User
            </button>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dropdown for Role Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Select User Role</span>
                  <span className="text-[10px] text-brand-600 font-medium">Role-Based Access</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer shadow-xs"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.role} — ({r.name}, {r.team})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Active Persona: <strong className="text-slate-800">{roles.find(r => r.id === selectedRole)?.name}</strong> ({roles.find(r => r.id === selectedRole)?.role})
                </p>
              </div>

              {/* Full Name field (if Register) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Organization / Company */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setLocalTenant(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Quick Persona 1-Click Picker */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Or Quick-Pick Demo Persona:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id)}
                        className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-6 h-6 rounded-full object-cover mb-1 border border-slate-200"
                        />
                        <span className="text-[9px] truncate w-full">{r.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center shadow-md font-bold text-sm"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {isRegisterMode ? 'Complete Registration & Open Portal' : 'Sign In & Launch DealFlow360'}
                </Button>
              </div>
            </form>
          </CardContent>

          {/* Security & Currency Footer */}
          <div className="bg-slate-50/90 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              SOC2 & GST Invoicing Enforced
            </span>
            <span className="font-semibold text-brand-700">Currency: INR (₹)</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
