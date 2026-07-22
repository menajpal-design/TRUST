import api from '../config/api';

export const fetchAIFinancialInsights = async () => {
  const response = await api.get('/ai/financial-insights');
  return response.data;
};

export const generateAINotice = async (topic, target_audience) => {
  const response = await api.post('/ai/draft-notice', { topic, target_audience });
  return response.data;
};

export const summarizeAIMeeting = async (notes) => {
  const response = await api.post('/ai/summarize-meeting', { notes });
  return response.data;
};
