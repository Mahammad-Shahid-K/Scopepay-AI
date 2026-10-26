export interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  default_currency: string;
  hasGeminiKey?: boolean;
  hasPayPalKeys?: boolean;
  paypalMode?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  created_at: string;
}

export interface DeliverableItem {
  title: string;
  description: string;
  complexity?: 'Low' | 'Medium' | 'High';
}

export interface FeatureItem {
  category: string;
  title: string;
  details: string;
}

export interface MilestoneItem {
  title: string;
  days: number;
  deliverable_summary: string;
}

export interface ScopeVersion {
  id: string;
  project_id: string;
  version_number: number;
  overview: string;
  objectives: string[];
  deliverables: DeliverableItem[];
  features: FeatureItem[];
  exclusions: string[];
  assumptions: string[];
  missing_information: string[];
  timeline_days: number;
  milestones: MilestoneItem[];
  approval_status: 'draft' | 'awaiting_approval' | 'approved' | 'rejected';
  approved_at?: string;
  created_at: string;
}

export interface Quotation {
  id: string;
  project_id: string;
  scope_version_id?: string;
  quotation_number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  valid_until?: string;
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  quotation_id?: string;
  invoice_number: string;
  share_token: string;
  amount_total: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'cancelled';
  due_date?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  paypal_order_id: string;
  paypal_capture_id?: string;
  amount: number;
  currency: string;
  status: 'created' | 'approved' | 'captured' | 'failed';
  payer_email?: string;
  payer_name?: string;
  captured_at?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id?: string;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  title: string;
  description?: string;
  budget: number;
  currency: string;
  status: 'draft' | 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  scopes?: ScopeVersion[];
  quotations?: Quotation[];
  invoices?: Invoice[];
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  outstandingInvoicesCount: number;
  outstandingAmount: number;
  paidInvoicesCount: number;
  totalReceivedAmount: number;
  recentProjects: Project[];
  recentPayments: Payment[];
}

export interface ScopeGenerationResult {
  overview: string;
  objectives: string[];
  deliverables: DeliverableItem[];
  features: FeatureItem[];
  exclusions: string[];
  assumptions: string[];
  missingInformation: string[];
  timelineDays: number;
  milestones: MilestoneItem[];
  suggestedBudget?: number;
}

export interface ScopeComparisonResult {
  isScopeChange: boolean;
  summary: string;
  newRequirements: Array<{
    title: string;
    description: string;
    impact: 'Low' | 'Medium' | 'High';
    estimatedDays: number;
    estimatedCost: number;
  }>;
  existingRequirements: string[];
  potentiallyExcludedWork: string[];
  missingInformation: string[];
  followUpQuestions: string[];
  recommendedAction: 'approve_existing' | 'create_revised_quotation' | 'clarify_requirements';
  recommendedAdditionalCost: number;
  recommendedAdditionalDays: number;
  draftClientMessage: string;
}

export interface PublicInvoiceDetails {
  id: string;
  invoice_number: string;
  amount_total: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'cancelled';
  due_date?: string;
  created_at: string;
  project_title: string;
  project_description: string;
  freelancer_name: string;
  freelancer_business: string;
  deliverables: DeliverableItem[];
  paypal_client_id: string;
}
