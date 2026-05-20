import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { EmployeeShell } from "../Components/EmployeeShell";
import { getAuthHeaders } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const LEAVE_TYPES = {
  vacation:        "Vacation",
  sick_leave:      "Sick Leave",
  time_off:        "Time Off",
  leave_early:     "Leave Early",
  unpaid_leave:    "Unpaid Leave",
  remote_day:      "Remote Day",
  maternity_leave: "Maternity Leave",
  paternity_leave: "Paternity Leave",
  bereavement:     "Bereavement",
};

const STATUS_COLORS = {
  pending:   { bg: "#f59e0b20", color: "#f59e0b" },
  approved:  { bg: "#22c55e20", color: "#22c55e" },
  rejected:  { bg: "#ef444420", color: "#ef4444" },
  cancelled: { bg: "#64748b20", color: "#64748b" },
  escalated: { bg: "#a78bfa20", color: "#a78bfa" },
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const emptyForm = { type: "vacation", startDate: "", endDate: "", reason: "" };

export default function EmployeeLeave() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leave/my`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setRequests(data.requests || []);
      else toast.error(data.message || "Failed to load leave requests.");
    } catch {
      toast.error("Network error loading leave requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      toast.error("Please select start and end dates.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/leave/request`, {
        method: "POST",
        credentials: "include",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Leave request submitted.");
        setForm(emptyForm);
        setShowForm(false);
        fetchRequests();
      } else {
        toast.error(data.message || "Failed to submit request.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      const res = await fetch(`${API_URL}/api/leave/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request cancelled.");
        fetchRequests();
      } else {
        toast.error(data.message || "Could not cancel request.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <EmployeeShell
      active="Leave Requests"
      title="Leave Requests"
      subtitle="Submit and track your leave requests."
      actions={
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => setShowForm(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New Request
        </button>
      }
    >
      {/* ── New Request Modal ── */}
      {showForm && (
        <div className="admin-modal-overlay">
          <button
            type="button"
            aria-label="Close modal"
            className="admin-modal-backdrop-btn"
            onClick={() => setShowForm(false)}
          />
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>New Leave Request</h2>
              <button
                className="admin-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label htmlFor="leave-type">Leave Type</label>
                <select
                  id="leave-type"
                  className="admin-select"
                  value={form.type}
                  onChange={setField("type")}
                >
                  {Object.entries(LEAVE_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="leave-start">Start Date *</label>
                  <input
                    id="leave-start"
                    type="date"
                    className="admin-input"
                    value={form.startDate}
                    onChange={setField("startDate")}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="leave-end">End Date *</label>
                  <input
                    id="leave-end"
                    type="date"
                    className="admin-input"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={setField("endDate")}
                    required
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label htmlFor="leave-reason">Reason (optional)</label>
                <textarea
                  id="leave-reason"
                  className="admin-input"
                  value={form.reason}
                  onChange={setField("reason")}
                  rows={3}
                  placeholder="Brief reason for the leave request…"
                />
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Request List ── */}
      {loading ? (
        <div className="admin-empty-state">Loading leave requests…</div>
      ) : requests.length === 0 ? (
        <div className="admin-empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>beach_access</span>
          <p>No leave requests yet.</p>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowForm(true)}
          >
            Submit Your First Request
          </button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
                return (
                  <tr key={req._id}>
                    <td>{LEAVE_TYPES[req.type] || req.type || "—"}</td>
                    <td>{formatDate(req.startDate)}</td>
                    <td>{formatDate(req.endDate)}</td>
                    <td
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={req.reason || ""}
                    >
                      {req.reason || "—"}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: sc.bg,
                          color: sc.color,
                        }}
                      >
                        {req.status || "—"}
                      </span>
                    </td>
                    <td>{formatDate(req.createdAt)}</td>
                    <td>
                      {req.status === "pending" && (
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-danger"
                          onClick={() => handleCancel(req._id)}
                          title="Cancel request"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            cancel
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </EmployeeShell>
  );
}
