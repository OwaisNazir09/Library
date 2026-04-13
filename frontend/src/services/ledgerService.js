import api from './api';

export const getLedgers = async (params) => {
  const response = await api.get('/ledger', { params });
  return response.data;
};

export const getStudentLedger = async (studentId, params) => {
  const response = await api.get(`/ledger/${studentId}`, { params });
  return response.data;
};

export const addPayment = async (studentId, data) => {
  const response = await api.post(`/ledger/${studentId}/payment`, data);
  return response.data;
};

export const addCharge = async (studentId, data) => {
  const response = await api.post(`/ledger/${studentId}/charge`, data);
  return response.data;
};

export const getLedgerStats = async () => {
  const response = await api.get('/ledger/stats');
  return response.data;
};
