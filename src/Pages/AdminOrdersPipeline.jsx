import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "../Components/AdminShell";
import { commerceApi } from "../services/api";
import "../Styles/admin-premium.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const LANES = [
  { key: "new",          label: "New",                color: "#94a3b8" },
  { key: "confirmed",    label: "Confirmed",           color: "#60a5fa" },
  { key: "in_production",label: "In Production",      color: "#f59e0b" },
  { key: "ready",        label: "Ready For Delivery",  color: "#22c55e" },
  { key: "delivered",    label: "Delivered",           color: "#0f172a" },
  { key: "cancelled",    label: "Cancelled",           color: "#dc2626" },
];

const NEXT_STATUS = {
  new: "confirmed",
  confirmed: "in_production",
  in_production: "ready",
  ready: "delivered",
};

const money = (v) => `$${Number(v || 0).toLocaleString()}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveCustomer = (order) =>
  order._resolvedCustomerName || order.customerName || "Guest";

const resolveAssignee = (order) =>
  order._resolvedAssigneeName || order.assignedEmployeeName || "";

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminOrdersPipeline() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 3000);
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await commerceApi.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load orders from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const selected = useMemo(
    () => orders.find((o) => (o._id || o.id) === selectedId),
    [orders, selectedId]
  );

  const openOrder = useCallback((order) => {
    setSelectedId(order._id || order.id);
    setDrawerOpen(true);
  }, []);

  const handleAdvanceStatus = useCallback(async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const orderId = order._id || order.id;
    setUpdatingId(orderId);
    try {
      await commerceApi.updateOrderStatus(orderId, next);
      setOrders((prev) =>
        prev.map((o) => (o._id || o.id) === orderId ? { ...o, status: next } : o)
      );
      showToast(`Order moved to ${next.replace("_", " ")}.`, "ok");
    } catch (err) {
      showToast(err.message || "Status update failed.", "error");
    } finally {
      setUpdatingId(null);
    }
  }, [showToast]);

  const byLane = useMemo(() => {
    const map = {};
    LANES.forEach((l) => { map[l.key] = []; });
    orders.forEach((o) => {
      const key = o.status || "new";
      if (map[key]) map[key].push(o);
    });
    return map;
  }, [orders]);

  return (
    <div className="orders-premium-page">
      <AdminSidebar active="Orders" />

      <main className="admin-premium-main">
        {/* Toast */}
        {toast.msg && (
          <div className={`admin-toast admin-toast--${toast.type}`}
            style={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
            {toast.msg}
          </div>
        )}

        <header className="admin-premium-topbar">
          <div className="admin-premium-actions">
            <h1>Orders Pipeline</h1>
            {!loading && <span style={{ color: "#94a3b8", fontSize: 13 }}>{orders.length} orders</span>}
          </div>
          <div className="admin-premium-actions">
            <button className="admin-premium-button" type="button" onClick={loadOrders} disabled={loading}>
              <span className="material-symbols-outlined">refresh</span>
              Refresh
            </button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div style={{ padding: "24px 32px", color: "#dc2626", background: "#fff1f0", borderRadius: 8, margin: "0 32px 24px" }}>
            <strong>Could not load orders:</strong> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: "40px 32px", color: "#94a3b8", textAlign: "center" }}>
            Loading orders…
          </div>
        )}

        {!loading && !error && (
          <div className="orders-premium-workspace">
            <section className="orders-premium-board" aria-label="Orders pipeline board">
              <div className="orders-premium-lanes">
                {LANES.map((lane) => (
                  <div className="orders-lane" key={lane.key}>
                    <div className="orders-lane-header">
                      <span>
                        <i className="orders-dot" style={{ background: lane.color }} />
                        {lane.label} ({byLane[lane.key].length})
                      </span>
                    </div>

                    {byLane[lane.key].length === 0 && (
                      <div style={{ padding: "12px 8px", color: "#64748b", fontSize: 12, fontStyle: "italic" }}>
                        No orders
                      </div>
                    )}

                    {byLane[lane.key].map((order) => (
                      <OrderCard
                        key={order._id || order.id}
                        order={order}
                        selected={(order._id || order.id) === selectedId}
                        onSelect={() => openOrder(order)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {selected && drawerOpen && (
              <OrderDrawer
                order={selected}
                onClose={() => setDrawerOpen(false)}
                onAdvance={() => handleAdvanceStatus(selected)}
                updating={updatingId === (selected._id || selected.id)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order, selected, onSelect }) {
  const customer = resolveCustomer(order);
  const assignee = resolveAssignee(order);
  const itemsSummary = order.items?.map((i) => i.name).join(", ") ||
    order.desc || "Hedj Commerce Order";

  return (
    <button
      type="button"
      className={`orders-card${selected ? " selected" : ""}`}
      onClick={onSelect}
    >
      <div className="orders-card-top">
        <h3>{customer}</h3>
        {order.total > 0 && <span className="orders-value">{money(order.total)}</span>}
      </div>

      <p className="orders-desc" style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0" }}>
        #{order.orderNumber}
      </p>

      {itemsSummary && (
        <p className="orders-desc">{itemsSummary.length > 60 ? itemsSummary.slice(0, 57) + "…" : itemsSummary}</p>
      )}

      <div className="orders-card-bottom">
        {assignee && (
          <div className="orders-assignee">
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#1e293b", color: "#cbd5e1",
              fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600
            }}>
              {initials(assignee)}
            </div>
            <span>{assignee}</span>
          </div>
        )}
        {order.paymentStatus && order.paymentStatus !== "pending" && (
          <span className="orders-badge"
            style={{ background: order.paymentStatus === "paid" ? "#dcfce7" : "#fef2f2",
              color: order.paymentStatus === "paid" ? "#166534" : "#dc2626" }}>
            {order.paymentStatus}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── OrderDrawer ──────────────────────────────────────────────────────────────

function OrderDrawer({ order, onClose, onAdvance, updating }) {
  const customer = resolveCustomer(order);
  const assignee = resolveAssignee(order);
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <aside className="orders-drawer">
      <div className="orders-drawer-header">
        <div>
          <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ORDER #{order.orderNumber}
          </span>
          <h2>{customer}</h2>
        </div>
        <button className="admin-premium-button" type="button" aria-label="Close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="orders-drawer-body">
        {/* Status + Payment */}
        <section className="orders-drawer-section">
          <p className="orders-label">Status</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="admin-badge" style={{ background: "#1e293b", color: "#cbd5e1", padding: "4px 10px", borderRadius: 4, fontSize: 12 }}>
              {order.status?.replace("_", " ")}
            </span>
            {order.paymentStatus && (
              <span className="admin-badge" style={{
                background: order.paymentStatus === "paid" ? "#dcfce7" : "#fef3c7",
                color: order.paymentStatus === "paid" ? "#166534" : "#92400e",
                padding: "4px 10px", borderRadius: 4, fontSize: 12
              }}>
                {order.paymentStatus}
              </span>
            )}
          </div>
        </section>

        {/* Customer + Assignee */}
        <section className="orders-drawer-section">
          <p className="orders-label">Customer</p>
          <p style={{ fontSize: 14, color: "#1c1c19" }}>{customer}</p>
          {order.customerEmail && (
            <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>{order.customerEmail}</p>
          )}
        </section>

        {assignee && (
          <section className="orders-drawer-section">
            <p className="orders-label">Assigned To</p>
            <p style={{ fontSize: 14 }}>{assignee}</p>
          </section>
        )}

        {/* Items */}
        {order.items?.length > 0 && (
          <section className="orders-drawer-section">
            <p className="orders-label">Items ({order.items.length})</p>
            <div className="orders-items">
              {order.items.map((item, i) => (
                <div key={i} className="orders-item">
                  {item.imageUrl ? (
                    <div className="orders-item-image">
                      <img src={item.imageUrl} alt={item.name} />
                    </div>
                  ) : (
                    <div className="orders-item-image" style={{ background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ color: "#94a3b8", fontSize: 24 }}>chair</span>
                    </div>
                  )}
                  <div>
                    <strong>{item.name}</strong>
                    {item.sku && <p style={{ fontSize: 11, color: "#94a3b8" }}>SKU: {item.sku}</p>}
                    <span className="orders-value">{money(item.unitPrice)} × {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delivery address */}
        {order.deliveryAddress?.city && (
          <section className="orders-drawer-section">
            <div className="orders-address">
              <p className="orders-label">Delivery Address</p>
              <p>{order.deliveryAddress.line1}</p>
              <p>{order.deliveryAddress.city}{order.deliveryAddress.country ? `, ${order.deliveryAddress.country}` : ""}</p>
            </div>
          </section>
        )}

        {/* Notes */}
        {order.notes && (
          <section className="orders-drawer-section">
            <p className="orders-label">Notes</p>
            <p style={{ fontSize: 13, color: "#45464d" }}>{order.notes}</p>
          </section>
        )}
      </div>

      <div className="orders-drawer-actions">
        <div className="orders-total-row">
          <span>Total Value</span>
          <strong>{money(order.total)}</strong>
        </div>
        {nextStatus && (
          <button
            className="admin-premium-button primary"
            type="button"
            onClick={onAdvance}
            disabled={updating}
          >
            <span className="material-symbols-outlined">arrow_forward</span>
            {updating ? "Updating…" : `Move to ${nextStatus.replace("_", " ")}`}
          </button>
        )}
        {order.status === "delivered" && (
          <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>
            ✓ Order complete
          </span>
        )}
      </div>
    </aside>
  );
}
