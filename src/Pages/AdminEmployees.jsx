import { useMemo, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import "../Styles/admin-premium.css";

const employees = [
  {
    name: "Eleanor Vance",
    role: "Sales Lead - West Coast",
    status: "Available",
    statusColor: "#22c55e",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKg56fmDE6b8lW-ZqTf2rFu5R2TwfNXbHRg5ewVs-sEg-Rw1arBoL-GQQRCIRXvaKukLnysCXJaN-2i5DFT_SpXZodidaYEn3-4Hi23foLx7Namrjpxg4U9Qsrigf4UV_teNuOHbmK1jTnihLzwLwef7COueB7wJeJy89WdyTzAqHTrUGXtuHtpmgytmlC4b1d6Jv3sWoGolmF2ThkVirtB0Az0dD4DRucqvJpnzUPqgqhhZA7CypkL5RDX6LKMXtBGY5211BzGGig",
    metrics: [
      ["leaderboard", "Active Leads", "24"],
      ["shopping_bag", "Conversion", "12.5%"],
    ],
  },
  {
    name: "Marcus Thorne",
    role: "Senior Interior Designer",
    status: "Busy",
    statusColor: "#f59e0b",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBieOctkqE3k5BUNDFozctUC3LA5ZE_TyImFlA7WFr7G6BE9EvoJL-ehVri6JDnIJdCcw6R6I7axfrSRzfrSchbK70Gf_sJUdsqhG45qXJunZGFiwp9bcQOkvalWvC5fgG8k_GC06IJcMHpB0fkI20KwFSAAFmAQ55pNf7mPBGw4T1aQc3LYFWVh4blNusWyZe-5gaW36V-0ajwGxUMPZyXeKwR9bI8WUenDriYrGPhUPJuP6CKV_PiqB5Bjx9_8YM_2v_yQSQlxP0D",
    metrics: [
      ["architecture", "Projects", "8"],
      ["inventory", "Managed Stock", "412 Units"],
    ],
  },
  {
    name: "Sienna Blake",
    role: "Logistics Manager",
    status: "Available",
    statusColor: "#22c55e",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAPmIYB5KpkPXdxUsP4VLHBbh5eDH9FcsmBpB_V0H-a-GnZMnFxdty8M_u4hM8cfW85sap9G8g6ndV8CfVinCyJW3ReWXLsXfySlA6s3vldOtvpExGHTNKSvRo-ZBKawezbAsw_aKJBgb048hwd_cyRCk1p70kejkyp7_zEuGYa62ASCAvW7XpEYZyZocTtvWoZ74oWrq-fJlC3bsFb3YKpATvKu3_jTmfqYDGquvTxJY9ut1q3G6Pj-GybbR6fRFr7ffLJDKKxG1Xt",
    metrics: [
      ["local_shipping", "Shipments", "32 Today"],
      ["fact_check", "Accuracy", "99.8%"],
    ],
  },
];

const AdminEmployees = () => {
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredEmployees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(needle) ||
        employee.role.toLowerCase().includes(needle)
    );
  }, [query]);

  return (
    <AdminShell
      active="Employees"
      title="Employee Directory"
      profileName="Julian Hedj"
      role="Administrator"
      actions={
        <>
          <label className="employee-search">
            <span className="material-symbols-outlined">search</span>
            <input
              aria-label="Search team"
              placeholder="Search team..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className="admin-premium-button primary"
            type="button"
            onClick={() => setInviteOpen(true)}
          >
            <span className="material-symbols-outlined">person_add</span>
            Invite New Employee
          </button>
          <span className="material-symbols-outlined">notifications</span>
          <span className="material-symbols-outlined">help</span>
        </>
      }
    >
      <section className="employee-stats-grid">
        <Stat title="Total Staff" value="42" />
        <Stat title="Active Leads" value="128" />
        <Stat title="Department Split" split />
        <Stat title="Utilization" value="84%" gold />
      </section>

      {notice && <p className="employee-toast">{notice}</p>}

      <section className="employee-grid">
        {filteredEmployees.map((employee) => (
          <EmployeeCard key={employee.name} employee={employee} />
        ))}
      </section>

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSent={() => {
            setInviteOpen(false);
            setNotice("Invitation prepared. Backend invitation delivery is not configured yet.");
          }}
        />
      )}
    </AdminShell>
  );
};

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

const EmployeeCard = ({ employee }) => (
  <article className="employee-card">
    <div className="employee-card-body">
      <div className="employee-card-top">
        <div className="employee-avatar-wrap">
          <img className="employee-avatar" src={employee.image} alt={employee.name} />
          <span
            className="employee-status-dot"
            style={{ background: employee.statusColor }}
          />
        </div>
        <span className="employee-status">{employee.status}</span>
      </div>

      <h2>{employee.name}</h2>
      <p className="employee-role">{employee.role}</p>

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
      <button type="button" aria-label={`Email ${employee.name}`}>
        <span className="material-symbols-outlined">mail</span>
      </button>
    </div>
  </article>
);

const InviteModal = ({ onClose, onSent }) => {
  const [permission, setPermission] = useState("Admin");

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

        <form
          className="invite-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSent();
          }}
        >
          <div className="invite-grid">
            <div className="admin-field">
              <label htmlFor="invite-name">Full Name</label>
              <input id="invite-name" placeholder="e.g. Julian Hedj" required />
            </div>
            <div className="admin-field">
              <label htmlFor="invite-email">Work Email</label>
              <input id="invite-email" type="email" placeholder="julian@hedj.com" required />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="invite-department">Department</label>
            <select id="invite-department" defaultValue="Interior Design">
              <option>Interior Design</option>
              <option>Sales & Leads</option>
              <option>Logistics & Warehouse</option>
              <option>Administration</option>
            </select>
          </div>

          <div>
            <p className="orders-label">Role Permission Level</p>
            <div className="permission-grid">
              {["Admin", "Editor", "Viewer"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`permission-card ${permission === item ? "active" : ""}`}
                  onClick={() => setPermission(item)}
                >
                  <span className="material-symbols-outlined">
                    {item === "Admin"
                      ? "admin_panel_settings"
                      : item === "Editor"
                        ? "edit_note"
                        : "visibility"}
                  </span>
                  <strong>{item}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="invite-actions">
            <button className="admin-premium-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="admin-premium-button primary" type="submit">
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEmployees;
