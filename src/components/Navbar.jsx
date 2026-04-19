import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { BoltIcon, BellIcon, UserIcon, XIcon } from './Icons.jsx';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { notifications, isConnected, isOnline } = useApp();
  const { isAuthenticated, admin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAdmin   = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isLogin   = location.pathname === '/admin/login';

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      {/* Offline banner */}
      {!isOnline && (
        <div style={{
          background: '#1a1a1a', color: '#fff', textAlign: 'center',
          padding: '8px 16px', fontSize: '12px', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>📵</span>
          No internet connection — please check your network
        </div>
      )}
      <header className={styles.navbar}>
      <button className={styles.brand} onClick={() => navigate(isAdmin ? '/admin' : '/')}>
        <div className={styles.brandIcon}>
          <BoltIcon size={16} stroke="#fff" sw={2.5} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Thakur Electronics</span>
          <span className={styles.brandSub}>
            {isAdmin ? (
              <>
                <span className={`${styles.dot} ${isConnected ? styles.dotLive : styles.dotOff}`} />
                {isConnected ? 'Live' : 'Offline'}
              </>
            ) : (
              <span style={{ color: 'var(--text-tertiary)' }}>Service Portal</span>
            )}
          </span>
        </div>
      </button>

      <div className={styles.actions}>
        {/* Notification bell — only on admin pages */}
        {isAdmin && (
          <button className={styles.iconBtn} style={{ position: 'relative' }}>
            <BellIcon size={20} stroke="var(--text-secondary)" sw={1.8} />
            {notifications.length > 0 && (
              <span className={styles.badge}>{notifications.length}</span>
            )}
          </button>
        )}

        {/* Logout — only when authenticated on admin pages */}
        {isAdmin && isAuthenticated && (
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
            <XIcon size={14} stroke="var(--red)" sw={2.5} />
            <span>Logout</span>
          </button>
        )}

        {/* Admin button — show on customer page always */}
        {!isAdmin && !isLogin && (
          <button
            className={styles.adminBtn}
            onClick={() => navigate(isAuthenticated ? '/admin' : '/admin/login')}
            title="Admin Dashboard"
          >
            Admin
          </button>
        )}

        {/* Avatar — only show on admin pages to go back to customer form */}
        {isAdmin && (
          <button
            className={styles.avatarBtn}
            onClick={() => navigate('/')}
            title="Customer Form"
          >
            {isAuthenticated && admin?.name
              ? <span className={styles.avatarInitial}>{admin.name[0].toUpperCase()}</span>
              : <UserIcon size={16} stroke="#fff" sw={2} />
            }
          </button>
        )}
      </div>
    </header>
    </>
  );
}
