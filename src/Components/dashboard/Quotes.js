import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await commerceApi.getQuotes();
      setQuotes(data);
      setError("");
    } catch {
      setError("Quotes could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const convertQuote = async (quote) => {
    setSavingId(quote.id);
    try {
      const result = await commerceApi.convertQuoteToOrder(quote.id);
      setQuotes((prev) =>
        prev.map((item) => (item.id === quote.id ? { ...item, status: "converted", orderId: result.order.id } : item))
      );
      toast.success(`Quote converted to order ${result.order.id}.`);
      navigate("/admin/orders");
    } catch {
      toast.error("Could not convert quote.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Quotes</p>
          <h2>Quote Pipeline</h2>
        </div>
        <button className="btn-hedj-primary" type="button" onClick={() => navigate("/admin/leads")}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New Quote
        </button>
      </div>

      {loading && <div className="kitchen-state">Loading quotes...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}
      {!loading && !error && quotes.length === 0 && <div className="kitchen-state">No quotes yet.</div>}

      {!loading && !error && quotes.length > 0 && (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Project</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.customerName}</td>
                  <td>{quote.project}</td>
                  <td>
                    <div className="admin-chip-row">
                      {(quote.items || []).map((item) => (
                        <span className="admin-chip" key={item}>{item}</span>
                      ))}
                    </div>
                  </td>
                  <td>${Number(quote.amount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge-status ${quote.status === "converted" ? "badge-success" : "badge-amber"}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-ghost-btn"
                      type="button"
                      disabled={savingId === quote.id || quote.status === "converted"}
                      onClick={() => convertQuote(quote)}
                    >
                      {quote.status === "converted" ? "Converted" : savingId === quote.id ? "Converting..." : "Convert"}
                    </button>
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

export default Quotes;
