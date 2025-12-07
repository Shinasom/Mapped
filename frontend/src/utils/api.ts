import axios from 'axios';

// Point to your Django Backend
const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to set the token after login
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Check for existing token on app load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) setAuthToken(token);
}

export default api;