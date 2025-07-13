// src/services/api.ts
import axios from 'axios';

/*const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5058',
  timeout: 10000,
});*/


const api = axios.create({
  baseURL: 'http://localhost:5058',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;