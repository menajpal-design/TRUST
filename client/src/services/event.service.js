import api from '../config/api';

export const fetchEvents = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post('/events', data);
  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/register`);
  return response.data;
};

export const rsvpEvent = registerForEvent;

export const checkInTicket = async (ticket_code) => {
  const response = await api.post('/events/check-in', { ticket_code });
  return response.data;
};

export const verifyTicketToken = checkInTicket;

export const fetchEventAttendees = async (eventId) => {
  const response = await api.get(`/events/${eventId}/attendees`);
  return response.data;
};
