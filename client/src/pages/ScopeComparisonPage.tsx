import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  Send,
  HelpCircle,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { Project, ScopeVersion, ScopeComparisonResult } from '../types';

export const ScopeComparisonPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [approvedScope, setApprovedScope] = useState<ScopeVersion | null>(null);
  const [newRequestText, setNewRequestText] = useState(
    'Hi! Can we also add an admin analytics dashboard to view live orders, and integrate automated WhatsApp notifications for pickup reminders?'
  );
  const [analysis, setAnalysis] = useState<ScopeComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Revised Quote Modal
  const [isRevisedQuoteModalOpen, setIsRevisedQuoteModalOpen] = useState(false);
  const [revisedAmount, setRevisedAmount] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        setPageLoading(true);
        if (!projectId) return;
        const p = await api.getProject(projectId);
        setProject(p);
        const scopes = p.scopes || [];
        const approved = scopes.find(s => s.approval_status === 'approved') || scopes[0];
        setApprovedScope(approved || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setPageLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  const handleRunComparison = async () => {
    if (!newRequestText.trim() || !approvedScope) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.compareScope({
        approvedScope: {
          title: project?.title,
          overview: approvedScope.overview,
          deliverables: approvedScope.deliverables,
          exclusions: approvedScope.exclusions,
          timeline_days: approvedScope.timeline_days
        },
        newCustomerRequest: newRequestText
      });
      setAnalysis(result);
      if (result.recommendedAdditionalCost) {
        setRevisedAmount(String(result.recommendedAdditionalCost));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze scope change');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = () => {
    if (!analysis?.draftClientMessage) return;
    navigator.clipboard.writeText(analysis.draftClientMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateRevisedQuotation = async () => {
    if (!project || !revisedAmount) return;
    try {
      await api.createQuotation({
        project_id: project.id,
        amount: parseFloat(revisedAmount),
        currency: project.currency || 'USD',
        notes: `Revised Scope Add-on: ${analysis?.summary || 'Additional customer requirements'}`,
        valid_days: 14
      });
      setIsRevisedQuoteModalOpen(false);
      navigate('/quotations');
    } catch (err: any) {
      setError(err.message || 'Failed to create revised quotation');
    }
  };

  if (pageLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#DC2626] border-t-transparent mb-3" />
        <p className="text-xs text-[#6B7280]">Loading scope comparison engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E5E7EB]">
        <div>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] font-medium mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {project?.title || 'Project'}</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Scope Change Analysis
            </h1>
            <span className="bg-[#FEF2F2] text-[#DC2626] text-xs font-bold px-2 py-0.5 rounded border border-red-200">
              AI Creep Detection
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Identify new requirements before agreeing to additional work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Return to Project
          </Button>
          {analysis && (
            <Button
              size="sm"
              onClick={() => setIsRevisedQuoteModalOpen(true)}
              icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              Create Revised Quotation
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert type="error" title="Analysis Notice">
          {error}
        </Alert>
      )}

      {/* Side-by-Side Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Approved Scope */}
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-[#F9FAFB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                <CardTitle className="text-sm">Original Approved Scope (Baseline)</CardTitle>
              </div>
              <Badge status="approved" label="Version 1" />
            </div>
            <p className="text-xs text-[#6B7280]">
              The agreed contract deliverables and exclusions currently in effect.
            </p>
          </CardHeader>
          <CardContent className="p-5 flex-1 space-y-4 text-xs">
            <div>
              <span className="font-semibold text-[#111827] block mb-1">Agreed Deliverables:</span>
              <ul className="space-y-1.5 text-[#4B5563]">
                {approvedScope?.deliverables?.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#15803D] font-bold">✓</span>
                    <span><strong>{d.title}:</strong> {d.description}</span>
                  </li>
                )) || <li className="text-[#9CA3AF]">No deliverables loaded</li>}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#E5E7EB]">
              <span className="font-semibold text-[#DC2626] block mb-1">Contractual Exclusions:</span>
              <ul className="space-y-1 text-[#6B7280]">
                {approvedScope?.exclusions?.map((ex, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#DC2626] font-bold">✕</span>
                    <span>{ex}</span>
                  </li>
                )) || <li className="text-[#9CA3AF]">No exclusions listed</li>}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[#6B7280]">
              <span>Agreed Duration: <strong>{approvedScope?.timeline_days || 14} days</strong></span>
              <span>Project Budget: <strong>${project?.budget || 0} {project?.currency}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Right: New Customer Request */}
        <Card className="h-full flex flex-col border-red-200">
          <CardHeader className="bg-[#FEF2F2]/40 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <CardTitle className="text-sm text-[#DC2626]">New Customer Request</CardTitle>
              </div>
              <span className="text-[11px] text-[#DC2626] font-semibold">Incoming Request</span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Paste the customer's email, message, or extra requested feature below.
            </p>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="flex-1">
              <textarea
                value={newRequestText}
                onChange={e => setNewRequestText(e.target.value)}
                placeholder="Paste client email or new feature request..."
                rows={7}
                className="w-full text-xs p-3 bg-white border border-[#E5E7EB] rounded-md focus:ring-1 focus:ring-red-500 focus:border-[#DC2626] text-[#111827]"
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleRunComparison}
                loading={loading}
                className="w-full"
                icon={<Sparkles className="w-4 h-4" />}
              >
                Analyze Scope Changes with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Scope Creep Analysis Results */}
      {analysis && (
        <div className="space-y-6 pt-4 animate-in fade-in">
          <div className="border-b border-[#E5E7EB] pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">AI Scope Comparison Assessment</h2>
              <p className="text-xs text-[#6B7280]">
                AI recommendations must not automatically modify an approved contract. Review recommendations below.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] px-2.5 py-1 rounded-full border border-red-200">
                Action: {analysis.recommendedAction.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Highlights & Financial Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-[#FEF2F2]/30">
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-[#DC2626] uppercase">Scope Change Detected</span>
                <p className="text-xl font-extrabold text-[#111827] mt-1">
                  {analysis.isScopeChange ? 'YES — Additional Work' : 'NO — Covered in Scope'}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Outside original Version 1 baseline</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase">Recommended Additional Cost</span>
                <p className="text-xl font-extrabold text-[#DC2626] mt-1">
                  +${analysis.recommendedAdditionalCost} {project?.currency || 'USD'}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Estimated billable effort</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase">Timeline Impact</span>
                <p className="text-xl font-extrabold text-[#111827] mt-1">
                  +{analysis.recommendedAdditionalDays} Business Days
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Required schedule extension</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Requirements Identified */}
            <Card className="border-red-200">
              <CardHeader className="bg-[#FEF2F2]/50">
                <CardTitle className="text-xs text-[#DC2626] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Newly Requested Work (Out of Scope)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {analysis.newRequirements.map((req, i) => (
                  <div key={i} className="p-3 bg-[#FEF2F2] rounded-md border border-red-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-[#111827]">{req.title}</strong>
                      <span className="text-[10px] uppercase font-bold text-[#DC2626] bg-white px-1.5 py-0.5 rounded border border-red-200">
                        {req.impact} Impact • +${req.estimatedCost}
                      </span>
                    </div>
                    <p className="text-[#4B5563]">{req.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Questions to Ask Client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#B45309]" />
                  <span>Clarification Questions to Ask Client</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {analysis.followUpQuestions.map((q, i) => (
                  <div key={i} className="p-2.5 bg-[#F9FAFB] rounded-md border border-[#E5E7EB] text-[#4B5563]">
                    <strong>Q{i + 1}:</strong> {q}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Draft Professional Client Message */}
          <Card className="border-[#DC2626]">
            <CardHeader className="bg-[#FEF2F2] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs text-[#DC2626]">
                  AI-Drafted Courteous Client Response
                </CardTitle>
                <p className="text-[11px] text-[#6B7280]">
                  Ready to copy and send to the client to set expectations professionally.
                </p>
              </div>
              <Button
                variant="outline-red"
                size="sm"
                onClick={handleCopyMessage}
                icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied!' : 'Copy Message'}
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              <div className="bg-white p-4 rounded-md border border-[#E5E7EB] text-xs text-[#111827] font-mono whitespace-pre-wrap leading-relaxed">
                {analysis.draftClientMessage}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revised Quotation Modal */}
      <Modal
        isOpen={isRevisedQuoteModalOpen}
        onClose={() => setIsRevisedQuoteModalOpen(false)}
        title="Create Revised Scope Quotation"
        description="Formalize this scope addition as a supplementary quotation."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1">
              Add-on Quotation Amount ({project?.currency || 'USD'})
            </label>
            <input
              type="number"
              value={revisedAmount}
              onChange={e => setRevisedAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-md focus:ring-red-500 focus:border-[#DC2626]"
              placeholder="350"
            />
          </div>

          <div className="p-3 bg-[#FEF2F2] rounded-md border border-red-200 text-[#DC2626]">
            This supplementary quote will be logged under project "{project?.title}". Once accepted, you can issue an invoice with a PayPal Sandbox checkout link.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsRevisedQuoteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateRevisedQuotation}>
              Issue Revised Quotation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
