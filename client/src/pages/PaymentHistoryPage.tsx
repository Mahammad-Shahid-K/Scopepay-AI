import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { Payment, Invoice, Project } from '../types';

export const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [payList, invList, projList] = await Promise.all([
        api.getPayments(),
        api.getInvoices(),
        api.getProjects()
      ]);
      setPayments(payList);
      setInvoices(invList);
      setProjects(projList);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCaptured = payments
    .filter(p => p.status === 'captured')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const filteredPayments = payments.filter(p => {
    const q = search.toLowerCase();
    return (
      p.paypal_order_id.toLowerCase().includes(q) ||
      (p.paypal_capture_id && p.paypal_capture_id.toLowerCase().includes(q)) ||
      (p.payer_name && p.payer_name.toLowerCase().includes(q)) ||
      (p.payer_email && p.payer_email.toLowerCase().includes(q))
    );
  });

  const getInvoiceNumber = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    return inv ? inv.invoice_number : 'INV-PAY';
  };

  const getProject = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    if (!inv) return null;
    return projects.find(p => p.id === inv.project_id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB] dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-gray-100">Payment History</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
            Verified backend transactions captured through PayPal Sandbox.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] text-[#6B7280] dark:text-gray-400 block">Total Verified Volume</span>
            <span className="text-lg font-extrabold text-[#15803D] dark:text-emerald-400">
              ${totalCaptured.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Filter / Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by PayPal Order ID, Capture ID, or Payer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#1A2234] text-[#111827] dark:text-gray-100 border border-[#E5E7EB] dark:border-gray-700 rounded-md focus:ring-1 focus:ring-red-500 focus:border-[#DC2626] dark:focus:border-red-500 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#DC2626] dark:text-red-400 bg-[#FEF2F2] dark:bg-red-950/40 px-2.5 py-1 rounded border border-red-200 dark:border-red-900/50">
              PayPal Sandbox Environment
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#6B7280]">Loading payment history...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CreditCard className="w-6 h-6" />}
                title="No payment records found"
                description="Payments captured via PayPal Sandbox checkout will appear here once verified by the server."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-[#161F30] text-[#6B7280] dark:text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">PayPal Transaction Reference</th>
                    <th className="py-3 px-6">Invoice</th>
                    <th className="py-3 px-6">Project & Payer</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
                  {filteredPayments.map(payment => {
                    const project = getProject(payment.invoice_id);
                    return (
                      <tr key={payment.id} className="hover:bg-[#F9FAFB] dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-6 font-mono">
                          <div className="font-bold text-[#111827] dark:text-gray-100">
                            {payment.paypal_capture_id || payment.paypal_order_id}
                          </div>
                          {payment.paypal_capture_id && (
                            <span className="text-[10px] text-[#6B7280] dark:text-gray-400">
                              Order: {payment.paypal_order_id}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#111827] dark:text-gray-100">
                          {getInvoiceNumber(payment.invoice_id)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-[#111827] dark:text-gray-100">
                            {project?.title || 'Direct Client Order'}
                          </div>
                          <span className="text-[11px] text-[#6B7280] dark:text-gray-400">
                            {payment.payer_name || payment.payer_email || 'Sandbox Buyer'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#15803D] dark:text-emerald-400">
                          +${Number(payment.amount).toFixed(2)} {payment.currency}
                        </td>
                        <td className="py-4 px-6 text-[#6B7280] dark:text-gray-400">
                          {new Date(payment.captured_at || payment.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Badge status="paid" label="Verified Captured" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
