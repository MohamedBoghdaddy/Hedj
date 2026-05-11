import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [allProducts, lowStockItems] = await Promise.all([
        commerceApi.getProducts(),
        commerceApi.getLowStockInventory(),
      ]);
      setProducts(allProducts);
      setLowStock(lowStockItems);
      setError("");
    } catch {
      setError("Inventory could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const lowStockIds = useMemo(() => new Set(lowStock.map((item) => item.id)), [lowStock]);

  const adjustStock = async (product, delta) => {
    const nextStock = Math.max(0, Number(product.stock || 0) + delta);
    setSavingId(product.id);
    try {
      const updated = await commerceApi.updateProductStock(product.id, nextStock);
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      const nextLowStock = await commerceApi.getLowStockInventory();
      setLowStock(nextLowStock);
      toast.success(`${product.name} stock updated.`);
    } catch {
      toast.error("Could not update stock.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Products / Inventory</p>
          <h2>Product Stock Control</h2>
        </div>
        <button className="btn-hedj-primary" type="button" onClick={loadInventory} disabled={loading}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
          Refresh
        </button>
      </div>

      <div className="admin-grid-3">
        <div className="admin-stat-card">
          <span>Total Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Low Stock</span>
          <strong>{lowStock.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Stock Units</span>
          <strong>{products.reduce((sum, item) => sum + Number(item.stock || 0), 0)}</strong>
        </div>
      </div>

      {loading && <div className="kitchen-state">Loading inventory...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}
      {!loading && !error && products.length === 0 && <div className="kitchen-state">No products found.</div>}

      {!loading && !error && products.length > 0 && (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Collection</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-initials">{product.name.slice(0, 2).toUpperCase()}</div>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.collection}</td>
                  <td>${Number(product.price || 0).toLocaleString()}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`badge-status ${lowStockIds.has(product.id) ? "badge-error" : "badge-success"}`}>
                      {lowStockIds.has(product.id) ? "Low Stock" : "Healthy"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-ghost-btn"
                        type="button"
                        onClick={() => adjustStock(product, -1)}
                        disabled={savingId === product.id}
                      >
                        -1
                      </button>
                      <button
                        className="admin-ghost-btn"
                        type="button"
                        onClick={() => adjustStock(product, 5)}
                        disabled={savingId === product.id}
                      >
                        +5
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
