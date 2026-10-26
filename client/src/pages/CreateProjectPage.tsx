import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, AlertCircle, Info, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timelineDays, setTimelineDays] = useState('14');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'Project title is required';
    if (!requirements.trim()) errs.requirements = 'Customer requirements are required for AI scope generation';
    if (requirements.trim().length < 20) {
      errs.requirements = 'Please provide at least a brief summary of requirements (minimum 20 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerateScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create project on backend
      const project = await api.createProject({
        title,
        client_name: clientName,
        client_email: clientEmail,
        description,
        budget: budget ? parseFloat(budget) : undefined,
        currency
      });

      // 2. Generate structured AI Scope
      const generatedScope = await api.generateScope({
        title,
        clientName,
        description,
        requirements,
        budget: budget ? parseFloat(budget) : undefined,
        currency
      });

      // 3. Save as Version 1 draft scope for this project
      const savedScope = await api.saveScopeVersion({
        project_id: project.id,
        version_number: 1,
        overview: generatedScope.overview,
        objectives: generatedScope.objectives,
        deliverables: generatedScope.deliverables,
        features: generatedScope.features,
        exclusions: generatedScope.exclusions,
        assumptions: generatedScope.assumptions,
        missing_information: generatedScope.missingInformation,
        timeline_days: generatedScope.timelineDays || parseInt(timelineDays, 10) || 14,
        milestones: generatedScope.milestones,
        approval_status: 'draft'
      });

      // 4. Navigate to Scope Editor for review
      navigate(`/projects/${project.id}/scope/${savedScope.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate project scope. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Create a New Project</h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Turn your customer's requirements into a clear project scope and quotation.
        </p>
      </div>

      {error && (
        <Alert type="error" title="Generation Error">
          {error}
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleGenerateScope} className="space-y-6">
            {/* Section 1: Project Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
                1. Project & Client Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Project Title *"
                    placeholder="e.g. E-Commerce Store & Custom Ordering System"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    error={errors.title}
                    required
                  />
                </div>

                <Input
                  label="Client Name"
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />

                <Input
                  label="Client Email"
                  type="email"
                  placeholder="sarah@example.com"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Brief Project Overview (Optional)"
                    placeholder="Short description of the client's business, goals, or context..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Requirements */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-[#111827] border-b border-[#E5E7EB] pb-2">
                2. Customer Requirements & Brief
              </h3>

              <Textarea
                label="Customer Requirements *"
                placeholder="Paste the raw requirements, customer email, chat transcript, or bullet points here. For example:
- We need a 5-page website with a custom cake ordering wizard
- Customers should select cake flavor, frosting, and delivery date
- We want customers to pay online before pickup
- Need it done in about 3 weeks
- Budget is around $3,000"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                error={errors.requirements}
                rows={6}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Target Budget"
                  type="number"
                  placeholder="3000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-[#111827] bg-white border border-[#E5E7EB] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-[#DC2626]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <Input
                  label="Preferred Timeline (Days)"
                  type="number"
                  placeholder="14"
                  value={timelineDays}
                  onChange={e => setTimelineDays(e.target.value)}
                />
              </div>
            </div>

            {/* AI Explanation Notice */}
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-[#FEF2F2] border border-red-200 flex items-center justify-center text-[#DC2626] flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs text-[#6B7280] leading-relaxed">
                <p className="font-semibold text-[#111827] mb-0.5">
                  How AI Scope Generation Works:
                </p>
                Our AI analyzes the raw customer request and structures it into clearly defined deliverables,
                technical specifications, explicit exclusions (to prevent scope creep), project assumptions,
                and recommended delivery milestones. You will be able to review and edit every section before approving.
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full sm:w-auto px-8"
                icon={<Sparkles className="w-4 h-4" />}
              >
                {loading ? 'Synthesizing Project Scope...' : 'Generate Project Scope with AI'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
