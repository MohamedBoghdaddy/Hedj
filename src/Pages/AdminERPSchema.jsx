import { useState } from "react";
import { AdminShell } from "../Components/AdminShell";
import "../Styles/admin-erp-premium.css";

const schemaGroups = [
  {
    appSlug: "base",
    label: "Base / Users",
    icon: "manage_accounts",
    tables: [
      { name: "users", description: "Authenticated user accounts and profiles", fields: ["_id", "username", "email", "role", "firstName", "lastName", "department", "wishlist"], relationships: [{ from: "_id", to: "orders.customerId", type: "one-to-many" }, { from: "_id", to: "erp_employees.userId", type: "one-to-one" }] },
      { name: "roles", description: "Role definitions and permission sets", fields: ["_id", "name", "permissions", "modules", "createdAt"], relationships: [] },
      { name: "companies", description: "Company entities for multi-company support", fields: ["_id", "name", "currency", "fiscalYear", "address"], relationships: [] },
    ],
  },
  {
    appSlug: "employees",
    label: "Employees / Org",
    icon: "badge",
    tables: [
      { name: "erp_employees", description: "ERP employees with full manager chain", fields: ["_id", "userId", "fullName", "email", "employeeCode", "level", "departmentId", "jobPositionId", "managerId", "status", "assignedModules", "hireDate"], relationships: [{ from: "managerId", to: "erp_employees._id", type: "self-reference" }, { from: "departmentId", to: "departments._id", type: "many-to-one" }, { from: "jobPositionId", to: "job_positions._id", type: "many-to-one" }, { from: "userId", to: "users._id", type: "many-to-one" }] },
      { name: "departments", description: "Organizational departments with sub-department support", fields: ["_id", "name", "code", "description", "managerId", "parentDepartmentId", "status"], relationships: [{ from: "managerId", to: "erp_employees._id", type: "many-to-one" }, { from: "parentDepartmentId", to: "departments._id", type: "self-reference" }] },
      { name: "job_positions", description: "Job titles and level classifications", fields: ["_id", "title", "code", "level", "departmentId", "permissionsRole", "status"], relationships: [{ from: "departmentId", to: "departments._id", type: "many-to-one" }] },
    ],
  },
  {
    appSlug: "products",
    label: "Products",
    icon: "chair",
    tables: [
      { name: "products", description: "Luxury furniture and decor catalog", fields: ["_id", "name", "description", "category", "price", "discountPrice", "images", "stock", "sold", "averageRating", "createdBy"], relationships: [{ from: "createdBy", to: "users._id", type: "many-to-one" }, { from: "_id", to: "order_items.productId", type: "one-to-many" }, { from: "_id", to: "inventory_items.productId", type: "one-to-many" }] },
      { name: "collections", description: "Product groupings and curated collections", fields: ["_id", "name", "slug", "description", "coverImage", "products"], relationships: [{ from: "products[]", to: "products._id", type: "many-to-many" }] },
    ],
  },
  {
    appSlug: "orders",
    label: "Sales / Orders",
    icon: "receipt_long",
    tables: [
      { name: "orders", description: "Customer orders from quotation to delivery", fields: ["_id", "orderNumber", "customerId", "salespersonId", "status", "total", "estimatedDelivery", "createdAt"], relationships: [{ from: "customerId", to: "users._id", type: "many-to-one" }, { from: "salespersonId", to: "erp_employees._id", type: "many-to-one" }, { from: "_id", to: "order_items.orderId", type: "one-to-many" }, { from: "_id", to: "invoices.orderId", type: "one-to-one" }] },
      { name: "order_items", description: "Line items belonging to an order", fields: ["_id", "orderId", "productId", "quantity", "unitPrice", "total"], relationships: [{ from: "orderId", to: "orders._id", type: "many-to-one" }, { from: "productId", to: "products._id", type: "many-to-one" }] },
      { name: "quotes", description: "Pre-order quotations and proposals", fields: ["_id", "customerId", "items", "total", "status", "validUntil"], relationships: [{ from: "customerId", to: "users._id", type: "many-to-one" }] },
    ],
  },
  {
    appSlug: "inventory",
    label: "Inventory",
    icon: "inventory_2",
    tables: [
      { name: "inventory_items", description: "Current stock levels per product", fields: ["_id", "productId", "quantity", "reservedQty", "reorderLevel", "warehouseId"], relationships: [{ from: "productId", to: "products._id", type: "many-to-one" }] },
      { name: "stock_moves", description: "Stock movement audit trail", fields: ["_id", "productId", "orderId", "type", "quantity", "fromLocation", "toLocation", "createdAt"], relationships: [{ from: "productId", to: "products._id", type: "many-to-one" }, { from: "orderId", to: "orders._id", type: "many-to-one" }] },
      { name: "warehouses", description: "Physical storage locations", fields: ["_id", "name", "code", "address", "managerId", "status"], relationships: [{ from: "managerId", to: "erp_employees._id", type: "many-to-one" }] },
    ],
  },
  {
    appSlug: "accounting",
    label: "Accounting",
    icon: "account_balance",
    tables: [
      { name: "invoices", description: "Customer invoices linked to orders", fields: ["_id", "orderId", "customerId", "amount", "tax", "status", "dueDate", "paidAt"], relationships: [{ from: "orderId", to: "orders._id", type: "one-to-one" }, { from: "customerId", to: "users._id", type: "many-to-one" }, { from: "_id", to: "payments.invoiceId", type: "one-to-many" }] },
      { name: "payments", description: "Payment records collected against invoices", fields: ["_id", "invoiceId", "amount", "method", "reference", "paidAt"], relationships: [{ from: "invoiceId", to: "invoices._id", type: "many-to-one" }] },
    ],
  },
  {
    appSlug: "hr",
    label: "HR / Approvals",
    icon: "approval",
    tables: [
      { name: "approval_requests", description: "Multi-step approval workflow requests", fields: ["_id", "requestType", "employeeId", "currentApproverId", "status", "description", "createdAt"], relationships: [{ from: "employeeId", to: "erp_employees._id", type: "many-to-one" }, { from: "currentApproverId", to: "erp_employees._id", type: "many-to-one" }, { from: "_id", to: "approval_steps.requestId", type: "one-to-many" }] },
      { name: "approval_steps", description: "Individual steps in an approval chain", fields: ["_id", "requestId", "stepOrder", "approverId", "approverRole", "status", "approvedAt", "notes"], relationships: [{ from: "requestId", to: "approval_requests._id", type: "many-to-one" }, { from: "approverId", to: "erp_employees._id", type: "many-to-one" }] },
    ],
  },
];

const typeColor = { "one-to-many": "#0f172a", "many-to-one": "#645d58", "one-to-one": "#059669", "self-reference": "#a07e48", "many-to-many": "#7c3aed" };

export default function AdminERPSchema() {
  const [activeGroup, setActiveGroup] = useState(schemaGroups[0]);
  const [activeTable, setActiveTable] = useState(schemaGroups[0].tables[0]);

  const handleGroupClick = (g) => {
    setActiveGroup(g);
    setActiveTable(g.tables[0]);
  };

  return (
    <AdminShell
      active="ERP Architecture"
      title="Schema Dependencies"
      subtitle="Database table groupings, field definitions, and foreign-key relationships"
    >
      <div className="erp-schema-layout">
        {/* Left: App group list */}
        <div className="erp-schema-groups">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#76777d", marginBottom: 8 }}>
            App Modules
          </div>
          {schemaGroups.map((g) => (
            <button
              key={g.appSlug}
              className={`erp-schema-group-btn${activeGroup.appSlug === g.appSlug ? " active" : ""}`}
              onClick={() => handleGroupClick(g)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#a07e48" }}>{g.icon}</span>
                {g.label}
              </span>
              <small>{g.tables.length} tables</small>
            </button>
          ))}

          {/* Global relationship key */}
          <div className="erp-section-card" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#76777d", marginBottom: 12 }}>
              Relationship Types
            </div>
            {Object.entries(typeColor).map(([type, color]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#645d58", textTransform: "capitalize" }}>{type.replace(/-/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Tables in selected group */}
        <div>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#a07e48" }}>{activeGroup.icon}</span>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontWeight: 400, fontSize: 20, margin: 0 }}>
              {activeGroup.label}
            </h2>
          </div>

          <div className="erp-schema-tables">
            {activeGroup.tables.map((t) => (
              <div
                key={t.name}
                className={`erp-schema-table-card${activeTable?.name === t.name ? " selected" : ""}`}
                onClick={() => setActiveTable(t)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setActiveTable(t)}
              >
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <div className="erp-field-pills">
                  {t.fields.map((f) => (
                    <span key={f} className="erp-field-pill">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cross-module key relationships */}
          <div className="erp-section-card" style={{ marginTop: 24 }}>
            <h2>Key Cross-Module References</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["users._id", "→", "erp_employees.userId"],
                ["erp_employees.managerId", "→", "erp_employees._id (self)"],
                ["erp_employees.departmentId", "→", "departments._id"],
                ["orders.customerId", "→", "users._id"],
                ["orders.salespersonId", "→", "erp_employees._id"],
                ["order_items.productId", "→", "products._id"],
                ["stock_moves.orderId", "→", "orders._id"],
                ["invoices.orderId", "→", "orders._id"],
                ["payments.invoiceId", "→", "invoices._id"],
                ["approval_requests.employeeId", "→", "erp_employees._id"],
              ].map(([from, arrow, to]) => (
                <div key={from} className="erp-relation-chip">
                  <code style={{ background: "transparent", padding: 0, border: "none", borderLeft: "none" }}>{from}</code>
                  <span className="arrow">{arrow}</span>
                  <code style={{ background: "transparent", padding: 0, border: "none", borderLeft: "none" }}>{to}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected table detail */}
        {activeTable && (
          <div className="erp-detail-panel">
            <h2 style={{ fontFamily: "'Courier New', monospace", fontSize: 16 }}>{activeTable.name}</h2>
            <p>{activeTable.description}</p>

            <div className="erp-detail-section">
              <h4>Fields</h4>
              <div className="erp-table-list">
                {activeTable.fields.map((f) => <code key={f}>{f}</code>)}
              </div>
            </div>

            <div className="erp-detail-section">
              <h4>Relationships</h4>
              {activeTable.relationships.length > 0 ? (
                <div className="erp-relation-list">
                  {activeTable.relationships.map((r, i) => (
                    <div className="erp-relation-chip" key={i}>
                      <code style={{ background: "transparent", padding: 0, border: "none", borderLeft: "none", color: "#0f172a", fontSize: 10 }}>{r.from}</code>
                      <span className="arrow">→</span>
                      <code style={{ background: "transparent", padding: 0, border: "none", borderLeft: "none", color: "#0f172a", fontSize: 10 }}>{r.to}</code>
                      <span
                        className="erp-relation-type"
                        style={{ color: typeColor[r.type] || "#76777d" }}
                      >
                        {r.type.replace(/-/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 12, color: "#76777d" }}>No foreign key references</span>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
