import { useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import "../Styles/admin-erp-premium.css";

const workflows = [
  {
    id: "sales",
    label: "Sales",
    icon: "point_of_sale",
    title: "Sales Workflow",
    description: "From initial customer contact through quotation, order confirmation, physical delivery, invoicing, and final payment collection.",
    steps: [
      { name: "Customer", icon: "person", table: "users", highlight: false },
      { name: "Quotation", icon: "request_quote", table: "quotes", highlight: false },
      { name: "Sale Order", icon: "receipt_long", table: "orders", highlight: true },
      { name: "Delivery", icon: "local_shipping", table: "shipments", highlight: false },
      { name: "Invoice", icon: "receipt", table: "invoices", highlight: false },
      { name: "Payment", icon: "payments", table: "payments", highlight: true },
    ],
    dbChain: ["users._id", "orders.customerId", "order_items.orderId", "invoices.orderId", "payments.invoiceId"],
    rules: [
      "Quotation must be confirmed before an order is created.",
      "Delivery triggers stock deduction in inventory.",
      "Invoice is auto-generated when order status is 'shipped'.",
      "Payment clears the invoice and posts a journal entry.",
    ],
  },
  {
    id: "purchase",
    label: "Purchase",
    icon: "shopping_cart",
    title: "Purchase Workflow",
    description: "From vendor selection and RFQ through purchase order confirmation, goods receipt, and vendor bill settlement.",
    steps: [
      { name: "Vendor", icon: "storefront", table: "contacts", highlight: false },
      { name: "RFQ", icon: "mail", table: "purchase_orders", highlight: false },
      { name: "PO Confirmed", icon: "task_alt", table: "purchase_orders", highlight: true },
      { name: "Receipt", icon: "inventory", table: "stock_moves", highlight: false },
      { name: "Vendor Bill", icon: "receipt_long", table: "invoices", highlight: false },
      { name: "Payment", icon: "payments", table: "payments", highlight: true },
    ],
    dbChain: ["contacts._id", "purchase_orders.vendorId", "stock_moves.orderId", "invoices.orderId", "payments.invoiceId"],
    rules: [
      "RFQ becomes a PO once vendor confirms.",
      "Receipt triggers stock addition in inventory.",
      "Vendor bill is matched against the PO.",
      "Payment posts to accounting journal.",
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "inventory_2",
    title: "Inventory Workflow",
    description: "Product stock lifecycle from receipt through warehouse storage, order allocation, and outbound delivery.",
    steps: [
      { name: "Product", icon: "chair", table: "products", highlight: false },
      { name: "Receipt", icon: "move_to_inbox", table: "stock_moves", highlight: false },
      { name: "Warehouse", icon: "warehouse", table: "warehouses", highlight: true },
      { name: "Allocated", icon: "bookmark", table: "inventory_items", highlight: false },
      { name: "Pick & Pack", icon: "inventory_2", table: "stock_moves", highlight: false },
      { name: "Delivered", icon: "local_shipping", table: "shipments", highlight: true },
    ],
    dbChain: ["products._id", "inventory_items.productId", "stock_moves.productId", "orders._id", "shipments.orderId"],
    rules: [
      "Stock is reserved when an order is confirmed.",
      "Pick & Pack step moves stock from warehouse to staging.",
      "Delivery creates an outbound stock move.",
      "Returned goods create an inbound stock move back to warehouse.",
    ],
  },
  {
    id: "hr",
    label: "HR Approval",
    icon: "approval",
    title: "HR Approval Workflow",
    description: "Multi-level approval chain for leave requests, expense claims, and module access. Escalates through the management hierarchy.",
    steps: [
      { name: "Employee", icon: "badge", table: "erp_employees", highlight: false },
      { name: "Submits Request", icon: "send", table: "approval_requests", highlight: false },
      { name: "Line Manager", icon: "manage_accounts", table: "erp_employees", highlight: true },
      { name: "HR Manager", icon: "groups", table: "erp_employees", highlight: false },
      { name: "Decision", icon: "gavel", table: "approval_steps", highlight: true },
      { name: "Confirmed", icon: "check_circle", table: "approval_requests", highlight: false },
    ],
    dbChain: ["erp_employees._id", "approval_requests.employeeId", "approval_requests.currentApproverId", "approval_steps.requestId", "approval_steps.approverId"],
    rules: [
      "Every employee except the CEO must have a managerId.",
      "Approval chain follows the manager hierarchy upward.",
      "Leave requests require line manager + HR manager approval.",
      "Purchase approvals above $5,000 escalate to CEO.",
    ],
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: "account_balance",
    title: "Accounting Workflow",
    description: "Financial lifecycle from order completion through invoicing, payment collection, and journal entry posting.",
    steps: [
      { name: "Order", icon: "receipt_long", table: "orders", highlight: false },
      { name: "Invoice", icon: "receipt", table: "invoices", highlight: true },
      { name: "Payment", icon: "credit_card", table: "payments", highlight: false },
      { name: "Reconcile", icon: "balance", table: "payments", highlight: false },
      { name: "Journal Entry", icon: "book", table: "journal_entries", highlight: true },
      { name: "Report", icon: "analytics", table: "financial_reports", highlight: false },
    ],
    dbChain: ["orders._id", "invoices.orderId", "payments.invoiceId", "journal_entries.paymentId"],
    rules: [
      "Invoice is created automatically when order is delivered.",
      "Payment is matched to outstanding invoices.",
      "Journal entry records debit/credit for each transaction.",
      "Monthly close reconciles all entries.",
    ],
  },
];

export default function AdminERPWorkflows() {
  const [activeWf, setActiveWf] = useState(workflows[0]);

  return (
    <AdminShell
      active="ERP Architecture"
      title="Business Workflows"
      subtitle="Step-by-step process flows with database chain references"
    >
      {/* Workflow tabs */}
      <div className="erp-workflow-tabs">
        {workflows.map((wf) => (
          <button
            key={wf.id}
            className={`erp-workflow-tab${activeWf.id === wf.id ? " active" : ""}`}
            onClick={() => setActiveWf(wf)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle", marginRight: 4 }}>{wf.icon}</span>
            {wf.label}
          </button>
        ))}
      </div>

      {/* Workflow Canvas */}
      <div className="erp-workflow-canvas">
        <div className="erp-workflow-title">{activeWf.title}</div>
        <div className="erp-workflow-desc">{activeWf.description}</div>

        {/* Flow steps */}
        <div className="erp-wf-flow">
          {activeWf.steps.map((step, i) => (
            <div key={step.name} style={{ display: "flex", alignItems: "center" }}>
              <div className={`erp-wf-step${step.highlight ? " highlight" : ""}`}>
                <div className="erp-wf-step-icon">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div className="erp-wf-step-name">{step.name}</div>
                <div className="erp-wf-step-table">{step.table}</div>
              </div>
              {i < activeWf.steps.length - 1 && <div className="erp-wf-arrow" />}
            </div>
          ))}
        </div>

        {/* Database chain */}
        <div className="erp-workflow-db-section">
          <h4>Database Reference Chain</h4>
          <div className="erp-db-chain">
            {activeWf.dbChain.map((table, i) => (
              <div key={table} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code>{table}</code>
                {i < activeWf.dbChain.length - 1 && <span className="db-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Business rules */}
        <div className="erp-workflow-db-section">
          <h4>Business Rules</h4>
          <ul style={{ margin: "8px 0 0", padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 6 }}>
            {activeWf.rules.map((rule) => (
              <li key={rule} style={{ fontSize: 13, color: "#645d58", lineHeight: 1.5 }}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* All workflow summary cards */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#76777d", marginBottom: 16 }}>
          All Workflow Summaries
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className={`erp-app-card${activeWf.id === wf.id ? " selected" : ""}`}
              onClick={() => setActiveWf(wf)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveWf(wf)}
            >
              <div className="erp-app-card-header">
                <div className="erp-app-icon">
                  <span className="material-symbols-outlined">{wf.icon}</span>
                </div>
                <span style={{ fontSize: 11, color: "#76777d" }}>{wf.steps.length} steps</span>
              </div>
              <h3>{wf.title}</h3>
              <p style={{ fontSize: 12, color: "#a07e48", fontStyle: "italic", marginTop: 8 }}>
                {wf.steps.map((s) => s.name).join(" → ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
