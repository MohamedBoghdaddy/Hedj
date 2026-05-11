import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/admin-dashboard.css";
import "./Orders.css";

const STATUS_COLS = [
  { key: "new",        label: "New",             color: "#94A3B8", count: 2 },
  { key: "confirmed",  label: "Confirmed",        color: "#60A5FA", count: 1 },
  { key: "production", label: "In Production",    color: "#F59E0B", count: 2 },
  { key: "ready",      label: "Ready for Delivery",color: "#22C55E", count: 2 },
  { key: "delivered",  label: "Delivered",        color: "#1C1C19", count: 12 },
];

const ORDERS = {
  new: [
    { id: "#HJ-20981", customer: "Eleanor Sterling", amount: "$12,450", items: "Aurelius Oak Dining Set, 8× Velvet Armchairs", assignee: "Marcus T.", days: 14 },
    { id: "#HJ-20975", customer: "The Ritz Carlton", amount: "$84,000", items: "24× Custom Lobby Loungers, Marble Pedestals", assignee: "Sarah L.", days: 60 },
  ],
  confirmed: [
    { id: "#HJ-20944", customer: "Sebastian Thorne", amount: "$5,200", items: "Obsidian Glass Desk, Aeron Executive Chair", assignee: "Julianne V.", days: null, depositPaid: true, active: true },
  ],
  production: [
    { id: "#HJ-20933", customer: "Modernist Loft", amount: "$18,900", items: "Custom Walnut Library Shelving", assignee: "Marcus T.", progress: 65 },
    { id: "#HJ-20921", customer: "Clara Monfort",   amount: "$3,400",  items: "Brutalist Coffee Table (Cast Iron)", assignee: "Sarah L.", progress: 15 },
  ],
  ready: [
    { id: "#HJ-20910", customer: "Dr. Aris Thorne", amount: "$9,700", items: "Monolith Dining Table, Side Chairs", assignee: "Julianne V.", warehouse: "A-12" },
    { id: "#HJ-20905", customer: "Madison Grange",  amount: "$6,100", items: "Nordic Oak Cabinetry", assignee: "Marcus T.", warehouse: "B-04" },
  ],
  delivered: [
    { id: "#HJ-20890", customer: "The Soho Gallery", amount: "$22,500", items: "Gallery Display Pedestals", completedYesterday: true },
  ],
};

const Orders = () => {
  const [selectedOrder, setSelected] = useState(ORDERS.confirmed[0]);
  const navigate = useNavigate();

  return (
    <div className="orders-page">

      {/* Header */}
      <div className="orders-header">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400 }}>Orders Pipeline</h2>
          <div className="view-tabs">
            <button className="view-tab active">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_kanban</span>
              Pipeline
            </button>
            <button className="view-tab">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>
              Table
            </button>
          </div>
        </div>
        <div className="orders-header-actions">
          {["filter_alt","calendar_today","category"].map(icon => (
            <button key={icon} className="filter-pill">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
              {icon === "filter_alt" ? "Status" : icon === "calendar_today" ? "Date" : "Collection"}
            </button>
          ))}
          <button className="btn-hedj-primary" onClick={() => navigate("/admin/leads")}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Create Order
          </button>
        </div>
      </div>

      <div className="orders-body">
        {/* Kanban */}
        <div className="kanban-scroll">
          {STATUS_COLS.map(col => (
            <div className="kanban-col" key={col.key}>
              <div className="kanban-col-header">
                <span className="kanban-col-label">
                  <span className="kanban-dot" style={{ background: col.color }} />
                  {col.label.toUpperCase()} ({col.count})
                </span>
                <button className="action-dot-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
                </button>
              </div>
              <div className="kanban-cards">
                {(ORDERS[col.key] || []).map(order => (
                  <div
                    key={order.id}
                    className={`kanban-card${order.active ? " active" : ""}`}
                    onClick={() => setSelected(order)}
                  >
                    {order.progress !== undefined && (
                      <div className="kanban-progress-bar">
                        <div style={{ width: `${order.progress}%`, height: "100%", background: "#F59E0B", borderRadius: 99 }} />
                      </div>
                    )}
                    <div className="kanban-card-top">
                      <span className="kanban-customer">{order.customer}</span>
                      <span className="kanban-amount">{order.amount}</span>
                    </div>
                    <p className="kanban-items">{order.items}</p>
                    <div className="kanban-card-bottom">
                      {order.assignee && (
                        <div className="kanban-assignee">
                          <div className="kanban-assignee-avatar" />
                          <span>{order.assignee}</span>
                        </div>
                      )}
                      {order.days && (
                        <span className="kanban-eta">EST. {order.days} DAYS</span>
                      )}
                      {order.depositPaid && (
                        <span className="kanban-tag-paid">DEP. PAID</span>
                      )}
                      {order.warehouse && (
                        <span className="kanban-warehouse">Warehouse {order.warehouse}</span>
                      )}
                      {order.completedYesterday && (
                        <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)", fontFamily: "var(--font-sans)" }}>COMPLETED YESTERDAY</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail drawer */}
        {selectedOrder && (
          <div className="order-drawer">
            <div className="drawer-header">
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-on-tertiary-container)", marginBottom: 4 }}>
                  Order {selectedOrder.id}
                </p>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400 }}>{selectedOrder.customer}</h3>
              </div>
              <button className="action-dot-btn" onClick={() => setSelected(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="drawer-img">
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" alt="Order" />
              <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8 }}>
                {["View Specs","3D Model"].map(t => (
                  <span key={t} style={{ background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--font-sans)", cursor: "pointer" }}>{t.toUpperCase()}</span>
                ))}
              </div>
            </div>

            <div className="drawer-body">
              {/* Timeline */}
              <div className="drawer-section">
                <p className="drawer-section-title">Logistics Status</p>
                <div className="drawer-timeline">
                  <div className="timeline-item done">
                    <div className="timeline-dot done" />
                    <div>
                      <p className="timeline-event">Order Confirmed</p>
                      <p className="timeline-date">Oct 12, 2024 · 09:45 AM</p>
                    </div>
                  </div>
                  <div className="timeline-item pending">
                    <div className="timeline-dot" />
                    <div>
                      <p className="timeline-event" style={{ opacity: 0.5 }}>Production Kickoff</p>
                      <p className="timeline-date" style={{ opacity: 0.5 }}>Estimated Oct 18, 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="drawer-section">
                <p className="drawer-section-title">Inventory Items</p>
                <div className="drawer-items">
                  <div className="drawer-item">
                    <div className="drawer-item-img">
                      <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80" alt="" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13 }}>{selectedOrder.items?.split(",")[0]}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--color-on-tertiary-container)", fontWeight: 700 }}>{selectedOrder.amount}</span>
                        <span className="badge-status badge-success">IN STOCK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-on-surface-variant)" }}>Total Value</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400 }}>{selectedOrder.amount}</span>
              </div>
              <button className="btn-hedj-primary" style={{ width: "100%", marginBottom: 10, justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                Move to Production
              </button>
              <button style={{ width: "100%", padding: "13px", background: "transparent", border: "1.5px solid var(--color-outline-variant)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", borderRadius: 4 }}>
                Download Spec Sheet (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
