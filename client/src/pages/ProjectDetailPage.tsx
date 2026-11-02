import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'versions' | 'quotations' | 'invoices'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProject = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getProject(id);
      setProject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#DC2626] border-t-transparent mb-3" />
        <p className="text-xs text-[#6B7280] dark:text-gray-400">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-12">
        <Alert type="error" title="Notice">
          {error || 'Project not found'}
        </Alert>
        <div className="mt-4">
          <Link to="/projects">
            <Button variant="secondary" size="sm">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const scopes = project.scopes || [];
  const approvedScope = scopes.find(s => s.approval_status === 'approved') || scopes[0];
  const quotations = project.quotations || [];
  const invoices = project.invoices || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E5E7EB] dark:border-gray-800">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-white font-medium mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Projects</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-gray-100">{project.title}</h1>
            <Badge status={project.status} />
          </div>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1">
            Client: <strong className="text-[#111827] dark:text-gray-200">{project.client_name || 'Direct'}</strong> ({project.client_email || 'No email'}) • Budget: <strong className="text-[#111827] dark:text-gray-200">${project.budget.toLocaleString()} {project.currency}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {approvedScope ? (
            <>
              <Link to={`/projects/${project.id}/compare`}>
                <Button variant="secondary" size="sm" icon={<GitCompare className="w-3.5 h-3.5 text-[#DC2626] dark:text-red-400" />}>
                  Compare Scope Change
                </Button>
              </Link>
              <Link to={`/projects/${project.id}/scope/${approvedScope.id}`}>
                <Button variant="outline-red" size="sm">
                  View Scope Agreement
                </Button>
              </Link>
            </>
          ) : (
            <Link to={`/create-project`}>
              <Button size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Generate AI Scope
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="border-b border-[#E5E7EB] dark:border-gray-800">
        <nav className="flex space-x-6 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Project Overview' },
            { id: 'scope', label: `Approved Scope (${approvedScope ? 'v' + approvedScope.version_number : 'None'})` },
            { id: 'versions', label: `Scope History (${scopes.length})` },
            { id: 'quotations', label: `Quotations (${quotations.length})` },
            { id: 'invoices', label: `Invoices (${invoices.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#DC2626] text-[#DC2626] dark:text-red-400 font-bold'
                  : 'border-transparent text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description & Scope Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-[#4B5563] dark:text-gray-300 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                {approvedScope && (
                  <div className="p-4 bg-[#F9FAFB] dark:bg-gray-800/40 rounded-md border border-[#E5E7EB] dark:border-gray-700 space-y-2">
                    <span className="font-bold text-[#111827] dark:text-gray-100 block">Active Deliverables Summary:</span>
                    <ul className="space-y-1.5 text-[#4B5563] dark:text-gray-300">
                      {approvedScope.deliverables.slice(0, 3).map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span><strong className="text-[#111827] dark:text-gray-200">{d.title}:</strong> {d.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to={`/projects/${project.id}/compare`}
                  className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-[#FEF2F2]/40 dark:bg-red-950/20 hover:bg-[#FEF2F2] dark:hover:bg-red-950/40 transition-colors block text-left"
                >
                  <div className="flex items-center gap-2 text-[#DC2626] dark:text-red-400 font-bold text-xs mb-1">
                    <GitCompare className="w-4 h-4" />
                    <span>Run Scope Creep Check</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                    Paste new client emails to identify unbilled scope additions.
                  </p>
                </Link>

                <button
                  onClick={() => setActiveTab('quotations')}
                  className="p-4 rounded-lg border border-[#E5E7EB] dark:border-gray-700 hover:bg-[#F9FAFB] dark:hover:bg-gray-800/60 transition-colors block text-left"
                >
                  <div className="flex items-center gap-2 text-[#111827] dark:text-gray-100 font-bold text-xs mb-1">
                    <span className="text-[#DC2626] dark:text-red-400 font-bold">📄</span>
                    <span>Manage Quotations</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-gray-400">
                    Create proposals and convert into PayPal checkout invoices.
                  </p>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right Rail: Financial & Status Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Project Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#E5E7EB] dark:border-gray-800 pb-2">
                  <span className="text-[#6B7280] dark:text-gray-400">Status:</span>
                  <Badge status={project.status} />
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] dark:border-gray-800 pb-2">
                  <span className="text-[#6B7280] dark:text-gray-400">Budget:</span>
                  <span className="font-bold text-[#111827] dark:text-gray-100">${project.budget.toLocaleString()} {project.currency}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] dark:border-gray-800 pb-2">
                  <span className="text-[#6B7280] dark:text-gray-400">Client:</span>
                  <span className="font-semibold text-[#111827] dark:text-gray-200">{project.client_name || 'Direct'}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] dark:border-gray-800 pb-2">
                  <span className="text-[#6B7280] dark:text-gray-400">Created:</span>
                  <span className="text-[#6B7280] dark:text-gray-400">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280] dark:text-gray-400">Scope Version:</span>
                  <span className="font-mono font-bold text-[#DC2626] dark:text-red-400">
                    {approvedScope ? `v${approvedScope.version_number} (${approvedScope.approval_status})` : 'Draft'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Approved Scope */}
      {activeTab === 'scope' && (
        <div className="space-y-6">
          {approvedScope ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link to={`/projects/${project.id}/scope/${approvedScope.id}`}>
                  <Button size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Full Scope Editor
                  </Button>
                </Link>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Baseline Deliverables</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
                    {approvedScope.deliverables.map((d, i) => (
                      <div key={i} className="p-4 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-[#111827] dark:text-gray-100">{d.title}</strong>
                          {d.complexity && (
                            <span className="text-[10px] text-[#DC2626] dark:text-red-400 bg-[#FEF2F2] dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/50">
                              {d.complexity}
                            </span>
                          )}
                        </div>
                        <p className="text-[#6B7280] dark:text-gray-400">{d.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-xs text-[#6B7280] dark:text-gray-400">
                No approved scope yet. Click "Generate AI Scope" to create one.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Scope Versions History */}
      {activeTab === 'versions' && (
        <Card>
          <CardHeader>
            <CardTitle>Scope Agreement Versions</CardTitle>
            <p className="text-xs text-[#6B7280] dark:text-gray-400">
              Every approved scope is permanently preserved for audit and scope creep comparison.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
              {scopes.map(s => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-md bg-[#FEF2F2] dark:bg-red-950/40 text-[#DC2626] dark:text-red-400 font-mono font-bold text-xs flex items-center justify-center border border-red-200 dark:border-red-900/50">
                      v{s.version_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#111827] dark:text-gray-100">{s.overview.slice(0, 60)}...</h4>
                        <Badge status={s.approval_status} />
                      </div>
                      <p className="text-[11px] text-[#6B7280] dark:text-gray-400 mt-0.5">
                        Created {new Date(s.created_at).toLocaleDateString()} • {s.timeline_days} days delivery
                      </p>
                    </div>
                  </div>
                  <Link to={`/projects/${project.id}/scope/${s.id}`}>
                    <Button variant="outline-red" size="sm">
                      Inspect Scope
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Quotations */}
      {activeTab === 'quotations' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quotations for this Project</CardTitle>
            <Link to="/quotations">
              <Button size="sm">View All Quotations</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {quotations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B7280] dark:text-gray-400">
                No quotations created for this project yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
                {quotations.map(q => (
                  <div key={q.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#111827] dark:text-gray-100 block">{q.quotation_number}</span>
                      <span className="text-[#6B7280] dark:text-gray-400">{q.notes || 'Project Quotation'}</span>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-bold text-[#111827] dark:text-gray-100">${Number(q.amount).toLocaleString()} {q.currency}</span>
                      <Badge status={q.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Invoices */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoices for this Project</CardTitle>
            <Link to="/invoices">
              <Button size="sm">View All Invoices</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B7280] dark:text-gray-400">
                No invoices created for this project yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
                {invoices.map(inv => (
                  <div key={inv.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#111827] dark:text-gray-100 block">{inv.invoice_number}</span>
                      <span className="text-[#6B7280] dark:text-gray-400">Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'Upon receipt'}</span>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-bold text-[#111827] dark:text-gray-100">${Number(inv.amount_total).toLocaleString()} {inv.currency}</span>
                      <Badge status={inv.status} />
                      <Link to={`/pay/${inv.share_token}`} target="_blank">
                        <Button variant="outline-red" size="sm">
                          Payment Link
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
