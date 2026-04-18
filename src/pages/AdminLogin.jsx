import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BoltIcon, UserIcon, EyeIcon, CheckIcon } from '../components/Icons.jsx';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Already logged in → go to dashboard
  if (isAuthenticated) {
    navigate('/admin', { replace: true });
    return null;
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <BoltIcon size={28} stroke="#fff" sw={2.5} />
        </div>
        <h1 className={styles.brandName}>Thakur Electronics</h1>
        <p className={styles.brandSub}>Admin Portal</p>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.lockIcon}>
            <UserIcon size={20} stroke="var(--navy)" sw={2} />
          </div>
          <h2 className={styles.cardTitle}>Admin Sign In</h2>
          <p className={styles.cardSub}>Enter your credentials to access the dashboard</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Username */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Username</label>
            <input
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={set('username')}
              autoComplete="username"
              autoCapitalize="none"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passWrap}>
              <input
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                <EyeIcon size={16} stroke="var(--text-tertiary)" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorDot} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <CheckIcon size={16} stroke="#fff" sw={2.5} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>

      <p className={styles.hint}>
        This area is restricted to authorized personnel only.
      </p>
    </div>
  );
}
