import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestsApi, socket } from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

// ─── App Context (public — used by customer form & navbar) ────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected]     = useState(false);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
  }, []);

  const submitRequest = async (formData) => {
    const res = await requestsApi.create(formData);
    return res.data;
  };

  return (
    <AppContext.Provider value={{ notifications, isConnected, setIsConnected, addNotification, submitRequest }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ─── Admin Context (protected — only mounts when authenticated) ───────────────
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { addNotification, setIsConnected } = useApp();

  const [requests, setRequests] = useState([]);
  const [stats, setStats]       = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await requestsApi.getAll();
      setRequests(res.data.data);
      setStats(res.data.stats);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('te_token');
        window.location.href = '/admin/login';
        return;
      }
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch data and connect socket when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRequests();
  }, [isAuthenticated, fetchRequests]);

  // Socket — only connect when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!socket.connected) socket.connect();

    const onConnect    = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNewRequest = ({ request, stats: newStats }) => {
      setRequests((prev) => {
        if (prev.some((r) => r.id === request.id)) return prev;
        return [request, ...prev];
      });
      setStats(newStats);
      addNotification(`New request from ${request.name}`, 'new');
    };

    const onUpdated = ({ request, stats: newStats }) => {
      setRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)));
      setStats(newStats);
    };

    const onDeleted = ({ id, stats: newStats }) => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setStats(newStats);
    };

    socket.on('connect',         onConnect);
    socket.on('disconnect',      onDisconnect);
    socket.on('new_request',     onNewRequest);
    socket.on('request_updated', onUpdated);
    socket.on('request_deleted', onDeleted);

    return () => {
      socket.off('connect',         onConnect);
      socket.off('disconnect',      onDisconnect);
      socket.off('new_request',     onNewRequest);
      socket.off('request_updated', onUpdated);
      socket.off('request_deleted', onDeleted);
      // Disconnect socket when admin logs out
      if (socket.connected) socket.disconnect();
    };
  }, [isAuthenticated, addNotification, setIsConnected]);

  const updateStatus = async (id, status) => {
    try {
      await requestsApi.updateStatus(id, status);
    } catch {
      addNotification('Failed to update status', 'error');
    }
  };

  const deleteRequest = async (id) => {
    try {
      await requestsApi.delete(id);
      addNotification('Request deleted', 'info');
    } catch {
      addNotification('Failed to delete request', 'error');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'pending'     && r.status === 'pending') ||
      (activeTab === 'in-progress' && r.status === 'in-progress') ||
      (activeTab === 'completed'   && r.status === 'completed');

    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  return (
    <AdminContext.Provider value={{
      requests, filteredRequests, stats, loading,
      activeTab, setActiveTab, searchQuery, setSearchQuery,
      updateStatus, deleteRequest, refetch: fetchRequests,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
