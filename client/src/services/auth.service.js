import api from '../config/api';

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const verifyEmailToken = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const sendForgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordToken = async (token, new_password) => {
  const response = await api.post('/auth/reset-password', { token, new_password });
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const switchOrganization = async (organization_id) => {
  const response = await api.post('/auth/switch-tenant', { organization_id });
  return response.data;
};
