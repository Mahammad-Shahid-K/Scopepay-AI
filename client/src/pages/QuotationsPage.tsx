import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Search,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { Quotation, Project } from '../types';

export const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  // Convert to Invoice Modal
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDueDays, setInvoiceDueDays] = useState('7');
  const [converting, setConverting] = useState(false);

  // New Quotation Modal
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotesData, projectsData] = await Promise.all([
        api.getQuotations(),
        api.getProjects()
      ]);
      setQuotations(quotesData);
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setNewProjectId(projectsData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateQuotation = async () => {
    if (!newProjectId || !newAmount) return;
    try {
      const q = await api.createQuotation({
        project_id: newProjectId,
        amount: parseFloat(newAmount),
        notes: newNotes,
        valid_days: 14
      });
      setQuotations([q, ...quotations]);
      setIsNewQuoteOpen(false);
      setNewAmount('');
      setNewNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to create quotation');
    }
  };

  const handleConvertToInvoice = async () => {
    if (!selectedQuote || !invoiceAmount) return;
    setConverting(true);
    try {
      const invoice = await api.createInvoice({
        project_id: selectedQuote.project_id,
        quotation_id: selectedQuote.id,
        amount_total: parseFloat(invoiceAmount),
        currency: selectedQuote.currency || 'USD',
        due_days: parseInt(invoiceDueDays, 10) || 7
      });
      setSelectedQuote(null);
      navigate('/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice');
    } finally {
      setConverting(false);
    }
  };

  const filteredQuotes = quotations.filter(q => {
    const matchesSearch =
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      (q.notes && q.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProjectName = (projId: string) => {
    const p = projects.find(item => item.id === projId);
    return p ? p.title : 'Project Agreement';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Quotations</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage proposals, scope estimates, and convert accepted quotes into client invoices.
          </p>
        </div>
        <div>
          <Button onClick={() => setIsNewQuoteOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Quotation
          </Button>
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
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by quote # or notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded-md focus:ring-1 focus:ring-red-500 focus:border-[#DC2626]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Filter:</span>
            {['all', 'draft', 'sent', 'accepted'].map(status => (
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

      {/* Quotations Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#6B7280]">Loading quotations...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<FileSpreadsheet className="w-6 h-6" />}
                title="No quotations found"
                description="Create a quotation directly or generate one from an approved AI Scope."
                actionText="+ Create Quotation"
                onAction={() => setIsNewQuoteOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Quotation Number</th>
                    <th className="py-3 px-6">Project</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Valid Until</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredQuotes.map(quote => (
                    <tr key={quote.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#111827]">
                        {quote.quotation_number}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#111827] max-w-xs truncate">
                        <Link to={`/projects/${quote.project_id}`} className="hover:text-[#DC2626]">
                          {getProjectName(quote.project_id)}
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#111827]">
                        ${Number(quote.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {quote.currency}
                      </td>
                      <td className="py-4 px-6">
                        <Badge status={quote.status} />
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">
                        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline-red"
                          size="sm"
                          onClick={() => {
                            setSelectedQuote(quote);
                            setInvoiceAmount(String(quote.amount));
                          }}
                          icon={<Receipt className="w-3.5 h-3.5" />}
                        >
                          Generate Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert to Invoice Modal */}
      <Modal
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title="Convert Quotation to Invoice"
        description={`Issue an invoice for ${selectedQuote?.quotation_number}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Invoice Amount ({selectedQuote?.currency || 'USD'}) *
            </label>
            <input
              type="number"
              value={invoiceAmount}
              onChange={e => setInvoiceAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
              placeholder="1600"
              required
            />
            <p className="text-[11px] text-[#6B7280] mt-1">
              You can bill the full quote (${selectedQuote?.amount}) or a 50% upfront milestone.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Payment Due In (Days)
            </label>
            <input
              type="number"
              value={invoiceDueDays}
              onChange={e => setInvoiceDueDays(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
            />
          </div>

          <div className="p-3 bg-[#FEF2F2] rounded-md border border-red-200 text-[#DC2626]">
            This will generate a secure customer payment link with live PayPal Sandbox checkout.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedQuote(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConvertToInvoice} loading={converting}>
              Issue Customer Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Quotation Modal */}
      <Modal
        isOpen={isNewQuoteOpen}
        onClose={() => setIsNewQuoteOpen(false)}
        title="Create New Quotation"
        description="Attach a quotation to a project"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Select Project *
            </label>
            <select
              value={newProjectId}
              onChange={e => setNewProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Total Amount (USD) *
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              placeholder="2500"
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Notes & Payment Terms
            </label>
            <textarea
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="e.g. 50% deposit, remainder on delivery."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsNewQuoteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateQuotation}>
              Create Quotation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
