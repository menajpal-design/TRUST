import api from '../config/api';

export const fetchFinanceSummary = async () => {
  const response = await api.get('/finance/summary');
  return response.data;
};

export const fetchTransactions = async (params = {}) => {
  const response = await api.get('/finance/transactions', { params });
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await api.post('/finance/transactions', data);
  return response.data;
};

export const approveTransaction = async (id, status) => {
  const response = await api.put(`/finance/transactions/${id}/approve`, { status });
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/finance/transactions/${id}`);
  return response.data;
};

export const fetchCashbook = async (params = {}) => {
  const response = await api.get('/finance/cashbook', { params });
  return response.data;
};

export const fetchPeriodClosings = async (period_type) => {
  const response = await api.get('/finance/closings', { params: { period_type } });
  return response.data;
};

export const fetchClosings = fetchPeriodClosings;

export const executePeriodClosing = async (data) => {
  const response = await api.post('/finance/closings', data);
  return response.data;
};
