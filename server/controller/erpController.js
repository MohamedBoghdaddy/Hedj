import mongoose from "mongoose";
import Department from "../model/Department.js";
import JobPosition from "../model/JobPosition.js";
import ERPEmployee from "../model/ERPEmployee.js";
import ERPApp from "../model/ERPApp.js";
import ApprovalRequest from "../model/ApprovalRequest.js";
import ApprovalStep from "../model/ApprovalStep.js";
import ERPSchemaRelation from "../model/ERPSchemaRelation.js";
import ERPIntegrationStatus from "../model/ERPIntegrationStatus.js";
import Product from "../model/productsmodel.js";
import Employee from "../model/employeemodel.js";
import Lead from "../model/Lead.js";
import Quote from "../model/Quote.js";

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── Static demo data (used when MongoDB is not connected) ───────────────────

const demoERPApps = [
  { _id: "app_base", name: "Base / Users", slug: "base", layer: "primary", icon: "manage_accounts", purpose: "Manages users, roles, permissions, and company structure", dependsOn: [], usedBy: ["contacts", "employees", "sales", "accounting"], mainTables: ["users", "roles", "permissions", "companies"], workflowSummary: "User creation → Role assignment → Module access", status: "active" },
  { _id: "app_companies", name: "Companies", slug: "companies", layer: "primary", icon: "business", purpose: "Multi-company structure and entity management", dependsOn: ["base"], usedBy: ["contacts", "employees", "accounting"], mainTables: ["companies"], workflowSummary: "Create company → Assign users → Set currency and fiscal year", status: "planned" },
  { _id: "app_contacts", name: "Contacts", slug: "contacts", layer: "primary", icon: "contacts", purpose: "Stores customers, vendors, and partner information", dependsOn: ["base"], usedBy: ["sales", "purchase", "crm"], mainTables: ["contacts", "customers", "vendors"], workflowSummary: "Contact created → Tagged as customer/vendor → Linked to transactions", status: "active" },
  { _id: "app_employees", name: "Employees", slug: "employees", layer: "primary", icon: "badge", purpose: "Organization structure, job positions, and department hierarchy", dependsOn: ["base"], usedBy: ["hr", "sales", "projects"], mainTables: ["employees", "departments", "job_positions"], workflowSummary: "Department created → Job position assigned → Employee onboarded → Manager chain set", status: "static" },
  { _id: "app_products", name: "Products", slug: "products", layer: "primary", icon: "chair", purpose: "Product catalog, variants, pricing, and collections", dependsOn: ["base"], usedBy: ["sales", "inventory", "purchase", "ecommerce"], mainTables: ["products", "collections", "product_variants"], workflowSummary: "Product created → Pricing set → Inventory linked → Published to eCommerce", status: "active" },
  { _id: "app_accounting", name: "Accounting", slug: "accounting", layer: "primary", icon: "account_balance", purpose: "Invoicing, payments, journal entries, and financial reporting", dependsOn: ["base", "contacts"], usedBy: ["sales", "purchase"], mainTables: ["invoices", "invoice_items", "payments"], workflowSummary: "Order completed → Invoice generated → Payment collected → Journal entry posted", status: "planned" },
  { _id: "app_inventory", name: "Inventory", slug: "inventory", layer: "primary", icon: "inventory_2", purpose: "Warehouses, stock levels, movements, and fulfillment", dependsOn: ["products"], usedBy: ["sales", "purchase", "manufacturing"], mainTables: ["warehouses", "inventory_items", "stock_moves", "stock_quantities"], workflowSummary: "Product received → Stock updated → Allocated to order → Shipped", status: "static" },
  { _id: "app_sales", name: "Sales", slug: "sales", layer: "secondary", icon: "point_of_sale", purpose: "Quotations, sales orders, and customer invoicing pipeline", dependsOn: ["contacts", "products", "inventory", "accounting"], usedBy: ["ecommerce", "crm"], mainTables: ["orders", "order_items", "quotes"], workflowSummary: "Customer → Quotation → Sale Order → Delivery → Invoice → Payment", status: "static" },
  { _id: "app_purchase", name: "Purchase", slug: "purchase", layer: "secondary", icon: "shopping_cart", purpose: "Purchase orders, vendor management, and receipts", dependsOn: ["contacts", "products", "inventory"], usedBy: ["manufacturing"], mainTables: ["purchase_orders", "purchase_order_items"], workflowSummary: "Vendor selected → RFQ sent → PO confirmed → Receipt logged → Bill paid", status: "planned" },
  { _id: "app_manufacturing", name: "Manufacturing", slug: "manufacturing", layer: "secondary", icon: "precision_manufacturing", purpose: "Bill of materials, production orders, and assembly workflows", dependsOn: ["products", "inventory"], usedBy: [], mainTables: ["mrp_productions", "mrp_boms"], workflowSummary: "BOM created → Production order → Components consumed → Finished goods produced", status: "planned" },
  { _id: "app_crm", name: "CRM", slug: "crm", layer: "secondary", icon: "leaderboard", purpose: "Lead pipeline, opportunity tracking, and sales conversion", dependsOn: ["contacts", "sales"], usedBy: [], mainTables: ["leads", "crm_stages"], workflowSummary: "Lead created → Qualified → Quoted → Won/Lost", status: "static" },
  { _id: "app_projects", name: "Projects", slug: "projects", layer: "secondary", icon: "task_alt", purpose: "Task management, timelines, and team collaboration", dependsOn: ["employees", "contacts"], usedBy: ["helpdesk"], mainTables: ["projects", "tasks"], workflowSummary: "Project opened → Tasks assigned → Progress tracked → Deliverable closed", status: "planned" },
  { _id: "app_hr", name: "HR", slug: "hr", layer: "secondary", icon: "groups", purpose: "Leave management, attendance, appraisals, and payroll", dependsOn: ["employees"], usedBy: [], mainTables: ["leave_requests", "attendance"], workflowSummary: "Leave submitted → Manager approved → HR confirmed → Payroll adjusted", status: "planned" },
  { _id: "app_orders", name: "Orders", slug: "orders", layer: "secondary", icon: "receipt_long", purpose: "End-to-end order lifecycle from placement to fulfillment", dependsOn: ["sales", "inventory", "contacts"], usedBy: ["accounting"], mainTables: ["orders", "order_items", "shipments"], workflowSummary: "Order placed → Confirmed → In production → Shipped → Delivered → Invoiced", status: "static" },
  { _id: "app_fulfillment", name: "Fulfillment", slug: "fulfillment", layer: "secondary", icon: "local_shipping", purpose: "Shipment tracking, delivery management, and carrier integration", dependsOn: ["orders", "inventory"], usedBy: [], mainTables: ["shipments", "deliveries"], workflowSummary: "Order picked → Packed → Carrier assigned → Shipped → Delivered", status: "planned" },
  { _id: "app_ecommerce", name: "Website / eCommerce", slug: "ecommerce", layer: "optional", icon: "storefront", purpose: "Public storefront, product catalog, cart, and checkout", dependsOn: ["products", "sales", "inventory"], usedBy: [], mainTables: ["carts", "checkout_sessions"], workflowSummary: "Visitor → Product browsed → Cart → Checkout → Order created", status: "active" },
  { _id: "app_marketing", name: "Marketing", slug: "marketing", layer: "optional", icon: "campaign", purpose: "Email campaigns, promotions, and customer engagement", dependsOn: ["contacts", "crm"], usedBy: [], mainTables: ["campaigns", "email_lists"], workflowSummary: "Segment contacts → Draft campaign → Send → Track conversions", status: "planned" },
  { _id: "app_helpdesk", name: "Helpdesk", slug: "helpdesk", layer: "optional", icon: "support_agent", purpose: "Support tickets, SLA management, and customer resolution", dependsOn: ["contacts", "projects"], usedBy: [], mainTables: ["tickets", "ticket_messages"], workflowSummary: "Ticket submitted → Assigned → In progress → Resolved → Closed", status: "planned" },
  { _id: "app_pos", name: "POS", slug: "pos", layer: "optional", icon: "storefront", purpose: "Point of sale for physical showroom transactions", dependsOn: ["products", "sales", "inventory"], usedBy: [], mainTables: ["pos_sessions", "pos_orders"], workflowSummary: "Session opened → Items scanned → Payment collected → Receipt printed", status: "planned" },
  { _id: "app_showroom", name: "Virtual Showroom", slug: "showroom", layer: "optional", icon: "event_seat", purpose: "Immersive 3D product visualization and virtual consultations", dependsOn: ["products"], usedBy: [], mainTables: ["showroom_spaces", "consultations"], workflowSummary: "Space selected → Products explored → Consultation booked", status: "active" },
  { _id: "app_consultations", name: "Consultations", slug: "consultations", layer: "optional", icon: "calendar_month", purpose: "Interior design consultation booking and client management", dependsOn: ["contacts", "employees"], usedBy: [], mainTables: ["consultations", "consultation_slots"], workflowSummary: "Slot offered → Client books → Designer assigned → Session completed", status: "planned" },
];

const demoDepartments = [
  { _id: "dept_exec", name: "Executive", code: "EXEC", description: "C-suite and executive leadership", status: "active" },
  { _id: "dept_sales", name: "Sales", code: "SALES", description: "Sales team and revenue operations", status: "active" },
  { _id: "dept_finance", name: "Finance", code: "FIN", description: "Financial management and accounting", status: "active" },
  { _id: "dept_ops", name: "Operations", code: "OPS", description: "Operational management and logistics", status: "active" },
  { _id: "dept_design", name: "Design", code: "DES", description: "Interior design and creative services", status: "active" },
  { _id: "dept_it", name: "IT", code: "IT", description: "Technology infrastructure and development", status: "active" },
  { _id: "dept_warehouse", name: "Warehouse", code: "WH", description: "Inventory and fulfillment operations", status: "active" },
  { _id: "dept_cs", name: "Customer Success", code: "CS", description: "Customer relationships and retention", status: "active" },
];

const demoJobPositions = [
  { _id: "jp_ceo", title: "CEO", code: "CEO", level: "executive", departmentId: "dept_exec" },
  { _id: "jp_sales_mgr", title: "Sales Manager", code: "SALES_MGR", level: "manager", departmentId: "dept_sales" },
  { _id: "jp_sr_sales", title: "Senior Sales Executive", code: "SR_SALES", level: "senior", departmentId: "dept_sales" },
  { _id: "jp_jr_sales", title: "Junior Sales Executive", code: "JR_SALES", level: "junior", departmentId: "dept_sales" },
  { _id: "jp_fin_mgr", title: "Finance Manager", code: "FIN_MGR", level: "manager", departmentId: "dept_finance" },
  { _id: "jp_sr_acct", title: "Senior Accountant", code: "SR_ACCT", level: "senior", departmentId: "dept_finance" },
  { _id: "jp_jr_acct", title: "Junior Accountant", code: "JR_ACCT", level: "junior", departmentId: "dept_finance" },
  { _id: "jp_ops_mgr", title: "Operations Manager", code: "OPS_MGR", level: "manager", departmentId: "dept_ops" },
  { _id: "jp_wh_spec", title: "Warehouse Specialist", code: "WH_SPEC", level: "junior", departmentId: "dept_warehouse" },
  { _id: "jp_des_mgr", title: "Design Manager", code: "DES_MGR", level: "manager", departmentId: "dept_design" },
  { _id: "jp_sr_des", title: "Senior Interior Designer", code: "SR_DES", level: "senior", departmentId: "dept_design" },
  { _id: "jp_jr_des", title: "Junior Interior Designer", code: "JR_DES", level: "junior", departmentId: "dept_design" },
  { _id: "jp_it_mgr", title: "IT Manager", code: "IT_MGR", level: "manager", departmentId: "dept_it" },
  { _id: "jp_sr_dev", title: "Senior Developer", code: "SR_DEV", level: "senior", departmentId: "dept_it" },
  { _id: "jp_jr_dev", title: "Junior Developer", code: "JR_DEV", level: "junior", departmentId: "dept_it" },
];

const demoEmployees = [
  { _id: "emp_ceo", fullName: "Alexander Voss", email: "a.voss@hedj.com", employeeCode: "HJ-001", level: "executive", departmentId: "dept_exec", jobPositionId: "jp_ceo", managerId: null, status: "active", assignedModules: ["all"] },
  { _id: "emp_sales_mgr", fullName: "Eleanor Vance", email: "e.vance@hedj.com", employeeCode: "HJ-002", level: "manager", departmentId: "dept_sales", jobPositionId: "jp_sales_mgr", managerId: "emp_ceo", status: "active", assignedModules: ["sales", "crm", "contacts"] },
  { _id: "emp_sr_sales", fullName: "David Harrington", email: "d.harrington@hedj.com", employeeCode: "HJ-006", level: "senior", departmentId: "dept_sales", jobPositionId: "jp_sr_sales", managerId: "emp_sales_mgr", status: "active", assignedModules: ["sales", "crm"] },
  { _id: "emp_jr_sales", fullName: "Priya Mehta", email: "p.mehta@hedj.com", employeeCode: "HJ-011", level: "junior", departmentId: "dept_sales", jobPositionId: "jp_jr_sales", managerId: "emp_sales_mgr", status: "active", assignedModules: ["sales"] },
  { _id: "emp_fin_mgr", fullName: "Julianne Vose", email: "j.vose@hedj.com", employeeCode: "HJ-003", level: "manager", departmentId: "dept_finance", jobPositionId: "jp_fin_mgr", managerId: "emp_ceo", status: "active", assignedModules: ["accounting", "reports"] },
  { _id: "emp_sr_acct", fullName: "Thomas Berg", email: "t.berg@hedj.com", employeeCode: "HJ-007", level: "senior", departmentId: "dept_finance", jobPositionId: "jp_sr_acct", managerId: "emp_fin_mgr", status: "active", assignedModules: ["accounting"] },
  { _id: "emp_jr_acct", fullName: "Lena Park", email: "l.park@hedj.com", employeeCode: "HJ-012", level: "junior", departmentId: "dept_finance", jobPositionId: "jp_jr_acct", managerId: "emp_fin_mgr", status: "active", assignedModules: ["accounting"] },
  { _id: "emp_ops_mgr", fullName: "Marcus Thorne", email: "m.thorne@hedj.com", employeeCode: "HJ-004", level: "manager", departmentId: "dept_ops", jobPositionId: "jp_ops_mgr", managerId: "emp_ceo", status: "active", assignedModules: ["orders", "fulfillment", "inventory"] },
  { _id: "emp_wh_spec", fullName: "Carlos Reyes", email: "c.reyes@hedj.com", employeeCode: "HJ-008", level: "junior", departmentId: "dept_warehouse", jobPositionId: "jp_wh_spec", managerId: "emp_ops_mgr", status: "active", assignedModules: ["inventory"] },
  { _id: "emp_des_mgr", fullName: "Sienna Blake", email: "s.blake@hedj.com", employeeCode: "HJ-005", level: "manager", departmentId: "dept_design", jobPositionId: "jp_des_mgr", managerId: "emp_ceo", status: "active", assignedModules: ["showroom", "consultations", "products"] },
  { _id: "emp_sr_des", fullName: "Isabelle Laurent", email: "i.laurent@hedj.com", employeeCode: "HJ-009", level: "senior", departmentId: "dept_design", jobPositionId: "jp_sr_des", managerId: "emp_des_mgr", status: "active", assignedModules: ["showroom", "products"] },
  { _id: "emp_jr_des", fullName: "Omar Hassan", email: "o.hassan@hedj.com", employeeCode: "HJ-013", level: "junior", departmentId: "dept_design", jobPositionId: "jp_jr_des", managerId: "emp_des_mgr", status: "active", assignedModules: ["showroom"] },
  { _id: "emp_it_mgr", fullName: "James Knight", email: "j.knight@hedj.com", employeeCode: "HJ-010", level: "manager", departmentId: "dept_it", jobPositionId: "jp_it_mgr", managerId: "emp_ceo", status: "active", assignedModules: ["base", "settings"] },
  { _id: "emp_sr_dev", fullName: "Nadia Sorensen", email: "n.sorensen@hedj.com", employeeCode: "HJ-014", level: "senior", departmentId: "dept_it", jobPositionId: "jp_sr_dev", managerId: "emp_it_mgr", status: "active", assignedModules: ["base", "ecommerce"] },
  { _id: "emp_jr_dev", fullName: "Kevin Liu", email: "k.liu@hedj.com", employeeCode: "HJ-015", level: "junior", departmentId: "dept_it", jobPositionId: "jp_jr_dev", managerId: "emp_it_mgr", status: "active", assignedModules: ["ecommerce"] },
];

const demoApprovalRequests = [
  { _id: "apr_001", requestType: "Leave Request", employeeId: "emp_jr_sales", employeeName: "Priya Mehta", currentApproverId: "emp_sales_mgr", currentApproverName: "Eleanor Vance", status: "pending", description: "Annual leave — December 20–27", createdAt: "2024-12-05T09:00:00Z" },
  { _id: "apr_002", requestType: "Purchase Approval", employeeId: "emp_ops_mgr", employeeName: "Marcus Thorne", currentApproverId: "emp_ceo", currentApproverName: "Alexander Voss", status: "pending", description: "Warehouse equipment purchase — $12,400", createdAt: "2024-12-06T14:30:00Z" },
  { _id: "apr_003", requestType: "Module Access", employeeId: "emp_jr_des", employeeName: "Omar Hassan", currentApproverId: "emp_it_mgr", currentApproverName: "James Knight", status: "pending", description: "Access request for Accounting module", createdAt: "2024-12-07T10:15:00Z" },
  { _id: "apr_004", requestType: "Leave Request", employeeId: "emp_jr_acct", employeeName: "Lena Park", currentApproverId: "emp_fin_mgr", currentApproverName: "Julianne Vose", status: "approved", description: "Sick leave — December 4–5", createdAt: "2024-12-04T08:00:00Z" },
  { _id: "apr_005", requestType: "Expense Claim", employeeId: "emp_sr_sales", employeeName: "David Harrington", currentApproverId: "emp_sales_mgr", currentApproverName: "Eleanor Vance", status: "rejected", description: "Client entertainment expense — $840", createdAt: "2024-12-03T16:45:00Z" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const buildHierarchy = (employees) => {
  const map = {};
  employees.forEach((e) => { map[e._id] = { ...e, children: [] }; });
  const roots = [];
  employees.forEach((e) => {
    if (e.managerId && map[e.managerId]) {
      map[e.managerId].children.push(map[e._id]);
    } else {
      roots.push(map[e._id]);
    }
  });
  return roots;
};

const ensureDb = (res) => {
  if (isDbConnected()) return true;
  res.status(503).json({ success: false, message: "Database unavailable." });
  return false;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getERPOverview = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    const [
      apps,
      departments,
      jobPositions,
      erpEmployees,
      employees,
      approvals,
      products,
      leads,
      quotes,
    ] = await Promise.all([
      ERPApp.countDocuments(),
      Department.countDocuments(),
      JobPosition.countDocuments(),
      ERPEmployee.countDocuments(),
      Employee.countDocuments({ status: { $ne: "inactive" } }),
      ApprovalRequest.countDocuments({ status: "pending" }),
      Product.countDocuments({ status: { $ne: "archived" } }),
      Lead.countDocuments({ status: { $nin: ["archived", "lost"] } }),
      Quote.countDocuments({ status: { $nin: ["cancelled", "expired"] } }),
    ]);

    const integrations = await buildIntegrationStatus();
    return res.json({
      success: true,
      overview: {
        apps,
        departments,
        jobPositions,
        erpEmployees,
        employees,
        pendingApprovals: approvals,
        products,
        activeLeads: leads,
        quotes,
        integrations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const buildIntegrationStatus = async () => {
  const statuses = [
    {
      key: "mongodb",
      name: "MongoDB Atlas",
      status: isDbConnected() ? "active" : "error",
      message: isDbConnected() ? "MongoDB is connected." : "MongoDB connection is unavailable.",
    },
    {
      key: "supabase",
      name: "Supabase Storage/Outbox",
      status:
        process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "active"
          : "not_configured",
      message:
        process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "Supabase backend client is configured."
          : "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
    },
    {
      key: "email_delivery",
      name: "Email Delivery Provider",
      status:
        (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) ||
        process.env.RESEND_API_KEY ||
        process.env.SENDGRID_API_KEY
          ? "active"
          : "not_configured",
      message:
        "Configure SMTP_*, RESEND_API_KEY, or SENDGRID_API_KEY to send queued emails.",
    },
  ];

  await Promise.all(
    statuses.map((item) =>
      ERPIntegrationStatus.findOneAndUpdate(
        { key: item.key },
        { ...item, checkedAt: new Date() },
        { upsert: true, new: true }
      )
    )
  );

  return statuses;
};

// ─── ERP Apps ─────────────────────────────────────────────────────────────────

export const getERPApps = async (req, res) => {
  try {
    if (isDbConnected()) {
      const apps = await ERPApp.find().sort({ layer: 1, name: 1 });
      if (apps.length > 0) {
        return res.json({ success: true, data: apps });
      }
    }
    res.json({ success: true, data: demoERPApps, source: "demo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createERPApp = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const app = await ERPApp.create(req.body);
    res.status(201).json({ success: true, data: app });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateERPApp = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const app = await ERPApp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!app) return res.status(404).json({ success: false, message: "App not found." });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteERPApp = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    await ERPApp.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "App deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const getDepartments = async (req, res) => {
  try {
    if (isDbConnected()) {
      const depts = await Department.find().sort({ name: 1 });
      if (depts.length > 0) return res.json({ success: true, data: depts });
    }
    res.json({ success: true, data: demoDepartments, source: "demo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: "Department not found." });
    res.json({ success: true, data: dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Department deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Job Positions ────────────────────────────────────────────────────────────

export const getJobPositions = async (req, res) => {
  try {
    if (isDbConnected()) {
      const positions = await JobPosition.find().populate("departmentId", "name").sort({ level: 1, title: 1 });
      if (positions.length > 0) return res.json({ success: true, data: positions });
    }
    res.json({ success: true, data: demoJobPositions, source: "demo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createJobPosition = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const pos = await JobPosition.create(req.body);
    res.status(201).json({ success: true, data: pos });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateJobPosition = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const pos = await JobPosition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pos) return res.status(404).json({ success: false, message: "Job position not found." });
    res.json({ success: true, data: pos });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteJobPosition = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    await JobPosition.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Job position deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ERP Employees ────────────────────────────────────────────────────────────

export const getERPEmployees = async (req, res) => {
  try {
    if (isDbConnected()) {
      const emps = await ERPEmployee.find()
        .select("-__v")
        .populate("departmentId", "name")
        .populate("jobPositionId", "title level")
        .populate("managerId", "fullName employeeCode")
        .sort({ level: 1, fullName: 1 });
      if (emps.length > 0) return res.json({ success: true, data: emps });
    }
    res.json({ success: true, data: demoEmployees, source: "demo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getERPHierarchy = async (req, res) => {
  try {
    if (!ensureDb(res)) return;

    // 1. Try ERPEmployee first (dedicated hierarchy model)
    const erpEmps = await ERPEmployee.find({ status: "active" })
      .select("-__v")
      .sort({ level: 1, fullName: 1 });

    if (erpEmps.length > 0) {
      const hierarchy = buildHierarchy(erpEmps.map((e) => e.toObject()));
      return res.json({ success: true, data: hierarchy, source: "erp_employees" });
    }

    // 2. Fall back to the regular Employee model — normalise to the shape buildHierarchy expects
    const realEmps = await Employee.find({ status: { $ne: "inactive" } })
      .select("fname lname email department jobTitle seniorityLevel role status _id")
      .sort({ seniorityLevel: 1, fname: 1 });

    if (realEmps.length > 0) {
      // Build a simple department-based hierarchy:
      // Group employees by seniority: C-Suite/Director → manager, others are leaves
      const LEVEL_MAP = {
        "C-Suite": "executive", Director: "manager", Manager: "manager",
        Senior: "senior", "Mid-Level": "junior", Junior: "junior",
      };
      const empObjects = realEmps.map((e) => ({
        _id: e._id.toString(),
        id: e._id.toString(),
        fullName: `${e.fname} ${e.lname}`,
        email: e.email,
        level: LEVEL_MAP[e.seniorityLevel] || "junior",
        dept: e.department,
        position: e.jobTitle || `${e.role} — ${e.department}`,
        code: "",
        assignedModules: [],
        managerId: null, // flat list — no explicit manager chain in Employee model
        children: [],
      }));

      // Simple grouping: executives/managers are roots, others are department leaves
      const roots = empObjects.filter((e) => ["executive", "manager"].includes(e.level));
      const leaves = empObjects.filter((e) => !["executive", "manager"].includes(e.level));

      // Attach leaves to the first manager sharing their department
      leaves.forEach((leaf) => {
        const mgr = roots.find((r) => r.dept === leaf.dept) || roots[0];
        if (mgr) mgr.children.push(leaf);
      });

      return res.json({ success: true, data: roots, source: "employees" });
    }

    // 3. No employee data at all — return empty production state
    return res.json({ success: true, data: [], source: "empty" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createERPEmployee = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const emp = await ERPEmployee.create(req.body);
    res.status(201).json({ success: true, data: emp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateERPEmployee = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const emp = await ERPEmployee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!emp) return res.status(404).json({ success: false, message: "Employee not found." });
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteERPEmployee = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    await ERPEmployee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Employee deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Approval Requests ────────────────────────────────────────────────────────

export const getApprovalRequests = async (req, res) => {
  try {
    if (isDbConnected()) {
      const requests = await ApprovalRequest.find()
        .populate("employeeId", "fname lname email department jobTitle")
        .populate("currentApproverId", "fname lname email department jobTitle")
        .sort({ createdAt: -1 });
      if (requests.length > 0) {
        // Normalise each record so the frontend always gets resolved name fields
        const normalised = requests.map((r) => {
          const obj = r.toObject();
          // Resolve requester name: populated ref > stored string fields
          if (obj.employeeId) {
            obj._resolvedEmployeeName = `${obj.employeeId.fname} ${obj.employeeId.lname}`.trim();
          } else {
            obj._resolvedEmployeeName = obj.employeeName || obj.requestedBy || "";
          }
          // Resolve approver name
          if (obj.currentApproverId) {
            obj._resolvedApproverName = `${obj.currentApproverId.fname} ${obj.currentApproverId.lname}`.trim();
          } else {
            obj._resolvedApproverName = obj.currentApproverName || "";
          }
          return obj;
        });
        return res.json({ success: true, data: normalised });
      }
    }
    res.json({ success: true, data: demoApprovalRequests, source: "demo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createApprovalRequest = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const request = await ApprovalRequest.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateApprovalStatus = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const { status, notes } = req.body;
    const request = await ApprovalRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (notes) {
      await ApprovalStep.create({
        requestId: request._id,
        stepOrder: 1,
        approverId: request.currentApproverId,
        status,
        notes,
        [status === "approved" ? "approvedAt" : "rejectedAt"]: new Date(),
      });
    }
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Schema data (static — describes the DB schema relationships) ─────────────

export const getERPSchema = async (req, res) => {
  const schema = [
    { appSlug: "base", tableName: "users", description: "Authenticated user accounts", fields: ["_id", "username", "email", "role", "firstName", "lastName", "department"], relationships: [{ field: "_id", referencesTable: "employees", referencesField: "userId", relationType: "one-to-one" }, { field: "_id", referencesTable: "orders", referencesField: "customerId", relationType: "one-to-many" }] },
    { appSlug: "base", tableName: "roles", description: "Role definitions and permission sets", fields: ["_id", "name", "permissions", "modules"], relationships: [] },
    { appSlug: "employees", tableName: "erp_employees", description: "ERP organizational employees with manager chain", fields: ["_id", "fullName", "email", "employeeCode", "level", "departmentId", "jobPositionId", "managerId", "status", "assignedModules"], relationships: [{ field: "managerId", referencesTable: "erp_employees", referencesField: "_id", relationType: "self-reference" }, { field: "departmentId", referencesTable: "departments", referencesField: "_id", relationType: "many-to-one" }, { field: "jobPositionId", referencesTable: "job_positions", referencesField: "_id", relationType: "many-to-one" }, { field: "userId", referencesTable: "users", referencesField: "_id", relationType: "many-to-one" }] },
    { appSlug: "employees", tableName: "departments", description: "Organizational departments with hierarchy support", fields: ["_id", "name", "code", "description", "managerId", "parentDepartmentId", "status"], relationships: [{ field: "managerId", referencesTable: "erp_employees", referencesField: "_id", relationType: "many-to-one" }, { field: "parentDepartmentId", referencesTable: "departments", referencesField: "_id", relationType: "self-reference" }] },
    { appSlug: "employees", tableName: "job_positions", description: "Job titles and levels within departments", fields: ["_id", "title", "code", "level", "departmentId", "permissionsRole"], relationships: [{ field: "departmentId", referencesTable: "departments", referencesField: "_id", relationType: "many-to-one" }] },
    { appSlug: "products", tableName: "products", description: "Luxury furniture and decor product catalog", fields: ["_id", "name", "description", "category", "price", "discountPrice", "images", "stock", "sold", "createdBy"], relationships: [{ field: "createdBy", referencesTable: "users", referencesField: "_id", relationType: "many-to-one" }, { field: "_id", referencesTable: "order_items", referencesField: "productId", relationType: "one-to-many" }, { field: "_id", referencesTable: "inventory_items", referencesField: "productId", relationType: "one-to-many" }] },
    { appSlug: "orders", tableName: "orders", description: "Customer orders from quotation to delivery", fields: ["_id", "orderNumber", "customerId", "salespersonId", "status", "total", "items", "estimatedDelivery"], relationships: [{ field: "customerId", referencesTable: "users", referencesField: "_id", relationType: "many-to-one" }, { field: "salespersonId", referencesTable: "erp_employees", referencesField: "_id", relationType: "many-to-one" }, { field: "_id", referencesTable: "order_items", referencesField: "orderId", relationType: "one-to-many" }, { field: "_id", referencesTable: "invoices", referencesField: "orderId", relationType: "one-to-one" }] },
    { appSlug: "orders", tableName: "order_items", description: "Line items belonging to an order", fields: ["_id", "orderId", "productId", "quantity", "unitPrice", "total"], relationships: [{ field: "orderId", referencesTable: "orders", referencesField: "_id", relationType: "many-to-one" }, { field: "productId", referencesTable: "products", referencesField: "_id", relationType: "many-to-one" }] },
    { appSlug: "inventory", tableName: "inventory_items", description: "Current stock levels per product per warehouse", fields: ["_id", "productId", "warehouseId", "quantity", "reservedQty", "reorderLevel"], relationships: [{ field: "productId", referencesTable: "products", referencesField: "_id", relationType: "many-to-one" }] },
    { appSlug: "inventory", tableName: "stock_moves", description: "Stock movement audit trail", fields: ["_id", "productId", "orderId", "type", "quantity", "fromLocation", "toLocation"], relationships: [{ field: "productId", referencesTable: "products", referencesField: "_id", relationType: "many-to-one" }, { field: "orderId", referencesTable: "orders", referencesField: "_id", relationType: "many-to-one" }] },
    { appSlug: "accounting", tableName: "invoices", description: "Customer invoices linked to orders", fields: ["_id", "orderId", "customerId", "amount", "tax", "status", "dueDate", "paidAt"], relationships: [{ field: "orderId", referencesTable: "orders", referencesField: "_id", relationType: "one-to-one" }, { field: "customerId", referencesTable: "users", referencesField: "_id", relationType: "many-to-one" }, { field: "_id", referencesTable: "payments", referencesField: "invoiceId", relationType: "one-to-many" }] },
    { appSlug: "accounting", tableName: "payments", description: "Payment records collected against invoices", fields: ["_id", "invoiceId", "amount", "method", "reference", "paidAt"], relationships: [{ field: "invoiceId", referencesTable: "invoices", referencesField: "_id", relationType: "many-to-one" }] },
    { appSlug: "hr", tableName: "approval_requests", description: "Multi-step approval workflow requests", fields: ["_id", "requestType", "employeeId", "currentApproverId", "status", "description"], relationships: [{ field: "employeeId", referencesTable: "erp_employees", referencesField: "_id", relationType: "many-to-one" }, { field: "currentApproverId", referencesTable: "erp_employees", referencesField: "_id", relationType: "many-to-one" }, { field: "_id", referencesTable: "approval_steps", referencesField: "requestId", relationType: "one-to-many" }] },
    { appSlug: "hr", tableName: "approval_steps", description: "Individual steps in an approval chain", fields: ["_id", "requestId", "stepOrder", "approverId", "approverRole", "status", "notes"], relationships: [{ field: "requestId", referencesTable: "approval_requests", referencesField: "_id", relationType: "many-to-one" }, { field: "approverId", referencesTable: "erp_employees", referencesField: "_id", relationType: "many-to-one" }] },
  ];
  res.json({ success: true, data: schema });
};

export const getSchemaRelations = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    const relations = await ERPSchemaRelation.find().sort({ appSlug: 1, fromTable: 1 });
    res.json({ success: true, data: relations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSchemaRelation = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    const relation = await ERPSchemaRelation.create(req.body);
    res.status(201).json({ success: true, data: relation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSchemaRelation = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid relation id." });
    }
    const relation = await ERPSchemaRelation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!relation) return res.status(404).json({ success: false, message: "Relation not found." });
    return res.json({ success: true, data: relation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteSchemaRelation = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid relation id." });
    }
    const relation = await ERPSchemaRelation.findByIdAndDelete(req.params.id);
    if (!relation) return res.status(404).json({ success: false, message: "Relation not found." });
    return res.json({ success: true, message: "Relation deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApprovalRequest = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid approval id." });
    }
    const request = await ApprovalRequest.findById(req.params.id)
      .populate("employeeId", "fullName employeeCode")
      .populate("currentApproverId", "fullName");
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    return res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApprovalRequest = async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid approval id." });
    }
    const request = await ApprovalRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    return res.json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const approveApprovalRequest = async (req, res) => {
  req.body.status = "approved";
  return updateApprovalStatus(req, res);
};

export const rejectApprovalRequest = async (req, res) => {
  req.body.status = "rejected";
  return updateApprovalStatus(req, res);
};

export const checkERPIntegrations = async (req, res) => {
  try {
    const integrations = await buildIntegrationStatus();
    res.json({ success: true, integrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
