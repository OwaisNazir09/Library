import api from './api';

export const getReportsSummary = async () => {
  const response = await api.get('/reports/summary');
  return response.data;
};

export const getMonthlyAnalytics = async () => {
  const response = await api.get('/reports/monthly');
  return response.data;
};

export const getExpiringMemberships = async () => {
  const response = await api.get('/reports/expiring-memberships');
  return response.data;
};
