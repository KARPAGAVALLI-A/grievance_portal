import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getGrievances,
  updateGrievanceStatus,
  getExportUrl,
  getUploadUrl,
} from '../services/api';

export default function AdminDashboard() {
  const [grievances, setGrievances] = useState([]);
  const [currentTab, setCurrentTab] = useState('Pending');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);
  const navigate = useNavigate();

  // Guard: Admin must have session token
  useEffect(() => {
    const token = sessionStorage.getItem('nec_admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getGrievances();
      setGrievances(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(
        err.message || 'Could not load grievances. Please verify the backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab counts
  const countPending = grievances.filter((g) => g.status === 'Pending').length;
  const countResolved = grievances.filter((g) => g.status === 'Resolved').length;
  const countRejected = grievances.filter((g) => g.status === 'Rejected').length;
  const countAll = grievances.length;

  const handleStatusUpdate = async (gid, newStatus) => {
    const confirmed = window.confirm(
      `Mark GID ${gid} as ${newStatus}? This is final and the user will be notified by email.`
    );
    if (!confirmed) return;

    setActionInProgress(gid);
    try {
      await updateGrievanceStatus(gid, newStatus);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update grievance status.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDownloadReport = () => {
    const url = getExportUrl(currentTab);
    window.open(url, '_blank');
  };

  // Filtered & sorted grievances
  const filtered =
    currentTab === 'All'
      ? grievances
      : grievances.filter((g) => g.status === currentTab);

  const sortedGrievances = [...filtered].sort((a, b) => b.gid - a.gid);

  const formatExtraFields = (extraFields) => {
    if (!extraFields || typeof extraFields !== 'object') return null;
    const entries = Object.values(extraFields);
    if (!entries.length) return null;

    return (
      <div style={{ marginTop: 4 }}>
        {entries.map((f, i) => (
          <span key={i}>
            <b>{f.label}:</b> {f.value}
            {i < entries.length - 1 ? ' \u00A0|\u00A0 ' : ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <main className="dashboard-main">
      <h2 className="page-title">Grievance Management</h2>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${currentTab === 'Pending' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Pending')}
        >
          Pending <span className="count">{countPending}</span>
        </button>
        <button
          type="button"
          className={`tab ${currentTab === 'Resolved' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Resolved')}
        >
          Resolved <span className="count">{countResolved}</span>
        </button>
        <button
          type="button"
          className={`tab ${currentTab === 'Rejected' ? 'active' : ''}`}
          onClick={() => setCurrentTab('Rejected')}
        >
          Rejected <span className="count">{countRejected}</span>
        </button>
        <button
          type="button"
          className={`tab ${currentTab === 'All' ? 'active' : ''}`}
          onClick={() => setCurrentTab('All')}
        >
          All <span className="count">{countAll}</span>
        </button>

        <button
          type="button"
          className="tab btn-download"
          onClick={handleDownloadReport}
          title="Download grievances as CSV report"
        >
          ⬇ Download Report (CSV)
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading grievances...</span>
        </div>
      ) : errorMessage ? (
        <div className="empty-state" style={{ color: 'var(--danger)' }}>
          <p>{errorMessage}</p>
          <button
            type="button"
            className="action-btn action-resolve"
            style={{ margin: '12px auto 0' }}
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      ) : sortedGrievances.length === 0 ? (
        <div className="empty-state">No grievances in this category.</div>
      ) : (
        <div className="card-list">
          {sortedGrievances.map((g) => (
            <div className="g-card" key={g.gid}>
              <div className="g-card-head">
                <div>
                  <span className="gid">GID {g.gid}</span>
                  <span className="type">{g.userType}</span>
                </div>
                <span className={`status-badge ${g.status}`}>{g.status}</span>
              </div>

              <div className="g-card-body">
                <div>
                  <b>Name:</b> {g.name} &nbsp;|&nbsp; <b>Email:</b> {g.email}{' '}
                  &nbsp;|&nbsp; <b>Mobile:</b> {g.mobile}
                </div>
                {g.department && (
                  <div>
                    <b>Department:</b> {g.department}
                  </div>
                )}
                {formatExtraFields(g.extraFields)}
                <div style={{ marginTop: 4 }}>
                  <b>Submitted:</b> {new Date(g.submittedAt).toLocaleString()}
                </div>
                <div className="desc">{g.description}</div>
                {g.originalFileName && (
                  <div style={{ marginTop: 8 }}>
                    <b>Attachment:</b> {g.originalFileName} —{' '}
                    <a
                      href={getUploadUrl(g.document)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={g.originalFileName}
                      style={{ color: 'var(--green-dark)', fontWeight: 600 }}
                    >
                      ⬇ Download
                    </a>
                  </div>
                )}
              </div>

              <div className="g-card-actions">
                {g.status === 'Pending' ? (
                  <>
                    <button
                      type="button"
                      className="action-btn action-resolve"
                      onClick={() => handleStatusUpdate(g.gid, 'Resolved')}
                      disabled={actionInProgress === g.gid}
                    >
                      ✓ Resolve
                    </button>
                    <button
                      type="button"
                      className="action-btn action-reject"
                      onClick={() => handleStatusUpdate(g.gid, 'Rejected')}
                      disabled={actionInProgress === g.gid}
                    >
                      ✕ Reject
                    </button>
                  </>
                ) : (
                  <span className="finalized-note">
                    This grievance has been finalized.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
