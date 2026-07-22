import api from '../config/api';

export const fetchUserOrganizations = async () => {
  const response = await api.get('/organizations');
  return response.data;
};

export const fetchMyOrganizations = fetchUserOrganizations;

export const fetchOrganizationDetails = async (id) => {
  const response = await api.get(`/organizations/${id}`);
  return response.data;
};

export const createOrganization = async (data) => {
  const response = await api.post('/organizations', data);
  return response.data;
};

export const updateOrganization = async (id, data) => {
  const response = await api.put(`/organizations/${id}`, data);
  return response.data;
};

export const updateTransparencySettings = async (id, transparency_settings) => {
  const response = await api.put(`/organizations/${id}/transparency`, { transparency_settings });
  return response.data;
};

export const uploadOrganizationMedia = async (id, type, file) => {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('image', file);

  const response = await api.post(`/organizations/${id}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
