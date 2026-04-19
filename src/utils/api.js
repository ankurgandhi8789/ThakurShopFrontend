import axios from 'axios';
import { io } from 'socket.io-client';

const BASE = (() => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
})();

const api = axios.create({
  baseURL: BASE,
  timeout: 15000, // 15s timeout — fail fast on slow internet instead of hanging
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('te_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Retry failed requests up to 2 times on network errors
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    if (!config || config.__retryCount >= 2) return Promise.reject(err);
    // Only retry on network errors or 5xx, not 4xx
    const shouldRetry = !err.response || err.response.status >= 500;
    if (!shouldRetry) return Promise.reject(err);
    config.__retryCount = (config.__retryCount || 0) + 1;
    // Wait before retry: 1s, then 2s
    await new Promise((r) => setTimeout(r, config.__retryCount * 1000));
    return api(config);
  }
);

export const authApi = {
  login: (username, password) => api.post('/api/auth/login', { username, password }),
  me:    (token) => api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  }),
};

export const requestsApi = {
  getAll:       (params) => api.get('/api/requests', { params }),
  getById:      (id)     => api.get(`/api/requests/${id}`),
  create:       (data)   => api.post('/api/requests', data),
  updateStatus: (id, status)         => api.patch(`/api/requests/${id}/status`, { status }),
  assign:       (id, technicianName) => api.patch(`/api/requests/${id}/assign`, { technicianName }),
  updateNotes:  (id, notes)          => api.patch(`/api/requests/${id}/notes`, { notes }),
  delete:       (id)     => api.delete(`/api/requests/${id}`),
};

export const socket = io(BASE, {
  autoConnect: false,
  // Start with polling on slow internet — more reliable than WebSocket
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000, // max 10s between retries
  timeout: 20000,              // 20s connection timeout
  upgrade: true,               // upgrade to websocket when connection is stable
});
