import { useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import "../Styles/admin-erp-premium.css";

const allApps = [
  { id: "base", name: "Base / Users", layer: "primary", icon: "manage_accounts", status: "active", purpose: "Manages users, roles, permissions, and company structure.", dependsOn: [], usedBy: ["contacts", "employees", "sales", "accounting"], mainTables: ["users", "roles", "permissions", "companies"], workflowSummary: "User created → Role assigned → Module access granted → Auth token issued" },
  { id: "companies", name: "Companies", layer: "primary", icon: "business", status: "planned", purpose: "Multi-company structure and entity management.", dependsOn: ["Base / Users"], usedBy: ["Contacts", "Employees", "Accounting"], mainTables: ["companies"], workflowSummary: "Company created → Users assigned → Currency and fiscal year set" },
  { id: "contacts", name: "Contacts", layer: "primary", icon: "contacts", status: "active", purpose: "Stores customers, vendors, and partner information.", dependsOn: ["Base / Users"], usedBy: ["Sales", "Purchase", "CRM"], mainTables: ["contacts", "customers", "vendors"], workflowSummary: "Contact created → Tagged as customer or vendor → Linked to transactions" },
  { id: "employees", name: "Employees", layer: "primary", icon: "badge", status: "static", purpose: "Organization structure, job positions, and department hierarchy.", dependsOn: ["Base / Users"], usedBy: ["HR", "Sales", "Projects"], mainTables: ["employees", "departments", "job_positions"], workflowSummary: "Department created → Job position assigned → Employee onboarded → Manager chain set" },
  { id: "products", name: "Products", layer: "primary", icon: "chair", status: "active", purpose: "Product catalog, variants, pricing, and collections.", dependsOn: ["Base / Users"], usedBy: ["Sales", "Inventory", "Purchase", "eCommerce"], mainTables: ["products", "collections", "product_variants"], workflowSummary: "Product created → Pricing set → Inventory linked → Published to eCommerce" },
  { id: "accounting", name: "Accounting", layer: "primary", icon: "account_balance", status: "planned", purpose: "Invoicing, payments, journal entries, and financial reporting.", dependsOn: ["Base / Users", "Contacts"], usedBy: ["Sales", "Purchase"], mainTables: ["invoices", "invoice_items", "payments"], workflowSummary: "Order completed → Invoice generated → Payment collected → Journal entry posted" },
  { id: "inventory", name: "Inventory", layer: "primary", icon: "inventory_2", status: "static", purpose: "Warehouses, stock levels, movements, and fulfillment.", dependsOn: ["Products"], usedBy: ["Sales", "Purchase", "Manufacturing"], mainTables: ["warehouses", "inventory_items", "stock_moves", "stock_quantities"], workflowSummary: "Product received → Stock updated → Allocated to order → Shipped" },
  { id: "sales", name: "Sales", layer: "secondary", icon: "point_of_sale", status: "static", purpose: "Quotations, sales orders, and customer invoicing pipeline.", dependsOn: ["Contacts", "Products", "Inventory", "Accounting"], usedBy: ["eCommerce", "CRM"], mainTables: ["orders", "order_items", "quotes"], workflowSummary: "Customer → Quotation → Sale Order → Delivery → Invoice → Payment" },
  { id: "purchase", name: "Purchase", layer: "secondary", icon: "shopping_cart", status: "planned", purpose: "Purchase orders, vendor management, and receipts.", dependsOn: ["Contacts", "Products", "Inventory"], usedBy: ["Manufacturing"], mainTables: ["purchase_orders", "purchase_order_items"], workflowSummary: "Vendor selected → RFQ sent → PO confirmed → Receipt logged → Bill paid" },
  { id: "manufacturing", name: "Manufacturing", layer: "secondary", icon: "precision_manufacturing", status: "planned", purpose: "Bill of materials, production orders, and assembly workflows.", dependsOn: ["Products", "Inventory"], usedBy: [], mainTables: ["mrp_productions", "mrp_boms"], workflowSummary: "BOM created → Production order → Components consumed → Finished goods produced" },
  { id: "crm", name: "CRM", layer: "secondary", icon: "leaderboard", status: "static", purpose: "Lead pipeline, opportunity tracking, and sales conversion.", dependsOn: ["Contacts", "Sales"], usedBy: [], mainTables: ["leads", "crm_stages"], workflowSummary: "Lead created → Qualified → Quoted → Won or Lost" },
  { id: "projects", name: "Projects", layer: "secondary", icon: "task_alt", status: "planned", purpose: "Task management, timelines, and team collaboration.", dependsOn: ["Employees", "Contacts"], usedBy: ["Helpdesk"], mainTables: ["projects", "tasks"], workflowSummary: "Project opened → Tasks assigned → Progress tracked → Deliverable closed" },
  { id: "hr", name: "HR", layer: "secondary", icon: "groups", status: "planned", purpose: "Leave management, attendance, appraisals, and payroll.", dependsOn: ["Employees"], usedBy: [], mainTables: ["leave_requests", "attendance"], workflowSummary: "Leave submitted → Manager approved → HR confirmed → Payroll adjusted" },
  { id: "orders", name: "Orders", layer: "secondary", icon: "receipt_long", status: "static", purpose: "End-to-end order lifecycle from placement to fulfillment.", dependsOn: ["Sales", "Inventory", "Contacts"], usedBy: ["Accounting"], mainTables: ["orders", "order_items", "shipments"], workflowSummary: "Order placed → Confirmed → In production → Shipped → Delivered → Invoiced" },
  { id: "fulfillment", name: "Fulfillment", layer: "secondary", icon: "local_shipping", status: "planned", purpose: "Shipment tracking, delivery management, and carrier integration.", dependsOn: ["Orders", "Inventory"], usedBy: [], mainTables: ["shipments", "deliveries"], workflowSummary: "Order picked → Packed → Carrier assigned → Shipped → Delivered" },
  { id: "ecommerce", name: "Website / eCommerce", layer: "optional", icon: "storefront", status: "active", purpose: "Public storefront, product catalog, cart, and checkout.", dependsOn: ["Products", "Sales", "Inventory"], usedBy: [], mainTables: ["carts", "checkout_sessions"], workflowSummary: "Visitor → Product browsed → Cart → Checkout → Order created" },
  { id: "marketing", name: "Marketing", layer: "optional", icon: "campaign", status: "planned", purpose: "Email campaigns, promotions, and customer engagement.", dependsOn: ["Contacts", "CRM"], usedBy: [], mainTables: ["campaigns", "email_lists"], workflowSummary: "Segment contacts → Draft campaign → Send → Track conversions" },
  { id: "helpdesk", name: "Helpdesk", layer: "optional", icon: "support_agent", status: "planned", purpose: "Support tickets, SLA management, and customer resolution.", dependsOn: ["Contacts", "Projects"], usedBy: [], mainTables: ["tickets", "ticket_messages"], workflowSummary: "Ticket submitted → Assigned → In progress → Resolved → Closed" },
  { id: "pos", name: "POS", layer: "optional", icon: "storefront", status: "planned", purpose: "Point of sale for physical showroom transactions.", dependsOn: ["Products", "Sales", "Inventory"], usedBy: [], mainTables: ["pos_sessions", "pos_orders"], workflowSummary: "Session opened → Items scanned → Payment collected → Receipt printed" },
  { id: "showroom", name: "Virtual Showroom", layer: "optional", icon: "event_seat", status: "active", purpose: "Immersive 3D product visualization and virtual consultations.", dependsOn: ["Products"], usedBy: [], mainTables: ["showroom_spaces", "consultations"], workflowSummary: "Space selected → Products explored → Consultation booked" },
  { id: "consultations", name: "Consultations", layer: "optional", icon: "calendar_month", status: "planned", purpose: "Interior design consultation booking and client management.", dependsOn: ["Contacts", "Employees"], usedBy: [], mainTables: ["consultations", "consultation_slots"], workflowSummary: "Slot offered → Client books → Designer assigned → Session completed" },
];

const layerFilters = ["all", "primary", "secondary", "optional"];

const statusBadgeClass = { active: "erp-badge-active", planned: "erp-badge-planned", static: "erp-badge-static", "api-connected": "erp-badge-api" };
const layerBadgeClass = { primary: "erp-badge-primary", secondary: "erp-badge-secondary", optional: "erp-badge-optional" };

export default function AdminERPApps() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(allApps[0]);

  const visible = filter === "all" ? allApps : allApps.filter((a) => a.layer === filter);

  return (
    <AdminShell
      active="ERP Architecture"
      title="Application Dependencies"
      subtitle="App layer classification, dependency graph, and integration matrix"
    >
      {/* Filter bar */}
      <div className="erp-filter-bar">
        {layerFilters.map((f) => (
          <button
            key={f}
            className={`erp-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? `All (${allApps.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${allApps.filter((a) => a.layer === f).length})`}
          </button>
        ))}
      </div>

      <div className="erp-layout-two-col">
        {/* App Cards */}
        <div>
          <div className="erp-apps-grid">
            {visible.map((app) => (
              <div
                key={app.id}
                className={`erp-app-card${selected?.id === app.id ? " selected" : ""}`}
                onClick={() => setSelected(app)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelected(app)}
              >
                <div className="erp-app-card-header">
                  <div className="erp-app-icon">
                    <span className="material-symbols-outlined">{app.icon}</span>
                  </div>
                  <span className={`erp-badge ${statusBadgeClass[app.status] || "erp-badge-planned"}`}>
                    {app.status}
                  </span>
                </div>
                <span className={`erp-badge ${layerBadgeClass[app.layer]}`} style={{ marginBottom: 8 }}>
                  {app.layer}
                </span>
                <h3>{app.name}</h3>
                <p>{app.purpose}</p>
              </div>
            ))}
          </div>

          {/* Dependency Matrix */}
          <div className="erp-section-card" style={{ marginTop: 24 }}>
            <h2>Dependency Matrix</h2>
            <div className="erp-matrix">
              <table>
                <thead>
                  <tr>
                    <th>App</th>
                    <th>Layer</th>
                    <th>Primary Dependencies</th>
                    <th>Main Tables</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((app) => (
                    <tr key={app.id} onClick={() => setSelected(app)} style={{ cursor: "pointer" }}>
                      <td style={{ fontWeight: 500 }}>{app.name}</td>
                      <td><span className={`erp-badge ${layerBadgeClass[app.layer]}`}>{app.layer}</span></td>
                      <td style={{ color: "#645d58", fontSize: 11 }}>{app.dependsOn.length > 0 ? app.dependsOn.join(", ") : "—"}</td>
                      <td>
                        <div className="erp-dep-list">
                          {app.mainTables.slice(0, 2).map((t) => (
                            <code key={t} style={{ fontSize: 10, background: "#f6f3ee", padding: "2px 6px", display: "inline-block" }}>{t}</code>
                          ))}
                          {app.mainTables.length > 2 && <span style={{ fontSize: 10, color: "#76777d" }}>+{app.mainTables.length - 2}</span>}
                        </div>
                      </td>
                      <td><span className={`erp-badge ${statusBadgeClass[app.status]}`}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="erp-detail-panel">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div className="erp-app-icon">
                <span className="material-symbols-outlined">{selected.icon}</span>
              </div>
              <div>
                <h2>{selected.name}</h2>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <span className={`erp-badge ${layerBadgeClass[selected.layer]}`}>{selected.layer}</span>
                  <span className={`erp-badge ${statusBadgeClass[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
            </div>

            <p>{selected.purpose}</p>

            <div className="erp-detail-section">
              <h4>Primary Dependencies</h4>
              <div className="erp-dep-list">
                {selected.dependsOn.length > 0
                  ? selected.dependsOn.map((d) => <span key={d} className="erp-dep-chip primary-dep">{d}</span>)
                  : <span style={{ fontSize: 12, color: "#76777d" }}>None — foundation app</span>}
              </div>
            </div>

            <div className="erp-detail-section">
              <h4>Used By</h4>
              <div className="erp-dep-list">
                {selected.usedBy.length > 0
                  ? selected.usedBy.map((d) => <span key={d} className="erp-dep-chip">{d}</span>)
                  : <span style={{ fontSize: 12, color: "#76777d" }}>No dependents</span>}
              </div>
            </div>

            <div className="erp-detail-section">
              <h4>Main Database Tables</h4>
              <div className="erp-table-list">
                {selected.mainTables.map((t) => <code key={t}>{t}</code>)}
              </div>
            </div>

            <div className="erp-detail-section">
              <h4>Business Workflow</h4>
              <div className="erp-workflow-text">{selected.workflowSummary}</div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
