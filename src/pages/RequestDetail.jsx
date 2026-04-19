import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsApi } from '../utils/api.js';
import { useApp } from '../context/AppContext.jsx';
import { useAdmin } from '../context/AppContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  PhoneIcon, MapPinIcon, HomeIcon, MapIcon,
  CheckIcon, TrashIcon, ChevronRightIcon, ClockIcon, ClipboardIcon
} from '../components/Icons.jsx';
import { timeAgo, formatPhone, getInitials, openGoogleMaps } from '../utils/helpers.js';
import styles from './RequestDetail.module.css';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const { updateStatus, deleteRequest } = useAdmin();
  const [request, setRequest]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [notes, setNotes]             = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [mapLoading, setMapLoading]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await requestsApi.getById(id);
        setRequest(res.data.data);
        setNotes(res.data.data.notes || '');
      } catch {
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleStatusChange = async (status) => {
    setLoadingStatus(status);
    await updateStatus(id, status);
    setRequest((r) => ({ ...r, status }));
    setLoadingStatus('');
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await requestsApi.updateNotes(id, notes);
      addNotification('Notes saved', 'success');
    } catch {
      addNotification('Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this service request?')) {
      await deleteRequest(id);
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!request) return null;

  const initials = getInitials(request.name);

  return (
    <div className={styles.page}>

      {/* Back bar */}
      <div className={styles.backBar}>
        <button className={styles.backBtn} onClick={() => navigate('/admin')}>
          <ChevronRightIcon size={16} stroke="var(--text-secondary)" sw={2.5} />
          <span>Back</span>
        </button>
        <StatusBadge status={request.status} />
      </div>

      {/* Hero */}
      <div className={styles.heroCard}>
        <div className={styles.heroAvatar}>{initials}</div>
        <div className={styles.heroName}>{request.name}</div>
        <a href={`tel:${request.phone}`} className={styles.heroPhone}>
          <PhoneIcon size={14} stroke="var(--blue)" />
          {formatPhone(request.phone)}
        </a>
        <div className={styles.heroTime}>
          <ClockIcon size={11} stroke="var(--text-tertiary)" />
          Submitted {timeAgo(request.createdAt)}
        </div>
      </div>

      {/* Task Details */}
      {request.description && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Task Details</div>
          <div className={styles.taskDescBox}>
            <div className={styles.taskDescHeader}>
              <ClipboardIcon size={13} stroke="var(--text-tertiary)" sw={1.8} />
              <span>Problem Description</span>
            </div>
            <p className={styles.taskDescText}>{request.description}</p>
          </div>
        </div>
      )}

      {/* Location */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Location</div>
        {(request.houseNo || request.block) && (
          <div className={styles.locRow}>
            <HomeIcon size={14} stroke="var(--navy)" />
            <span className={styles.locText} style={{ fontWeight: 700, color: 'var(--navy)' }}>
              {[request.houseNo, request.block].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {request.landmark && (
          <div className={styles.locRow}>
            <HomeIcon size={14} stroke="var(--text-tertiary)" />
            <span className={styles.locTextSub}>{request.landmark}</span>
          </div>
        )}
        <div className={styles.locRow}>
          <MapPinIcon size={15} stroke="var(--red)" />
          <span className={styles.locText}>{request.address}</span>
        </div>
        {request.location?.lat != null ? (
          <div className={styles.locRow}>
            <MapIcon size={14} stroke="var(--purple)" />
            <span className={styles.locTextSub}>
              GPS: {request.location.lat.toFixed(5)}, {request.location.lng.toFixed(5)}
            </span>
          </div>
        ) : (
          <div className={styles.locRow}>
            <MapIcon size={14} stroke="var(--red)" />
            <span className={styles.locTextSub} style={{ color: 'var(--red)', fontWeight: 500 }}>
              Location not shared by user
            </span>
          </div>
        )}
        <button
          className={styles.mapBtn}
          onClick={() => openGoogleMaps(request.location, request.address, setMapLoading)}
          disabled={!request.location?.lat || mapLoading}
          title={!request.location?.lat ? 'User did not share location' : ''}
        >
          {mapLoading
            ? <><span className={styles.mapBtnSpinner} /> Getting your location…</>
            : <><MapIcon size={16} stroke="#fff" /> {request.location?.lat ? 'Open in Google Maps' : 'Location Not Available'}</>
          }
        </button>
      </div>

      {/* Update Status */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Update Status</div>
        <div className={styles.statusBtns}>
          {['pending', 'in-progress', 'completed'].map((s) => (
            <button
              key={s}
              className={`${styles.statusBtn} ${request.status === s ? styles[`active_${s.replace('-','_')}`] : ''}`}
              onClick={() => handleStatusChange(s)}
              disabled={request.status === s || !!loadingStatus}
            >
              {loadingStatus === s ? '…' : s === 'pending' ? 'Pending' : s === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Service Notes */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Service Notes</div>
        <textarea
          className={styles.notesInput}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this service request…"
          rows={3}
        />
        <button className={styles.saveNotesBtn} onClick={handleSaveNotes} disabled={savingNotes}>
          {savingNotes ? 'Saving…' : 'Save Notes'}
        </button>
      </div>

      {/* Actions */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Actions</div>
        <div className={styles.quickActions}>
          <a href={`tel:${request.phone}`} className={styles.quickBtn} style={{ textDecoration: 'none', color: 'inherit' }}>
            <PhoneIcon size={18} stroke="var(--teal)" />
            <span>Call Customer</span>
          </a>
          {request.status !== 'completed' && (
            <button className={styles.quickBtn} onClick={() => handleStatusChange('completed')}>
              <CheckIcon size={18} stroke="var(--green)" />
              <span>Mark as Done</span>
            </button>
          )}
          <button className={`${styles.quickBtn} ${styles.dangerBtn}`} onClick={handleDelete}>
            <TrashIcon size={18} stroke="var(--red)" />
            <span>Delete Request</span>
          </button>
        </div>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
