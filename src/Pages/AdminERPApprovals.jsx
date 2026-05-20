import { useEffect, useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import { erpApi } from "../services/api";
import "../Styles/admin-erp-premium.css";

const initialRequests = [
  { id: "apr_001", requestType: "Leave Request", employeeName: "Priya Mehta", employeeCode: "HJ-011", currentApproverName: "Eleanor Vance", status: "pending", description: "Annual leave — December 20–27", date: "Dec 5, 2024" },
  { id: "apr_002", requestType: "Purchase Approval", employeeName: "Marcus Thorne", employeeCode: "HJ-004", currentApproverName: "Alexander Voss", status: "pending", description: "Warehouse equipment purchase — $12,400", date: "Dec 6, 2024" },
  { id: "apr_003", requestType: "Module Access", employeeName: "Omar Hassan", employeeCode: "HJ-013", currentApproverName: "James Knight", status: "pending", description: "Access request for Accounting module", date: "Dec 7, 2024" },
  { id: "apr_004", requestType: "Leave Request", employeeName: "Lena Park", employeeCode: "HJ-012", currentApproverName: "Julianne Vose", status: "approved", description: "Sick leave — December 4–5", date: "Dec 4, 2024" },
  { id: "apr_005", requestType: "Expense Claim", employeeName: "David Harrington", employeeCode: "HJ-006", currentApproverName: "Eleanor Vance", status: "rejected", description: "Client entertainment expense — $840", date: "Dec 3, 2024" },
];

const typeIcons = { "Leave Request": "event_busy", "Purchase Approval": "shopping_cart", "Module Access": "admin_panel_settings", "Expense Claim": "receipt_long" };
const statusBadge = { pending: "erp-badge-pending", approved: "erp-badge-approved", rejected: "erp-badge-rejected" };

const approvalSteps = {
  apr_001: [
    { step: 1, role: "Line Manager", approver: "Eleanor Vance", status: "pending" },
    { step: 2, role: "HR Manager", approver: "TBD", status: "waiting" },
  ],
  apr_002: [
    { step: 1, role: "Dept Manager", approver: "Marcus Thorne (self)", status: "submitted" },
    { step: 2, role: "CEO", approver: "Alexander Voss", status: "pending" },
  ],
  apr_003: [
    { step: 1, role: "IT Manager", approver: "James Knight", status: "pending" },
    { step: 2, role: "HR Review", approver: "Julianne Vose", status: "waiting" },
  ],
  apr_004: [
    { step: 1, role: "Line Manager", approver: "Julianne Vose", status: "approved" },
    { step: 2, role: "HR Manager", approver: "Julianne Vose", status: "approved" },
  ],
  apr_005: [
    { step: 1, role: "Line Manager", approver: "Eleanor Vance", status: "rejected" },
  ],
};

const stepStatusColor = { approved: "#059669", pending: "#d97706", rejected: "#dc2626", waiting: "#c6c6cd", submitted: "#a07e48" };

export default function AdminERPApprovals() {
  const [requests, setRequests] = useState(initialRequests);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    erpApi.getApprovals().then((payload) => {
      const live = (payload.data || []).map((request) => ({
        id: request._id,
        requestType: request.requestType,
        employeeName: request._resolvedEmployeeName || request.employeeId?.fullName || request.employeeName || request.requestedBy || "Employee",
        employeeCode: request.employeeId?.employeeCode || "",
        currentApproverName: request._resolvedApproverName || request.currentApproverId?.fullName || request.currentApproverName || "Approver",
        status: request.status,
        description: request.description,
        date: new Date(request.createdAt).toLocaleDateString(),
      }));
      if (live.length) setRequests(live);
    }).catch((err) => showToast(err.message || "Approval API unavailable."));
  }, []);

  const handleAction = async (id, action) => {
    try {
      await (action === "approved" ? erpApi.approve(id) : erpApi.reject(id));
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r));
      showToast(`Request ${action}.`);
      if (selected?.id === id) setSelected((prev) => ({ ...prev, status: action }));
    } catch (err) {
      showToast(err.message || `Could not mark request ${action}.`);
    }
  };

  const visible = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <AdminShell
      active="ERP Architecture"
      title="Approval Requests"
      subtitle="Multi-step workflow approvals across departments"
    >
      {toast && <div className="admin-premium-toast" style={{ position: "fixed", bottom: 24, right: 24, background: "#000", color: "#fff", padding: "12px 20px", borderRadius: 999, zIndex: 100, fontSize: 14 }}>{toast}</div>}

      {/* Stats */}
      <div className="erp-approvals-stats">
        <div className="erp-approval-stat">
          <div className="erp-approval-stat-icon pending">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <div className="erp-approval-stat-val">{pendingCount}</div>
            <div className="erp-approval-stat-label">Pending</div>
          </div>
        </div>
        <div className="erp-approval-stat">
          <div className="erp-approval-stat-icon approved">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div className="erp-approval-stat-val">{approvedCount}</div>
            <div className="erp-approval-stat-label">Approved</div>
          </div>
        </div>
        <div className="erp-approval-stat">
          <div className="erp-approval-stat-icon rejected">
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <div>
            <div className="erp-approval-stat-val">{rejectedCount}</div>
            <div className="erp-approval-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="erp-filter-bar">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            className={`erp-filter-btn${filterStatus === f ? " active" : ""}`}
            onClick={() => setFilterStatus(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${requests.filter((r) => r.status === f).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: 24, alignItems: "start" }}>
        {/* Table */}
        <div className="erp-approvals-table">
          <div className="erp-table-header">
            <span>Request</span>
            <span>Requester</span>
            <span>Current Approver</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {visible.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#76777d", fontSize: 13 }}>
              No requests match this filter.
            </div>
          )}

          {visible.map((req) => (
            <div
              key={req.id}
              className="erp-table-row"
              role="button"
              tabIndex={0}
              onClick={() => setSelected(selected?.id === req.id ? null : req)}
              onKeyDown={(e) => e.key === "Enter" && setSelected(selected?.id === req.id ? null : req)}
              style={{ cursor: "pointer", background: selected?.id === req.id ? "#fdf9f4" : undefined }}
            >
              <div>
                <div className="erp-row-type">
                  <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: "middle", marginRight: 4, color: "#a07e48" }}>
                    {typeIcons[req.requestType] || "help"}
                  </span>
                  {req.requestType}
                </div>
                <div className="erp-row-desc">{req.description}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{req.employeeName}</div>
                <div style={{ fontSize: 11, color: "#76777d", fontFamily: "monospace" }}>{req.employeeCode}</div>
              </div>
              <div style={{ fontSize: 13, color: "#645d58" }}>{req.currentApproverName}</div>
              <div className="erp-row-date">{req.date}</div>
              <div>
                <span className={`erp-badge ${statusBadge[req.status]}`}>{req.status}</span>
              </div>
              <div className="erp-row-actions" role="presentation" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                {req.status === "pending" && (
                  <>
                    <button className="erp-action-btn approve" onClick={() => handleAction(req.id, "approved")}>Approve</button>
                    <button className="erp-action-btn reject" onClick={() => handleAction(req.id, "rejected")}>Reject</button>
                  </>
                )}
                {req.status !== "pending" && (
                  <span style={{ fontSize: 11, color: "#76777d" }}>Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="erp-detail-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="erp-app-icon">
                <span className="material-symbols-outlined">{typeIcons[selected.requestType] || "help"}</span>
              </div>
              <div>
                <h2 style={{ fontSize: 16 }}>{selected.requestType}</h2>
                <span className={`erp-badge ${statusBadge[selected.status]}`}>{selected.status}</span>
              </div>
            </div>

            <div className="erp-detail-section">
              <h4>Description</h4>
              <p>{selected.description}</p>
            </div>

            <div className="erp-detail-section">
              <h4>Requester</h4>
              <p>{selected.employeeName} <span style={{ fontFamily: "monospace", fontSize: 11, color: "#a07e48" }}>({selected.employeeCode})</span></p>
            </div>

            <div className="erp-detail-section">
              <h4>Submitted</h4>
              <p>{selected.date}</p>
            </div>

            <div className="erp-detail-section">
              <h4>Approval Chain</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {(approvalSteps[selected.id] || []).map((step) => (
                  <div key={step.step} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f6f3ee", border: "1px solid #e5e2dd" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: stepStatusColor[step.status] || "#c6c6cd", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{step.step}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1c1c19" }}>{step.role}</div>
                      <div style={{ fontSize: 11, color: "#76777d" }}>{step.approver}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: stepStatusColor[step.status] }}>{step.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {selected.status === "pending" && (
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="erp-action-btn approve" style={{ flex: 1, padding: "10px" }} onClick={() => handleAction(selected.id, "approved")}>Approve</button>
                <button className="erp-action-btn reject" style={{ flex: 1, padding: "10px" }} onClick={() => handleAction(selected.id, "rejected")}>Reject</button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
