import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { dbService } from './services/db.service';
import { geminiService } from './services/gemini.service';
import { paypalService } from './services/paypal.service';

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'ScopePay AI API',
    version: '1.0.0',
    paypalMode: config.paypal.mode,
    timestamp: new Date().toISOString()
  });
});

// ---------------- DASHBOARD ----------------
app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    const summary = await dbService.getDashboardSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load dashboard summary' });
  }
});

// ---------------- PROJECTS ----------------
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const projects = await dbService.getProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load projects' });
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await dbService.getProjectById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const scopes = await dbService.getScopeVersions(project.id);
    const quotations = await dbService.getQuotations(project.id);
    const invoices = await dbService.getInvoices(project.id);

    res.json({
      ...project,
      scopes,
      quotations,
      invoices
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load project details' });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const { title, client_name, client_email, description, budget, currency } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required' });
    }
    const project = await dbService.createProject({
      title,
      client_name,
      client_email,
      description,
      budget: budget ? parseFloat(budget) : 0,
      currency: currency || 'USD'
    });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});

app.patch('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await dbService.updateProject(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update project' });
  }
});

// ---------------- AI SERVICES ----------------
app.post('/api/ai/generate-scope', async (req: Request, res: Response) => {
  try {
    const { title, clientName, description, requirements, budget, currency } = req.body;
    if (!title || !requirements) {
      return res.status(400).json({ error: 'Project title and customer requirements are required.' });
    }

    const scopeOutput = await geminiService.generateScope({
      title,
      clientName,
      description,
      requirements,
      budget: budget ? parseFloat(budget) : undefined,
      currency: currency || 'USD'
    });

    res.json(scopeOutput);
  } catch (err: any) {
    console.error('Error in /api/ai/generate-scope:', err);
    res.status(500).json({ error: err.message || 'Failed to generate project scope' });
  }
});

app.post('/api/ai/compare-scope', async (req: Request, res: Response) => {
  try {
    const { approvedScope, newCustomerRequest } = req.body;
    if (!approvedScope || !newCustomerRequest) {
      return res.status(400).json({ error: 'Both approved scope and new customer request are required.' });
    }

    const comparisonOutput = await geminiService.compareScope({
      approvedScope,
      newCustomerRequest
    });

    res.json(comparisonOutput);
  } catch (err: any) {
    console.error('Error in /api/ai/compare-scope:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze scope change' });
  }
});

// ---------------- SCOPE VERSIONS ----------------
app.get('/api/projects/:id/scopes', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const scopes = await dbService.getScopeVersions(id);
    res.json(scopes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch scope versions' });
  }
});

app.post('/api/scopes', async (req: Request, res: Response) => {
  try {
    const {
      project_id,
      overview,
      objectives,
      deliverables,
      features,
      exclusions,
      assumptions,
      missing_information,
      timeline_days,
      milestones,
      approval_status
    } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    const created = await dbService.createScopeVersion({
      project_id,
      version_number: 1, // calculated dynamically in service
      overview: overview || '',
      objectives: objectives || [],
      deliverables: deliverables || [],
      features: features || [],
      exclusions: exclusions || [],
      assumptions: assumptions || [],
      missing_information: missing_information || [],
      timeline_days: timeline_days || 14,
      milestones: milestones || [],
      approval_status: approval_status || 'draft'
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save scope version' });
  }
});

app.post('/api/scopes/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const approved = await dbService.approveScopeVersion(id);
    if (!approved) return res.status(404).json({ error: 'Scope version not found' });
    res.json(approved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to approve scope' });
  }
});

// ---------------- QUOTATIONS ----------------
app.get('/api/quotations', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.project_id as string | undefined;
    const quotations = await dbService.getQuotations(projectId);
    res.json(quotations);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch quotations' });
  }
});

app.post('/api/quotations', async (req: Request, res: Response) => {
  try {
    const { project_id, scope_version_id, amount, currency, notes, valid_days } = req.body;
    if (!project_id || amount === undefined) {
      return res.status(400).json({ error: 'project_id and amount are required' });
    }
    const quotation = await dbService.createQuotation({
      project_id,
      scope_version_id,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      notes,
      valid_days
    });
    res.status(201).json(quotation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create quotation' });
  }
});

// ---------------- INVOICES ----------------
app.get('/api/invoices', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.project_id as string | undefined;
    const invoices = await dbService.getInvoices(projectId);
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch invoices' });
  }
});

app.get('/api/invoices/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const invoice = await dbService.getInvoiceById(id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    const project = await dbService.getProjectById(invoice.project_id);
    const profile = await dbService.getProfile();
    res.json({ ...invoice, project, freelancer: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch invoice' });
  }
});

// Secure public invoice access by unguessable share token
app.get('/api/invoices/public/:shareToken', async (req: Request, res: Response) => {
  try {
    const shareToken = String(req.params.shareToken);
    const invoice = await dbService.getInvoiceByShareToken(shareToken);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found or invalid share token' });
    const project = await dbService.getProjectById(invoice.project_id);
    const profile = await dbService.getProfile();
    const scopes = await dbService.getScopeVersions(invoice.project_id);
    const approvedScope = scopes.find(s => s.approval_status === 'approved') || scopes[0];

    res.json({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount_total: invoice.amount_total,
      currency: invoice.currency,
      status: invoice.status,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      project_title: project?.title || 'Project Deliverables',
      project_description: project?.description || '',
      freelancer_name: profile.full_name,
      freelancer_business: profile.business_name,
      deliverables: approvedScope?.deliverables || [],
      paypal_client_id: paypalService.getClientId()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch public invoice' });
  }
});

app.post('/api/invoices', async (req: Request, res: Response) => {
  try {
    const { project_id, quotation_id, amount_total, currency, due_days } = req.body;
    if (!project_id || amount_total === undefined) {
      return res.status(400).json({ error: 'project_id and amount_total are required' });
    }
    const invoice = await dbService.createInvoice({
      project_id,
      quotation_id,
      amount_total: parseFloat(amount_total),
      currency: currency || 'USD',
      due_days
    });
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create invoice' });
  }
});

// ---------------- PAYPAL SANDBOX INTEGRATION ----------------
app.post('/api/paypal/orders', async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ error: 'invoiceId is required' });
    }
    const order = await paypalService.createOrder(invoiceId);
    res.json(order);
  } catch (err: any) {
    console.error('Error in /api/paypal/orders:', err);
    res.status(400).json({ error: err.message || 'Failed to create PayPal order' });
  }
});

app.post('/api/paypal/orders/:orderId/capture', async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId);
    const { invoiceId } = req.body;
    if (!orderId || !invoiceId) {
      return res.status(400).json({ error: 'orderId and invoiceId are required' });
    }

    const captureResult = await paypalService.captureOrder(orderId, invoiceId);
    res.json(captureResult);
  } catch (err: any) {
    console.error('Error in /api/paypal/orders/:orderId/capture:', err);
    res.status(400).json({ error: err.message || 'Payment capture and verification failed' });
  }
});

app.post('/api/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventId = event?.id || `sim-evt-${Date.now()}`;
    const eventType = event?.event_type || 'PAYMENT.CAPTURE.COMPLETED';

    const alreadyProcessed = await dbService.hasProcessedWebhook(eventId);
    if (alreadyProcessed) {
      return res.status(200).json({ status: 'ignored_duplicate' });
    }

    await dbService.recordWebhookEvent(eventId, eventType);
    res.status(200).json({ status: 'processed', eventId });
  } catch (err: any) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// ---------------- PAYMENTS ----------------
app.get('/api/payments', async (req: Request, res: Response) => {
  try {
    const payments = await dbService.getPayments();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch payments' });
  }
});

// ---------------- SETTINGS & PROFILE ----------------
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const profile = await dbService.getProfile();
    res.json({
      ...profile,
      hasGeminiKey: Boolean(config.gemini.apiKey),
      hasPayPalKeys: Boolean(config.paypal.clientId && config.paypal.clientSecret),
      paypalMode: config.paypal.mode
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get settings' });
  }
});

app.post('/api/settings', async (req: Request, res: Response) => {
  try {
    const { full_name, business_name, email, default_currency, gemini_api_key } = req.body;
    const updated = await dbService.updateProfile({
      full_name,
      business_name,
      email,
      default_currency
    });

    if (gemini_api_key) {
      geminiService.setApiKey(gemini_api_key);
    }

    res.json({
      ...updated,
      hasGeminiKey: Boolean(config.gemini.apiKey || gemini_api_key),
      hasPayPalKeys: Boolean(config.paypal.clientId && config.paypal.clientSecret),
      paypalMode: config.paypal.mode
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`[ScopePay AI] Server running on http://localhost:${PORT}`);
  console.log(`[ScopePay AI] Connected to frontend at ${config.clientUrl}`);
});
