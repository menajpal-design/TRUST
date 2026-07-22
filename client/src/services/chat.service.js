import api from '../config/api';

export const fetchChatRooms = async () => {
  const response = await api.get('/chat/rooms');
  return response.data;
};

export const createChatRoom = async (data) => {
  const response = await api.post('/chat/rooms', data);
  return response.data;
};

export const fetchRoomMessages = async (roomId, params = {}) => {
  const response = await api.get(`/chat/rooms/${roomId}/messages`, { params });
  return response.data;
};

export const sendChatMessage = async (roomId, data) => {
  const response = await api.post(`/chat/rooms/${roomId}/messages`, data);
  return response.data;
};

export const uploadChatMedia = async (file) => {
  const formData = new FormData();
  formData.append('media', file);
  const response = await api.post('/chat/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
