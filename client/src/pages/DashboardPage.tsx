import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileCheck2,
  Clock,
  DollarSign,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Receipt,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { api } from '../services/api';
import { DashboardSummary, Project } from '../types';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboard();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#DC2626] border-t-transparent mb-3" />
        <p className="text-xs text-[#6B7280]">Loading dashboard data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12">
        <div className="bg-[#FEF2F2] border border-red-200 text-[#DC2626] p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error || 'Could not load dashboard data'}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Welcome back</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage projects, protect your scope, and track payments in one place.
          </p>
        </div>
        <div>
          <Link to="/create-project">
            <Button icon={<Plus className="w-4 h-4" />}>
              + Create New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Total Projects
              </span>
              <div className="w-8 h-8 rounded-md bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#DC2626]">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#111827]">{data.totalProjects}</span>
              <p className="text-[11px] text-[#6B7280] mt-1">Managed contracts & scopes</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active Projects */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Active Projects
              </span>
              <div className="w-8 h-8 rounded-md bg-[#FEF2F2] border border-red-200 flex items-center justify-center text-[#DC2626]">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#DC2626]">{data.activeProjects}</span>
              <p className="text-[11px] text-[#6B7280] mt-1">Approved & in execution</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Outstanding Invoices */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Outstanding Invoices
              </span>
              <div className="w-8 h-8 rounded-md bg-[#FFFBEB] border border-amber-200 flex items-center justify-center text-[#B45309]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#111827]">
                ${data.outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-[#B45309] font-medium mt-1">
                {data.outstandingInvoicesCount} awaiting client payment
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Payments Received */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Payments Received
              </span>
              <div className="w-8 h-8 rounded-md bg-[#F0FDF4] border border-green-200 flex items-center justify-center text-[#15803D]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-[#15803D]">
                ${data.totalReceivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-[#15803D] font-medium mt-1">
                Verified PayPal Sandbox captures
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <p className="text-xs text-[#6B7280]">
              Active client agreements, scope approvals, and financial status
            </p>
          </div>
          <Link to="/projects">
            <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentProjects.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No projects created yet"
                description="Start by turning customer requirements into a verified proposal."
                actionText="+ Create Your First Project"
                onAction={() => navigate('/create-project')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Project Name</th>
                    <th className="py-3 px-6">Client</th>
                    <th className="py-3 px-6">Project Value</th>
                    <th className="py-3 px-6">Scope Status</th>
                    <th className="py-3 px-6">Last Updated</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {data.recentProjects.map(project => (
                    <tr
                      key={project.id}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="py-4 px-6 font-semibold text-[#111827]">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-[#DC2626] transition-colors">{project.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">
                        {project.client_name || 'Direct Client'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#111827]">
                        ${project.budget.toLocaleString()} {project.currency}
                      </td>
                      <td className="py-4 px-6">
                        <Badge status={project.status} />
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">
                        {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/projects/${project.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[#DC2626] hover:text-[#B91C1C] font-semibold inline-flex items-center gap-1"
                        >
                          Manage <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Verified Payments</CardTitle>
            <p className="text-xs text-[#6B7280]">
              Backend-captured transactions processed through PayPal Sandbox
            </p>
          </div>
          <Link to="/payments">
            <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              All Transactions
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {data.recentPayments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Receipt className="w-6 h-6" />}
                title="No payments captured yet"
                description="When clients complete checkout using PayPal Sandbox, transactions will automatically appear here once verified."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">PayPal Order / Capture ID</th>
                    <th className="py-3 px-6">Payer</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {data.recentPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-[#F9FAFB]">
                      <td className="py-4 px-6 font-mono font-medium text-[#111827]">
                        {payment.paypal_capture_id || payment.paypal_order_id}
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">
                        {payment.payer_name || payment.payer_email || 'Sandbox Client'}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#15803D]">
                        +${Number(payment.amount).toFixed(2)} {payment.currency}
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">
                        {new Date(payment.captured_at || payment.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <Badge status="paid" label="Verified Captured" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
