import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  GitCompare,
  FileSpreadsheet,
  Save,
  ArrowLeft,
  AlertCircle,
  Clock,
  Layers,
  ShieldAlert,
  HelpCircle,
  Milestone,
  Check,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { Project, ScopeVersion, DeliverableItem, FeatureItem, MilestoneItem } from '../types';

export const ScopeEditorPage: React.FC = () => {
  const { projectId, scopeId } = useParams<{ projectId: string; scopeId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [scope, setScope] = useState<ScopeVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [missingInfo, setMissingInfo] = useState<string[]>([]);
  const [timelineDays, setTimelineDays] = useState(14);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);

  // Confirmation Modals
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('Payment split into 50% upfront deposit and 50% upon milestone completion.');

  useEffect(() => {
    const loadScopeData = async () => {
      try {
        setLoading(true);
        if (!projectId) return;
        const proj = await api.getProject(projectId);
        setProject(proj);

        // Find specific scope or use latest
        const scopes = proj.scopes || [];
        const currentScope = scopeId
          ? scopes.find(s => s.id === scopeId)
          : scopes[0];

        if (currentScope) {
          setScope(currentScope);
          populateForm(currentScope);
        } else {
          setError('No scope agreement found for this project.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project scope');
      } finally {
        setLoading(false);
      }
    };

    loadScopeData();
  }, [projectId, scopeId]);

  const populateForm = (s: ScopeVersion) => {
    setOverview(s.overview || '');
    setObjectives(s.objectives || []);
    setDeliverables(s.deliverables || []);
    setFeatures(s.features || []);
    setExclusions(s.exclusions || []);
    setAssumptions(s.assumptions || []);
    setMissingInfo(s.missing_information || []);
    setTimelineDays(s.timeline_days || 14);
    setMilestones(s.milestones || []);
  };

  const handleSaveDraft = async () => {
    if (!project || !scope) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.saveScopeVersion({
        id: scope.id,
        project_id: project.id,
        version_number: scope.version_number,
        overview,
        objectives,
        deliverables,
        features,
        exclusions,
        assumptions,
        missing_information: missingInfo,
        timeline_days: timelineDays,
        milestones,
        approval_status: scope.approval_status
      });
      setScope(updated);
      setIsEditing(false);
      setSuccessMsg('Scope draft saved successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save draft scope');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveScope = async () => {
    if (!scope) return;
    setSaving(true);
    try {
      const approved = await api.approveScopeVersion(scope.id);
      setScope(approved);
      setIsApproveModalOpen(false);
      setSuccessMsg('Scope approved and locked! Version 1 is now the baseline for payments and scope creep protection.');
      if (project) {
        setProject({ ...project, status: 'approved' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve scope');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuotation = async () => {
    if (!project || !scope || !quoteAmount) return;
    setSaving(true);
    try {
      const quotation = await api.createQuotation({
        project_id: project.id,
        scope_version_id: scope.id,
        amount: parseFloat(quoteAmount),
        currency: project.currency || 'USD',
        notes: quoteNotes,
        valid_days: 14
      });
      setIsQuotationModalOpen(false);
      navigate('/quotations');
    } catch (err: any) {
      setError(err.message || 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#DC2626] border-t-transparent mb-3" />
        <p className="text-xs text-[#6B7280]">Loading scope agreement details...</p>
      </div>
    );
  }

  if (error && !scope) {
    return (
      <div className="py-12">
        <Alert type="error" title="Error Loading Scope">
          {error}
        </Alert>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            Return to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E5E7EB]">
        <div>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] font-medium mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {project?.title || 'Project'}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">AI Project Scope</h1>
            <Badge status={scope?.approval_status || 'draft'} />
            <span className="text-xs text-[#6B7280] font-mono">v{scope?.version_number}</span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Turn unstructured customer requests into a clear, reviewable project agreement.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {scope?.approval_status !== 'approved' ? (
            <>
              <Button
                variant={isEditing ? 'secondary' : 'outline-red'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                icon={<Edit2 className="w-3.5 h-3.5" />}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Scope'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={handleSaveDraft}
                  loading={saving}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Draft
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsApproveModalOpen(true)}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approve Scope
              </Button>
            </>
          ) : (
            <>
              <Link to={`/projects/${projectId}/compare`}>
                <Button variant="secondary" size="sm" icon={<GitCompare className="w-3.5 h-3.5 text-[#DC2626]" />}>
                  Compare New Request
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setQuoteAmount(project?.budget ? String(project.budget) : '3000');
                  setIsQuotationModalOpen(true);
                }}
                icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              >
                Create Quotation
              </Button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <Alert type="success" title="Success">
          {successMsg}
        </Alert>
      )}

      {scope?.approval_status === 'approved' && (
        <div className="p-4 rounded-lg bg-[#F0FDF4] border border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-green-950">This scope is formally approved</p>
              <p className="text-[11px] text-green-800">
                Any subsequent customer requests can now be checked against this approved baseline using AI Scope Creep Detection.
              </p>
            </div>
          </div>
          <Link to={`/projects/${projectId}/compare`}>
            <Button size="sm" variant="secondary" className="border-green-300 hover:bg-green-100 text-green-900">
              Run Scope Comparison
            </Button>
          </Link>
        </div>
      )}

      {/* Scope Sections Container */}
      <div className="space-y-6">
        {/* Section 1: Project Overview & Objectives */}
        <Card>
          <CardHeader>
            <CardTitle>1. Project Overview & Objectives</CardTitle>
            <p className="text-xs text-[#6B7280]">
              Summary of goals and commercial outcomes defined by the client brief.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
                Executive Summary
              </label>
              {isEditing ? (
                <textarea
                  value={overview}
                  onChange={e => setOverview(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 border border-[#E5E7EB] rounded-md focus:ring-1 focus:ring-red-500"
                />
              ) : (
                <p className="text-xs text-[#111827] leading-relaxed bg-[#F9FAFB] p-3 rounded-md border border-[#E5E7EB]">
                  {overview}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
                Primary Objectives
              </label>
              <ul className="space-y-2">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#111827]">
                    <Check className="w-3.5 h-3.5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Deliverables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>2. Key Deliverables</CardTitle>
                <p className="text-xs text-[#6B7280]">
                  Specific assets and components included in this project price.
                </p>
              </div>
              <span className="text-xs text-[#6B7280] font-medium">{deliverables.length} Deliverables</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E5E7EB]">
              {deliverables.map((item, idx) => (
                <div key={idx} className="p-5 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-[#111827]">{item.title}</h4>
                    {item.complexity && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-red-200">
                        {item.complexity} Complexity
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Exclusions (Crucial for avoiding scope creep!) */}
        <Card className="border-red-200 bg-red-50/20">
          <CardHeader className="bg-[#FEF2F2]/60 border-b border-red-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <div>
                <CardTitle className="text-[#DC2626]">3. Explicit Exclusions (Out of Scope)</CardTitle>
                <p className="text-xs text-[#6B7280]">
                  Activities explicitly NOT covered under this quotation. Additional requests will require a separate quote.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ul className="space-y-2.5">
              {exclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#111827]">
                  <span className="text-[#DC2626] font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Section 4: Assumptions & Missing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>4. Project Assumptions</CardTitle>
              <p className="text-xs text-[#6B7280]">Conditions required for project success.</p>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="space-y-2 text-xs text-[#6B7280]">
                {assumptions.map((assump, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#DC2626] font-bold">•</span>
                    <span>{assump}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#B45309]" />
                <div>
                  <CardTitle>5. Missing Information</CardTitle>
                  <p className="text-xs text-[#6B7280]">Questions to clarify with the client.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="space-y-2 text-xs text-[#6B7280]">
                {missingInfo.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#B45309] font-bold">?</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Section 5: Timeline & Milestones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>6. Timeline & Delivery Milestones</CardTitle>
                <p className="text-xs text-[#6B7280]">
                  Estimated delivery schedule: <strong>{timelineDays} business days</strong>
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] px-3 py-1 rounded-md border border-red-200">
                <Clock className="w-3.5 h-3.5" />
                <span>{timelineDays} Days</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#E5E7EB]">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-5 flex items-start gap-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#FEF2F2] text-[#DC2626] font-bold text-xs flex items-center justify-center flex-shrink-0 border border-red-200">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#111827]">{m.title}</h4>
                      <span className="text-[11px] text-[#6B7280] font-medium">~{m.days} days</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">{m.deliverable_summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal for Scope Approval */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve & Lock Baseline Scope"
        description="Formalize this scope agreement for the project."
      >
        <div className="space-y-4">
          <p className="text-xs text-[#4B5563] leading-relaxed">
            By approving this scope, <strong>Version 1</strong> will be permanently saved as the contractual baseline.
            Future client change requests will be evaluated against these exact deliverables and exclusions to protect you from unpaid scope creep.
          </p>
          <div className="bg-[#FEF2F2] border border-red-200 p-3 rounded-md text-xs text-[#DC2626]">
            ✓ Enables AI Scope Creep Detection for all future client emails and messages.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApproveScope} loading={saving}>
              Yes, Approve Baseline Scope
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal for Quotation Generation */}
      <Modal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        title="Generate Quotation"
        description="Create a formal quotation based on this approved scope."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Quotation Amount ({project?.currency || 'USD'}) *
            </label>
            <input
              type="number"
              value={quoteAmount}
              onChange={e => setQuoteAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
              placeholder="3200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Payment Terms & Milestones
            </label>
            <textarea
              value={quoteNotes}
              onChange={e => setQuoteNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsQuotationModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateQuotation} loading={saving}>
              Generate Quotation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
