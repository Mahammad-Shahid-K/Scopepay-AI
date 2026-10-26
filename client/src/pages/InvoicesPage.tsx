import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { Invoice, Project } from '../types';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invs, projs] = await Promise.all([
        api.getInvoices(),
        api.getProjects()
      ]);
      setInvoices(invs);
      setProjects(projs);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = (shareToken: string, id: string) => {
    const url = `${window.location.origin}/pay/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Metrics
  const totalCount = invoices.length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const failedInvoices = invoices.filter(i => ['failed', 'cancelled'].includes(i.status));

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProject = (projId: string) => {
    return projects.find(p => p.id === projId);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Invoices</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Track customer payment requests, share PayPal Sandbox checkout links, and view verified transaction statuses.
          </p>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase">Total Invoices</span>
            <p className="text-xl font-bold text-[#111827] mt-1">{totalCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-[#B45309] uppercase">Awaiting Payment</span>
            <p className="text-xl font-bold text-[#B45309] mt-1">{pendingInvoices.length}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">
              ${pendingInvoices.reduce((a, b) => a + Number(b.amount_total), 0).toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-[#15803D] uppercase">Paid Invoices</span>
            <p className="text-xl font-bold text-[#15803D] mt-1">{paidInvoices.length}</p>
            <p className="text-[10px] text-[#15803D] font-medium mt-0.5">Verified backend captures</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase">Failed / Cancelled</span>
            <p className="text-xl font-bold text-[#6B7280] mt-1">{failedInvoices.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded-md focus:ring-1 focus:ring-red-500 focus:border-[#DC2626]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Status:</span>
            {['all', 'pending', 'paid'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-[#FEF2F2] text-[#DC2626] font-bold border border-red-200'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#6B7280]">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Receipt className="w-6 h-6" />}
                title="No invoices found"
                description="Invoices are created from accepted quotations or directly from projects."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Invoice Number</th>
                    <th className="py-3 px-6">Project & Client</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Due Date</th>
                    <th className="py-3 px-6">Payment Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredInvoices.map(invoice => {
                    const project = getProject(invoice.project_id);
                    return (
                      <tr key={invoice.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-[#111827]">
                          {invoice.invoice_number}
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/projects/${invoice.project_id}`} className="font-semibold text-[#111827] hover:text-[#DC2626] block">
                            {project?.title || 'Client Project'}
                          </Link>
                          <span className="text-[11px] text-[#6B7280]">
                            {project?.client_name || 'Client'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#111827]">
                          ${Number(invoice.amount_total).toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}
                        </td>
                        <td className="py-4 px-6 text-[#6B7280]">
                          {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge status={invoice.status} />
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {/* Copy Shareable Payment Link */}
                          <button
                            onClick={() => handleCopyLink(invoice.share_token, invoice.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#111827] transition-colors"
                            title="Copy secure public payment link"
                          >
                            {copiedId === invoice.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#15803D]" />
                                <span className="text-[#15803D]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          {/* Open Public Customer Payment Checkout Page */}
                          <Link
                            to={`/pay/${invoice.share_token}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white transition-colors"
                          >
                            <span>Pay / View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
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
