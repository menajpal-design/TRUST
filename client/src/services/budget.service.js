import api from '../config/api';

export const fetchBudgets = async (params = {}) => {
  const response = await api.get('/budgets', { params });
  return response.data;
};

export const fetchBudgetSummary = async (fiscalYear) => {
  const response = await api.get('/budgets/summary', { params: { fiscalYear } });
  return response.data;
};

export const fetchBudgetDetails = async (id) => {
  const response = await api.get(`/budgets/${id}`);
  return response.data;
};

export const fetchBudgetHistory = async (id) => {
  const response = await api.get(`/budgets/${id}/history`);
  return response.data;
};

export const createBudget = async (data) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

export const updateBudget = async (id, data) => {
  const response = await api.put(`/budgets/${id}`, data);
  return response.data;
};

export const approveBudget = async (id, status) => {
  const response = await api.put(`/budgets/${id}/approve`, { status });
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};
