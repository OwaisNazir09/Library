import api from './api';

const queryService = {
  submitQuery: async (data) => {
    const response = await api.post('/queries', data);
    return response.data;
  },

  getQueries: async (params) => {
    const response = await api.get('/queries', { params });
    return response.data;
  },

  updateQueryStatus: async (id, status) => {
    const response = await api.patch(`/queries/${id}`, { status });
    return response.data;
  },

  deleteQuery: async (id) => {
    const response = await api.delete(`/queries/${id}`);
    return response.data;
  }
};

export default queryService;
