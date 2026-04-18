import React from 'react';
import styles from './StatusBadge.module.css';

const CONFIG = {
  pending:     { label: 'Pending',     cls: 'pending' },
  'in-progress': { label: 'In Progress', cls: 'inProgress' },
  completed:   { label: 'Completed',   cls: 'completed' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.pending;
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      <span className={styles.dot} />
      {cfg.label}
    </span>
  );
}
