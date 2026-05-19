import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { storageApi } from "../services/api";
import "../Styles/admin-premium.css";

const statuses = ["", "pending", "sending", "sent", "failed", "cancelled"];

export default function AdminEmailOutbox() {
  const [filters, setFilters] = useState({ status: "", toEmail: "", relatedEntityType: "" });
  const [outbox, setOutbox] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadOutbox = useCallback(async () => {
    setLoading(true);
    try {
      const result = await storageApi.listEmailOutbox(filters);
      setOutbox(result.outbox || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Email outbox could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOutbox();
  }, [loadOutbox]);

  const openLogs = async (email) => {
    setSelected(email);
    setLogs([]);
    try {
      const result = await storageApi.getEmailLogs(email.id);
      setLogs(result.logs || []);
    } catch (error) {
      setMessage(error.message || "Email logs could not be loaded.");
    }
  };

  const retry = async (email) => {
    try {
      const result = await storageApi.retryEmail(email.id);
      setMessage(result.message || "Retry attempted.");
      await loadOutbox();
      await openLogs(email);
    } catch (error) {
      setMessage(error.message || "Retry failed.");
    }
  };

  return (
    <AdminShell active="Email Outbox" title="Email Outbox" subtitle="Queued, sent, and failed email delivery records.">
      <div className="admin-filter-card">
        <div className="admin-filter-grid">
          <div className="admin-field">
            <label htmlFor="email-status">Status</label>
            <select id="email-status" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              {statuses.map((status) => <option key={status || "all"} value={status}>{status || "All"}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label htmlFor="email-to">To Email</label>
            <input id="email-to" value={filters.toEmail} onChange={(event) => setFilters((prev) => ({ ...prev, toEmail: event.target.value }))} />
          </div>
          <div className="admin-field">
            <label htmlFor="email-entity">Related Entity</label>
            <input id="email-entity" value={filters.relatedEntityType} onChange={(event) => setFilters((prev) => ({ ...prev, relatedEntityType: event.target.value }))} />
          </div>
          <button className="admin-premium-button primary" type="button" onClick={loadOutbox}>
            <span className="material-symbols-outlined">filter_alt</span>
            Apply
          </button>
        </div>
      </div>

      {message && <div className="admin-toast admin-toast--info">{message}</div>}
      {loading && <div className="admin-loading">Loading email outbox...</div>}

      <div className="admin-table-wrap" style={{ marginTop: 24 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Related</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outbox.map((email) => (
              <tr key={email.id}>
                <td>{email.to_email}</td>
                <td>{email.subject}</td>
                <td><span className="admin-badge badge-muted">{email.status}</span></td>
                <td>{email.attempts || 0}</td>
                <td>{[email.related_entity_type, email.related_entity_id].filter(Boolean).join(" / ")}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-ghost-btn" type="button" onClick={() => openLogs(email)}>Logs</button>
                    {["pending", "failed"].includes(email.status) && (
                      <button className="admin-ghost-btn" type="button" onClick={() => retry(email)}>Retry</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && outbox.length === 0 && <div className="admin-panel-pad admin-muted">No emails match these filters.</div>}
      </div>

      {selected && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Email Logs</h2>
              <button type="button" className="admin-modal-close" onClick={() => setSelected(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-view-body">
              <p className="admin-muted">{selected.to_email} - {selected.subject}</p>
              <dl className="admin-detail-list">
                {logs.map((log) => (
                  <div key={log.id}>
                    <dt>{log.event_type}</dt>
                    <dd>{new Date(log.created_at).toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
              {logs.length === 0 && <p className="admin-muted">No logs recorded.</p>}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
