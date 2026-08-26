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

import { NoticeBoardPage } from '../features/notice/NoticeBoardPage';
import { MeetingVotingPage } from '../features/meeting/MeetingVotingPage';
import { MemberIDCardPage } from '../features/idcard/MemberIDCardPage';
import { BloodReliefDirectoryPage } from '../features/directory/BloodReliefDirectoryPage';
import { MemberProfilePage } from '../features/member/MemberProfilePage';
import { DocumentVaultPage } from '../features/document/DocumentVaultPage';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

export const AppRoutes = () => {
  const MANAGEMENT_ROLES = ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'MODERATOR'];
  const SETTINGS_ROLES = ['ORG_OWNER', 'OWNER', 'ADMIN'];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-receipt" element={<PublicVerifyReceiptPage />} />

      {/* Protected Routes (Authenticated) */}
      <Route element={<ProtectedRoute />}>
        {/* Accessible to ALL authenticated users including MEMBER */}
        <Route path="/dashboard" element={<DashboardOverviewPage />} />
        <Route path="/profile" element={<MemberProfilePage />} />
        <Route path="/fees" element={<FeeManagementPage />} />
        <Route path="/receipts" element={<ReceiptListPage />} />
        <Route path="/idcard" element={<MemberIDCardPage />} />
        <Route path="/blood-relief" element={<BloodReliefDirectoryPage />} />
        <Route path="/donations" element={<DonationDashboardPage />} />
        <Route path="/meetings" element={<MeetingVotingPage />} />
        <Route path="/notices" element={<NoticeBoardPage />} />
        <Route path="/documents" element={<DocumentVaultPage />} />
        <Route path="/events" element={<EventDashboardPage />} />
        <Route path="/chat" element={<ChatDashboardPage />} />

        {/* Management Routes - Hidden & Blocked for General MEMBER */}
        <Route element={<RoleProtectedRoute allowedRoles={MANAGEMENT_ROLES} />}>
          <Route path="/members" element={<MemberListPage />} />
          <Route path="/committees" element={<CommitteeListPage />} />
          <Route path="/committees/:id" element={<CommitteeDetailsPage />} />
          <Route path="/finance" element={<FinanceDashboardPage />} />
          <Route path="/budgets" element={<BudgetListPage />} />
          <Route path="/reports" element={<ReportsDashboardPage />} />
          <Route path="/locations" element={<LocationManagementPage />} />
          <Route path="/organizations" element={<OrganizationListPage />} />
        </Route>

        {/* Organization Settings - Hidden & Blocked for General MEMBER */}
        <Route element={<RoleProtectedRoute allowedRoles={SETTINGS_ROLES} />}>
          <Route path="/settings" element={<OrganizationSettingsPage />} />
          <Route path="/organizations/settings" element={<OrganizationSettingsPage />} />
        </Route>

        {/* SuperAdmin Only Route */}
        <Route element={<RoleProtectedRoute superAdminOnly={true} />}>
          <Route path="/superadmin" element={<SuperAdminDashboardPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
