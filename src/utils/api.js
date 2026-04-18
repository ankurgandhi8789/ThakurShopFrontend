import axios from 'axios';
import { io } from 'socket.io-client';

const BASE = (() => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Ensure it always has a protocol prefix
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
})();

const api = axios.create({ baseURL: BASE });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('te_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});
