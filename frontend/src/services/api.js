import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    const role = localStorage.getItem('role');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId && role !== 'super_admin') {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      toast.error('Network Error: Please check your internet connection');
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401:
        // Unauthorized - session expired
        localStorage.clear();
        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
        break;
      
      case 403:
        toast.error('Access Denied: You do not have permission');
        break;

      case 404:
        // Handled per-component usually, but can toast for generic failures
        break;

      case 500:
        toast.error('Server error: Something went wrong on our end');
        break;

      case 422:
      case 400:
        // Validation errors usually handled by forms, 
        // but we can toast generic bad request messages
        if (response.data?.message) {
          toast.error(response.data.message);
        }
        break;

      default:
        toast.error(response.data?.message || 'An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;
