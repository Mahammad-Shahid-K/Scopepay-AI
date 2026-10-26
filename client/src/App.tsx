import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ScopeEditorPage } from './pages/ScopeEditorPage';
import { ScopeComparisonPage } from './pages/ScopeComparisonPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { CustomerPaymentPage } from './pages/CustomerPaymentPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Public Customer Payment Checkout Route */}
          <Route path="/pay/:shareToken" element={<CustomerPaymentPage />} />

          {/* Authenticated Dashboard & Workspace */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/projects/:projectId/scope" element={<ScopeEditorPage />} />
            <Route path="/projects/:projectId/scope/:scopeId" element={<ScopeEditorPage />} />
            <Route path="/projects/:projectId/compare" element={<ScopeComparisonPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/payments" element={<PaymentHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
