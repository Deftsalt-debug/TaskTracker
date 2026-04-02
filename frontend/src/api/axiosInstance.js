import axios from 'axios';

// Automatically detect the correct base URL
// If accessing from network (not localhost), use the network IP
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // If accessing via network IP (like 172.20.10.2), use that IP for backend
  // Node.js backend runs on port 8080 (same as before)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8080/api`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:8080/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token if stored
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
