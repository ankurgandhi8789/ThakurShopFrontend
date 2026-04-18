import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AppContext.jsx';
import RequestCard from '../components/RequestCard.jsx';
import {
  SearchIcon, PlusIcon, RefreshIcon, ClockIcon
} from '../components/Icons.jsx';
import styles from './AdminDashboard.module.css';

const TABS = [
  { key: 'all',         label: 'All' },
  { key: 'pending',     label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
];

function StatCard({ value, label, color }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statNum} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    filteredRequests,
    stats,
    loading,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    refetch,
  } = useAdmin();

  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  const tabCountMap = {
    all: stats.total,
    pending: stats.pending,
    'in-progress': stats.inProgress,
    completed: stats.completed,
  };

  return (
    <div className={styles.page}>

      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard value={stats.total}      label="Total"       color="var(--text-primary)" />
        <StatCard value={stats.pending}    label="Pending"     color="var(--red)" />
        <StatCard value={stats.inProgress} label="In Progress" color="var(--amber)" />
        <StatCard value={stats.completed}  label="Done"        color="var(--green)" />
      </div>

      {/* Search + Refresh */}
      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <SearchIcon size={15} stroke="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search name, phone, address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
        <button
          className={`${styles.refreshBtn} ${refreshing ? styles.spinning : ''}`}
          onClick={handleRefresh}
        >
          <RefreshIcon size={16} stroke="var(--text-secondary)" />
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabsWrap}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={`${styles.tabCount} ${activeTab === tab.key ? styles.activeCount : ''}`}>
              {tabCountMap[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>
          <ClockIcon size={12} stroke="var(--text-tertiary)" />
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Cards list */}
      <div className={styles.cardsList}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.spinner} />
            <p>Loading requests…</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyTitle}>No requests found</p>
            <p className={styles.emptySub}>
              {searchQuery ? 'Try a different search.' : 'New requests will appear here.'}
            </p>
          </div>
        ) : (
          filteredRequests.map((req, i) => (
            <RequestCard key={req.id} request={req} index={i} />
          ))
        )}
      </div>

      <div style={{ height: 90 }} />

      {/* FAB */}
      <button
        className={styles.fab}
        onClick={() => navigate('/')}
        title="New service request"
      >
        <PlusIcon size={22} stroke="#fff" />
      </button>
    </div>
  );
}