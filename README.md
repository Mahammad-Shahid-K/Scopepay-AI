# ScopePay AI

> **Agree on the work. Get paid. Avoid scope creep.**

An AI-powered project agreement, quotation, invoice, scope management, and verified payment assistant designed for freelancers, web developers, UI/UX designers, consultants, and independent agencies.

Built for the **PayPal AI Hackathon**.

---

## 🚀 Overview

Freelancers and boutique agencies routinely suffer from **unpaid scope creep**, ambiguous client briefs, and fractured billing processes. ScopePay AI bridges this gap using Google Gemini AI and the PayPal Orders REST API:

1. **AI Scope Generator**: Turns unstructured client emails or briefs into structured proposals containing explicit deliverables, contractual exclusions, assumptions, missing questions, and delivery milestones.
2. **Quotation & Invoicing**: Formalizes approved scopes into clear quotations and milestone invoices with secure, shareable customer checkout links.
3. **Verified PayPal Sandbox Checkout**: Real server-to-server PayPal order creation and capture. The server recalculates and verifies payment amounts before updating invoices to `Paid`.
4. **Scope Creep Detection & Comparison**: When a client requests extra features mid-project, AI performs a side-by-side analysis against the approved Version 1 baseline, flags unauthorized additions, and drafts courteous revised quotes.

---

## 🎨 Visual Identity & Design System

The application is built strictly with a **clean white-and-red visual identity**:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Primary Background** | `#FFFFFF` | Main page background and card surfaces |
| **Secondary Background** | `#F9FAFB` | Subdued sections, table headers, and inputs |
| **Primary Red** | `#DC2626` | Primary action buttons, active navigation, brand accents |
| **Hover Red** | `#B91C1C` | Button hover and active states |
| **Light Red Background**| `#FEF2F2` | Active menu backgrounds, highlighted scope additions |
| **Main Text** | `#111827` | High contrast headings and typography |
| **Secondary Text** | `#6B7280` | Subtitles, labels, and metadata |
| **Borders** | `#E5E7EB` | Subtle dividers and card containers |
| **Verified Green** | `#15803D` | Reserved exclusively for backend-verified payments & approvals |

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router 6, `@paypal/react-paypal-js`.
* **Backend**: Node.js, Express, TypeScript, CORS, Dotenv.
* **Database**: Supabase PostgreSQL (DDL schema with Row Level Security in `server/src/db/schema.sql`) with resilient local fallback for zero-dependency development.
* **AI Provider**: Google Gemini API (`gemini-1.5-flash`) via structured JSON generation and fallback synthesis engine.
* **Payments**: PayPal Orders REST API v2 (`/v2/checkout/orders` & `/v2/checkout/orders/{id}/capture`) in sandbox mode.

---

## 📂 Repository Structure

```text
scopepay-ai/
├── client/                     # React + Vite frontend application
│   ├── src/
│   │   ├── components/         # Button, Card, Badge, Modal, Input, Table, Alert, EmptyState
│   │   │   └── layout/         # Persistent Sidebar, TopNav, AppLayout
│   │   ├── context/            # AuthContext (freelancer profile & demo login)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Screen 1: Brand hero, features, workflow demo
│   │   │   ├── LoginPage.tsx            # Screen 2: Authentication & 1-click test login
│   │   │   ├── DashboardPage.tsx        # Screen 3: 4 Summary cards, Recent projects, Verified payments
│   │   │   ├── CreateProjectPage.tsx    # Screen 4: Requirements input & AI Scope generator
│   │   │   ├── ScopeEditorPage.tsx      # Screen 5: 9 Editable scope sections & approval lock
│   │   │   ├── ScopeComparisonPage.tsx  # Screen 7: Side-by-side creep comparison & client reply
│   │   │   ├── QuotationsPage.tsx       # Screen 8: Quotation management & conversion to invoice
│   │   │   ├── InvoicesPage.tsx         # Screen 9: Invoices table & copyable payment links
│   │   │   ├── CustomerPaymentPage.tsx  # Screen 10: Public (/pay/:token) PayPal checkout
│   │   │   ├── PaymentHistoryPage.tsx   # Screen 11: Backend-verified transactions log
│   │   │   ├── ProjectDetailPage.tsx   # Screen 12: Central project tabs workspace
│   │   │   └── SettingsPage.tsx        # Screen 13: Profile, currency, API & Sandbox configs
│   │   ├── services/           # Typed api.ts client
│   │   ├── types/              # Domain TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css
│   └── tailwind.config.js
├── server/                     # Express Node.js backend API
│   ├── src/
│   │   ├── db/                 # schema.sql (Supabase DDL & RLS policies)
│   │   ├── services/
│   │   │   ├── gemini.service.ts        # Gemini AI scope generation & scope comparison
│   │   │   ├── paypal.service.ts        # Server order creation & verified capture
│   │   │   └── db.service.ts            # Supabase client + persistent store
│   │   ├── config.ts
│   │   └── index.ts                     # API endpoints
│   ├── tsconfig.json
│   └── package.json
├── package.json                # Root package with concurrent dev runner
├── .env.example
├── LICENSE
└── README.md
```

---

## ⚡ Quick Start & Local Run

### Prerequisites
* Node.js v20+ or v24+
* npm

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*(The application works out of the box with intelligent fallback generation and sandbox simulation even if API keys are not supplied immediately).*

### 3. Start Development Servers
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 🔄 End-to-End User Flow

1. **Sign In**: Launch the app, click **"Continue as Demo Freelancer (Alex Rivera)"** or register.
2. **Create Project**: Click **"+ Create New Project"**, enter customer details and raw project requirements.
3. **AI Scope Generation**: Click **"Generate Project Scope with AI"**. Review the structured deliverables, exclusions, assumptions, and timeline.
4. **Approve Scope**: Click **"Approve Scope"** to lock Version 1 as the official contract baseline.
5. **Issue Quotation & Invoice**: Generate a quotation and create an invoice with a single click.
6. **Customer Checkout**: Open the public checkout link (`/pay/:shareToken`), review deliverables, and click **PayPal Sandbox Checkout**.
7. **Server Verification**: The backend verifies the transaction, recalculates amounts, and records the captured payment.
8. **Detect Scope Creep**: In the project workspace, click **"Compare Scope Change"**, paste an incoming client addition, and watch the AI identify out-of-scope work, calculate required timeline/budget adjustments, and draft a polite email response!

---

## 🔒 Security & Backend Payment Verification

* **Server-Recalculated Amounts**: Invoice amounts are always pulled directly from the verified database record when creating PayPal orders. Client-side tampering is prevented.
* **Server-Side Capture**: Order capture is executed exclusively server-to-server using the PayPal Orders REST API v2.
* **Unguessable Share Tokens**: Public customer payment URLs use secure unguessable tokens (`/pay/tok_...`) rather than raw database IDs.
* **Supabase Row-Level Security (RLS)**: Policies ensure freelancers access only their own projects and invoices.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
