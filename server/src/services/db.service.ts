import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export interface Profile {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  default_currency: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
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
}

export interface ScopeVersion {
  id: string;
  project_id: string;
  version_number: number;
  overview: string;
  objectives: string[];
  deliverables: Array<{ title: string; description: string; complexity?: string }>;
  features: Array<{ category: string; title: string; details: string }>;
  exclusions: string[];
  assumptions: string[];
  missing_information: string[];
  timeline_days: number;
  milestones: Array<{ title: string; days: number; deliverable_summary: string }>;
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

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private isSupabaseConfigured = false;

  // Local fallback storage for seamless offline / zero-setup operation
  private defaultUserId = 'user-scopepay-demo-1';
  private profile: Profile = {
    id: 'user-scopepay-demo-1',
    full_name: 'Alex Rivera',
    business_name: 'Rivera Creative Tech & Design',
    email: 'alex@riveracreative.io',
    default_currency: 'USD',
    created_at: new Date().toISOString()
  };

  private clients: Client[] = [
    {
      id: 'client-1',
      user_id: 'user-scopepay-demo-1',
      name: 'Sarah Jenkins',
      email: 'sarah@artisanbakery.com',
      company: 'Artisan Gourmet Bakery',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    },
    {
      id: 'client-2',
      user_id: 'user-scopepay-demo-1',
      name: 'Marcus Vance',
      email: 'marcus@finnovate.tech',
      company: 'Finnovate SaaS',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
    }
  ];

  private projects: Project[] = [
    {
      id: 'proj-1',
      user_id: 'user-scopepay-demo-1',
      client_id: 'client-1',
      client_name: 'Sarah Jenkins',
      client_email: 'sarah@artisanbakery.com',
      title: 'E-Commerce Store & Custom Cake Ordering System',
      description: 'Custom headless storefront with bespoke cake configuration flow and customer checkout.',
      budget: 3200,
      currency: 'USD',
      status: 'approved',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      id: 'proj-2',
      user_id: 'user-scopepay-demo-1',
      client_id: 'client-2',
      client_name: 'Marcus Vance',
      client_email: 'marcus@finnovate.tech',
      title: 'Fintech Analytics Dashboard MVP',
      description: 'Responsive financial metrics dashboard with interactive charts and export capabilities.',
      budget: 4500,
      currency: 'USD',
      status: 'proposed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    }
  ];

  private scopeVersions: ScopeVersion[] = [
    {
      id: 'scope-1',
      project_id: 'proj-1',
      version_number: 1,
      overview: 'Design and build an e-commerce website for Artisan Gourmet Bakery including brand styling, catalog browsing, cart, and PayPal Sandbox payment integration.',
      objectives: [
        'Establish a mobile-first online bakery presence',
        'Enable online pastry & cake orders with pickup date selection',
        'Streamline automated invoicing and client payments'
      ],
      deliverables: [
        { title: 'Responsive Storefront UI', description: '5 responsive pages: Home, Menu, Cake Customizer, Cart, Contact.', complexity: 'Medium' },
        { title: 'Cake Customization Wizard', description: 'Step-by-step selector for tiers, sponge flavor, frosting, and dietary options.', complexity: 'High' },
        { title: 'Checkout & PayPal Integration', description: 'Secure order checkout processing via PayPal Sandbox.', complexity: 'Medium' }
      ],
      features: [
        { category: 'Storefront', title: 'Product Showcase', details: 'High-res gallery with categorization and search.' },
        { category: 'Ordering', title: 'Date/Time Slot Picker', details: 'Pickup scheduling with minimum 48hr notice limitation.' },
        { category: 'Payments', title: 'PayPal Sandbox Orders', details: 'Instant checkout and payment confirmation receipts.' }
      ],
      exclusions: [
        'Native iOS or Android mobile application development',
        'Custom multi-vendor marketplace or external delivery driver dispatch integration',
        'Multi-currency automated tax calculations for international shipping'
      ],
      assumptions: [
        'Client provides high-resolution photography and menu copy within 5 business days',
        'PayPal Sandbox credentials and store logo will be supplied prior to kickoff',
        'Hosting infrastructure on Vercel/Netlify with custom domain DNS managed by client'
      ],
      missing_information: [
        'Confirmation of maximum daily pickup order limits',
        'Preferred refund and cancellation policy wording'
      ],
      timeline_days: 18,
      milestones: [
        { title: 'Phase 1: Wireframes & Visual Architecture', days: 4, deliverable_summary: 'Figma mockups and responsive wireframes approved.' },
        { title: 'Phase 2: Storefront & Ordering Wizard Development', days: 9, deliverable_summary: 'Frontend build and customizer logic functional.' },
        { title: 'Phase 3: PayPal Sandbox Integration & Deployment', days: 5, deliverable_summary: 'End-to-end payment testing, QA and launch.' }
      ],
      approval_status: 'approved',
      approved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    }
  ];

  private quotations: Quotation[] = [
    {
      id: 'quote-1',
      project_id: 'proj-1',
      scope_version_id: 'scope-1',
      quotation_number: 'QUO-2026-001',
      amount: 3200,
      currency: 'USD',
      status: 'accepted',
      valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      notes: 'Includes 2 rounds of design revisions and 30 days post-launch warranty.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    }
  ];

  private invoices: Invoice[] = [
    {
      id: 'inv-1',
      project_id: 'proj-1',
      quotation_id: 'quote-1',
      invoice_number: 'INV-2026-001',
      share_token: 'tok_artisan_deposit_9921',
      amount_total: 1600, // 50% upfront milestone
      currency: 'USD',
      status: 'pending',
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    }
  ];

  private payments: Payment[] = [
    {
      id: 'pay-sample-1',
      invoice_id: 'inv-1',
      paypal_order_id: '8XX92817290192',
      paypal_capture_id: 'CAP-991204812',
      amount: 1600,
      currency: 'USD',
      status: 'captured',
      payer_email: 'buyer-sandbox@artisanbakery.com',
      payer_name: 'Sarah Jenkins',
      captured_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    }
  ];

  private webhookEvents: Array<{ id: string; event_id: string; event_type: string; processed_at: string }> = [];

  constructor() {
    const supabaseKey = config.supabase.serviceKey || config.supabase.anonKey;
    if (config.supabase.url && supabaseKey) {
      try {
        this.supabase = createClient(config.supabase.url, supabaseKey);
        this.isSupabaseConfigured = true;
        console.log('[DatabaseService] Connected to Supabase PostgreSQL at ' + config.supabase.url);
      } catch (err) {
        console.warn('[DatabaseService] Failed to initialize Supabase client, using local store', err);
      }
    } else {
      console.log('[DatabaseService] Supabase credentials not set, operating in robust local development store mode');
    }
  }

  // --- Profile Methods ---
  async getProfile(): Promise<Profile> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('profiles').select('*').limit(1).single();
      if (!error && data) return data as Profile;
    }
    return this.profile;
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    this.profile = { ...this.profile, ...updates };
    if (this.supabase) {
      await this.supabase.from('profiles').upsert(this.profile);
    }
    return this.profile;
  }

  // --- Client Methods ---
  async getClients(): Promise<Client[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Client[];
    }
    return this.clients;
  }

  async createClient(clientData: { name: string; email: string; company?: string }): Promise<Client> {
    const newClient: Client = {
      id: uuidv4(),
      user_id: this.defaultUserId,
      name: clientData.name,
      email: clientData.email,
      company: clientData.company,
      created_at: new Date().toISOString()
    };
    if (this.supabase) {
      await this.supabase.from('clients').insert(newClient);
    }
    this.clients.unshift(newClient);
    return newClient;
  }

  // --- Project Methods ---
  async getProjects(): Promise<Project[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Project[];
    }
    return this.projects;
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) return data as Project;
    }
    return this.projects.find(p => p.id === id) || null;
  }

  async createProject(projectData: {
    title: string;
    description?: string;
    budget?: number;
    currency?: string;
    client_name?: string;
    client_email?: string;
  }): Promise<Project> {
    let clientId: string | undefined;
    if (projectData.client_name && projectData.client_email) {
      let existingClient = this.clients.find(c => c.email.toLowerCase() === projectData.client_email?.toLowerCase());
      if (!existingClient) {
        existingClient = await this.createClient({
          name: projectData.client_name,
          email: projectData.client_email
        });
      }
      clientId = existingClient.id;
    }

    const newProject: Project = {
      id: uuidv4(),
      user_id: this.defaultUserId,
      client_id: clientId,
      client_name: projectData.client_name,
      client_email: projectData.client_email,
      title: projectData.title,
      description: projectData.description || '',
      budget: projectData.budget || 0,
      currency: projectData.currency || 'USD',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.supabase) {
      await this.supabase.from('projects').insert(newProject);
    }
    this.projects.unshift(newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const proj = this.projects.find(p => p.id === id);
    if (!proj) return null;
    Object.assign(proj, updates, { updated_at: new Date().toISOString() });
    if (this.supabase) {
      await this.supabase.from('projects').update(updates).eq('id', id);
    }
    return proj;
  }

  // --- Scope Version Methods ---
  async getScopeVersions(projectId: string): Promise<ScopeVersion[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('scope_versions').select('*').eq('project_id', projectId).order('version_number', { ascending: false });
      if (!error && data) return data as ScopeVersion[];
    }
    return this.scopeVersions.filter(s => s.project_id === projectId);
  }

  async getScopeVersionById(id: string): Promise<ScopeVersion | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('scope_versions').select('*').eq('id', id).single();
      if (!error && data) return data as ScopeVersion;
    }
    return this.scopeVersions.find(s => s.id === id) || null;
  }

  async createScopeVersion(scopeData: Omit<ScopeVersion, 'id' | 'created_at'>): Promise<ScopeVersion> {
    const existing = this.scopeVersions.filter(s => s.project_id === scopeData.project_id);
    const versionNumber = scopeData.version_number || (existing.length + 1);

    const newScope: ScopeVersion = {
      ...scopeData,
      id: uuidv4(),
      version_number: versionNumber,
      created_at: new Date().toISOString()
    };

    if (this.supabase) {
      await this.supabase.from('scope_versions').insert(newScope);
    }
    this.scopeVersions.unshift(newScope);
    return newScope;
  }

  async approveScopeVersion(id: string): Promise<ScopeVersion | null> {
    const scope = this.scopeVersions.find(s => s.id === id);
    if (!scope) return null;
    scope.approval_status = 'approved';
    scope.approved_at = new Date().toISOString();

    // Also update project status to approved
    await this.updateProject(scope.project_id, { status: 'approved' });

    if (this.supabase) {
      await this.supabase.from('scope_versions').update({
        approval_status: 'approved',
        approved_at: scope.approved_at
      }).eq('id', id);
    }
    return scope;
  }

  // --- Quotation Methods ---
  async getQuotations(projectId?: string): Promise<Quotation[]> {
    if (this.supabase) {
      let query = this.supabase.from('quotations').select('*').order('created_at', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (!error && data) return data as Quotation[];
    }
    if (projectId) return this.quotations.filter(q => q.project_id === projectId);
    return this.quotations;
  }

  async getQuotationById(id: string): Promise<Quotation | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('quotations').select('*').eq('id', id).single();
      if (!error && data) return data as Quotation;
    }
    return this.quotations.find(q => q.id === id) || null;
  }

  async createQuotation(data: {
    project_id: string;
    scope_version_id?: string;
    amount: number;
    currency?: string;
    notes?: string;
    valid_days?: number;
  }): Promise<Quotation> {
    const count = this.quotations.length + 1;
    const year = new Date().getFullYear();
    const quotation_number = `QUO-${year}-${String(count).padStart(3, '0')}`;
    const validUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * (data.valid_days || 14)).toISOString();

    const newQuotation: Quotation = {
      id: uuidv4(),
      project_id: data.project_id,
      scope_version_id: data.scope_version_id,
      quotation_number,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'draft',
      valid_until: validUntil,
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };

    if (this.supabase) {
      await this.supabase.from('quotations').insert(newQuotation);
    }
    this.quotations.unshift(newQuotation);
    return newQuotation;
  }

  async updateQuotationStatus(id: string, status: Quotation['status']): Promise<Quotation | null> {
    const q = this.quotations.find(item => item.id === id);
    if (!q) return null;
    q.status = status;
    if (this.supabase) {
      await this.supabase.from('quotations').update({ status }).eq('id', id);
    }
    return q;
  }

  // --- Invoice Methods ---
  async getInvoices(projectId?: string): Promise<Invoice[]> {
    if (this.supabase) {
      let query = this.supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (!error && data) return data as Invoice[];
    }
    if (projectId) return this.invoices.filter(i => i.project_id === projectId);
    return this.invoices;
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('invoices').select('*').eq('id', id).single();
      if (!error && data) return data as Invoice;
    }
    return this.invoices.find(i => i.id === id) || null;
  }

  async getInvoiceByShareToken(token: string): Promise<Invoice | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('invoices').select('*').eq('share_token', token).single();
      if (!error && data) return data as Invoice;
    }
    return this.invoices.find(i => i.share_token === token || i.id === token) || null;
  }

  async createInvoice(data: {
    project_id: string;
    quotation_id?: string;
    amount_total: number;
    currency?: string;
    due_days?: number;
  }): Promise<Invoice> {
    const count = this.invoices.length + 1;
    const year = new Date().getFullYear();
    const invoice_number = `INV-${year}-${String(count).padStart(3, '0')}`;
    const share_token = `tok_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const dueDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * (data.due_days || 7)).toISOString();

    const newInvoice: Invoice = {
      id: uuidv4(),
      project_id: data.project_id,
      quotation_id: data.quotation_id,
      invoice_number,
      share_token,
      amount_total: data.amount_total,
      currency: data.currency || 'USD',
      status: 'pending',
      due_date: dueDate,
      created_at: new Date().toISOString()
    };

    if (this.supabase) {
      await this.supabase.from('invoices').insert(newInvoice);
    }
    this.invoices.unshift(newInvoice);
    return newInvoice;
  }

  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice | null> {
    const inv = this.invoices.find(i => i.id === id);
    if (!inv) return null;
    inv.status = status;
    if (this.supabase) {
      await this.supabase.from('invoices').update({ status }).eq('id', id);
    }
    return inv;
  }

  // --- Payment Methods ---
  async getPayments(): Promise<Payment[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Payment[];
    }
    return this.payments;
  }

  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };
    if (this.supabase) {
      await this.supabase.from('payments').insert(newPayment);
    }
    this.payments.unshift(newPayment);
    return newPayment;
  }

  // --- Webhook Events ---
  async hasProcessedWebhook(eventId: string): Promise<boolean> {
    if (this.supabase) {
      const { data } = await this.supabase.from('payment_webhook_events').select('id').eq('paypal_event_id', eventId).single();
      if (data) return true;
    }
    return this.webhookEvents.some(w => w.event_id === eventId);
  }

  async recordWebhookEvent(eventId: string, eventType: string): Promise<void> {
    const record = {
      id: uuidv4(),
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString()
    };
    this.webhookEvents.push(record);
    if (this.supabase) {
      await this.supabase.from('payment_webhook_events').insert({
        paypal_event_id: eventId,
        event_type: eventType
      });
    }
  }

  // Comprehensive analytics for dashboard
  async getDashboardSummary() {
    const projects = await this.getProjects();
    const invoices = await this.getInvoices();
    const payments = await this.getPayments();

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => ['proposed', 'approved', 'in_progress'].includes(p.status)).length;
    const outstandingInvoices = invoices.filter(i => i.status === 'pending');
    const outstandingAmount = outstandingInvoices.reduce((acc, curr) => acc + Number(curr.amount_total), 0);
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const receivedPayments = payments.filter(p => p.status === 'captured');
    const totalReceivedAmount = receivedPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      totalProjects,
      activeProjects,
      outstandingInvoicesCount: outstandingInvoices.length,
      outstandingAmount,
      paidInvoicesCount: paidInvoices.length,
      totalReceivedAmount,
      recentProjects: projects.slice(0, 5),
      recentPayments: payments.slice(0, 5)
    };
  }
}

export const dbService = new DatabaseService();
