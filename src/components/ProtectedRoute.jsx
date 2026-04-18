import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, checking } = useAuth();

  if (checking) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '60vh',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #e8eaed',
          borderTopColor: '#1a1a2e',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
