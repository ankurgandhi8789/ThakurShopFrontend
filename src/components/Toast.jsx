import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckIcon, XIcon, BellIcon } from './Icons';
import styles from './Toast.module.css';

const ICONS = {
  new:     <BellIcon  size={14} stroke="#fff" sw={2} />,
  success: <CheckIcon size={14} stroke="#fff" sw={2.5} />,
  error:   <XIcon     size={14} stroke="#fff" sw={2.5} />,
  info:    <BellIcon  size={14} stroke="#fff" sw={2} />,
};

export default function Toast() {
  const { notifications } = useApp();
  if (!notifications.length) return null;

  return (
    <div className={styles.container}>
      {notifications.map((n) => (
        <div key={n.id} className={`${styles.toast} ${styles[n.type] || styles.info}`}>
          <span className={styles.icon}>{ICONS[n.type] || ICONS.info}</span>
          <span className={styles.msg}>{n.message}</span>
        </div>
      ))}
    </div>
  );
}
