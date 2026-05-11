import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const CustomerDetail = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCustomer = async () => {
      try {
        const [customerData, orderData] = await Promise.all([
          commerceApi.getCustomer(customerId),
          commerceApi.getOrders(),
        ]);
        if (mounted) {
          setCustomer(customerData);
          setOrders(orderData);
          setError(customerData ? "" : "Customer not found.");
        }
      } catch {
        if (mounted) setError("Customer could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCustomer();
    return () => {
      mounted = false;
    };
  }, [customerId]);

  const customerOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.customerId === customerId ||
          order.customerName === customer?.name ||
          order.customer?.email === customer?.email
      ),
    [orders, customer, customerId]
  );

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Customer Detail</p>
          <h2>{customer?.name || customerId}</h2>
        </div>
        <Link className="admin-ghost-btn" to="/admin/customers">Back to Customers</Link>
      </div>

      {loading && <div className="kitchen-state">Loading customer...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}

      {!loading && !error && customer && (
        <>
          <div className="admin-grid-3">
            <div className="admin-stat-card">
              <span>Total Spent</span>
              <strong>${Number(customer.totalSpent || 0).toLocaleString()}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Orders</span>
              <strong>{customerOrders.length || customer.orders || 0}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Status</span>
              <strong>{customer.status}</strong>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-panel admin-panel-pad">
              <p className="admin-page-eyebrow">Profile</p>
              <div className="admin-detail-list">
                <div className="admin-detail-row"><span>Email</span><strong>{customer.email}</strong></div>
                <div className="admin-detail-row"><span>Phone</span><strong>{customer.phone}</strong></div>
                <div className="admin-detail-row"><span>Location</span><strong>{customer.location}</strong></div>
              </div>
            </div>

            <div className="admin-panel">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order) => (
                    <tr key={order.id}>
                      <td><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></td>
                      <td>{order.itemsSummary}</td>
                      <td><span className="badge-status badge-amber">{order.status}</span></td>
                      <td>{order.amountLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customerOrders.length === 0 && <div className="admin-panel-pad admin-muted">No orders yet.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDetail;
