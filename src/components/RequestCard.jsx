import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AppContext';
import StatusBadge from './StatusBadge.jsx';
import {
  PhoneIcon, MapPinIcon, HomeIcon, MapIcon,
  EyeIcon, CheckIcon, TrashIcon, ClockIcon, ClipboardIcon
} from './Icons.jsx';
import { timeAgo, formatPhone, getInitials, openGoogleMaps } from '../utils/helpers.js';
import styles from './RequestCard.module.css';

const avatarColors = [
  { bg: '#fcebeb', color: '#a32d2d' },
  { bg: '#faeeda', color: '#854f0b' },
  { bg: '#eaf3de', color: '#3b6d11' },
  { bg: '#e6f1fb', color: '#185fa5' },
  { bg: '#eeedfe', color: '#534ab7' },
  { bg: '#e1f5ee', color: '#0f6e56' },
];

function getAvatarColor(name) {
  let sum = 0;
  for (let c of name) sum += c.charCodeAt(0);
  return avatarColors[sum % avatarColors.length];
}

export default function RequestCard({ request, index = 0 }) {
  const { updateStatus, deleteRequest } = useAdmin();
  const navigate = useNavigate();
  const [loadingDone, setLoadingDone]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mapLoading, setMapLoading]       = useState(false);

  const avatarColor = getAvatarColor(request.name);
  const initials    = getInitials(request.name);

  const handleMarkDone = async () => {
    setLoadingDone(true);
    await updateStatus(request.id, 'completed');
    setLoadingDone(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteRequest(request.id);
  };

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 0.05}s` }}>
      {/* Left accent bar */}
      <div className={`${styles.accentBar} ${styles[`accent_${request.status.replace('-','_')}`]}`} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userRow}>
          <div className={styles.avatar} style={{ background: avatarColor.bg, color: avatarColor.color }}>
            {initials}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.name}>{request.name}</div>
            <a href={`tel:${request.phone}`} className={styles.phone} onClick={(e) => e.stopPropagation()}>
              <PhoneIcon size={11} stroke="currentColor" />
              {formatPhone(request.phone)}
            </a>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Problem description */}
      {request.description && (
        <div className={styles.taskBlock}>
          <p className={styles.taskDesc}>
            <ClipboardIcon size={11} stroke="var(--text-tertiary)" sw={1.8} />
            {request.description}
          </p>
        </div>
      )}

      {/* Address */}
      <div className={styles.addressBlock}>
        {(request.houseNo || request.block) && (
          <div className={styles.addrRow}>
            <HomeIcon size={13} stroke="var(--navy)" />
            <span className={styles.houseBlock}>
              {[request.houseNo, request.block].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        <div className={styles.addrRow}>
          <MapPinIcon size={13} stroke="var(--text-tertiary)" />
          <span className={styles.addrText}>{request.address}</span>
        </div>
        {request.landmark && (
          <div className={styles.addrRow}>
            <HomeIcon size={13} stroke="var(--text-tertiary)" />
            <span className={styles.landmarkText}>{request.landmark}</span>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className={styles.timestamp}>
        <ClockIcon size={11} stroke="var(--text-tertiary)" />
        <span>{timeAgo(request.createdAt)}</span>
        {request.notes && (
          <span className={styles.notesPill}>{request.notes}</span>
        )}
      </div>

      <div className={styles.divider} />

      {/* Actions — 3 buttons */}
      <div className={styles.actionsRow}>
        <a href={`tel:${request.phone}`} className={styles.actionBtn} style={{ textDecoration: 'none' }}>
          <div className={styles.actionIcon} style={{ background: 'var(--teal-bg)' }}>
            <PhoneIcon size={14} stroke="var(--teal)" />
          </div>
          <span>Call</span>
        </a>

        <button className={styles.actionBtn} onClick={() => navigate(`/admin/request/${request.id}`)}>
          <div className={styles.actionIcon} style={{ background: 'var(--blue-bg)' }}>
            <EyeIcon size={14} stroke="var(--blue)" />
          </div>
          <span>Details</span>
        </button>

        <button
          className={`${styles.actionBtn} ${!request.location?.lat ? styles.actionBtnDisabled : ''}`}
          onClick={() => request.location?.lat && openGoogleMaps(request.location, request.address, setMapLoading)}
          disabled={!request.location?.lat}
          title={!request.location?.lat ? 'User did not share location' : 'Open in Google Maps'}
        >
          <div className={styles.actionIcon} style={{ background: request.location?.lat ? 'var(--purple-bg)' : 'var(--bg)' }}>
            {mapLoading ? <span className={styles.mapSpinner} /> : <MapIcon size={14} stroke={request.location?.lat ? 'var(--purple)' : 'var(--text-tertiary)'} />}
          </div>
          <span>{mapLoading ? 'Locating…' : 'Map'}</span>
        </button>
      </div>

      {/* Mark done + delete */}
      {request.status !== 'completed' && (
        <>
          <div className={styles.divider} />
          <div className={styles.secondaryRow}>
            <button className={styles.markDoneBtn} onClick={handleMarkDone} disabled={loadingDone}>
              <CheckIcon size={14} stroke="#fff" />
              {loadingDone ? 'Marking…' : 'Mark as Done'}
            </button>
            <button
              className={`${styles.deleteBtn} ${confirmDelete ? styles.confirmDelete : ''}`}
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
            >
              <TrashIcon size={14} stroke={confirmDelete ? '#fff' : 'var(--red)'} />
              {confirmDelete ? 'Confirm?' : ''}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
