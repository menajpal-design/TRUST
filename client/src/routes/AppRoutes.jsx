import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardOverviewPage } from '../features/dashboard/DashboardOverviewPage';
import { OrganizationListPage } from '../features/organization/OrganizationListPage';
import { OrganizationSettingsPage } from '../features/organization/OrganizationSettingsPage';
import { CommitteeListPage } from '../features/committee/CommitteeListPage';
import { CommitteeDetailsPage } from '../features/committee/CommitteeDetailsPage';
import { MemberListPage } from '../features/member/MemberListPage';
import { FinanceDashboardPage } from '../features/finance/FinanceDashboardPage';
import { ReceiptListPage } from '../features/receipt/ReceiptListPage';
import { PublicVerifyReceiptPage } from '../features/receipt/PublicVerifyReceiptPage';
import { BudgetListPage } from '../features/budget/BudgetListPage';
import { ChatDashboardPage } from '../features/chat/ChatDashboardPage';
import { ReportsDashboardPage } from '../features/reports/ReportsDashboardPage';
import { DonationDashboardPage } from '../features/donation/DonationDashboardPage';
import { EventDashboardPage } from '../features/event/EventDashboardPage';
import { SuperAdminDashboardPage } from '../features/superadmin/SuperAdminDashboardPage';
import { FeeManagementPage } from '../features/fee/FeeManagementPage';
import { LocationManagementPage } from '../features/geo/LocationManagementPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-receipt" element={<PublicVerifyReceiptPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/settings" element={<OrganizationSettingsPage />} />
        <Route path="/organizations" element={<OrganizationListPage />} />
        <Route path="/organizations/settings" element={<OrganizationSettingsPage />} />
        <Route path="/committees" element={<CommitteeListPage />} />
        <Route path="/committees/:id" element={<CommitteeDetailsPage />} />
        <Route path="/members" element={<MemberListPage />} />
        <Route path="/finance" element={<FinanceDashboardPage />} />
        <Route path="/receipts" element={<ReceiptListPage />} />
        <Route path="/budgets" element={<BudgetListPage />} />
        <Route path="/chat" element={<ChatDashboardPage />} />
        <Route path="/reports" element={<ReportsDashboardPage />} />
        <Route path="/donations" element={<DonationDashboardPage />} />
        <Route path="/events" element={<EventDashboardPage />} />
        <Route path="/superadmin" element={<SuperAdminDashboardPage />} />
        <Route path="/fees" element={<FeeManagementPage />} />
        <Route path="/locations" element={<LocationManagementPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
