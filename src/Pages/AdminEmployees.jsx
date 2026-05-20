import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { useAuthContext } from "../context/AuthContext";
import { can } from "../utils/permissions";
import { commerceApi, storageApi, API_URL } from "../services/api";
import "../Styles/admin-premium.css";

// Static demo roster (will be replaced by live data once an employee list endpoint exists)
const DEMO_EMPLOYEES = [
  {
    _id: null,
    name: "Eleanor Vance",
    role: "Sales Lead - West Coast",
    status: "Available",
    statusColor: "#22c55e",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKg56fmDE6b8lW-ZqTf2rFu5R2TwfNXbHRg5ewVs-sEg-Rw1arBoL-GQQRCIRXvaKukLnysCXJaN-2i5DFT_SpXZodidaYEn3-4Hi23foLx7Namrjpxg4U9Qsrigf4UV_teNuOHbmK1jTnihLzwLwef7COueB7wJeJy89WdyTzAqHTrUGXtuHtpmgytmlC4b1d6Jv3sWoGolmF2ThkVirtB0Az0dD4DRucqvJpnzUPqgqhhZA7CypkL5RDX6LKMXtBGY5211BzGGig",
    metrics: [["leaderboard", "Active Leads", "24"], ["shopping_bag", "Conversion", "12.5%"]],
    invitationEmailStatus: "sent",
  },
  {
    _id: null,
    name: "Marcus Thorne",
    role: "Senior Interior Designer",
    status: "Busy",
    statusColor: "#f59e0b",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBieOctkqE3k5BUNDFozctUC3LA5ZE_TyImFlA7WFr7G6BE9EvoJL-ehVri6JDnIJdCcw6R6I7axfrSRzfrSchbK70Gf_sJUdsqhG45qXJunZGFiwp9bcQOkvalWvC5fgG8k_GC06IJcMHpB0fkI20KwFSAAFmAQ55pNf7mPBGw4T1aQc3LYFWVh4blNusWyZe-5gaW36V-0ajwGxUMPZyXeKwR9bI8WUenDriYrGPhUPJuP6CKV_PiqB5Bjx9_8YM_2v_yQSQlxP0D",
    metrics: [["architecture", "Projects", "8"], ["inventory", "Managed Stock", "412 Units"]],
    invitationEmailStatus: "sent",
  },
  {
    _id: null,
    name: "Sienna Blake",
    role: "Logistics Manager",
    status: "Available",
    statusColor: "#22c55e",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPmIYB5KpkPXdxUsP4VLHBbh5eDH9FcsmBpB_V0H-a-GnZMnFxdty8M_u4hM8cfW85sap9G8g6ndV8CfVinCyJW3ReWXLsXfySlA6s3vldOtvpExGHTNKSvRo-ZBKawezbAsw_aKJBgb048hwd_cyRCk1p70kejkyp7_zEuGYa62ASCAvW7XpEYZyZocTtvWoZ74oWrq-fJlC3bsFb3YKpATvKu3_jTmfqYDGquvTxJY9ut1q3G6Pj-GybbR6fRFr7ffLJDKKxG1Xt",
    metrics: [["local_shipping", "Shipments", "32 Today"], ["fact_check", "Accuracy", "99.8%"]],
    invitationEmailStatus: "none",
  },
];

const STATUS_LABEL = {
  none: { text: "Not invited", cls: "badge-muted" },
  queued: { text: "Invite queued", cls: "badge-warn" },
  sent: { text: "Invite sent", cls: "badge-ok" },
  failed: { text: "Invite failed", cls: "badge-danger" },
  provider_not_configured: { text: "Queued (no provider)", cls: "badge-warn" },
};

// ─── main component ───────────────────────────────────────────────────────────────

const AdminEmployees = () => {
  const { state } = useAuthContext();
  const user = state.user;
  const canInvite = can(user, "employees.invite");
  const canExport = can(user, "employees.exportExcel");

  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "info" });
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 3200);
  }, []);

  const normalizeEmployee = useCallback((employee) => ({
    _id: employee._id || employee.id,
    name:
      employee.name ||
      [employee.fname, employee.lname].filter(Boolean).join(" ") ||
      employee.email,
    role:
      employee.jobTitle ||
      `${employee.role || "readonly"} - ${employee.department || "General"}`,
    department: employee.department,
    email: employee.email,
    status: employee.status === "inactive" ? "Inactive" : "Active",
    statusColor: employee.status === "inactive" ? "#94a3b8" : "#22c55e",
    image: employee.profilePhotoUrl,
    metrics: [],
    invitationEmailStatus: employee.invitationEmailStatus || "none",
  }), []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await commerceApi.getEmployees();
      setEmployees(data.map(normalizeEmployee));
    } catch (error) {
      setEmployees(DEMO_EMPLOYEES);
      showToast(error.message || "Employee API unavailable. Showing demo roster.", "warn");
    } finally {
      setLoading(false);
    }
  }, [normalizeEmployee, showToast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return employees;
    return employees.filter(
      (e) => e.name.toLowerCase().includes(needle) || e.role.toLowerCase().includes(needle)
    );
  }, [query, employees]);

  const handleInviteSent = (newEmployee) => {
    setEmployees((prev) => [
      {
        _id: newEmployee._id,
        name: `${newEmployee.fname} ${newEmployee.lname}`,
        role: `${newEmployee.role} - ${newEmployee.department}`,
        status: "Invited",
        statusColor: "#6366f1",
        image: null,
        metrics: [],
        invitationEmailStatus: newEmployee.invitationEmailStatus,
      },
      ...prev,
    ]);
    setInviteOpen(false);
  };

  const handlePhotoUploaded = (employeeId, photoUrl) => {
    setEmployees((prev) =>
      prev.map((e) => (e._id === employeeId ? { ...e, image: photoUrl } : e))
    );
  };

  return (
    <AdminShell
      active="Employees"
      title="Employee Directory"
      actions={
        <>
          <label className="employee-search">
            <span className="material-symbols-outlined">search</span>
            <input
              aria-label="Search team"
              placeholder="Search team..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {canInvite && (
            <button
              className="admin-premium-button primary"
              type="button"
              onClick={() => setInviteOpen(true)}
            >
              <span className="material-symbols-outlined">person_add</span>
              Invite New Employee
            </button>
          )}
          {canExport && (
            <a
              className="admin-premium-button"
              href={`${API_URL}/api/admin/export/employees.xlsx`}
              download="employees.xlsx"
              onClick={(e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");
                window.open(`${API_URL}/api/admin/export/employees.xlsx?token=${token}`, "_blank");
              }}
              style={{ textDecoration: "none" }}
            >
              <span className="material-symbols-outlined">download</span>
              Export
            </a>
          )}
        </>
      }
    >
      <section className="employee-stats-grid">
        <Stat title="Total Staff" value={employees.length} />
        <Stat title="Active Leads" value="128" />
        <Stat title="Department Split" split />
        <Stat title="Utilization" value="84%" gold />
      </section>

      {toast.msg && (
        <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {loading && <div className="admin-loading">Loading employees...</div>}

      <section className="employee-grid">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee._id || employee.name}
            employee={employee}
            showToast={showToast}
            onPhotoUploaded={handlePhotoUploaded}
            onInviteUpdated={(employeeId, status) => {
              setEmployees((prev) =>
                prev.map((item) =>
                  item._id === employeeId ? { ...item, invitationEmailStatus: status } : item
                )
              );
            }}
          />
        ))}
      </section>

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSent={handleInviteSent}
          showToast={showToast}
        />
      )}
    </AdminShell>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────────

const Stat = ({ title, value, split, gold }) => (
  <div className="employee-stat-card">
    <p>{title}</p>
    {split ? (
      <div className="employee-split-bar" aria-label="Department split">
        <span style={{ background: "#0f172a", width: "33%" }} />
        <span style={{ background: "#d97706", width: "50%" }} />
        <span style={{ background: "#a8a29e", width: "17%" }} />
      </div>
    ) : (
      <strong style={{ color: gold ? "#b45309" : undefined }}>{value}</strong>
    )}
  </div>
);

// ─── Employee card ────────────────────────────────────────────────────────────────

const EmployeeCard = ({ employee, showToast, onPhotoUploaded, onInviteUpdated }) => {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !employee._id) return;
    setUploading(true);
    try {
      const result = await storageApi.uploadEmployeePhoto(employee._id, file);
      onPhotoUploaded(employee._id, result.photoUrl);
      showToast("Profile photo updated.", "ok");
    } catch (err) {
      showToast(`Photo upload failed: ${err.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const invBadge = STATUS_LABEL[employee.invitationEmailStatus] || STATUS_LABEL.none;

  const handleSendInvite = async () => {
    if (!employee._id) return;
    setSendingInvite(true);
    try {
      const result = await storageApi.sendEmployeeInvite(employee._id);
      onInviteUpdated(employee._id, result.status);
      const copyText = result.inviteUrl ? ` Invite link: ${result.inviteUrl}` : "";
      showToast(`${result.message || "Invite queued."}${copyText}`, result.status === "sent" ? "ok" : "warn");
    } catch (err) {
      showToast(`Invite failed: ${err.message}`, "error");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <article className="employee-card">
      <div className="employee-card-body">
        <div className="employee-card-top">
          <div className="employee-avatar-wrap">
            {employee.image ? (
              <img className="employee-avatar" src={employee.image} alt={employee.name} />
            ) : (
              <div className="employee-avatar employee-avatar--initials">
                {employee.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="employee-status-dot" style={{ background: employee.statusColor }} />

            {/* photo upload trigger — only for employees with a real DB id */}
            {employee._id && (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="employee-photo-upload-btn"
                  title="Upload profile photo"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <span className="material-symbols-outlined">
                    {uploading ? "hourglass_empty" : "photo_camera"}
                  </span>
                </button>
              </>
            )}
          </div>
          <span className="employee-status">{employee.status}</span>
        </div>

        <h2>{employee.name}</h2>
        <p className="employee-role">{employee.role}</p>

        <span className={`admin-badge ${invBadge.cls}`}>{invBadge.text}</span>

        <div className="employee-metrics">
          {employee.metrics.map(([icon, label, value]) => (
            <div className="employee-metric" key={label}>
              <span>
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="employee-card-footer">
        <button type="button">View Profile</button>
        <button
          type="button"
          aria-label={`Email ${employee.name}`}
          onClick={handleSendInvite}
          disabled={!employee._id || sendingInvite}
        >
          <span className="material-symbols-outlined">mail</span>
        </button>
      </div>
    </article>
  );
};

// ─── Invite modal (wired to backend) ─────────────────────────────────────────────

const DEPARTMENTS = [
  "Interior Design",
  "Sales & Leads",
  "Logistics & Warehouse",
  "Administration",
];

const InviteModal = ({ onClose, onSent, showToast }) => {
  const [permission, setPermission] = useState("readonly");
  const [sending, setSending] = useState(false);
  const [fields, setFields] = useState({ fname: "", lname: "", email: "", department: DEPARTMENTS[0] });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const result = await storageApi.createAndInviteEmployee({
        fname: fields.fname.trim(),
        lname: fields.lname.trim(),
        email: fields.email.trim(),
        department: fields.department,
        role: permission,
      });

      const statusMessages = {
        sent: "Invitation email sent successfully.",
        queued: "Employee created. Invite email queued (delivery provider not configured yet).",
        provider_not_configured: "Employee created. No email provider configured; share the invite link manually.",
        failed: `Employee created but invite email failed to send.`,
      };

      showToast(statusMessages[result.status] || `Invitation ${result.status}.`, result.status === "sent" ? "ok" : "warn");

      if (result.inviteUrl && result.status !== "sent") {
        navigator.clipboard?.writeText(result.inviteUrl).catch(() => {});
        showToast(`Invite link copied to clipboard: ${result.inviteUrl}`, "info");
      }

      onSent(result.employee);
    } catch (err) {
      showToast(`Invitation failed: ${err.message}`, "error");
      setSending(false);
    }
  };

  return (
    <div className="invite-modal-backdrop" role="dialog" aria-modal="true">
      <div className="invite-modal">
        <div className="invite-modal-header">
          <div>
            <h2>Invite New Employee</h2>
            <p>Grant access to the Hedj Commerce management suite.</p>
          </div>
          <button className="admin-premium-button" type="button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="invite-form" onSubmit={handleSubmit}>
          <div className="invite-grid">
            <div className="admin-field">
              <label htmlFor="invite-fname">First Name</label>
              <input id="invite-fname" name="fname" value={fields.fname} onChange={handleChange} placeholder="e.g. Julian" required />
            </div>
            <div className="admin-field">
              <label htmlFor="invite-lname">Last Name</label>
              <input id="invite-lname" name="lname" value={fields.lname} onChange={handleChange} placeholder="e.g. Hedj" required />
            </div>
            <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="invite-email">Work Email</label>
              <input id="invite-email" name="email" type="email" value={fields.email} onChange={handleChange} placeholder="julian@hedj.com" required />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="invite-department">Department</label>
            <select id="invite-department" name="department" value={fields.department} onChange={handleChange}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <p className="orders-label">Role Permission Level</p>
            <div className="permission-grid">
              {[
                { value: "admin", label: "Admin", icon: "admin_panel_settings" },
                { value: "readonly", label: "Viewer", icon: "visibility" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={`permission-card ${permission === item.value ? "active" : ""}`}
                  onClick={() => setPermission(item.value)}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="invite-actions">
            <button className="admin-premium-button" type="button" onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button className="admin-premium-button primary" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEmployees;
