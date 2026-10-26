import { config } from '../config';

export interface ScopeGenerationInput {
  title: string;
  clientName?: string;
  description?: string;
  requirements: string;
  budget?: number;
  currency?: string;
}

export interface ScopeGenerationOutput {
  overview: string;
  objectives: string[];
  deliverables: Array<{ title: string; description: string; complexity: 'Low' | 'Medium' | 'High' }>;
  features: Array<{ category: string; title: string; details: string }>;
  exclusions: string[];
  assumptions: string[];
  missingInformation: string[];
  timelineDays: number;
  milestones: Array<{ title: string; days: number; deliverable_summary: string }>;
  suggestedBudget?: number;
}

export interface ScopeComparisonInput {
  approvedScope: {
    title?: string;
    overview?: string;
    deliverables: Array<{ title: string; description: string }>;
    exclusions?: string[];
    timeline_days?: number;
  };
  newCustomerRequest: string;
}

export interface ScopeComparisonOutput {
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

class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.gemini.apiKey;
    if (this.apiKey) {
      console.log('[GeminiService] Initialized with Gemini API key');
    } else {
      console.log('[GeminiService] No GEMINI_API_KEY detected; using intelligent fallback generator');
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async generateScope(input: ScopeGenerationInput): Promise<ScopeGenerationOutput> {
    if (this.apiKey) {
      try {
        const prompt = `You are an expert freelance contract, project agreement, and scope engineer.
Analyze the following project brief and customer requirements, then produce a strictly structured JSON response.

Project Title: ${input.title}
Client Name: ${input.clientName || 'Valued Client'}
Description: ${input.description || 'N/A'}
Requirements: ${input.requirements}
Target Budget: ${input.budget ? `${input.currency || 'USD'} ${input.budget}` : 'To be determined'}

Provide JSON strictly matching this schema with NO markdown fences, NO extra words:
{
  "overview": "Clear 2-3 sentence summary of the project scope",
  "objectives": ["Primary goal 1", "Primary goal 2", "Primary goal 3"],
  "deliverables": [
    { "title": "Deliverable Name", "description": "Specific details of what will be produced", "complexity": "Low" | "Medium" | "High" }
  ],
  "features": [
    { "category": "Category Name (e.g. Frontend, Auth, Payment)", "title": "Feature Title", "details": "Specific functional specifications" }
  ],
  "exclusions": [
    "Explicitly out of scope item 1",
    "Explicitly out of scope item 2",
    "Explicitly out of scope item 3"
  ],
  "assumptions": [
    "Project assumption 1 (e.g. client supplies assets within X days)",
    "Project assumption 2",
    "Project assumption 3"
  ],
  "missingInformation": [
    "Crucial missing detail or question to confirm with client 1",
    "Crucial missing detail 2"
  ],
  "timelineDays": 14,
  "milestones": [
    { "title": "Milestone 1", "days": 4, "deliverable_summary": "Summary of milestone deliverables" }
  ],
  "suggestedBudget": 2500
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2
              }
            })
          }
        );

        if (response.ok) {
          const result = await response.json();
          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return this.validateAndSanitizeScopeOutput(parsed, input);
          }
        } else {
          console.warn('[GeminiService] Gemini API returned error status:', response.status);
        }
      } catch (err) {
        console.warn('[GeminiService] Error calling Gemini API, falling back to deterministic AI parser:', err);
      }
    }

    return this.fallbackGenerateScope(input);
  }

  async compareScope(input: ScopeComparisonInput): Promise<ScopeComparisonOutput> {
    if (this.apiKey) {
      try {
        const prompt = `You are an expert freelance contract protection and scope creep detection assistant.
Compare the newly submitted customer request with the existing approved scope. Determine whether new work is requested, whether it conflicts with exclusions, and provide a clear recommendation.

Approved Scope:
${JSON.stringify(input.approvedScope, null, 2)}

New Customer Request:
"${input.newCustomerRequest}"

Respond strictly with valid JSON with NO markdown fences, NO extra words matching:
{
  "isScopeChange": true or false,
  "summary": "Clear summary of the scope comparison and analysis",
  "newRequirements": [
    {
      "title": "New item title",
      "description": "Why this is an addition to agreed scope",
      "impact": "Low" | "Medium" | "High",
      "estimatedDays": 2,
      "estimatedCost": 350
    }
  ],
  "existingRequirements": ["Requirement that is already included in agreed scope"],
  "potentiallyExcludedWork": ["Items that directly conflict with agreed exclusions"],
  "missingInformation": ["Clarification questions needed to finalize estimate"],
  "followUpQuestions": ["Polite question to ask the client"],
  "recommendedAction": "create_revised_quotation" | "approve_existing" | "clarify_requirements",
  "recommendedAdditionalCost": 350,
  "recommendedAdditionalDays": 3,
  "draftClientMessage": "Polite, professional message explaining the scope review and outlining next steps."
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2
              }
            })
          }
        );

        if (response.ok) {
          const result = await response.json();
          const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return this.validateAndSanitizeComparisonOutput(parsed);
          }
        }
      } catch (err) {
        console.warn('[GeminiService] Error calling Gemini API for comparison, using fallback analyzer:', err);
      }
    }

    return this.fallbackCompareScope(input);
  }

  // --- Fallback Generators ---
  private fallbackGenerateScope(input: ScopeGenerationInput): ScopeGenerationOutput {
    const title = input.title.trim() || 'Custom Development Project';
    const reqText = input.requirements.toLowerCase();
    const budget = input.budget || 2400;

    const isEcommerce = reqText.includes('shop') || reqText.includes('ecommerce') || reqText.includes('cart') || reqText.includes('store') || reqText.includes('payment');
    const isMobile = reqText.includes('mobile') || reqText.includes('ios') || reqText.includes('android') || reqText.includes('app');
    const isDesign = reqText.includes('design') || reqText.includes('figma') || reqText.includes('ui') || reqText.includes('ux') || reqText.includes('brand');

    return {
      overview: `Complete end-to-end design and engineering for "${title}". This proposal establishes clearly defined deliverables, technical architecture, and a milestone delivery roadmap tailored to the client's specifications.`,
      objectives: [
        `Deliver a high-performance, modern digital solution for ${title}`,
        'Provide responsive, intuitive user journeys with accessible interactions',
        'Incorporate secure checkout and automated transaction verification via PayPal Sandbox'
      ],
      deliverables: [
        {
          title: 'Core Architecture & User Interface',
          description: 'Responsive, mobile-first design implemented with clean component architecture and design tokens.',
          complexity: 'Medium'
        },
        {
          title: isEcommerce ? 'Catalog, Cart & Checkout Engine' : 'Functional Application Modules & Workflows',
          description: isEcommerce 
            ? 'Interactive product showcase, custom item options, cart management, and seamless order capture.'
            : 'Interactive user dashboard, state management, form validations, and data persistence.',
          complexity: 'High'
        },
        {
          title: 'Payment Integration & Verification',
          description: 'PayPal Sandbox integration with server-side order creation, capture, and instant invoice status synchronization.',
          complexity: 'Medium'
        },
        {
          title: 'Testing, Deployment & Documentation',
          description: 'Cross-browser testing, performance audit, deployment to cloud hosting, and handover guide.',
          complexity: 'Low'
        }
      ],
      features: [
        {
          category: 'Frontend',
          title: 'Responsive UI Design System',
          details: 'Pixel-perfect typography, clean navigation, and accessible mobile layouts.'
        },
        {
          category: 'Business Logic',
          title: 'Workflow Automation',
          details: 'User input processing, status validation, and state persistence.'
        },
        {
          category: 'Payments',
          title: 'PayPal Sandbox Orders API',
          details: 'Secure modal/button checkout, server verification, and immutable transaction records.'
        }
      ],
      exclusions: [
        'Native iOS/Android App Store submissions (unless separately contracted)',
        'Third-party software subscription licenses, domain registrations, or hosting fees',
        'Unbounded creative redesign cycles beyond the 2 included feedback revisions',
        'Ongoing 24/7 post-launch maintenance or custom legacy database migrations'
      ],
      assumptions: [
        'Client will provide brand assets, logos, and high-resolution media within 4 business days of kickoff',
        'Client will test and approve sandbox payments in PayPal Sandbox environment before production rollout',
        'Communications and revision feedback will be delivered through consolidated written channels'
      ],
      missingInformation: [
        'Final list of required third-party integration credentials (e.g. CRM, Analytics)',
        'Preferred payment deposit schedule (e.g. 50% upfront, 50% upon completion)'
      ],
      timelineDays: 14,
      milestones: [
        {
          title: 'Milestone 1: Discovery, UX Wireframes & Style Approval',
          days: 3,
          deliverable_summary: 'Brand alignment, core user flows, and wireframe sign-off.'
        },
        {
          title: 'Milestone 2: Frontend & Functional Logic Development',
          days: 7,
          deliverable_summary: 'Full interactive components, data forms, and application flow.'
        },
        {
          title: 'Milestone 3: Payment Integration, QA Testing & Launch',
          days: 4,
          deliverable_summary: 'PayPal Sandbox verification, QA testing, deployment, and handover.'
        }
      ],
      suggestedBudget: budget
    };
  }

  private fallbackCompareScope(input: ScopeComparisonInput): ScopeComparisonOutput {
    const newReq = input.newCustomerRequest.toLowerCase();
    const approvedDeliverables = (input.approvedScope.deliverables || []).map(d => d.title.toLowerCase());
    
    // Analyze keywords in new request
    const isMajor = newReq.includes('app') || newReq.includes('portal') || newReq.includes('multi-vendor') || newReq.includes('ai') || newReq.includes('chat') || newReq.includes('crm') || newReq.includes('subscription');
    const estimatedCost = isMajor ? 850 : 350;
    const estimatedDays = isMajor ? 5 : 2;

    return {
      isScopeChange: true,
      summary: `The client has requested additional capabilities that were not part of the initial approved scope. Addressing these items requires dedicated design, technical implementation, and testing time.`,
      newRequirements: [
        {
          title: 'Additional Feature Implementation',
          description: `The request "${input.newCustomerRequest.slice(0, 100)}..." specifies new requirements outside the baseline deliverables.`,
          impact: isMajor ? 'High' : 'Medium',
          estimatedDays,
          estimatedCost
        }
      ],
      existingRequirements: approvedDeliverables.slice(0, 2),
      potentiallyExcludedWork: [
        'Unscheduled feature additions without adjusting project delivery milestones',
        'Custom third-party integrations outside the baseline contract'
      ],
      missingInformation: [
        'Detailed specification for the newly requested workflow',
        'Expected priority relative to the agreed original deadline'
      ],
      followUpQuestions: [
        'Would you like this added as Phase 2, or incorporated into a revised quotation for Phase 1?',
        'Does the proposed timeline extension of approximately ' + estimatedDays + ' business days fit your schedule?'
      ],
      recommendedAction: 'create_revised_quotation',
      recommendedAdditionalCost: estimatedCost,
      recommendedAdditionalDays: estimatedDays,
      draftClientMessage: `Hi there, thank you for sharing these additional thoughts! I reviewed the request regarding "${input.newCustomerRequest.slice(0, 80)}...". Because this adds functionality outside our approved initial scope, I've prepared a brief change assessment with an estimated add-on of $${estimatedCost} and ~${estimatedDays} days. Would you like me to send over a revised quotation so we can keep the agreement crystal clear?`
    };
  }

  private validateAndSanitizeScopeOutput(parsed: any, input: ScopeGenerationInput): ScopeGenerationOutput {
    return {
      overview: typeof parsed.overview === 'string' ? parsed.overview : `Project scope for ${input.title}`,
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : ['Deliver project on time and within scope'],
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      features: Array.isArray(parsed.features) ? parsed.features : [],
      exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions : [],
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : [],
      timelineDays: typeof parsed.timelineDays === 'number' ? parsed.timelineDays : 14,
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
      suggestedBudget: typeof parsed.suggestedBudget === 'number' ? parsed.suggestedBudget : input.budget
    };
  }

  private validateAndSanitizeComparisonOutput(parsed: any): ScopeComparisonOutput {
    return {
      isScopeChange: typeof parsed.isScopeChange === 'boolean' ? parsed.isScopeChange : true,
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Scope comparison completed.',
      newRequirements: Array.isArray(parsed.newRequirements) ? parsed.newRequirements : [],
      existingRequirements: Array.isArray(parsed.existingRequirements) ? parsed.existingRequirements : [],
      potentiallyExcludedWork: Array.isArray(parsed.potentiallyExcludedWork) ? parsed.potentiallyExcludedWork : [],
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : [],
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      recommendedAction: ['approve_existing', 'create_revised_quotation', 'clarify_requirements'].includes(parsed.recommendedAction)
        ? parsed.recommendedAction
        : 'create_revised_quotation',
      recommendedAdditionalCost: typeof parsed.recommendedAdditionalCost === 'number' ? parsed.recommendedAdditionalCost : 0,
      recommendedAdditionalDays: typeof parsed.recommendedAdditionalDays === 'number' ? parsed.recommendedAdditionalDays : 0,
      draftClientMessage: typeof parsed.draftClientMessage === 'string' ? parsed.draftClientMessage : ''
    };
  }
}

export const geminiService = new GeminiService();
