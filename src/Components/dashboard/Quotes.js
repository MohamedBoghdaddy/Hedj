import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

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

  const quoteKey = (quote) => quote._id || quote.id;

  const sendQuote = async (quote) => {
    setSavingId(quoteKey(quote));
    try {
      const result = await commerceApi.sendQuote(quoteKey(quote));
      setQuotes((prev) => prev.map((item) => (quoteKey(item) === quoteKey(quote) ? result.quote : item)));
      toast.success(result.message || "Quote email queued.");
    } catch (error) {
      toast.error(error.message || "Could not send quote.");
    } finally {
      setSavingId("");
    }
  };

  const updateStatus = async (quote, status) => {
    try {
      const result = await commerceApi.updateQuoteStatus(quoteKey(quote), status);
      setQuotes((prev) => prev.map((item) => (quoteKey(item) === quoteKey(quote) ? result.quote : item)));
    } catch (error) {
      toast.error(error.message || "Could not update quote.");
    }
  };

  const downloadPdf = async (quote) => {
    setSavingId(quoteKey(quote));
    try {
      const blob = await commerceApi.downloadQuotePdf(quoteKey(quote));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quote.quoteNumber || "quote"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Could not generate PDF.");
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
        <button className="btn-hedj-primary" type="button" onClick={() => window.location.assign("/admin/leads")}>
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
                <tr key={quoteKey(quote)}>
                  <td>
                    <strong>{quote.customerName || quote.leadId?.name || "Customer"}</strong>
                    <p className="admin-muted">{quote.quoteNumber}</p>
                  </td>
                  <td>{quote.project}</td>
                  <td>
                    <div className="admin-chip-row">
                      {(quote.items || []).map((item) => (
                        <span className="admin-chip" key={item.name || item}>{item.name || item}</span>
                      ))}
                    </div>
                  </td>
                  <td>${Number(quote.total || quote.amount || 0).toLocaleString()}</td>
                  <td>
                    <select value={quote.status || "draft"} onChange={(event) => updateStatus(quote, event.target.value)}>
                      {["draft", "pending", "sent", "accepted", "rejected", "expired", "converted", "cancelled"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-ghost-btn"
                        type="button"
                        disabled={savingId === quoteKey(quote)}
                        onClick={() => sendQuote(quote)}
                      >
                        {savingId === quoteKey(quote) ? "Working..." : "Send"}
                      </button>
                      <button
                        className="admin-ghost-btn"
                        type="button"
                        disabled={savingId === quoteKey(quote)}
                        onClick={() => downloadPdf(quote)}
                      >
                        PDF
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

export default Quotes;
