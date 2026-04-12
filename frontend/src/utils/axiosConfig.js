import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api'
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['x-tenant-id'] = tenantId;
  return config;
});

export default instance;
