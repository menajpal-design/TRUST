import api from '../config/api';

export const fetchDivisions = async () => {
  const response = await api.get('/geo/divisions');
  return response.data;
};

export const fetchDistricts = async (division) => {
  const response = await api.get('/geo/districts', { params: { division } });
  return response.data;
};

export const fetchUpazilas = async (district) => {
  const response = await api.get('/geo/upazilas', { params: { district } });
  return response.data;
};

export const syncBDGeoData = async () => {
  const response = await api.post('/geo/sync');
  return response.data;
};

export const importGeoExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/geo/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const exportGeoExcel = () => {
  window.open('/api/v1/geo/export', '_blank');
};
