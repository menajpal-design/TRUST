import api from '../config/api';

export const fetchMeetings = async () => {
  const response = await api.get('/meetings');
  return response.data;
};

export const createMeeting = async (data) => {
  const response = await api.post('/meetings', data);
  return response.data;
};

export const addMeetingResolution = async (meetingId, data) => {
  const response = await api.post(`/meetings/${meetingId}/resolution`, data);
  return response.data;
};

export const fetchVotes = async () => {
  const response = await api.get('/meetings/votes');
  return response.data;
};

export const createVote = async (data) => {
  const response = await api.post('/meetings/votes', data);
  return response.data;
};

export const castVote = async (voteId, option_id) => {
  const response = await api.post(`/meetings/votes/${voteId}/cast`, { option_id });
  return response.data;
};
