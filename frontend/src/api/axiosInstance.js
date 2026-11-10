import axios from 'axios';
import { getToken, signOut } from '../auth';

// Same-origin: Vite proxies /api to the backend in development, and the
// backend serves the built app in production.
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or rejected session signs the user out; App then shows the login page.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const onAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !onAuthRoute) signOut();
    return Promise.reject(error);
  },
);

/** The server's own explanation of a failed request, or a fallback. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) return 'Cannot reach the server. Is the backend running?';
  return error.response.data?.message || fallback;
}

export default axiosInstance;
