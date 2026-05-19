import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { commerceApi } from "../../services/api";
import "../../Styles/admin-dashboard.css";

const emptyQuote = {
  leadId: "",
  customerName: "",
  customerEmail: "",
  project: "",
  amount: "",
  items: "Custom Hedj scope",
};

const emptyLead = {
  name: "",
  email: "",
  phone: "",
  company: "",
  projectType: "",
  estimatedValue: "",
  priority: "medium",
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteForm, setQuoteForm] = useState(emptyQuote);
  const [leadForm, setLeadForm] = useState(emptyLead);
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
      leadId: lead._id || lead.id,
      customerName: lead.name,
      customerEmail: lead.email,
      project: lead.projectType || lead.project || "",
      amount: lead.estimatedValue || lead.budget || "",
      items: "Custom Hedj scope",
    });
  };

  const submitLead = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await commerceApi.createLead({
        ...leadForm,
        estimatedValue: Number(leadForm.estimatedValue || 0),
      });
      setLeads((prev) => [result.lead, ...prev]);
      setLeadForm(emptyLead);
      toast.success("Lead created.");
    } catch (error) {
      toast.error(error.message || "Could not create lead.");
    } finally {
      setSubmitting(false);
    }
  };

  const changeLeadStatus = async (lead, status) => {
    try {
      const result = await commerceApi.updateLeadStatus(lead._id || lead.id, status);
      setLeads((prev) =>
        prev.map((item) => ((item._id || item.id) === (lead._id || lead.id) ? result.lead : item))
      );
      toast.success("Lead status updated.");
    } catch (error) {
      toast.error(error.message || "Could not update lead.");
    }
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
        amount: Number(quoteForm.amount || 0),
        customerEmail: quoteForm.customerEmail,
        items: [
          {
            name: quoteForm.items || "Custom Hedj scope",
            quantity: 1,
            unitPrice: Number(quoteForm.amount || 0),
          },
        ],
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
                  <tr key={lead._id || lead.id}>
                    <td>
                      <strong>{lead.name}</strong>
                      <p className="admin-muted">{lead.email}</p>
                    </td>
                    <td>{lead.projectType || lead.project}</td>
                    <td>${Number(lead.estimatedValue || lead.budget || 0).toLocaleString()}</td>
                    <td>
                      <select
                        value={lead.status || "new"}
                        onChange={(event) => changeLeadStatus(lead, event.target.value)}
                      >
                        {["new", "contacted", "qualified", "proposal", "won", "lost"].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
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
            <p className="admin-page-eyebrow">Lead</p>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, marginBottom: 18 }}>Create Lead</h3>
            <form className="admin-form-grid" onSubmit={submitLead}>
              <div className="admin-field">
                <label htmlFor="leadName">Name</label>
                <input id="leadName" value={leadForm.name} onChange={(event) => setLeadForm((prev) => ({ ...prev, name: event.target.value }))} required />
              </div>
              <div className="admin-field">
                <label htmlFor="leadEmail">Email</label>
                <input id="leadEmail" type="email" value={leadForm.email} onChange={(event) => setLeadForm((prev) => ({ ...prev, email: event.target.value }))} required />
              </div>
              <div className="admin-field">
                <label htmlFor="leadProject">Project</label>
                <input id="leadProject" value={leadForm.projectType} onChange={(event) => setLeadForm((prev) => ({ ...prev, projectType: event.target.value }))} />
              </div>
              <div className="admin-field">
                <label htmlFor="leadValue">Estimated Value</label>
                <input id="leadValue" type="number" min="0" value={leadForm.estimatedValue} onChange={(event) => setLeadForm((prev) => ({ ...prev, estimatedValue: event.target.value }))} />
              </div>
              <button className="btn-hedj-primary admin-field-full" type="submit" disabled={submitting}>
                Save Lead
              </button>
            </form>
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
