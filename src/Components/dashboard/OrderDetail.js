import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const NEXT_STATUS = {
  new: "confirmed",
  confirmed: "production",
  production: "ready",
  ready: "delivered",
  delivered: "delivered",
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        const data = await commerceApi.getOrder(orderId);
        if (mounted) {
          setOrder(data);
          setError(data ? "" : "Order not found.");
        }
      } catch {
        if (mounted) setError("Order could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const moveStatus = async () => {
    if (!order) return;
    const next = NEXT_STATUS[order.status || "new"];
    setSaving(true);
    try {
      const updated = await commerceApi.updateOrderStatus(order.id, next);
      setOrder(updated);
      toast.success(`Order ${updated.id} updated.`);
    } catch {
      toast.error("Could not update order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Order Detail</p>
          <h2>{order?.id || orderId}</h2>
        </div>
        <Link className="admin-ghost-btn" to="/admin/orders">Back to Orders</Link>
      </div>

      {loading && <div className="kitchen-state">Loading order...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}

      {!loading && !error && order && (
        <div className="admin-grid-2">
          <div className="admin-panel admin-panel-pad">
            <p className="admin-page-eyebrow">Customer</p>
            <div className="admin-detail-list">
              <div className="admin-detail-row"><span>Name</span><strong>{order.customerName || order.customer?.name}</strong></div>
              <div className="admin-detail-row"><span>Email</span><strong>{order.customer?.email || "Not provided"}</strong></div>
              <div className="admin-detail-row"><span>Phone</span><strong>{order.customer?.phone || "Not provided"}</strong></div>
              <div className="admin-detail-row"><span>Address</span><strong>{[order.customer?.street, order.customer?.city].filter(Boolean).join(", ") || "Not provided"}</strong></div>
            </div>
          </div>

          <div className="admin-panel admin-panel-pad">
            <p className="admin-page-eyebrow">Status</p>
            <div className="admin-detail-list">
              <div className="admin-detail-row"><span>Status</span><strong>{order.status}</strong></div>
              <div className="admin-detail-row"><span>Total</span><strong>{order.amountLabel}</strong></div>
              <div className="admin-detail-row"><span>Created</span><strong>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</strong></div>
            </div>
            <button
              className="btn-hedj-primary"
              type="button"
              style={{ marginTop: 20 }}
              onClick={moveStatus}
              disabled={saving || order.status === "delivered"}
            >
              {saving ? "Updating..." : `Move to ${NEXT_STATUS[order.status || "new"]}`}
            </button>
          </div>

          <div className="admin-panel" style={{ gridColumn: "1 / -1" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={`${item.productId || item.name}-${item.quantity}`}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.price || 0).toLocaleString()}</td>
                    <td>${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
