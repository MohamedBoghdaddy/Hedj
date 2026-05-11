import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const emptyQuote = {
  customerName: "",
  project: "",
  amount: "",
  items: "Custom Hedj scope",
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteForm, setQuoteForm] = useState(emptyQuote);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadLeads = async () => {
    setLoading(true);
    try {
      const [leadData, quoteData] = await Promise.all([
        commerceApi.getLeads(),
        commerceApi.getQuotes(),
      ]);
      setLeads(leadData);
      setQuotes(quoteData);
      setError("");
    } catch {
      setError("Leads could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const startQuote = (lead) => {
    setQuoteForm({
      leadId: lead.id,
      customerName: lead.name,
      project: lead.project,
      amount: lead.budget,
      items: "Custom Hedj scope",
    });
  };

  const submitQuote = async (event) => {
    event.preventDefault();
    if (!quoteForm.customerName.trim() || !quoteForm.project.trim() || !quoteForm.amount) {
      toast.error("Customer, project, and amount are required.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await commerceApi.createQuote({
        ...quoteForm,
        amount: Number(quoteForm.amount),
        items: quoteForm.items.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setQuotes((prev) => [result.quote, ...prev]);
      setQuoteForm(emptyQuote);
      toast.success("Quote created.");
    } catch {
      toast.error("Could not create quote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Leads</p>
          <h2>Lead Intake & Quote Builder</h2>
        </div>
        <button className="btn-hedj-primary" type="button" onClick={() => navigate("/admin/quotes")}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>request_quote</span>
          View Quotes
        </button>
      </div>

      <div className="admin-grid-3">
        <div className="admin-stat-card">
          <span>Active Leads</span>
          <strong>{leads.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Quotes</span>
          <strong>{quotes.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Qualified</span>
          <strong>{leads.filter((lead) => lead.status === "qualified").length}</strong>
        </div>
      </div>

      {loading && <div className="kitchen-state">Loading leads...</div>}
      {!loading && error && <div className="kitchen-state kitchen-state-error">{error}</div>}

      {!loading && !error && (
        <div className="admin-grid-2">
          <div className="admin-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Project</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.name}</strong>
                      <p className="admin-muted">{lead.email}</p>
                    </td>
                    <td>{lead.project}</td>
                    <td>${Number(lead.budget || 0).toLocaleString()}</td>
                    <td><span className="badge-status badge-amber">{lead.status}</span></td>
                    <td>
                      <button className="admin-ghost-btn" type="button" onClick={() => startQuote(lead)}>
                        Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <div className="admin-panel-pad admin-muted">No leads yet.</div>}
          </div>

          <div className="admin-panel admin-panel-pad">
            <p className="admin-page-eyebrow">Quote</p>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 18 }}>Create Quote</h3>
            <form className="admin-form-grid" onSubmit={submitQuote}>
              <div className="admin-field">
                <label htmlFor="quoteCustomer">Customer</label>
                <input
                  id="quoteCustomer"
                  value={quoteForm.customerName}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, customerName: event.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="quoteAmount">Amount</label>
                <input
                  id="quoteAmount"
                  type="number"
                  min="0"
                  value={quoteForm.amount}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, amount: event.target.value }))}
                />
              </div>
              <div className="admin-field admin-field-full">
                <label htmlFor="quoteProject">Project</label>
                <input
                  id="quoteProject"
                  value={quoteForm.project}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, project: event.target.value }))}
                />
              </div>
              <div className="admin-field admin-field-full">
                <label htmlFor="quoteItems">Items</label>
                <textarea
                  id="quoteItems"
                  rows={3}
                  value={quoteForm.items}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, items: event.target.value }))}
                />
              </div>
              <div className="admin-actions admin-field-full">
                <button className="btn-hedj-primary" type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Create Quote"}
                </button>
                <button className="admin-ghost-btn" type="button" onClick={() => setQuoteForm(emptyQuote)}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
