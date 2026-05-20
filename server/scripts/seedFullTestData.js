/**
 * Full test data seed — idempotent (upsert/skip-existing).
 * Run: node server/scripts/seedFullTestData.js
 *
 * Creates: users, employees, products, leads, quotes, ERP apps/schema/approvals.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
if (!MONGO_URI) { console.error("MONGO_URI not set"); process.exit(1); }

// ─── Inline schemas to avoid import resolution issues ────────────────────────
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["customer", "employee", "admin"], default: "customer" },
  status: { type: String, default: "active" },
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  department: { type: String, required: true },
  jobTitle: { type: String },
  seniorityLevel: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["readonly", "admin"], default: "readonly" },
  status: { type: String, default: "active" },
  invitedAt: { type: Date },
  invitationEmailStatus: { type: String, default: "none" },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, lowercase: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  collection: { type: String },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: null },
  sku: { type: String, uppercase: true },
  images: { type: [String], default: [] },
  imageUrl: { type: String },
  stock: { type: Number, required: true, min: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "draft", "archived", "inactive"], default: "active" },
}, { timestamps: true });
ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  company: { type: String },
  projectType: { type: String },
  source: { type: String, default: "website" },
  status: { type: String, enum: ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"], default: "new" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  estimatedValue: { type: Number, default: 0 },
  notes: { type: String, default: "" },
}, { timestamps: true });

const QuoteItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
}, { _id: false });

const QuoteSchema = new mongoose.Schema({
  customerName: { type: String },
  customerEmail: { type: String, lowercase: true },
  project: { type: String },
  quoteNumber: { type: String, required: true },
  status: { type: String, enum: ["draft", "pending", "sent", "accepted", "rejected", "expired", "converted", "cancelled"], default: "draft" },
  items: { type: [QuoteItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  validUntil: { type: Date },
  notes: { type: String, default: "" },
}, { timestamps: true });
QuoteSchema.index({ quoteNumber: 1 }, { unique: true });

const ERPAppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  layer: { type: String, enum: ["primary", "secondary", "optional"], required: true },
  icon: { type: String, default: "apps" },
  purpose: { type: String, default: "" },
  dependsOn: [{ type: String }],
  usedBy: [{ type: String }],
  mainTables: [{ type: String }],
  status: { type: String, enum: ["active", "planned", "static", "api-connected"], default: "planned" },
}, { timestamps: true });

const ERPSchemaRelationSchema = new mongoose.Schema({
  fromModel: { type: String, required: true },
  toModel: { type: String, required: true },
  relationType: { type: String, enum: ["one-to-one", "one-to-many", "many-to-many"], required: true },
  fieldName: { type: String },
  description: { type: String, default: "" },
}, { timestamps: true });

const ApprovalRequestSchema = new mongoose.Schema({
  title: { type: String },
  requestType: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  currentApproverId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  employeeName: { type: String, default: "" },
  currentApproverName: { type: String, default: "" },
  requestedBy: { type: String },
  department: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected", "escalated", "cancelled"], default: "pending" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  description: { type: String, default: "" },
  amount: { type: Number, default: null },
  steps: [{ stepName: String, assignee: String, status: String }],
}, { timestamps: true });

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: "" },
  sku: { type: String, default: "" },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  customerName: { type: String, default: "" },
  customerEmail: { type: String, default: "" },
  items: { type: [OrderItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  installationFee: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ["new","confirmed","in_production","ready","delivered","cancelled"], default: "new" },
  paymentStatus: { type: String, enum: ["pending","paid","failed","refunded"], default: "pending" },
  assignedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
  assignedEmployeeName: { type: String, default: "" },
  deliveryAddress: { line1: String, city: String, country: String },
  installationPreference: { type: String, default: "full" },
  notes: { type: String, default: "" },
}, { timestamps: true });
OrderSchema.index({ orderNumber: 1 }, { unique: true });

// ─── Models ───────────────────────────────────────────────────────────────────
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
const Quote = mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);
const ERPApp = mongoose.models.ERPApp || mongoose.model("ERPApp", ERPAppSchema);
const ERPSchemaRelation = mongoose.models.ERPSchemaRelation || mongoose.model("ERPSchemaRelation", ERPSchemaRelationSchema);
const ApprovalRequest = mongoose.models.ApprovalRequest || mongoose.model("ApprovalRequest", ApprovalRequestSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TEST_PASSWORD = "Hedj@Test123";
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const upsertBy = async (Model, key, data) => {
  const filter = { [key]: data[key] };
  const existing = await Model.findOne(filter);
  if (existing) return { doc: existing, created: false };
  const doc = await Model.create(data);
  return { doc, created: true };
};

// ─── Seed functions ───────────────────────────────────────────────────────────

const seedUsers = async () => {
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  const users = [
    { username: "atlas_admin", email: "atlas.admin@hedj.test", password: hash, gender: "male", firstName: "Atlas", lastName: "Admin", role: "admin" },
    { username: "nova_admin", email: "nova.admin@hedj.test", password: hash, gender: "female", firstName: "Nova", lastName: "Admin", role: "admin" },
    { username: "sienna_logistics", email: "sienna.logistics@hedj.test", password: hash, gender: "female", firstName: "Sienna", lastName: "Logistics", role: "employee" },
    { username: "marcus_sales", email: "marcus.sales@hedj.test", password: hash, gender: "male", firstName: "Marcus", lastName: "Sales", role: "employee" },
    { username: "eleanor_design", email: "eleanor.design@hedj.test", password: hash, gender: "female", firstName: "Eleanor", lastName: "Design", role: "employee" },
    { username: "omar_inventory", email: "omar.inventory@hedj.test", password: hash, gender: "male", firstName: "Omar", lastName: "Inventory", role: "employee" },
    { username: "julian_collector", email: "julian.collector@hedj.test", password: hash, gender: "male", firstName: "Julian", lastName: "Collector", role: "customer" },
    { username: "maya_interiors", email: "maya.interiors@hedj.test", password: hash, gender: "female", firstName: "Maya", lastName: "Interiors", role: "customer" },
    { username: "theo_studio", email: "theo.studio@hedj.test", password: hash, gender: "male", firstName: "Theo", lastName: "Studio", role: "customer" },
    { username: "lena_luxury", email: "lena.luxury@hedj.test", password: hash, gender: "female", firstName: "Lena", lastName: "Luxury", role: "customer" },
  ];
  let created = 0;
  for (const u of users) {
    const r = await upsertBy(User, "email", u);
    if (r.created) created++;
  }
  console.log(`  Users: ${created} created, ${users.length - created} already existed.`);
};

const seedEmployees = async () => {
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);
  const employees = [
    { fname: "Victoria", lname: "Chen", email: "victoria.chen@hedj.com", department: "Executive", jobTitle: "CEO", seniorityLevel: "C-Suite", phone: "+1-555-0100", password: hash, role: "admin", status: "active" },
    { fname: "James", lname: "Hargrove", email: "james.hargrove@hedj.com", department: "Sales", jobTitle: "Sales Director", seniorityLevel: "Director", phone: "+1-555-0101", password: hash, role: "admin", status: "active" },
    { fname: "Sienna", lname: "Blake", email: "sienna.blake@hedj.com", department: "Logistics", jobTitle: "Logistics Manager", seniorityLevel: "Manager", phone: "+1-555-0102", password: hash, role: "readonly", status: "active" },
    { fname: "Marcus", lname: "Thorne", email: "marcus.thorne@hedj.com", department: "Design", jobTitle: "Senior Designer", seniorityLevel: "Senior", phone: "+1-555-0103", password: hash, role: "readonly", status: "active" },
    { fname: "Eleanor", lname: "Vance", email: "eleanor.vance@hedj.com", department: "Inventory", jobTitle: "Inventory Analyst", seniorityLevel: "Mid-Level", phone: "+1-555-0104", password: hash, role: "readonly", status: "active" },
    { fname: "Omar", lname: "Khalid", email: "omar.khalid@hedj.com", department: "Finance", jobTitle: "Finance Controller", seniorityLevel: "Senior", phone: "+1-555-0105", password: hash, role: "readonly", status: "active" },
    { fname: "Priya", lname: "Sharma", email: "priya.sharma@hedj.com", department: "HR", jobTitle: "HR Manager", seniorityLevel: "Manager", phone: "+1-555-0106", password: hash, role: "admin", status: "active" },
    { fname: "Nathan", lname: "Foster", email: "nathan.foster@hedj.com", department: "IT", jobTitle: "Systems Engineer", seniorityLevel: "Senior", phone: "+1-555-0107", password: hash, role: "readonly", status: "active" },
    { fname: "Zara", lname: "Williams", email: "zara.williams@hedj.com", department: "Sales", jobTitle: "Sales Executive", seniorityLevel: "Junior", phone: "+1-555-0108", password: hash, role: "readonly", status: "active" },
    { fname: "Leo", lname: "Rossi", email: "leo.rossi@hedj.com", department: "Design", jobTitle: "Junior Designer", seniorityLevel: "Junior", phone: "+1-555-0109", password: hash, role: "readonly", status: "invited" },
  ];
  let created = 0;
  for (const e of employees) {
    const r = await upsertBy(Employee, "email", e);
    if (r.created) created++;
  }
  console.log(`  Employees: ${created} created, ${employees.length - created} already existed.`);
};

const seedProducts = async () => {
  const products = [
    { name: "Obsidian Kitchen Island", slug: "obsidian-kitchen-island", description: "A commanding island crafted from honed black granite with integrated brass fixtures. The centrepiece of any luxury kitchen.", category: "Kitchens", collection: "Obsidian", price: 28500, discountPrice: 26000, stock: 4, featured: true, sku: "OKI-001", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", status: "active" },
    { name: "Monolith Island System", slug: "monolith-island-system", description: "Seamless matte white lacquer surfaces with concealed storage and integrated appliance bays. Precision-engineered joinery.", category: "Kitchens", collection: "Monolith", price: 34200, stock: 3, featured: true, sku: "MIS-001", imageUrl: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800", status: "active" },
    { name: "Nordic Oak Cabinetry", slug: "nordic-oak-cabinetry", description: "Warm solid oak cabinetry with Shaker-inspired profiles and hand-applied oil finish. Timeless Nordic craftsmanship.", category: "Kitchens", collection: "Nordic", price: 18700, stock: 7, sku: "NOC-001", imageUrl: "https://images.unsplash.com/photo-1556909190-eccf4a8bf97a?w=800", status: "active" },
    { name: "Midnight Brass Galley", slug: "midnight-brass-galley", description: "A galley kitchen in deep navy lacquer with burnished brass hardware and ribbed glass uppers. Dramatic and refined.", category: "Kitchens", collection: "Midnight", price: 31000, discountPrice: 28500, stock: 2, sku: "MBG-001", imageUrl: "https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=800", status: "active" },
    { name: "Travertine Dining Table", slug: "travertine-dining-table", description: "Book-matched travertine slab top on a sculpted brushed steel base. Seats 10 comfortably. A statement piece.", category: "Tables", collection: "Stone Series", price: 14800, stock: 5, sku: "TDT-001", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", status: "active" },
    { name: "Marais Oak Dining Table", slug: "marais-oak-dining-table", description: "Solid white oak dining table with waterfall edge detailing and tapered steel legs. Inspired by Parisian design.", category: "Tables", collection: "Marais", price: 8900, stock: 9, sku: "MOD-001", imageUrl: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800", status: "active" },
    { name: "Bronze Geometric Table", slug: "bronze-geometric-table", description: "A sculptural side table in hand-poured bronze with geometric faceting. Functional art for living spaces.", category: "Tables", collection: "Bronze", price: 4200, stock: 12, sku: "BGT-001", imageUrl: "https://images.unsplash.com/photo-1616464916356-3a777b21b67e?w=800", status: "active" },
    { name: "Soren Linen Modular Sofa", slug: "soren-linen-modular-sofa", description: "Deep-seated modular sofa in Belgian linen with solid walnut feet. Configure to any living arrangement.", category: "Seating", collection: "Soren", price: 11200, discountPrice: 9800, stock: 6, featured: true, sku: "SLM-001", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", status: "active" },
    { name: "Velvet Emerald Armchair", slug: "velvet-emerald-armchair", description: "A confident statement armchair in jewel-toned emerald velvet. Solid brass legs and a high sculptural back.", category: "Seating", collection: "Velvet", price: 5600, stock: 8, sku: "VEA-001", imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800", status: "active" },
    { name: "Aero Task Chair", slug: "aero-task-chair", description: "Ergonomic task chair for the luxury home office. Full lumbar support, breathable mesh, polished aluminium frame.", category: "Seating", collection: "Aero", price: 3200, stock: 15, sku: "ATC-001", imageUrl: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800", status: "active" },
    { name: "Atlas Brass Floor Lamp", slug: "atlas-brass-floor-lamp", description: "An articulated arc floor lamp in hand-finished raw brass with a linen shade. Adjustable height and angle.", category: "Lighting", collection: "Atlas", price: 2800, stock: 10, sku: "ABL-001", imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800", status: "active" },
    { name: "Aurora Pendant Light", slug: "aurora-pendant-light", description: "Hand-blown amber glass pendant in a cluster formation. Dimmable warm LED. Transforms any dining space.", category: "Lighting", collection: "Aurora", price: 3400, discountPrice: 3100, stock: 7, sku: "APL-001", imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800", status: "active" },
    { name: "Lumiere Minimalist Sconce", slug: "lumiere-minimalist-sconce", description: "Brass wall sconce with rotatable shade. Each piece is individually soldered and polished by hand. Sold as a pair.", category: "Lighting", collection: "Lumiere", price: 1800, stock: 20, sku: "LMS-001", imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a35518502?w=800", status: "active" },
    { name: "Sanctuary Linen Bed", slug: "sanctuary-linen-bed", description: "A bed frame that commands the room. Upholstered headboard in oat linen, solid oak base with integrated bedside shelves.", category: "Bedrooms", collection: "Sanctuary", price: 9800, stock: 5, featured: true, sku: "SLB-001", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800", status: "active" },
    { name: "Walnut Storage Wall", slug: "walnut-storage-wall", description: "Floor-to-ceiling walnut storage system with integrated mirror, display shelving, and concealed wardrobe. Bespoke fit.", category: "Bedrooms", collection: "Storage", price: 16500, stock: 3, sku: "WSW-001", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", status: "active" },
    { name: "Terrace Teak Lounge Set", slug: "terrace-teak-lounge-set", description: "A complete outdoor seating ensemble in FSC-certified teak with Sunbrella cushions in stone grey.", category: "Outdoor", collection: "Terrace", price: 13600, discountPrice: 12400, stock: 4, sku: "TTL-001", imageUrl: "https://images.unsplash.com/photo-1575330933415-a6afae8543f9?w=800", status: "active" },
    { name: "Carrara Console Table", slug: "carrara-console-table", description: "A slender console in book-matched Carrara marble on powder-coated steel supports. Refined Italian lineage.", category: "Complements", collection: "Carrara", price: 7200, stock: 6, sku: "CCT-001", imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800", status: "active" },
    { name: "Stoneware Dining Set", slug: "stoneware-dining-set", description: "12-piece artisan stoneware dining set in matte celadon glaze. Microwave and dishwasher safe. Handcrafted in Portugal.", category: "Complements", collection: "Stoneware", price: 1600, stock: 18, sku: "SDS-001", imageUrl: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800", status: "active" },
    { name: "Minimalist Oak Island", slug: "minimalist-oak-island", description: "A freestanding oak island with integrated drawers and a butcher-block top. Scandinavian simplicity meets functional design.", category: "Kitchens", collection: "Nordic", price: 6400, stock: 8, sku: "MOI-001", imageUrl: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800", status: "active" },
    { name: "Eames Inspired Lounge", slug: "eames-inspired-lounge", description: "Reproduction lounge chair in aniline leather with rosewood shell and polished aluminium base. Mid-century icon.", category: "Seating", collection: "Heritage", price: 4800, stock: 5, sku: "EIL-001", imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800", status: "archived" },
  ];

  let created = 0, skipped = 0;
  for (const p of products) {
    try {
      const existing = await Product.findOne({ slug: p.slug });
      if (existing) { skipped++; continue; }
      await Product.create(p);
      created++;
    } catch (e) {
      if (e.code === 11000) skipped++;
      else console.warn(`  Product skip: ${p.name} — ${e.message}`);
    }
  }
  console.log(`  Products: ${created} created, ${skipped} already existed.`);
};

const seedLeads = async () => {
  const existingCount = await Lead.countDocuments();
  if (existingCount >= 10) {
    console.log(`  Leads: ${existingCount} already exist, skipping.`);
    return;
  }

  const leads = [
    { name: "Julian Ashford", email: "j.ashford@luxeresidences.com", phone: "+1-555-1001", company: "Luxe Residences", projectType: "Full Kitchen Renovation", source: "showroom", status: "proposal", priority: "high", estimatedValue: 85000, notes: "Viewing Obsidian and Nordic kitchens. Needs 3D renders." },
    { name: "Maya Fontaine", email: "m.fontaine@studiofw.com", phone: "+1-555-1002", company: "Studio FW Interiors", projectType: "Penthouse Furnishing", source: "referral", status: "qualified", priority: "urgent", estimatedValue: 220000, notes: "Repeat client. Full FF&E package for duplex penthouse." },
    { name: "Theodore Kim", email: "t.kim@kimarchitects.net", phone: "+1-555-1003", company: "Kim Architects", projectType: "Outdoor Entertaining Space", source: "website", status: "new", priority: "medium", estimatedValue: 42000, notes: "Interested in the Terrace Teak collection." },
    { name: "Lena Marchetti", email: "l.marchetti@marchetti.it", phone: "+39-02-555-0104", company: "Marchetti Luxury", projectType: "Lighting Installation", source: "campaign", status: "contacted", priority: "high", estimatedValue: 28000, notes: "Milan-based client, international shipping required." },
    { name: "Rafael Delgado", email: "r.delgado@villaazul.mx", phone: "+52-55-5555-0105", company: "Villa Azul Resort", projectType: "Resort Suite Furnishing", source: "referral", status: "won", priority: "urgent", estimatedValue: 480000, notes: "Closed. 24-suite contract for beachfront resort." },
    { name: "Sophie Laurent", email: "s.laurent@laurentgroup.fr", phone: "+33-1-5555-0106", company: "Laurent Group", projectType: "Dining Room Setup", source: "showroom", status: "qualified", priority: "high", estimatedValue: 36000, notes: "Interested in Travertine dining table." },
    { name: "Oliver Pemberton", email: "o.pemberton@pembertonestate.co.uk", phone: "+44-20-5555-0107", company: "Pemberton Estate", projectType: "Master Bedroom Suite", source: "website", status: "proposal", priority: "medium", estimatedValue: 62000, notes: "Complete bedroom suite including Sanctuary bed." },
    { name: "Aisha Mensah", email: "a.mensah@designco.gh", phone: "+233-30-5555-0108", company: "Design Co Africa", projectType: "Office Interior", source: "campaign", status: "lost", priority: "low", estimatedValue: 15000, notes: "Budget constraints, re-engage Q3." },
    { name: "Carlos Ruiz", email: "c.ruiz@haciendaruiz.com", phone: "+34-91-5555-0109", company: "Hacienda Ruiz", projectType: "Kitchen Remodel", source: "referral", status: "contacted", priority: "medium", estimatedValue: 55000, notes: "Spanish villa kitchen — Monolith system." },
    { name: "Isabelle Moreau", email: "i.moreau@moreau-archi.fr", phone: "+33-4-5555-0110", company: "Moreau Architecture", projectType: "Boutique Hotel Lobby", source: "showroom", status: "new", priority: "high", estimatedValue: 95000, notes: "Lobby and bar area for new Marseille boutique hotel." },
    { name: "David Park", email: "d.park@parkstudio.kr", phone: "+82-2-5555-0111", company: "Park Studio", projectType: "Residential Seating", source: "website", status: "qualified", priority: "medium", estimatedValue: 22000, notes: "Seoul penthouse — Soren sofa configuration." },
    { name: "Emma Johansson", email: "e.johansson@norrdesign.se", phone: "+46-8-5555-0112", company: "Norr Design", projectType: "Kitchen System", source: "referral", status: "proposal", priority: "high", estimatedValue: 78000, notes: "Stockholm villa — Nordic Oak Cabinetry." },
    { name: "Mehmet Yilmaz", email: "m.yilmaz@istanbulelite.tr", phone: "+90-212-5555-0113", company: "Istanbul Elite Properties", projectType: "Bosphorus Villa Furnishing", source: "campaign", status: "won", priority: "urgent", estimatedValue: 340000, notes: "Full FF&E. Preferred the Midnight Brass collection." },
    { name: "Chloe Dubois", email: "c.dubois@duboisinterieur.be", phone: "+32-2-5555-0114", company: "Dubois Intérieur", projectType: "Lighting Design", source: "showroom", status: "contacted", priority: "medium", estimatedValue: 18000, notes: "Aurora and Lumiere collections." },
    { name: "Aarav Patel", email: "a.patel@patelhomes.in", phone: "+91-22-5555-0115", company: "Patel Luxury Homes", projectType: "Outdoor Lounge", source: "website", status: "new", priority: "low", estimatedValue: 25000, notes: "Mumbai villa — Terrace Teak." },
  ];

  let created = 0;
  for (const l of leads) {
    try {
      await Lead.create(l);
      created++;
    } catch (e) {
      if (e.code !== 11000) console.warn(`  Lead skip: ${l.name} — ${e.message}`);
    }
  }
  console.log(`  Leads: ${created} created.`);
};

const seedQuotes = async () => {
  const existingCount = await Quote.countDocuments();
  if (existingCount >= 6) {
    console.log(`  Quotes: ${existingCount} already exist, skipping.`);
    return;
  }

  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 86400000);

  const quotes = [
    {
      customerName: "Maya Fontaine", customerEmail: "m.fontaine@studiofw.com",
      project: "Penthouse FF&E Package", quoteNumber: "HQ-2024-001",
      status: "accepted", validUntil: future(30),
      items: [
        { name: "Obsidian Kitchen Island", description: "Custom Obsidian Kitchen Island with integrated appliances", quantity: 1, unitPrice: 26000, total: 26000 },
        { name: "Soren Linen Modular Sofa", description: "5-module configuration in oat linen", quantity: 1, unitPrice: 9800, total: 9800 },
        { name: "Travertine Dining Table", description: "2400mm version, seats 10", quantity: 1, unitPrice: 14800, total: 14800 },
      ],
      subtotal: 50600, discount: 2600, tax: 4800, total: 52800,
      notes: "Client confirmed. Deposit received. Production starts Week 12.",
    },
    {
      customerName: "Julian Ashford", customerEmail: "j.ashford@luxeresidences.com",
      project: "Kitchen Renovation — Belgravia", quoteNumber: "HQ-2024-002",
      status: "sent", validUntil: future(14),
      items: [
        { name: "Nordic Oak Cabinetry", description: "Full run including island", quantity: 1, unitPrice: 18700, total: 18700 },
        { name: "Atlas Brass Floor Lamp", description: "Set of 2", quantity: 2, unitPrice: 2800, total: 5600 },
      ],
      subtotal: 24300, discount: 0, tax: 2430, total: 26730,
      notes: "Awaiting client sign-off. Follow up Friday.",
    },
    {
      customerName: "Oliver Pemberton", customerEmail: "o.pemberton@pembertonestate.co.uk",
      project: "Master Bedroom Suite — Kensington", quoteNumber: "HQ-2024-003",
      status: "draft", validUntil: future(21),
      items: [
        { name: "Sanctuary Linen Bed", description: "King size in oat linen", quantity: 1, unitPrice: 9800, total: 9800 },
        { name: "Walnut Storage Wall", description: "4m run with integrated mirror", quantity: 1, unitPrice: 16500, total: 16500 },
        { name: "Aurora Pendant Light", description: "Cluster of 3 — amber glass", quantity: 1, unitPrice: 3100, total: 3100 },
      ],
      subtotal: 29400, discount: 1500, tax: 2790, total: 30690,
      notes: "Awaiting final measurements from site survey.",
    },
    {
      customerName: "Emma Johansson", customerEmail: "e.johansson@norrdesign.se",
      project: "Stockholm Villa Kitchen", quoteNumber: "HQ-2024-004",
      status: "rejected", validUntil: future(-7),
      items: [
        { name: "Nordic Oak Cabinetry", description: "Custom Nordic oak kitchen", quantity: 1, unitPrice: 18700, total: 18700 },
        { name: "Minimalist Oak Island", description: "Freestanding island", quantity: 1, unitPrice: 6400, total: 6400 },
      ],
      subtotal: 25100, discount: 0, tax: 2510, total: 27610,
      notes: "Client went with local supplier. Re-engage in 6 months.",
    },
    {
      customerName: "Sophie Laurent", customerEmail: "s.laurent@laurentgroup.fr",
      project: "Dining Room — Paris 16th", quoteNumber: "HQ-2024-005",
      status: "pending", validUntil: future(7),
      items: [
        { name: "Travertine Dining Table", description: "2000mm version, seats 8", quantity: 1, unitPrice: 14800, total: 14800 },
        { name: "Bronze Geometric Table", description: "Set of 2 side tables", quantity: 2, unitPrice: 4200, total: 8400 },
        { name: "Lumiere Minimalist Sconce", description: "Set of 4 pairs", quantity: 4, unitPrice: 1800, total: 7200 },
      ],
      subtotal: 30400, discount: 1000, tax: 2940, total: 32340,
      notes: "Budget pre-approved. Finalising colour spec.",
    },
    {
      customerName: "David Park", customerEmail: "d.park@parkstudio.kr",
      project: "Seoul Penthouse Living Room", quoteNumber: "HQ-2024-006",
      status: "sent", validUntil: future(10),
      items: [
        { name: "Soren Linen Modular Sofa", description: "3-module configuration", quantity: 1, unitPrice: 9800, total: 9800 },
        { name: "Velvet Emerald Armchair", description: "Pair of emerald velvet chairs", quantity: 2, unitPrice: 5600, total: 11200 },
        { name: "Aurora Pendant Light", description: "Single pendant", quantity: 1, unitPrice: 3100, total: 3100 },
      ],
      subtotal: 24100, discount: 800, tax: 2331, total: 25631,
      notes: "International shipping quoted separately.",
    },
    {
      customerName: "Isabelle Moreau", customerEmail: "i.moreau@moreau-archi.fr",
      project: "Marseille Boutique Hotel Lobby", quoteNumber: "HQ-2024-007",
      status: "draft", validUntil: future(45),
      items: [
        { name: "Carrara Console Table", description: "Set of 3 for lobby alcoves", quantity: 3, unitPrice: 7200, total: 21600 },
        { name: "Velvet Emerald Armchair", description: "8 lounge chairs for seating areas", quantity: 8, unitPrice: 5600, total: 44800 },
        { name: "Atlas Brass Floor Lamp", description: "Set of 4", quantity: 4, unitPrice: 2800, total: 11200 },
      ],
      subtotal: 77600, discount: 4000, tax: 7360, total: 80960,
      notes: "Pending hotel owner approval. Very promising project.",
    },
    {
      customerName: "Chloe Dubois", customerEmail: "c.dubois@duboisinterieur.be",
      project: "Brussels Townhouse Lighting", quoteNumber: "HQ-2024-008",
      status: "accepted", validUntil: future(5),
      items: [
        { name: "Lumiere Minimalist Sconce", description: "6 pairs across 3 floors", quantity: 6, unitPrice: 1800, total: 10800 },
        { name: "Aurora Pendant Light", description: "2 kitchen pendants", quantity: 2, unitPrice: 3100, total: 6200 },
        { name: "Atlas Brass Floor Lamp", description: "Study floor lamp", quantity: 1, unitPrice: 2800, total: 2800 },
      ],
      subtotal: 19800, discount: 500, tax: 1930, total: 21230,
      notes: "Signed. 50% deposit received. Shipping scheduled.",
    },
  ];

  let created = 0;
  for (const q of quotes) {
    try {
      const existing = await Quote.findOne({ quoteNumber: q.quoteNumber });
      if (existing) continue;
      await Quote.create(q);
      created++;
    } catch (e) {
      if (e.code !== 11000) console.warn(`  Quote skip: ${q.quoteNumber} — ${e.message}`);
    }
  }
  console.log(`  Quotes: ${created} created.`);
};

const seedERPApps = async () => {
  const apps = [
    { name: "Hedj Commerce", slug: "hedj-commerce", layer: "primary", icon: "storefront", purpose: "Core e-commerce platform — product catalogue, orders, checkout, customer accounts.", dependsOn: [], usedBy: ["Sales", "Logistics", "Finance"], mainTables: ["products", "orders", "customers", "cart"], status: "active" },
    { name: "HR & Payroll", slug: "hr-payroll", layer: "primary", icon: "badge", purpose: "Employee records, payroll processing, benefits, and onboarding workflows.", dependsOn: ["hedj-commerce"], usedBy: ["HR", "Finance", "Executive"], mainTables: ["employees", "payroll", "departments"], status: "api-connected" },
    { name: "CRM & Leads", slug: "crm-leads", layer: "primary", icon: "leaderboard", purpose: "Lead pipeline, client relationships, quote management, and sales tracking.", dependsOn: ["hedj-commerce"], usedBy: ["Sales", "Executive"], mainTables: ["leads", "quotes", "customers"], status: "active" },
    { name: "Logistics & Inventory", slug: "logistics-inventory", layer: "primary", icon: "inventory", purpose: "Stock management, supplier relationships, warehouse operations, and delivery tracking.", dependsOn: ["hedj-commerce"], usedBy: ["Logistics", "Inventory", "Operations"], mainTables: ["products", "stock_movements", "suppliers"], status: "api-connected" },
    { name: "Financial Management", slug: "financial-management", layer: "secondary", icon: "account_balance", purpose: "Accounting, invoicing, expense management, and financial reporting.", dependsOn: ["crm-leads", "hedj-commerce"], usedBy: ["Finance", "Executive"], mainTables: ["invoices", "expenses", "accounts"], status: "planned" },
    { name: "Analytics Platform", slug: "analytics-platform", layer: "secondary", icon: "analytics", purpose: "Business intelligence dashboards, sales analytics, and performance reporting.", dependsOn: ["hedj-commerce", "crm-leads"], usedBy: ["Executive", "Sales", "Marketing"], mainTables: ["analytics_events", "reports"], status: "active" },
    { name: "Email & Notifications", slug: "email-notifications", layer: "secondary", icon: "outgoing_mail", purpose: "Transactional email delivery, notification queuing, and communication logs.", dependsOn: ["hedj-commerce"], usedBy: ["All"], mainTables: ["email_outbox", "notification_queue"], status: "api-connected" },
    { name: "Design & CAD Integration", slug: "design-cad", layer: "optional", icon: "architecture", purpose: "CAD file management, 3D model library, and client design approval workflows.", dependsOn: [], usedBy: ["Design"], mainTables: ["design_files", "approval_requests"], status: "planned" },
    { name: "ERP Core", slug: "erp-core", layer: "primary", icon: "account_tree", purpose: "Central ERP orchestration — schema relations, module dependencies, and integration status.", dependsOn: [], usedBy: ["IT", "Executive"], mainTables: ["erp_apps", "erp_schema_relations", "approval_requests"], status: "active" },
  ];

  let created = 0;
  for (const app of apps) {
    const r = await upsertBy(ERPApp, "slug", app);
    if (r.created) created++;
  }
  console.log(`  ERP Apps: ${created} created, ${apps.length - created} already existed.`);
};

const seedERPSchema = async () => {
  const existing = await ERPSchemaRelation.countDocuments();
  if (existing >= 5) {
    console.log(`  ERP Schema Relations: ${existing} already exist, skipping.`);
    return;
  }

  const relations = [
    { fromModel: "User", toModel: "Order", relationType: "one-to-many", fieldName: "customerId", description: "A customer can have many orders." },
    { fromModel: "User", toModel: "Lead", relationType: "one-to-many", fieldName: "createdBy", description: "A user creates and manages leads." },
    { fromModel: "Lead", toModel: "Quote", relationType: "one-to-many", fieldName: "leadId", description: "A lead can generate multiple quotes." },
    { fromModel: "Product", toModel: "Order", relationType: "many-to-many", fieldName: "items", description: "Orders contain many products; products appear in many orders." },
    { fromModel: "Employee", toModel: "Department", relationType: "many-to-one", fieldName: "department", description: "Many employees belong to one department." },
    { fromModel: "ERPApp", toModel: "ERPSchemaRelation", relationType: "one-to-many", fieldName: "relatedApp", description: "Each ERP module participates in multiple schema relations." },
    { fromModel: "User", toModel: "Quote", relationType: "one-to-many", fieldName: "customerId", description: "A customer can have multiple quotes." },
    { fromModel: "Employee", toModel: "Lead", relationType: "one-to-many", fieldName: "assignedTo", description: "An employee can be assigned many leads." },
  ];

  let created = 0;
  for (const r of relations) {
    try {
      await ERPSchemaRelation.create(r);
      created++;
    } catch (e) {
      console.warn(`  Schema relation skip: ${e.message}`);
    }
  }
  console.log(`  ERP Schema Relations: ${created} created.`);
};

const seedApprovals = async () => {
  // Always wipe and re-seed approvals so refs point to real Employee docs
  await ApprovalRequest.deleteMany({});

  // Look up real Employee ObjectIds by email
  const emps = await Employee.find({}, "email fname lname").lean();
  const empByEmail = {};
  emps.forEach((e) => { empByEmail[e.email] = e; });

  const emp = (email) => empByEmail[email]?._id || null;
  const empName = (email) => {
    const e = empByEmail[email];
    return e ? `${e.fname} ${e.lname}` : email;
  };

  const approvals = [
    {
      title: "Q2 Marketing Budget Increase",
      requestType: "Budget Approval",
      employeeId: emp("james.hargrove@hedj.com"),
      currentApproverId: emp("victoria.chen@hedj.com"),
      employeeName: empName("james.hargrove@hedj.com"),
      currentApproverName: empName("victoria.chen@hedj.com"),
      requestedBy: "James Hargrove", department: "Sales",
      status: "pending", priority: "high",
      description: "Requesting $40,000 additional marketing budget for Q2 trade show participation and digital campaigns.",
      amount: 40000,
      steps: [
        { stepName: "Manager Review", assignee: empName("victoria.chen@hedj.com"), status: "pending" },
        { stepName: "Finance Sign-off", assignee: empName("omar.khalid@hedj.com"), status: "pending" },
      ],
    },
    {
      title: "Leo Rossi — New Hire Equipment",
      requestType: "Purchase Approval",
      employeeId: emp("marcus.thorne@hedj.com"),
      currentApproverId: emp("nathan.foster@hedj.com"),
      employeeName: empName("marcus.thorne@hedj.com"),
      currentApproverName: empName("nathan.foster@hedj.com"),
      requestedBy: "Marcus Thorne", department: "Design",
      status: "approved", priority: "medium",
      description: "MacBook Pro, Wacom tablet, and design software licences for new junior designer.",
      amount: 5800,
      steps: [
        { stepName: "Manager Review", assignee: empName("marcus.thorne@hedj.com"), status: "approved" },
        { stepName: "IT Procurement", assignee: empName("nathan.foster@hedj.com"), status: "approved" },
      ],
    },
    {
      title: "Remote Work Policy Update",
      requestType: "Policy Change",
      employeeId: emp("priya.sharma@hedj.com"),
      currentApproverId: emp("victoria.chen@hedj.com"),
      employeeName: empName("priya.sharma@hedj.com"),
      currentApproverName: empName("victoria.chen@hedj.com"),
      requestedBy: "Priya Sharma", department: "HR",
      status: "pending", priority: "medium",
      description: "Updating the hybrid work policy to allow 3 remote days per week across all departments.",
      amount: null,
      steps: [{ stepName: "Executive Review", assignee: empName("victoria.chen@hedj.com"), status: "pending" }],
    },
    {
      title: "Supabase Storage Plan Upgrade",
      requestType: "Software Subscription",
      employeeId: emp("nathan.foster@hedj.com"),
      currentApproverId: emp("omar.khalid@hedj.com"),
      employeeName: empName("nathan.foster@hedj.com"),
      currentApproverName: empName("omar.khalid@hedj.com"),
      requestedBy: "Nathan Foster", department: "IT",
      status: "pending", priority: "urgent",
      description: "Upgrading Supabase from Free to Pro tier to support product image storage at scale. $25/month.",
      amount: 300,
      steps: [
        { stepName: "IT Manager", assignee: empName("nathan.foster@hedj.com"), status: "approved" },
        { stepName: "Finance", assignee: empName("omar.khalid@hedj.com"), status: "pending" },
      ],
    },
    {
      title: "Terrace Teak — Rush Supplier Order",
      requestType: "Procurement",
      employeeId: emp("sienna.blake@hedj.com"),
      currentApproverId: emp("victoria.chen@hedj.com"),
      employeeName: empName("sienna.blake@hedj.com"),
      currentApproverName: empName("victoria.chen@hedj.com"),
      requestedBy: "Sienna Blake", department: "Logistics",
      status: "escalated", priority: "urgent",
      description: "Emergency teak restock for 3 outstanding orders (Villa Azul, Istanbul Elite). Lead time 4 weeks.",
      amount: 22000,
      steps: [
        { stepName: "Logistics Manager", assignee: empName("sienna.blake@hedj.com"), status: "approved" },
        { stepName: "Executive", assignee: empName("victoria.chen@hedj.com"), status: "pending" },
      ],
    },
    {
      title: "Annual Training Budget — Design Team",
      requestType: "Budget Approval",
      employeeId: emp("marcus.thorne@hedj.com"),
      currentApproverId: emp("victoria.chen@hedj.com"),
      employeeName: empName("marcus.thorne@hedj.com"),
      currentApproverName: empName("victoria.chen@hedj.com"),
      requestedBy: "Marcus Thorne", department: "Design",
      status: "rejected", priority: "low",
      description: "Requesting $8,000 for Figma Advanced and Rhino 3D training courses.",
      amount: 8000,
      steps: [{ stepName: "Manager Review", assignee: empName("victoria.chen@hedj.com"), status: "rejected" }],
    },
  ];

  let created = 0;
  for (const a of approvals) {
    try {
      await ApprovalRequest.create(a);
      created++;
    } catch (e) {
      console.warn(`  Approval skip: ${e.message}`);
    }
  }
  console.log(`  Approval Requests: ${created} created (with real Employee refs).`);
};

const seedOrders = async () => {
  const existing = await Order.countDocuments();
  if (existing >= 10) {
    console.log(`  Orders: ${existing} already exist, skipping.`);
    return;
  }

  // Resolve real customer IDs and employee IDs
  const customers = await User.find({ role: "customer" }, "email firstName lastName").lean();
  const employees = await Employee.find({}, "email fname lname").lean();
  const products = await Product.find({ status: "active" }, "name price sku imageUrl slug").limit(10).lean();

  const custByEmail = {};
  customers.forEach((c) => { custByEmail[c.email] = c; });
  const empByEmail = {};
  employees.forEach((e) => { empByEmail[e.email] = e; });
  const p = (i) => products[i % products.length] || {};

  const buildItem = (prod, qty = 1) => ({
    productId: prod._id || null,
    name: prod.name || "Hedj Product",
    quantity: qty,
    unitPrice: prod.price || 0,
    total: (prod.price || 0) * qty,
    imageUrl: prod.imageUrl || "",
    sku: prod.sku || "",
  });

  const mkOrder = (num, custEmail, empEmail, status, payStatus, items, extra = {}) => {
    const cust = custByEmail[custEmail];
    const emp = empByEmail[empEmail];
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = Math.round(subtotal * 0.08);
    const install = 450;
    return {
      orderNumber: `HJ-${num}`,
      customerId: cust?._id || null,
      customerName: cust ? `${cust.firstName} ${cust.lastName}` : custEmail,
      customerEmail: custEmail,
      assignedEmployeeId: emp?._id || null,
      assignedEmployeeName: emp ? `${emp.fname} ${emp.lname}` : "",
      items,
      subtotal,
      tax,
      installationFee: install,
      total: subtotal + tax + install,
      status,
      paymentStatus: payStatus,
      installationPreference: "full",
      deliveryAddress: { line1: "888 Elysium Drive, Suite 402", city: "London", country: "UK" },
      ...extra,
    };
  };

  const orders = [
    mkOrder("30001", "julian.collector@hedj.test", "sienna.blake@hedj.com", "new", "pending",
      [buildItem(p(0), 1), buildItem(p(4), 2)],
      { notes: "Client requested white-glove delivery. Call ahead.", estimatedDays: 14 }),

    mkOrder("30002", "maya.interiors@hedj.test", "james.hargrove@hedj.com", "new", "paid",
      [buildItem(p(1), 1), buildItem(p(7), 1)],
      { notes: "Rush order — trade show deadline.", estimatedDays: 10 }),

    mkOrder("30003", "theo.studio@hedj.test", "marcus.thorne@hedj.com", "confirmed", "paid",
      [buildItem(p(2), 2)],
      { notes: "Deposit paid. Awaiting fabric confirmation.", estimatedDays: 21 }),

    mkOrder("30004", "lena.luxury@hedj.test", "sienna.blake@hedj.com", "confirmed", "pending",
      [buildItem(p(3), 1), buildItem(p(5), 1)],
      { estimatedDays: 18 }),

    mkOrder("30005", "julian.collector@hedj.test", "james.hargrove@hedj.com", "in_production", "paid",
      [buildItem(p(0), 1)],
      { notes: "Custom honed edge requested. 65% complete.", estimatedDays: 7 }),

    mkOrder("30006", "maya.interiors@hedj.test", "marcus.thorne@hedj.com", "in_production", "paid",
      [buildItem(p(6), 3), buildItem(p(8), 1)],
      { notes: "Custom dimensions 2200x1000mm. Workshop B.", estimatedDays: 12 }),

    mkOrder("30007", "theo.studio@hedj.test", "sienna.blake@hedj.com", "in_production", "paid",
      [buildItem(p(9), 1)],
      { estimatedDays: 5 }),

    mkOrder("30008", "lena.luxury@hedj.test", "james.hargrove@hedj.com", "ready", "paid",
      [buildItem(p(1), 1)],
      { notes: "QC passed. Wrapped and palletised. Warehouse A-12.", estimatedDays: 2 }),

    mkOrder("30009", "julian.collector@hedj.test", "marcus.thorne@hedj.com", "ready", "paid",
      [buildItem(p(3), 2)],
      { notes: "Client confirmed delivery date: next Tuesday.", estimatedDays: 1 }),

    mkOrder("30010", "maya.interiors@hedj.test", "sienna.blake@hedj.com", "delivered", "paid",
      [buildItem(p(7), 1), buildItem(p(4), 1)],
      { notes: "Installed and signed off by client. No issues." }),

    mkOrder("30011", "theo.studio@hedj.test", "james.hargrove@hedj.com", "delivered", "paid",
      [buildItem(p(2), 1)],
      { notes: "Feedback: very satisfied. Follow-up quote requested." }),

    mkOrder("30012", "lena.luxury@hedj.test", "marcus.thorne@hedj.com", "delivered", "paid",
      [buildItem(p(5), 2)],
      {}),

    mkOrder("30013", "julian.collector@hedj.test", "sienna.blake@hedj.com", "cancelled", "refunded",
      [buildItem(p(8), 1)],
      { notes: "Client relocated. Full refund processed." }),

    mkOrder("30014", "maya.interiors@hedj.test", "james.hargrove@hedj.com", "new", "pending",
      [buildItem(p(9), 1), buildItem(p(6), 2)],
      { notes: "Pending design sign-off from client.", estimatedDays: 30 }),

    mkOrder("30015", "lena.luxury@hedj.test", "marcus.thorne@hedj.com", "confirmed", "paid",
      [buildItem(p(0), 1), buildItem(p(3), 1), buildItem(p(7), 1)],
      { notes: "Full suite order. High-value — priority handling.", estimatedDays: 35 }),
  ];

  let created = 0;
  for (const o of orders) {
    try {
      const existing = await Order.findOne({ orderNumber: o.orderNumber });
      if (existing) continue;
      await Order.create(o);
      created++;
    } catch (e) {
      if (e.code !== 11000) console.warn(`  Order skip: ${o.orderNumber} — ${e.message}`);
    }
  }
  console.log(`  Orders: ${created} created.`);
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected.\n");

  console.log("Seeding users...");
  await seedUsers();

  console.log("Seeding employees...");
  await seedEmployees();

  console.log("Seeding products...");
  await seedProducts();

  console.log("Seeding leads...");
  await seedLeads();

  console.log("Seeding quotes...");
  await seedQuotes();

  console.log("Seeding ERP apps...");
  await seedERPApps();

  console.log("Seeding ERP schema relations...");
  await seedERPSchema();

  console.log("Seeding approval requests...");
  await seedApprovals();

  console.log("Seeding orders...");
  await seedOrders();

  console.log("\n─── Final counts ─────────────────────────────────────────");
  const counts = await Promise.all([
    User.countDocuments(),
    Employee.countDocuments(),
    Product.countDocuments(),
    Lead.countDocuments(),
    Quote.countDocuments(),
    Order.countDocuments(),
    ERPApp.countDocuments(),
    ERPSchemaRelation.countDocuments(),
    ApprovalRequest.countDocuments(),
  ]);
  const labels = ["Users", "Employees", "Products", "Leads", "Quotes", "Orders", "ERP Apps", "Schema Relations", "Approvals"];
  labels.forEach((l, i) => console.log(`  ${l}: ${counts[i]}`));
  console.log("\nSeed complete.");
  await mongoose.disconnect();
};

run().catch((err) => { console.error("Seed failed:", err.message); process.exit(1); });
