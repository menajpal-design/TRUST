import api from '../config/api';

export const fetchDocuments = async (params = {}) => {
  const response = await api.get('/documents', { params });
  return response.data;
};

export const uploadDocument = async (data) => {
  const response = await api.post('/documents', data);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};
