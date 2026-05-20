import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { AdminShell } from "../Components/AdminShell";
import { useAuthContext } from "../context/AuthContext";
import { can } from "../utils/permissions";
import { getAuthHeaders } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const STATUS_COLORS = {
  pending:   { bg: "#f59e0b20", color: "#f59e0b" },
  approved:  { bg: "#22c55e20", color: "#22c55e" },
  rejected:  { bg: "#ef444420", color: "#ef4444" },
  cancelled: { bg: "#64748b20", color: "#64748b" },
  escalated: { bg: "#a78bfa20", color: "#a78bfa" },
};

const TYPE_LABELS = {
  vacation:       "Vacation",
  sick_leave:     "Sick Leave",
  time_off:       "Time Off",
  leave_early:    "Leave Early",
  unpaid_leave:   "Unpaid Leave",
  remote_day:     "Remote Day",
  maternity_leave:"Maternity Leave",
  paternity_leave:"Paternity Leave",
  bereavement:    "Bereavement",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

export default function AdminLeave() {
  const { state } = useAuthContext();
  const user = state.user;

  const canApprove  = can(user, "leave.approve");
  const canReject   = can(user, "leave.reject");
  const canEscalate = can(user, "leave.escalate");
  const canExport   = can(user, "leave.exportExcel");

  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({ status: "pending", type: "", from: "", to: "" });
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalId, setRejectModalId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (filters.status) params.set("status", filters.status);
      if (filters.type)   params.set("type", filters.type);
      if (filters.from)   params.set("from", filters.from);
      if (filters.to)     params.set("to", filters.to);

      const res = await fetch(`${API_URL}/api/admin/leave?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
        setTotal(data.total);
      } else {
        toast.error(data.message || "Failed to load leave requests");
      }
    } catch {
      toast.error("Network error loading leave requests");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/leave/${id}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request approved — attendance updated");
        fetchRequests();
        if (selected?._id === id) setSelected(null);
      } else {
        toast.error(data.message || "Approve failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) { toast.error("Rejection reason is required"); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/leave/${rejectModalId}/reject`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request rejected");
        setRejectModalId(null);
        setRejectReason("");
        fetchRequests();
        if (selected?._id === rejectModalId) setSelected(null);
      } else {
        toast.error(data.message || "Reject failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/leave/${id}/escalate`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ comment: "Escalated for senior approval" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request escalated");
        fetchRequests();
      } else {
        toast.error(data.message || "Escalate failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    window.open(`${API_URL}/api/admin/export/leave.xlsx?${params}&token=${localStorage.getItem("token")}`, "_blank");
  };

  const LIMIT = 50;
  const totalPages = Math.ceil(total / LIMIT);

  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminShell
      active="Leave Requests"
      title="Leave Requests"
      subtitle="Manage vacation, sick leave, time-off, and leave-early requests."
      actions={
        <div style={{ display: "flex", gap: 8 }}>
          {canExport && (
            <button className="admin-btn admin-btn-secondary" onClick={handleExport}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Export Excel
            </button>
          )}
        </div>
      }
    >
      {/* Status quick-filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["", "pending", "approved", "rejected", "escalated", "cancelled"].map((s) => (
          <button
            key={s}
            className={`admin-btn ${filters.status === s ? "admin-btn-primary" : "admin-btn-secondary"}`}
            onClick={() => { setFilters((f) => ({ ...f, status: s })); setPage(1); }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            {s && statusCounts[s] ? ` (${statusCounts[s]})` : ""}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <select
          className="admin-select"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="date"
          className="admin-input"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
        />
        <input
          type="date"
          className="admin-input"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-empty-state">Loading leave requests…</div>
      ) : requests.length === 0 ? (
        <div className="admin-empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>beach_access</span>
          <p>No leave requests found for the selected filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Requested</th>
                {(canApprove || canReject || canEscalate) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const style = STATUS_COLORS[req.status] || {};
                return (
                  <tr
                    key={req._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelected(selected?._id === req._id ? null : req)}
                  >
                    <td>
                      <strong>{req.employeeName || "—"}</strong>
                      <br />
                      <small style={{ color: "#94a3b8" }}>{req.department || req.employeeEmail}</small>
                    </td>
                    <td>{TYPE_LABELS[req.type] || req.type}</td>
                    <td>{formatDate(req.startDate)}</td>
                    <td>{formatDate(req.endDate)}</td>
                    <td>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: style.bg, color: style.color }}>
                        {req.status}
                      </span>
                    </td>
                    <td>{formatDate(req.createdAt)}</td>
                    {(canApprove || canReject || canEscalate) && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {canApprove && req.status === "pending" && (
                            <button
                              className="admin-btn admin-btn-success"
                              onClick={() => handleApprove(req._id)}
                              disabled={actionLoading}
                              title="Approve request"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                            </button>
                          )}
                          {canReject && req.status === "pending" && (
                            <button
                              className="admin-btn admin-btn-danger"
                              onClick={() => { setRejectModalId(req._id); setRejectReason(""); }}
                              disabled={actionLoading}
                              title="Reject request"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                            </button>
                          )}
                          {canEscalate && req.status === "pending" && (
                            <button
                              className="admin-btn admin-btn-secondary"
                              onClick={() => handleEscalate(req._id)}
                              disabled={actionLoading}
                              title="Escalate to senior"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_upward</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="admin-card" style={{ marginTop: 20, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>{TYPE_LABELS[selected.type] || selected.type} — {selected.employeeName}</h3>
            <button className="admin-btn admin-btn-ghost" onClick={() => setSelected(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <div><small style={{ color: "#94a3b8" }}>Status</small><br /><strong>{selected.status}</strong></div>
            <div><small style={{ color: "#94a3b8" }}>Department</small><br /><strong>{selected.department || "—"}</strong></div>
            <div><small style={{ color: "#94a3b8" }}>Start Date</small><br /><strong>{formatDate(selected.startDate)}</strong></div>
            <div><small style={{ color: "#94a3b8" }}>End Date</small><br /><strong>{formatDate(selected.endDate)}</strong></div>
            {selected.leaveEarlyTime && <div><small style={{ color: "#94a3b8" }}>Leave Early At</small><br /><strong>{selected.leaveEarlyTime}</strong></div>}
            {selected.hoursRequested && <div><small style={{ color: "#94a3b8" }}>Hours Requested</small><br /><strong>{selected.hoursRequested}h</strong></div>}
            <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#94a3b8" }}>Reason</small><br />{selected.reason || "—"}</div>
            {selected.rejectionReason && <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#ef4444" }}>Rejection Reason</small><br />{selected.rejectionReason}</div>}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <button className="admin-btn admin-btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ lineHeight: "36px", color: "#94a3b8" }}>Page {page} of {totalPages} ({total} records)</span>
          <button className="admin-btn admin-btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="admin-modal-overlay">
          <button
            type="button"
            aria-label="Close modal"
            className="admin-modal-backdrop-btn"
            onClick={() => setRejectModalId(null)}
          />
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>Reject Leave Request</h2>
              <button className="admin-modal-close" onClick={() => setRejectModalId(null)} aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReject} className="admin-modal-form">
              <div className="admin-form-group">
                <label htmlFor="leave-reject-reason">Rejection Reason *</label>
                <textarea
                  id="leave-reject-reason"
                  className="admin-input"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Provide a clear reason for rejection"
                  required
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setRejectModalId(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-danger" disabled={actionLoading}>
                  {actionLoading ? "Rejecting…" : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
