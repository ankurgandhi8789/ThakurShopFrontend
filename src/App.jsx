import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider, AdminProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ServiceForm from './pages/ServiceForm.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import './App.css';

function Layout({ children }) {
  return (
    <div className="shell">
      <div className="phoneFrame">
        <Navbar />
        <main className="main">{children}</main>
        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Layout>
            <Routes>
              {/* Public — no socket, no auth needed */}
              <Route path="/"            element={<ServiceForm />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected — AdminProvider mounts here, socket connects only now */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminProvider>
                    <AdminDashboard />
                  </AdminProvider>
                </ProtectedRoute>
              } />
              <Route path="/admin/request/:id" element={
                <ProtectedRoute>
                  <AdminProvider>
                    <RequestDetail />
                  </AdminProvider>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
