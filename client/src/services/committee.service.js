import api from '../config/api';

export const fetchCommittees = async (status) => {
  const params = status ? { status } : {};
  const response = await api.get('/committees', { params });
  return response.data;
};

export const fetchCommitteeDetails = async (id) => {
  const response = await api.get(`/committees/${id}`);
  return response.data;
};

export const createCommittee = async (data) => {
  const response = await api.post('/committees', data);
  return response.data;
};

export const seedBDCommittees = async () => {
  const response = await api.post('/committees/seed-bd');
  return response.data;
};

export const updateCommittee = async (id, data) => {
  const response = await api.put(`/committees/${id}`, data);
  return response.data;
};

export const deleteCommittee = async (id) => {
  const response = await api.delete(`/committees/${id}`);
  return response.data;
};

export const addCommitteeMember = async (committeeId, data) => {
  const response = await api.post(`/committees/${committeeId}/members`, data);
  return response.data;
};

export const assignCommitteeMember = addCommitteeMember;

export const removeCommitteeMember = async (committeeId, memberId) => {
  const response = await api.delete(`/committees/${committeeId}/members/${memberId}`);
  return response.data;
};

export const archiveCommitteeTerm = async (committeeId, data) => {
  const response = await api.post(`/committees/${committeeId}/archive-term`, data);
  return response.data;
};

export const fetchCommitteeHistory = async (committeeId) => {
  const response = await api.get(`/committees/${committeeId}/history`);
  return response.data;
};
