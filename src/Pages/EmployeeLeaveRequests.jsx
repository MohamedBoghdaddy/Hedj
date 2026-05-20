import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EmployeeShell } from "../Components/EmployeeShell";
import { useAuthContext } from "../context/AuthContext";
import { isStaff } from "../utils/permissions";
import { getAuthHeaders } from "../services/authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const LEAVE_TYPES = [
  "annual", "sick", "personal", "maternity", "paternity",
  "unpaid", "study", "emergency", "other",
];

const STATUS_STYLE = {
  pending:  { background: "#fef9c3", color: "#ca8a04" },
  approved: { background: "#dcfce7", color: "#16a34a" },
  rejected: { background: "#fee2e2", color: "#dc2626" },
  cancelled:{ background: "#f3f4f6", color: "#6b7280" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const INITIAL_FORM = { type: "annual", startDate: "", endDate: "", reason: "" };

export default function EmployeeLeaveRequests() {
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const user = state.user;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  // Redirect non-staff
  useEffect(() => {
    if (!state.loading && state.isAuthenticated && state.user && !isStaff(state.user)) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.loading, state.isAuthenticated, state.user, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leave/my`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && user) load();
  }, [state.isAuthenticated, user, load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setMsg({ type: "error", text: "Start and end dates are required." });
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setMsg({ type: "error", text: "End date must be after start date." });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/leave/request`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.message || "Submission failed." });
      } else {
        setMsg({ type: "success", text: "Leave request submitted successfully." });
        setForm(INITIAL_FORM);
        setShowForm(false);
        await load();
      }
    } catch {
      setMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelling(id);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/leave/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.message || "Cancel failed." });
      } else {
        setMsg({ type: "success", text: "Leave request cancelled." });
        await load();
      }
    } catch {
      setMsg({ type: "error", text: "Network error." });
    } finally {
      setCancelling(null);
    }
  };

  const filtered = statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);
  const counts = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
  requests.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });

  return (
    <EmployeeShell active="Leave Requests" title="My Leave Requests" subtitle="View, submit, and manage your leave requests.">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Total", count: counts.all, color: "#1a1a1a" },
            { label: "Pending", count: counts.pending, color: "#ca8a04" },
            { label: "Approved", count: counts.approved, color: "#16a34a" },
            { label: "Rejected", count: counts.rejected, color: "#dc2626" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.25rem", border: "1px solid var(--border, #e5e7eb)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color }}>{count}</p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Request leave button + message */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <button
            onClick={() => { setShowForm((v) => !v); setMsg(null); }}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem", borderRadius: "8px", border: "none",
              background: "#1a1a1a", color: "#fff", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>
              {showForm ? "close" : "add"}
            </span>
            {showForm ? "Cancel" : "Request Leave"}
          </button>

          {msg && (
            <p style={{ margin: 0, fontSize: "0.875rem", color: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</p>
          )}
        </div>

        {/* Leave request form */}
        {showForm && (
          <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
            <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 600 }}>New Leave Request</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                    Leave Type
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", marginTop: "0.375rem" }}
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                    Start Date
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", boxSizing: "border-box", marginTop: "0.375rem" }}
                    />
                  </label>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                    End Date
                    <input
                      type="date"
                      required
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", boxSizing: "border-box", marginTop: "0.375rem" }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.375rem" }}>
                  Reason (optional)
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    rows={3}
                    placeholder="Briefly describe the reason for your leave request…"
                    style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box", marginTop: "0.375rem" }}
                  />
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "0.625rem 1.5rem", borderRadius: "8px", border: "none",
                    background: "#1a1a1a", color: "#fff", fontWeight: 500, fontSize: "0.875rem",
                    cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests list */}
        <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>My Requests</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", cursor: "pointer" }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading leave requests…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No leave requests found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((r) => (
                <div key={r._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "8px", border: "1px solid #f3f4f6", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9375rem", textTransform: "capitalize" }}>{r.type || "Leave"}</span>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>
                      {fmtDate(r.startDate)} — {fmtDate(r.endDate)}
                    </span>
                    {r.reason && (
                      <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{r.reason}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ padding: "0.125rem 0.625rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 500, ...(STATUS_STYLE[r.status] || { background: "#f3f4f6", color: "#374151" }) }}>
                      {r.status || "—"}
                    </span>
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleCancel(r._id)}
                        disabled={cancelling === r._id}
                        style={{
                          padding: "0.25rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb",
                          background: "#fff", color: "#374151", fontSize: "0.8125rem", cursor: "pointer",
                        }}
                      >
                        {cancelling === r._id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </EmployeeShell>
  );
}
