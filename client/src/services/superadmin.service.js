import api from '../config/api';

export const fetchSuperAdminMetrics = async () => {
  const response = await api.get('/superadmin/metrics');
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await api.get('/superadmin/users');
  return response.data;
};

export const promoteUserRole = async (userId, role) => {
  const response = await api.put(`/superadmin/users/${userId}/role`, { role });
  return response.data;
};

export const updateTenantSubscriptionStatus = async (orgId, status) => {
  const response = await api.put(`/superadmin/tenants/${orgId}/status`, { subscription_status: status });
  return response.data;
};
