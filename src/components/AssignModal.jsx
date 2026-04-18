import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UsersIcon, XIcon, CheckIcon } from './Icons';
import { getInitials } from '../utils/helpers';
import styles from './AssignModal.module.css';

export default function AssignModal({ request, onClose }) {
  const { technicians, assignTechnician } = useApp();
  const [selected, setSelected] = useState(request.assignedTo || '');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selected) return;
    setLoading(true);
    await assignTechnician(request.id, selected);
    setLoading(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <UsersIcon size={18} stroke="var(--navy)" sw={2} />
            <span className={styles.title}>Assign Technician</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <XIcon size={18} stroke="var(--text-secondary)" />
          </button>
        </div>

        <p className={styles.sub}>Select a technician for <strong>{request.name}</strong></p>

        <div className={styles.list}>
          {technicians.map((tech) => (
            <button
              key={tech.id}
              className={`${styles.techItem} ${selected === tech.name ? styles.selected : ''}`}
              onClick={() => setSelected(tech.name)}
            >
              <div className={styles.techAvatar}>{getInitials(tech.name)}</div>
              <div className={styles.techInfo}>
                <span className={styles.techName}>{tech.name}</span>
                <span className={`${styles.techStatus} ${tech.available ? styles.available : styles.busy}`}>
                  {tech.available ? 'Available' : 'Busy'}
                </span>
              </div>
              {selected === tech.name && (
                <CheckIcon size={16} stroke="var(--navy)" sw={2.5} />
              )}
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.assignBtn}
            onClick={handleAssign}
            disabled={!selected || loading}
          >
            {loading ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
