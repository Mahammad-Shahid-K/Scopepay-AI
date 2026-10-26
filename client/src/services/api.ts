import {
  DashboardSummary,
  Project,
  ScopeVersion,
  Quotation,
  Invoice,
  Payment,
  Profile,
  ScopeGenerationResult,
  ScopeComparisonResult,
  PublicInvoiceDetails
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetch(`${API_BASE}/dashboard`).then(res => handleResponse<DashboardSummary>(res)),

  // Projects
  getProjects: () => fetch(`${API_BASE}/projects`).then(res => handleResponse<Project[]>(res)),
  getProject: (id: string) => fetch(`${API_BASE}/projects/${id}`).then(res => handleResponse<Project>(res)),
  createProject: (data: {
    title: string;
    description?: string;
    budget?: number;
    currency?: string;
    client_name?: string;
    client_email?: string;
  }) => fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<Project>(res)),

  updateProject: (id: string, updates: Partial<Project>) => fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  }).then(res => handleResponse<Project>(res)),

  // AI Scope Generator & Comparison
  generateScope: (data: {
    title: string;
    clientName?: string;
    description?: string;
    requirements: string;
    budget?: number;
    currency?: string;
  }) => fetch(`${API_BASE}/ai/generate-scope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<ScopeGenerationResult>(res)),

  compareScope: (data: {
    approvedScope: any;
    newCustomerRequest: string;
  }) => fetch(`${API_BASE}/ai/compare-scope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<ScopeComparisonResult>(res)),

  // Scope Versions
  saveScopeVersion: (data: Partial<ScopeVersion>) => fetch(`${API_BASE}/scopes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<ScopeVersion>(res)),

  approveScopeVersion: (id: string) => fetch(`${API_BASE}/scopes/${id}/approve`, {
    method: 'POST'
  }).then(res => handleResponse<ScopeVersion>(res)),

  // Quotations
  getQuotations: (projectId?: string) => {
    const url = projectId ? `${API_BASE}/quotations?project_id=${projectId}` : `${API_BASE}/quotations`;
    return fetch(url).then(res => handleResponse<Quotation[]>(res));
  },
  createQuotation: (data: {
    project_id: string;
    scope_version_id?: string;
    amount: number;
    currency?: string;
    notes?: string;
    valid_days?: number;
  }) => fetch(`${API_BASE}/quotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<Quotation>(res)),

  // Invoices
  getInvoices: (projectId?: string) => {
    const url = projectId ? `${API_BASE}/invoices?project_id=${projectId}` : `${API_BASE}/invoices`;
    return fetch(url).then(res => handleResponse<Invoice[]>(res));
  },
  getInvoice: (id: string) => fetch(`${API_BASE}/invoices/${id}`).then(res => handleResponse<Invoice & { project: Project }>(res)),
  getPublicInvoice: (shareToken: string) => fetch(`${API_BASE}/invoices/public/${shareToken}`).then(res => handleResponse<PublicInvoiceDetails>(res)),
  createInvoice: (data: {
    project_id: string;
    quotation_id?: string;
    amount_total: number;
    currency?: string;
    due_days?: number;
  }) => fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<Invoice>(res)),

  // PayPal Sandbox
  createPayPalOrder: (invoiceId: string) => fetch(`${API_BASE}/paypal/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId })
  }).then(res => handleResponse<{ orderId: string; currency: string; amount: number }>(res)),

  capturePayPalOrder: (orderId: string, invoiceId: string) => fetch(`${API_BASE}/paypal/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId })
  }).then(res => handleResponse<{
    success: boolean;
    orderId: string;
    captureId: string;
    amount: number;
    currency: string;
    status: string;
    payerName?: string;
    invoice: Invoice;
    payment: Payment;
  }>(res)),

  // Payments History
  getPayments: () => fetch(`${API_BASE}/payments`).then(res => handleResponse<Payment[]>(res)),

  // Settings
  getSettings: () => fetch(`${API_BASE}/settings`).then(res => handleResponse<Profile>(res)),
  updateSettings: (data: Partial<Profile> & { gemini_api_key?: string }) => fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => handleResponse<Profile>(res))
};
