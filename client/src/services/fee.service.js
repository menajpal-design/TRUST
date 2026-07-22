import api from '../config/api';

export const fetchFeeSettings = async () => {
  const response = await api.get('/fees/settings');
  return response.data;
};

export const updateFeeSettings = async (data) => {
  const response = await api.put('/fees/settings', data);
  return response.data;
};

export const generateMonthlyDues = async (period = null) => {
  const response = await api.post('/fees/generate-dues', { period });
  return response.data;
};

export const collectFee = async (data) => {
  const response = await api.post('/fees/collect', data);
  return response.data;
};

export const fetchMemberFeeProfile = async (memberId) => {
  const response = await api.get(`/fees/member-profile/${memberId}`);
  return response.data;
};

export const fetchDues = async (params = {}) => {
  const response = await api.get('/fees/dues', { params });
  return response.data;
};

export const fetchFeeReports = async () => {
  const response = await api.get('/fees/reports');
  return response.data;
};
