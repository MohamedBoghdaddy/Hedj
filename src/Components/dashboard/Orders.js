import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";
import "./Orders.css";

const STATUS_COLS = [
  { key: "new", label: "New", color: "#94A3B8" },
  { key: "confirmed", label: "Confirmed", color: "#60A5FA" },
  { key: "production", label: "In Production", color: "#F59E0B" },
  { key: "ready", label: "Ready for Delivery", color: "#22C55E" },
  { key: "delivered", label: "Delivered", color: "#1C1C19" },
];

const NEXT_STATUS = {
  new: "confirmed",
  confirmed: "production",
  production: "ready",
  ready: "delivered",
  delivered: "delivered",
};

const statusLabel = (status) =>
  STATUS_COLS.find((item) => item.key === status)?.label || status || "New";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      try {
        const data = await commerceApi.getOrders();
        if (!mounted) return;
        setOrders(data);
        setSelected(data[0] || null);
        setError("");
      } catch {
        if (mounted) setError("Orders could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const groupedOrders = useMemo(() => {
    return STATUS_COLS.reduce((acc, col) => {
      acc[col.key] = orders.filter((order) => (order.status || "new") === col.key);
      return acc;
    }, {});
  }, [orders]);

  const updateSelectedStatus = async () => {
    if (!selectedOrder) return;
    const nextStatus = NEXT_STATUS[selectedOrder.status || "new"];
    setSaving(true);
    try {
      const updated = await commerceApi.updateOrderStatus(selectedOrder.id, nextStatus);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      setSelected(updated);
      toast.success(`Order ${updated.id} moved to ${statusLabel(updated.status)}.`);
    } catch {
      toast.error("Could not update order status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400 }}>Orders Pipeline</h2>
          <div className="view-tabs">
            <button className="view-tab active" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_kanban</span>
              Pipeline
            </button>
            <button className="view-tab" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>
              Table
            </button>
          </div>
        </div>
        <div className="orders-header-actions">
          {["filter_alt", "calendar_today", "category"].map((icon) => (
            <button key={icon} className="filter-pill" type="button">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
              {icon === "filter_alt" ? "Status" : icon === "calendar_today" ? "Date" : "Collection"}
            </button>
          ))}
          <button className="btn-hedj-primary" type="button" onClick={() => navigate("/admin/leads")}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Create Order
          </button>
        </div>
      </div>

      {loading && <div className="kitchen-state">Loading orders...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}
      {!loading && !error && orders.length === 0 && <div className="kitchen-state">No orders yet.</div>}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-body">
          <div className="kanban-scroll">
            {STATUS_COLS.map((col) => (
              <div className="kanban-col" key={col.key}>
                <div className="kanban-col-header">
                  <span className="kanban-col-label">
                    <span className="kanban-dot" style={{ background: col.color }} />
                    {col.label.toUpperCase()} ({groupedOrders[col.key]?.length || 0})
                  </span>
                  <button className="action-dot-btn" type="button" aria-label={`${col.label} menu`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
                  </button>
                </div>
                <div className="kanban-cards">
                  {(groupedOrders[col.key] || []).map((order) => (
                    <button
                      key={order.id}
                      className={`kanban-card${selectedOrder?.id === order.id ? " active" : ""}`}
                      type="button"
                      onClick={() => setSelected(order)}
                    >
                      {order.progress !== undefined && (
                        <div className="kanban-progress-bar">
                          <div style={{ width: `${order.progress}%`, height: "100%", background: "#F59E0B", borderRadius: 99 }} />
                        </div>
                      )}
                      <div className="kanban-card-top">
                        <span className="kanban-customer">{order.customerName || order.customer?.name}</span>
                        <span className="kanban-amount">{order.amountLabel}</span>
                      </div>
                      <p className="kanban-items">{order.itemsSummary}</p>
                      <div className="kanban-card-bottom">
                        {order.assignee && (
                          <div className="kanban-assignee">
                            <div className="kanban-assignee-avatar" />
                            <span>{order.assignee}</span>
                          </div>
                        )}
                        {order.depositPaid && <span className="kanban-tag-paid">DEP. PAID</span>}
                        {order.warehouse && <span className="kanban-warehouse">Warehouse {order.warehouse}</span>}
                        <span className="kanban-eta">{statusLabel(order.status).toUpperCase()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedOrder && (
            <div className="order-drawer">
              <div className="drawer-header">
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-on-tertiary-container)", marginBottom: 4 }}>
                    Order {selectedOrder.id}
                  </p>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400 }}>{selectedOrder.customerName || selectedOrder.customer?.name}</h3>
                </div>
                <button className="action-dot-btn" type="button" onClick={() => setSelected(null)} aria-label="Close order details">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="drawer-img">
                <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80" alt="Order selection" />
                <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8 }}>
                  {["View Specs", "3D Model"].map((text) => (
                    <span key={text} style={{ background: "rgba(255,255,255,0.9)", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--font-sans)" }}>
                      {text.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="drawer-body">
                <div className="drawer-section">
                  <p className="drawer-section-title">Logistics Status</p>
                  <div className="drawer-timeline">
                    <div className="timeline-item done">
                      <div className="timeline-dot done" />
                      <div>
                        <p className="timeline-event">Order {statusLabel(selectedOrder.status)}</p>
                        <p className="timeline-date">{new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="timeline-item pending">
                      <div className="timeline-dot" />
                      <div>
                        <p className="timeline-event" style={{ opacity: 0.5 }}>Next Stage</p>
                        <p className="timeline-date" style={{ opacity: 0.5 }}>{statusLabel(NEXT_STATUS[selectedOrder.status || "new"])}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="drawer-section">
                  <p className="drawer-section-title">Inventory Items</p>
                  <div className="drawer-items">
                    {(selectedOrder.items || []).map((item) => (
                      <div className="drawer-item" key={`${selectedOrder.id}-${item.productId || item.name}`}>
                        <div className="drawer-item-img">
                          <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80" alt="" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13 }}>{item.name}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: "var(--color-on-tertiary-container)", fontWeight: 700 }}>
                              {item.quantity} x ${Number(item.price || 0).toLocaleString()}
                            </span>
                            <span className="badge-status badge-success">IN STOCK</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="drawer-footer">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-on-surface-variant)" }}>Total Value</span>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400 }}>{selectedOrder.amountLabel}</span>
                </div>
                <button
                  className="btn-hedj-primary"
                  type="button"
                  style={{ width: "100%", marginBottom: 10, justifyContent: "center" }}
                  onClick={updateSelectedStatus}
                  disabled={saving || selectedOrder.status === "delivered"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                  {saving ? "Updating..." : `Move to ${statusLabel(NEXT_STATUS[selectedOrder.status || "new"])}`}
                </button>
                <button
                  type="button"
                  style={{ width: "100%", padding: "13px", background: "transparent", border: "1.5px solid var(--color-outline-variant)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.06em", borderRadius: 4 }}
                  onClick={() => navigate(`/admin/orders/${selectedOrder.id}`)}
                >
                  Open Order Detail
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
