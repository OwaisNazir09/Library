import api from './api';

export const getOverdueIssues = async () => {
  const response = await api.get('/borrowings/overdue');
  return response.data;
};

export const issueBook = async (issueData) => {
  const response = await api.post('/borrowings/borrow', issueData);
  return response.data;
};

export const returnBook = async (id) => {
  const response = await api.patch(`/borrowings/return/${id}`);
  return response.data;
};
