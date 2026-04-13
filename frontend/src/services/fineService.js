import api from './api';

export const getFines = async (params) => {
  const response = await api.get('/fines', { params });
  return response.data;
};

export const createFine = async (fineData) => {
  const response = await api.post('/fines', fineData);
  return response.data;
};

export const payFine = async (id) => {
  const response = await api.put(`/fines/${id}/pay`);
  return response.data;
};
