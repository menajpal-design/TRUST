import api from '../config/api';

export const fetchNotices = async (params = {}) => {
  const response = await api.get('/notices', { params });
  return response.data;
};

export const createNotice = async (data) => {
  const response = await api.post('/notices', data);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
};
