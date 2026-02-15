import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
});

export const sendMessage = async (messages) => {
  const response = await apiClient.post('/chat', { messages });
  return response.data;
};

export const synthesizeSpeech = async (text) => {
  const response = await apiClient.post('/tts', 
    { text },
    { responseType: 'blob', timeout: 30000 }
  );
  return response.data;
};

export const searchImage = async (imageData, query = '') => {
  const response = await apiClient.post('/search/image', { imageData, query });
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};
