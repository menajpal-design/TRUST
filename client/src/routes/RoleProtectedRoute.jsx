import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export const RoleProtectedRoute = ({ allowedRoles = [], superAdminOnly = false }) => {
  const { user, activeOrganization, isAuthenticated } = useAuthStore();
  const isSuperAdmin = Boolean(user?.is_global_superadmin);
  const rawRole = activeOrganization?.role || activeOrganization?.user_role || user?.role || 'MEMBER';
  const userRole = String(rawRole).toUpperCase();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly) {
    return isSuperAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
  }

  if (isSuperAdmin) {
    return <Outlet />;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes('ALL') || allowedRoles.includes(userRole)) {
    return <Outlet />;
  }

  return <Navigate to="/dashboard" replace />;
};
