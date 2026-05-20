import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmployeeShell } from "../Components/EmployeeShell";
import { useAuthContext } from "../context/AuthContext";
import { isStaff, getDashboardRoute } from "../utils/permissions";
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
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

const workedMinutes = (record) => {
  if (!record?.clockIn || !record?.clockOut) return null;
  return Math.round((new Date(record.clockOut) - new Date(record.clockIn)) / 60000);
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const user = state.user;

  const [todayRecord, setTodayRecord] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [pendingLeave, setPendingLeave] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [clockMsg, setClockMsg] = useState(null);

  // Redirect customers away
  useEffect(() => {
    if (!state.loading && state.isAuthenticated && state.user && !isStaff(state.user)) {
      navigate(getDashboardRoute(state.user), { replace: true });
    }
  }, [state.loading, state.isAuthenticated, state.user, navigate]);

  const loadAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/my`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load attendance");
      const data = await res.json();
      const records = data.records || [];

      const todayStr = new Date().toDateString();
      const today = records.find((r) => new Date(r.date).toDateString() === todayStr) || null;
      setTodayRecord(today);
      setRecentRecords(records.slice(0, 7));
    } catch {
      setTodayRecord(null);
      setRecentRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  const loadLeave = useCallback(async () => {
    setLeaveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/leave/my`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load leave");
      const data = await res.json();
      const all = data.requests || data.leaveRequests || [];
      setPendingLeave(all.filter((r) => r.status === "pending").slice(0, 3));
    } catch {
      setPendingLeave([]);
    } finally {
      setLeaveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && user) {
      loadAttendance();
      loadLeave();
    }
  }, [state.isAuthenticated, user, loadAttendance, loadLeave]);

  const handleClockIn = async () => {
    setClockingIn(true);
    setClockMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-in`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClockMsg({ type: "error", text: data.message || "Clock-in failed." });
      } else {
        setClockMsg({ type: "success", text: "Clocked in successfully." });
        await loadAttendance();
      }
    } catch {
      setClockMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setClockingOut(true);
    setClockMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-out`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClockMsg({ type: "error", text: data.message || "Clock-out failed." });
      } else {
        setClockMsg({ type: "success", text: "Clocked out successfully." });
        await loadAttendance();
      }
    } catch {
      setClockMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setClockingOut(false);
    }
  };

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "Employee";

  const minutes = workedMinutes(todayRecord);

  return (
    <EmployeeShell active="Overview" title="Employee Dashboard" subtitle="Your attendance, leave, and profile at a glance.">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Welcome */}
        <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem 2rem", border: "1px solid var(--border, #e5e7eb)" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Welcome back, {displayName}.</h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted, #6b7280)", fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>

          {/* Today's Attendance */}
          <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "var(--accent, #1a1a1a)" }}>schedule</span>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Today's Attendance</h3>
            </div>

            {attendanceLoading ? (
              <p style={{ color: "var(--text-muted, #6b7280)", fontSize: "0.875rem" }}>Loading…</p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted, #6b7280)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Clock In</p>
                    <p style={{ margin: "0.125rem 0 0", fontWeight: 600 }}>{fmt(todayRecord?.clockIn)}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted, #6b7280)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Clock Out</p>
                    <p style={{ margin: "0.125rem 0 0", fontWeight: 600 }}>{fmt(todayRecord?.clockOut)}</p>
                  </div>
                  {minutes !== null && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted, #6b7280)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hours Worked</p>
                      <p style={{ margin: "0.125rem 0 0", fontWeight: 600 }}>{Math.floor(minutes / 60)}h {minutes % 60}m</p>
                    </div>
                  )}
                </div>

                {clockMsg && (
                  <p style={{ fontSize: "0.8125rem", marginBottom: "0.75rem", color: clockMsg.type === "error" ? "#dc2626" : "#16a34a" }}>
                    {clockMsg.text}
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={handleClockIn}
                    disabled={clockingIn || !!todayRecord?.clockIn}
                    style={{
                      flex: 1, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "none",
                      background: todayRecord?.clockIn ? "#e5e7eb" : "#1a1a1a",
                      color: todayRecord?.clockIn ? "#9ca3af" : "#fff",
                      cursor: todayRecord?.clockIn ? "not-allowed" : "pointer",
                      fontSize: "0.875rem", fontWeight: 500,
                    }}
                  >
                    {clockingIn ? "Clocking in…" : todayRecord?.clockIn ? "Clocked In" : "Clock In"}
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={clockingOut || !todayRecord?.clockIn || !!todayRecord?.clockOut}
                    style={{
                      flex: 1, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #e5e7eb",
                      background: "#fff",
                      color: (!todayRecord?.clockIn || todayRecord?.clockOut) ? "#9ca3af" : "#1a1a1a",
                      cursor: (!todayRecord?.clockIn || todayRecord?.clockOut) ? "not-allowed" : "pointer",
                      fontSize: "0.875rem", fontWeight: 500,
                    }}
                  >
                    {clockingOut ? "Clocking out…" : todayRecord?.clockOut ? "Clocked Out" : "Clock Out"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Recent Attendance */}
          <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>calendar_month</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>My Attendance</h3>
              </div>
              <Link to="/employee/attendance" style={{ fontSize: "0.8125rem", color: "var(--accent, #1a1a1a)", textDecoration: "none", fontWeight: 500 }}>View all →</Link>
            </div>
            {attendanceLoading ? (
              <p style={{ color: "var(--text-muted, #6b7280)", fontSize: "0.875rem" }}>Loading…</p>
            ) : recentRecords.length === 0 ? (
              <p style={{ color: "var(--text-muted, #6b7280)", fontSize: "0.875rem" }}>No attendance records found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recentRecords.map((r) => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "0.875rem" }}>{fmtDate(r.date)}</span>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 500, padding: "0.125rem 0.5rem", borderRadius: "9999px",
                      background: r.status === "present" ? "#dcfce7" : r.status === "late" ? "#fef9c3" : "#fee2e2",
                      color: r.status === "present" ? "#16a34a" : r.status === "late" ? "#ca8a04" : "#dc2626",
                    }}>
                      {r.status || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave Requests */}
          <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>beach_access</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Leave Requests</h3>
              </div>
              <Link to="/employee/leave" style={{ fontSize: "0.8125rem", color: "var(--accent, #1a1a1a)", textDecoration: "none", fontWeight: 500 }}>Manage →</Link>
            </div>
            {leaveLoading ? (
              <p style={{ color: "var(--text-muted, #6b7280)", fontSize: "0.875rem" }}>Loading…</p>
            ) : pendingLeave.length === 0 ? (
              <p style={{ color: "var(--text-muted, #6b7280)", fontSize: "0.875rem" }}>No pending leave requests.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pendingLeave.map((r) => (
                  <div key={r._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "0.875rem" }}>{r.leaveType || r.type || "Leave"}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500, padding: "0.125rem 0.5rem", borderRadius: "9999px", background: "#fef9c3", color: "#ca8a04" }}>
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/employee/leave"
              style={{
                display: "inline-block", marginTop: "1rem", padding: "0.5rem 1rem", borderRadius: "8px",
                background: "#1a1a1a", color: "#fff", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
              }}
            >
              Request Leave
            </Link>
          </div>

          {/* My Profile */}
          <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>manage_accounts</span>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>My Profile</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted, #6b7280)" }}>Name</span>
                <span style={{ fontWeight: 500 }}>{displayName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted, #6b7280)" }}>Email</span>
                <span style={{ fontWeight: 500 }}>{user?.email || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted, #6b7280)" }}>Role</span>
                <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{user?.role || "—"}</span>
              </div>
              {user?.department && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted, #6b7280)" }}>Department</span>
                  <span style={{ fontWeight: 500 }}>{user.department}</span>
                </div>
              )}
              {user?.jobTitle && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted, #6b7280)" }}>Job Title</span>
                  <span style={{ fontWeight: 500 }}>{user.jobTitle}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Quick actions */}
        <div style={{ background: "var(--surface, #fff)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border, #e5e7eb)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {[
              { label: "View Attendance", to: "/employee/attendance", icon: "calendar_month" },
              { label: "Request Leave", to: "/employee/leave", icon: "beach_access" },
            ].map(({ label, to, icon }) => (
              <Link
                key={label}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.625rem 1rem", borderRadius: "8px",
                  border: "1px solid #e5e7eb", color: "#1a1a1a", textDecoration: "none",
                  fontSize: "0.875rem", fontWeight: 500,
                  background: "#fff",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </EmployeeShell>
  );
}
