import api from './api';

const AUTH_API_URL = '/auth';

const authService = {
  login: async (username, password) => {
    const response = await api.post(`${AUTH_API_URL}/login`, {
      username,
      password,
    });
    
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        fullName: response.data.fullName,
      }));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
