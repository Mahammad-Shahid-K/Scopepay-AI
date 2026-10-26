import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  ShieldCheck,
  Save,
  Key,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Profile } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [businessName, setBusinessName] = useState(user?.business_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.default_currency || 'USD');
  const [geminiKey, setGeminiKey] = useState('');
  const [hasServerGeminiKey, setHasServerGeminiKey] = useState(false);
  const [hasServerPayPalKeys, setHasServerPayPalKeys] = useState(false);
  const [paypalMode, setPaypalMode] = useState('sandbox');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const profile = await api.getSettings();
        setFullName(profile.full_name);
        setBusinessName(profile.business_name);
        setEmail(profile.email);
        setCurrency(profile.default_currency || 'USD');
        setHasServerGeminiKey(Boolean(profile.hasGeminiKey));
        setHasServerPayPalKeys(Boolean(profile.hasPayPalKeys));
        if (profile.paypalMode) setPaypalMode(profile.paypalMode);
      } catch (err: any) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      const updated = await api.updateSettings({
        full_name: fullName,
        business_name: businessName,
        email,
        default_currency: currency,
        gemini_api_key: geminiKey.trim() || undefined
      });
      await updateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Settings & Profile</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage your freelancer identity, default billing currency, and API connections.
        </p>
      </div>

      {savedSuccess && (
        <Alert type="success" title="Success">
          Profile and settings updated successfully.
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Notice">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Freelancer & Studio Profile</CardTitle>
            <p className="text-xs text-[#6B7280]">
              This information appears on quotations, customer invoices, and PayPal checkout receipts.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Alex Rivera"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
              <Input
                label="Business / Studio Name"
                placeholder="Rivera Creative Tech & Design"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Email"
                type="email"
                placeholder="alex@riveracreative.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-[#111827] bg-white border border-[#E5E7EB] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-[#DC2626]"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="CAD">CAD - Canadian Dollar ($)</option>
                  <option value="AUD">AUD - Australian Dollar ($)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Integrations Card */}
        <Card>
          <CardHeader>
            <CardTitle>AI & PayPal Sandbox Configuration</CardTitle>
            <p className="text-xs text-[#6B7280]">
              Service connections powering AI scope analysis and sandbox payments.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            {/* Gemini API */}
            <div className="p-4 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#DC2626]" />
                  <span className="font-bold text-[#111827]">Google Gemini API</span>
                </div>
                {hasServerGeminiKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded border border-green-200">
                    <CheckCircle2 className="w-3 h-3" /> Active on Server
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded border border-amber-200">
                    Fallback AI Active
                  </span>
                )}
              </div>

              <Input
                label="Custom Gemini API Key (Optional)"
                type="password"
                placeholder={hasServerGeminiKey ? 'Using server environment key' : 'Enter AIzaSy...'}
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                helperText="If omitted, ScopePay AI uses configured server environment variables or structured local synthesis."
              />
            </div>

            {/* PayPal Sandbox Status */}
            <div className="p-4 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#DC2626]" />
                  <span className="font-bold text-[#111827]">PayPal Environment</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-red-200">
                  SANDBOX
                </span>
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Transactions use the PayPal Sandbox simulation environment (`api-m.sandbox.paypal.com`).
                Amounts are recalculation-validated on the backend and never trusted from client-side scripts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4" />}
          >
            Log Out
          </Button>

          <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
