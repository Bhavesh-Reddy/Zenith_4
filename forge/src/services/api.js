import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    return Promise.reject(error);
  }
);

export const pagesAPI = {
  getAll: async () => {
    const response = await api.get('/pages');
    return response.data;
  },
  getFavorites: async () => {
    const response = await api.get('/pages/favorites');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/pages/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/pages', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/pages/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/pages/${id}`);
    return response.data;
  },
  duplicate: async (id) => {
    const response = await api.post(`/pages/${id}/duplicate`);
    return response.data;
  },
  toggleFavorite: async (id) => {
    const response = await api.patch(`/pages/${id}/favorite`);
    return response.data;
  },
};

export default api;