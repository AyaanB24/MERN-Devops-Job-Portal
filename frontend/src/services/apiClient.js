import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Core Axios instance
// All API services import this — never import raw axios in feature files.
// ─────────────────────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — Inject JWT on every outgoing request
// Reads token from localStorage so it works even after a page refresh.
// ─────────────────────────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — Global error boundary
// 401 → token expired or invalid, force logout
// 403 → user does not have permission
// 5xx → surface a generic server error
// ─────────────────────────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear stale session and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (status === 403) {
      window.location.href = '/unauthorized';
    }

    // Re-throw so individual thunks can handle specific error messages
    return Promise.reject(error);
  }
);

export default apiClient;
