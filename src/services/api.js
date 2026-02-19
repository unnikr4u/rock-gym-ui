import axios from 'axios';
import authService from './authService';

// Base API configuration
const API_BASE_URL = 'http://localhost:9090/rockgymapp/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add JWT token to requests
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;