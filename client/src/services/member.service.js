import api from '../config/api';

export const fetchMembers = async (params = {}) => {
  const response = await api.get('/members', { params });
  return response.data;
};

export const fetchMemberDetails = async (id) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

export const addMember = async (data) => {
  const response = await api.post('/members', data);
  return response.data;
};

export const createMember = addMember;

export const updateMember = async (id, data) => {
  const response = await api.put(`/members/${id}`, data);
  return response.data;
};

export const fetchMemberHistory = async (id) => {
  const response = await api.get(`/members/${id}/history`);
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

export const importMembersExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/members/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const exportMembersExcel = () => {
  window.open('/api/v1/members/export', '_blank');
};
