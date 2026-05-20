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

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const workedMinutes = (r) => {
  if (!r?.clockIn || !r?.clockOut) return null;
  return Math.round((new Date(r.clockOut) - new Date(r.clockIn)) / 60000);
};

const STATUS_STYLE = {
  present: { background: "#dcfce7", color: "#16a34a" },
  late:    { background: "#fef9c3", color: "#ca8a04" },
  absent:  { background: "#fee2e2", color: "#dc2626" },
};

export default function EmployeeAttendance() {
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const user = state.user;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [msg, setMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect non-staff
  useEffect(() => {
    if (!state.loading && state.isAuthenticated && state.user && !isStaff(state.user)) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.loading, state.isAuthenticated, state.user, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/my`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const all = data.records || [];
      const todayStr = new Date().toDateString();
      setTodayRecord(all.find((r) => new Date(r.date).toDateString() === todayStr) || null);
      setRecords(all);
    } catch {
      setRecords([]);
      setTodayRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && user) load();
  }, [state.isAuthenticated, user, load]);

  const clockIn = async () => {
    setClockingIn(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-in`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      setMsg({ type: res.ok ? "success" : "error", text: data.message || (res.ok ? "Clocked in." : "Failed.") });
      if (res.ok) await load();
    } catch {
      setMsg({ type: "error", text: "Network error." });
    } finally {
      setClockingIn(false);
    }
  };

  const clockOut = async () => {
    setClockingOut(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-out`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      setMsg({ type: res.ok ? "success" : "error", text: data.message || (res.ok ? "Clocked out." : "Failed.") });
      if (res.ok) await load();
    } catch {
      setMsg({ type: "error", text: "Network error." });
    } finally {
      setClockingOut(false);
    }
  };

  const filtered = statusFilter === "all" ? records : records.filter((r) => r.status === statusFilter);
  const todayMinutes = workedMinutes(todayRecord);

  return (
    <EmployeeShell active="My Attendance" title="My Attendance" subtitle="Your personal attendance records and clock-in/out.">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Today card */}
        <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
            Today — {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Clock In</p>
              <p style={{ margin: "0.25rem 0 0", fontWeight: 600, fontSize: "1.125rem" }}>{fmt(todayRecord?.clockIn)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Clock Out</p>
              <p style={{ margin: "0.25rem 0 0", fontWeight: 600, fontSize: "1.125rem" }}>{fmt(todayRecord?.clockOut)}</p>
            </div>
            {todayMinutes !== null && (
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hours Worked</p>
                <p style={{ margin: "0.25rem 0 0", fontWeight: 600, fontSize: "1.125rem" }}>{Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</p>
              </div>
            )}
            {todayRecord?.status && (
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</p>
                <span style={{ display: "inline-block", marginTop: "0.375rem", padding: "0.125rem 0.625rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 500, ...(STATUS_STYLE[todayRecord.status] || { background: "#f3f4f6", color: "#374151" }) }}>
                  {todayRecord.status}
                </span>
              </div>
            )}
          </div>

          {msg && (
            <p style={{ marginBottom: "0.75rem", fontSize: "0.875rem", color: msg.type === "error" ? "#dc2626" : "#16a34a" }}>{msg.text}</p>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={clockIn}
              disabled={clockingIn || !!todayRecord?.clockIn}
              style={{
                padding: "0.625rem 1.25rem", borderRadius: "8px", border: "none",
                background: todayRecord?.clockIn ? "#e5e7eb" : "#1a1a1a",
                color: todayRecord?.clockIn ? "#9ca3af" : "#fff",
                cursor: todayRecord?.clockIn ? "not-allowed" : "pointer",
                fontWeight: 500, fontSize: "0.875rem",
              }}
            >
              {clockingIn ? "Clocking in…" : todayRecord?.clockIn ? "Already Clocked In" : "Clock In"}
            </button>
            <button
              onClick={clockOut}
              disabled={clockingOut || !todayRecord?.clockIn || !!todayRecord?.clockOut}
              style={{
                padding: "0.625rem 1.25rem", borderRadius: "8px", border: "1px solid #e5e7eb",
                background: "#fff",
                color: (!todayRecord?.clockIn || todayRecord?.clockOut) ? "#9ca3af" : "#1a1a1a",
                cursor: (!todayRecord?.clockIn || todayRecord?.clockOut) ? "not-allowed" : "pointer",
                fontWeight: 500, fontSize: "0.875rem",
              }}
            >
              {clockingOut ? "Clocking out…" : todayRecord?.clockOut ? "Already Clocked Out" : "Clock Out"}
            </button>
          </div>
        </div>

        {/* History */}
        <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Attendance History</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", cursor: "pointer" }}
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {loading ? (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading attendance records…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No records found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                    {["Date", "Clock In", "Clock Out", "Hours", "Status"].map((h) => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.8125rem" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const mins = workedMinutes(r);
                    return (
                      <tr key={r._id} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "0.625rem 0.75rem" }}>{fmtDate(r.date)}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>{fmt(r.clockIn)}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>{fmt(r.clockOut)}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>{mins !== null ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "—"}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>
                          <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, ...(STATUS_STYLE[r.status] || { background: "#f3f4f6", color: "#374151" }) }}>
                            {r.status || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </EmployeeShell>
  );
}
