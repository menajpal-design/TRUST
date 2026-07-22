import api from '../config/api';

export const fetchCampaigns = async (params = {}) => {
  const response = await api.get('/donations/campaigns', { params });
  return response.data;
};

export const createCampaign = async (data) => {
  const response = await api.post('/donations/campaigns', data);
  return response.data;
};

export const fetchDonations = async (params = {}) => {
  const response = await api.get('/donations/donations', { params });
  return response.data;
};

export const recordDonation = async (data) => {
  const response = await api.post('/donations/donations', data);
  return response.data;
};
