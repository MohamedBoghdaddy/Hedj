import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { erpApi } from "../services/api";
import "../Styles/admin-erp-premium.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPT_LABELS = {
  dept_exec: "Executive", dept_sales: "Sales", dept_finance: "Finance",
  dept_ops: "Operations", dept_design: "Design", dept_it: "IT",
  Executive: "Executive", Sales: "Sales", Finance: "Finance",
  Operations: "Operations", Design: "Design", IT: "IT",
  Logistics: "Logistics", HR: "HR", Inventory: "Inventory",
};

const LEVEL_BADGE = {
  executive: "erp-badge-executive", manager: "erp-badge-manager",
  senior: "erp-badge-senior", junior: "erp-badge-junior",
  "C-Suite": "erp-badge-executive", Director: "erp-badge-manager",
  Manager: "erp-badge-manager", Senior: "erp-badge-senior", Junior: "erp-badge-junior",
  "Mid-Level": "erp-badge-junior",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name = "") =>
  (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const resolveName = (node) =>
  node.fullName || node.name ||
  [node.fname, node.lname].filter(Boolean).join(" ") ||
  node.email || "Employee";

const resolveLevel = (node) =>
  node.level || node.seniorityLevel || "junior";

const resolveDept = (node) =>
  node.dept || node.department || node.departmentId?.name || "";

const resolvePosition = (node) =>
  node.position || node.jobTitle || node.jobPositionId?.title || "";

const resolveCode = (node) =>
  node.code || node.employeeCode || "";

const flattenTree = (nodes) => {
  const result = [];
  const walk = (n) => { result.push(n); (n.children || []).forEach(walk); };
  nodes.forEach(walk);
  return result;
};

// Build unique department list from flattened nodes
const buildDeptList = (flat) => {
  const seen = new Set(["all"]);
  const depts = [{ id: "all", label: "All Departments" }];
  flat.forEach((node) => {
    const dept = resolveDept(node);
    if (dept && !seen.has(dept)) {
      seen.add(dept);
      depts.push({ id: dept, label: DEPT_LABELS[dept] || dept });
    }
  });
  return depts;
};

// ─── TreeNode component ───────────────────────────────────────────────────────

function TreeNode({ node, deptFilter, onSelect, selectedId, depth = 0 }) {
  const dept = resolveDept(node);
  const level = resolveLevel(node);
  const name = resolveName(node);
  const matchesDept = deptFilter === "all" || dept === deptFilter;
  const childrenMatch = (node.children || []).some((c) =>
    flattenTree([c]).some((x) => deptFilter === "all" || resolveDept(x) === deptFilter)
  );

  if (!matchesDept && !childrenMatch) return null;

  const nodeId = node._id || node.id;

  return (
    <div className="erp-tree-item">
      <div
        className={`erp-emp-card${selectedId === nodeId ? " selected" : ""}`}
        onClick={() => onSelect(node)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect(node)}
        style={{ opacity: matchesDept ? 1 : 0.4 }}
      >
        <div className="erp-emp-avatar">{initials(name)}</div>
        <div className="erp-emp-info">
          <div className="erp-emp-name">{name}</div>
          <div className="erp-emp-meta">{resolvePosition(node)}</div>
        </div>
        <span className={`erp-badge ${LEVEL_BADGE[level] || "erp-badge-junior"}`}>
          {level}
        </span>
        {resolveCode(node) && (
          <div className="erp-emp-code">{resolveCode(node)}</div>
        )}
      </div>

      {(node.children || []).length > 0 && (
        <div className="erp-tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child._id || child.id || child.fullName}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminERPHierarchy() {
  const [hierarchy, setHierarchy] = useState([]);
  const [flat, setFlat] = useState([]);
  const [depts, setDepts] = useState([{ id: "all", label: "All Departments" }]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const loadHierarchy = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await erpApi.getEmployeeHierarchy();
      const tree = payload.data || [];
      const flattened = flattenTree(tree);
      setHierarchy(tree);
      setFlat(flattened);
      setDepts(buildDeptList(flattened));
      setSelected(flattened[0] || null);
      setIsDemo(payload.source === "demo"); // only true when explicitly falling back to hardcoded demo
    } catch (err) {
      setError(err.message || "Could not load hierarchy from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHierarchy(); }, [loadHierarchy]);

  const managerOf = selected
    ? flat.filter((e) => {
        const parent = flat.find((x) =>
          (x.children || []).some((c) => (c._id || c.id) === (selected._id || selected.id))
        );
        return parent && (parent._id || parent.id) === (selected._id || selected.id);
      })
    : [];

  const managerNode = selected
    ? flat.find((e) =>
        (e.children || []).some((c) => (c._id || c.id) === (selected._id || selected.id))
      )
    : null;

  const stats = [
    { label: "Total Employees", value: flat.length, icon: "badge" },
    { label: "Departments", value: depts.length - 1, icon: "corporate_fare" },
    { label: "Managers", value: flat.filter((e) => /manager|director|ceo|c-suite/i.test(resolveLevel(e))).length, icon: "manage_accounts" },
    { label: "Senior Staff", value: flat.filter((e) => /senior/i.test(resolveLevel(e))).length, icon: "star" },
  ];

  return (
    <AdminShell
      active="ERP Architecture"
      title="Organization Hierarchy"
      subtitle="Employee reporting lines, departments, and manager chains"
    >
      {/* Demo banner */}
      {isDemo && (
        <div style={{ padding: "10px 16px", background: "#fef3c7", borderRadius: 6, marginBottom: 16, fontSize: 13, color: "#92400e" }}>
          <strong>Demo data:</strong> No ERPEmployee records found in MongoDB. Showing organizational fallback data.
          Create ERPEmployee records via the ERP API to see real hierarchy.
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "12px 16px", background: "#fff1f0", borderRadius: 6, marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
          <strong>Error:</strong> {error}
          <button className="admin-premium-button" type="button" onClick={loadHierarchy}
            style={{ marginLeft: 12, padding: "2px 10px", fontSize: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
          Loading hierarchy…
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats row */}
          <div className="erp-kpi-row" style={{ marginBottom: 24 }}>
            {stats.map((k) => (
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
            {depts.map((d) => (
              <button
                key={d.id}
                className={`erp-filter-btn${deptFilter === d.id ? " active" : ""}`}
                onClick={() => setDeptFilter(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          {hierarchy.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              No active employees found. Add employees in the <strong>Employees</strong> section to build the hierarchy.
            </div>
          ) : (
            <div className="erp-hierarchy-layout">
              {/* Tree */}
              <div>
                <div className="erp-tree">
                  <div className="erp-tree-root-label">Organizational Chart — Hedj Commerce</div>
                  {hierarchy.map((root) => (
                    <TreeNode
                      key={root._id || root.id || root.fullName}
                      node={root}
                      deptFilter={deptFilter}
                      onSelect={setSelected}
                      selectedId={selected?._id || selected?.id}
                    />
                  ))}
                </div>
              </div>

              {/* Employee Detail panel */}
              {selected && (
                <div className="erp-emp-detail">
                  <div className="erp-emp-detail-avatar">{initials(resolveName(selected))}</div>
                  <h2>{resolveName(selected)}</h2>
                  <div className="erp-emp-detail-meta">
                    {resolvePosition(selected)}
                    {resolveCode(selected) && ` · ${resolveCode(selected)}`}
                  </div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                    <span className={`erp-badge ${LEVEL_BADGE[resolveLevel(selected)] || "erp-badge-junior"}`}>
                      {resolveLevel(selected)}
                    </span>
                    {resolveDept(selected) && (
                      <span className="erp-badge erp-badge-active">{resolveDept(selected)}</span>
                    )}
                  </div>

                  {selected.email && (
                    <div className="erp-detail-section">
                      <h4>Email</h4>
                      <p style={{ fontFamily: "monospace", fontSize: 12 }}>{selected.email}</p>
                    </div>
                  )}

                  {managerNode && (
                    <div className="erp-detail-section">
                      <h4>Reports To</h4>
                      <div
                        className="erp-emp-card"
                        role="button"
                        tabIndex={0}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected(managerNode)}
                        onKeyDown={(e) => e.key === "Enter" && setSelected(managerNode)}
                      >
                        <div className="erp-emp-avatar">{initials(resolveName(managerNode))}</div>
                        <div className="erp-emp-info">
                          <div className="erp-emp-name">{resolveName(managerNode)}</div>
                          <div className="erp-emp-meta">{resolvePosition(managerNode)}</div>
                        </div>
                        <span className={`erp-badge ${LEVEL_BADGE[resolveLevel(managerNode)] || "erp-badge-junior"}`}>
                          {resolveLevel(managerNode)}
                        </span>
                      </div>
                    </div>
                  )}

                  {managerOf.length > 0 && (
                    <div className="erp-detail-section">
                      <h4>Manages ({managerOf.length})</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {managerOf.map((e) => (
                          <div
                            key={e._id || e.id}
                            className="erp-emp-card"
                            role="button"
                            tabIndex={0}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelected(e)}
                            onKeyDown={(ev) => ev.key === "Enter" && setSelected(e)}
                          >
                            <div className="erp-emp-avatar">{initials(resolveName(e))}</div>
                            <div className="erp-emp-info">
                              <div className="erp-emp-name">{resolveName(e)}</div>
                              <div className="erp-emp-meta">{resolvePosition(e)}</div>
                            </div>
                            <span className={`erp-badge ${LEVEL_BADGE[resolveLevel(e)] || "erp-badge-junior"}`}>
                              {resolveLevel(e)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selected.assignedModules || []).length > 0 && (
                    <div className="erp-detail-section">
                      <h4>Assigned Modules</h4>
                      <div className="erp-module-tags">
                        {selected.assignedModules.map((m) => (
                          <span key={m} className="erp-module-tag">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
