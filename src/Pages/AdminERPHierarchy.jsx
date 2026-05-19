import { useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import "../Styles/admin-erp-premium.css";

const departments = [
  { id: "all", label: "All Departments" },
  { id: "dept_exec", label: "Executive" },
  { id: "dept_sales", label: "Sales" },
  { id: "dept_finance", label: "Finance" },
  { id: "dept_ops", label: "Operations" },
  { id: "dept_design", label: "Design" },
  { id: "dept_it", label: "IT" },
];

const levelBadge = { executive: "erp-badge-executive", manager: "erp-badge-manager", senior: "erp-badge-senior", junior: "erp-badge-junior", team_lead: "erp-badge-manager" };

const orgTree = [
  {
    id: "emp_ceo", fullName: "Alexander Voss", code: "HJ-001", level: "executive",
    dept: "dept_exec", position: "CEO", email: "a.voss@hedj.com",
    assignedModules: ["all"],
    children: [
      {
        id: "emp_sales_mgr", fullName: "Eleanor Vance", code: "HJ-002", level: "manager",
        dept: "dept_sales", position: "Sales Manager", email: "e.vance@hedj.com",
        assignedModules: ["sales", "crm", "contacts"],
        children: [
          { id: "emp_sr_sales", fullName: "David Harrington", code: "HJ-006", level: "senior", dept: "dept_sales", position: "Senior Sales Executive", email: "d.harrington@hedj.com", assignedModules: ["sales", "crm"], children: [] },
          { id: "emp_jr_sales", fullName: "Priya Mehta", code: "HJ-011", level: "junior", dept: "dept_sales", position: "Junior Sales Executive", email: "p.mehta@hedj.com", assignedModules: ["sales"], children: [] },
        ],
      },
      {
        id: "emp_fin_mgr", fullName: "Julianne Vose", code: "HJ-003", level: "manager",
        dept: "dept_finance", position: "Finance Manager", email: "j.vose@hedj.com",
        assignedModules: ["accounting", "reports"],
        children: [
          { id: "emp_sr_acct", fullName: "Thomas Berg", code: "HJ-007", level: "senior", dept: "dept_finance", position: "Senior Accountant", email: "t.berg@hedj.com", assignedModules: ["accounting"], children: [] },
          { id: "emp_jr_acct", fullName: "Lena Park", code: "HJ-012", level: "junior", dept: "dept_finance", position: "Junior Accountant", email: "l.park@hedj.com", assignedModules: ["accounting"], children: [] },
        ],
      },
      {
        id: "emp_ops_mgr", fullName: "Marcus Thorne", code: "HJ-004", level: "manager",
        dept: "dept_ops", position: "Operations Manager", email: "m.thorne@hedj.com",
        assignedModules: ["orders", "fulfillment", "inventory"],
        children: [
          { id: "emp_wh_spec", fullName: "Carlos Reyes", code: "HJ-008", level: "junior", dept: "dept_ops", position: "Warehouse Specialist", email: "c.reyes@hedj.com", assignedModules: ["inventory"], children: [] },
        ],
      },
      {
        id: "emp_des_mgr", fullName: "Sienna Blake", code: "HJ-005", level: "manager",
        dept: "dept_design", position: "Design Manager", email: "s.blake@hedj.com",
        assignedModules: ["showroom", "consultations", "products"],
        children: [
          { id: "emp_sr_des", fullName: "Isabelle Laurent", code: "HJ-009", level: "senior", dept: "dept_design", position: "Senior Interior Designer", email: "i.laurent@hedj.com", assignedModules: ["showroom", "products"], children: [] },
          { id: "emp_jr_des", fullName: "Omar Hassan", code: "HJ-013", level: "junior", dept: "dept_design", position: "Junior Interior Designer", email: "o.hassan@hedj.com", assignedModules: ["showroom"], children: [] },
        ],
      },
      {
        id: "emp_it_mgr", fullName: "James Knight", code: "HJ-010", level: "manager",
        dept: "dept_it", position: "IT Manager", email: "j.knight@hedj.com",
        assignedModules: ["base", "settings"],
        children: [
          { id: "emp_sr_dev", fullName: "Nadia Sorensen", code: "HJ-014", level: "senior", dept: "dept_it", position: "Senior Developer", email: "n.sorensen@hedj.com", assignedModules: ["base", "ecommerce"], children: [] },
          { id: "emp_jr_dev", fullName: "Kevin Liu", code: "HJ-015", level: "junior", dept: "dept_it", position: "Junior Developer", email: "k.liu@hedj.com", assignedModules: ["ecommerce"], children: [] },
        ],
      },
    ],
  },
];

const initials = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

const flattenTree = (nodes) => {
  const result = [];
  const walk = (n) => { result.push(n); n.children.forEach(walk); };
  nodes.forEach(walk);
  return result;
};

const allEmployees = flattenTree(orgTree);

function TreeNode({ node, deptFilter, onSelect, selectedId, depth = 0 }) {
  const matchesDept = deptFilter === "all" || node.dept === deptFilter;
  const childrenMatchDept = node.children.some((c) => deptFilter === "all" || c.dept === deptFilter || flattenTree([c]).some((x) => x.dept === deptFilter));

  if (!matchesDept && !childrenMatchDept) return null;

  return (
    <div className="erp-tree-item">
      <div
        className={`erp-emp-card${selectedId === node.id ? " selected" : ""}`}
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect(node)}
        style={{ opacity: matchesDept ? 1 : 0.4 }}
      >
        <div className="erp-emp-avatar">{initials(node.fullName)}</div>
        <div className="erp-emp-info">
          <div className="erp-emp-name">{node.fullName}</div>
          <div className="erp-emp-meta">{node.position}</div>
        </div>
        <span className={`erp-badge ${levelBadge[node.level] || "erp-badge-junior"}`}>{node.level}</span>
        <div className="erp-emp-code">{node.code}</div>
      </div>

      {node.children.length > 0 && (
        <div className="erp-tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              deptFilter={deptFilter}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminERPHierarchy() {
  const [deptFilter, setDeptFilter] = useState("all");
  const [selected, setSelected] = useState(allEmployees[0]);

  const managerOf = selected ? allEmployees.filter((e) => {
    const parent = allEmployees.find((x) => x.children.some((c) => c.id === e.id));
    return parent?.id === selected.id;
  }) : [];

  const managerNode = selected ? allEmployees.find((e) => e.children.some((c) => c.id === selected.id)) : null;

  return (
    <AdminShell
      active="ERP Architecture"
      title="Organization Hierarchy"
      subtitle="Employee reporting lines, departments, and manager chains"
    >
      {/* Stats row */}
      <div className="erp-kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Employees", value: allEmployees.length, icon: "badge" },
          { label: "Departments", value: 6, icon: "corporate_fare" },
          { label: "Managers", value: allEmployees.filter((e) => e.level === "manager").length, icon: "manage_accounts" },
          { label: "Senior Staff", value: allEmployees.filter((e) => e.level === "senior").length, icon: "star" },
        ].map((k) => (
          <div className="erp-kpi-card" key={k.label}>
            <div className="erp-kpi-icon">
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
            <div className="erp-kpi-label">{k.label}</div>
            <div className="erp-kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Department filter */}
      <div className="erp-filter-bar">
        {departments.map((d) => (
          <button
            key={d.id}
            className={`erp-filter-btn${deptFilter === d.id ? " active" : ""}`}
            onClick={() => setDeptFilter(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="erp-hierarchy-layout">
        {/* Tree */}
        <div>
          <div className="erp-tree">
            <div className="erp-tree-root-label">Organizational Chart — Hedj Commerce</div>
            {orgTree.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                deptFilter={deptFilter}
                onSelect={setSelected}
                selectedId={selected?.id}
              />
            ))}
          </div>
        </div>

        {/* Employee Detail */}
        {selected && (
          <div className="erp-emp-detail">
            <div className="erp-emp-detail-avatar">{initials(selected.fullName)}</div>
            <h2>{selected.fullName}</h2>
            <div className="erp-emp-detail-meta">{selected.position} · {selected.code}</div>

            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <span className={`erp-badge ${levelBadge[selected.level] || "erp-badge-junior"}`}>{selected.level}</span>
              <span className="erp-badge erp-badge-active">active</span>
            </div>

            <div className="erp-detail-section">
              <h4>Email</h4>
              <p style={{ fontFamily: "monospace", fontSize: 12 }}>{selected.email}</p>
            </div>

            {managerNode && (
              <div className="erp-detail-section">
                <h4>Reports To</h4>
                <div className="erp-emp-card" style={{ cursor: "default" }}>
                  <div className="erp-emp-avatar">{initials(managerNode.fullName)}</div>
                  <div className="erp-emp-info">
                    <div className="erp-emp-name">{managerNode.fullName}</div>
                    <div className="erp-emp-meta">{managerNode.position}</div>
                  </div>
                  <span className={`erp-badge ${levelBadge[managerNode.level]}`}>{managerNode.level}</span>
                </div>
              </div>
            )}

            {managerOf.length > 0 && (
              <div className="erp-detail-section">
                <h4>Manages ({managerOf.length})</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {managerOf.map((e) => (
                    <div
                      key={e.id}
                      className="erp-emp-card"
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(e)}
                      onKeyDown={(ev) => ev.key === "Enter" && setSelected(e)}
                    >
                      <div className="erp-emp-avatar">{initials(e.fullName)}</div>
                      <div className="erp-emp-info">
                        <div className="erp-emp-name">{e.fullName}</div>
                        <div className="erp-emp-meta">{e.position}</div>
                      </div>
                      <span className={`erp-badge ${levelBadge[e.level]}`}>{e.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="erp-detail-section">
              <h4>Assigned Modules</h4>
              <div className="erp-module-tags">
                {selected.assignedModules.map((m) => (
                  <span key={m} className="erp-module-tag">{m}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
