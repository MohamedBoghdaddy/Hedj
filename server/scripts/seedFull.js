/**
 * seedFull.js — Comprehensive idempotent seed for all QA data.
 *
 * Usage: node server/scripts/seedFull.js
 *
 * Seeds:
 *  - 9 User accounts (all roles)       password: 12345678
 *  - 15 Employee model accounts         password: 12345678
 *  - 30 Products across 7 categories
 *  - 15 Orders across all statuses
 *  - 15 Leads across all statuses
 *  - 10 Quotes across all statuses
 *  - Customer addresses + wishlist
 *  - Approval requests
 *  - Attendance records (10 days)
 *  - Leave requests
 *  - ERP Apps + Departments + Job Positions
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import User from "../model/usermodel.js";
import Employee from "../model/employeemodel.js";
import Product from "../model/productsmodel.js";
import Order from "../model/Order.js";
import Lead from "../model/Lead.js";
import Quote from "../model/Quote.js";
import Address from "../model/Address.js";
import AttendanceRecord from "../model/AttendanceRecord.js";
import LeaveRequest from "../model/LeaveRequest.js";
import ApprovalRequest from "../model/ApprovalRequest.js";
import ERPApp from "../model/ERPApp.js";
import Department from "../model/Department.js";
import JobPosition from "../model/JobPosition.js";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
if (!MONGO_URI) { console.error("No MONGO_URI set."); process.exit(1); }

const QA_PASS = "12345678";
const hash = (pw) => bcrypt.hash(pw, 10);

// ── Users ─────────────────────────────────────────────────────────────────────
const USER_SEEDS = [
  { username:"qa_superadmin", email:"qa.superadmin@hedj.test", firstName:"Sovereign", lastName:"Blackwood", gender:"male", role:"super_admin", department:"Executive", jobTitle:"Super Administrator" },
  { username:"qa_admin",      email:"qa.admin@hedj.test",      firstName:"Orion",     lastName:"Voss",      gender:"male", role:"admin",       department:"Management", jobTitle:"System Administrator" },
  { username:"qa_manager",    email:"qa.manager@hedj.test",    firstName:"Celeste",   lastName:"Harrington",gender:"female",role:"manager",   department:"Operations", jobTitle:"Operations Manager" },
  { username:"qa_hr",         email:"qa.hr@hedj.test",         firstName:"Nadia",     lastName:"Kowalski",  gender:"female",role:"HR",        department:"Human Resources", jobTitle:"HR Specialist" },
  { username:"qa_accountant", email:"qa.accountant@hedj.test", firstName:"Felix",     lastName:"Drummond",  gender:"male", role:"accountant", department:"Finance", jobTitle:"Senior Accountant" },
  { username:"qa_operations", email:"qa.operations@hedj.test", firstName:"Remy",      lastName:"Fontaine",  gender:"male", role:"operations", department:"Fulfillment", jobTitle:"Operations Coordinator" },
  { username:"qa_designer",   email:"qa.designer@hedj.test",   firstName:"Luna",      lastName:"Mercer",    gender:"female",role:"designer",  department:"Design", jobTitle:"Interior Designer" },
  { username:"qa_employee",   email:"qa.employee@hedj.test",   firstName:"Theo",      lastName:"Prescott",  gender:"male", role:"employee",   department:"Warehouse", jobTitle:"Warehouse Associate" },
  { username:"qa_customer",   email:"qa.customer@hedj.test",   firstName:"Ivy",       lastName:"Thornton",  gender:"female",role:"customer",  jobTitle:"" },
  { username:"qa_customer2",  email:"qa.customer2@hedj.test",  firstName:"Marcus",    lastName:"Adeyemi",   gender:"male", role:"customer",  jobTitle:"" },
  { username:"qa_customer3",  email:"qa.customer3@hedj.test",  firstName:"Sophie",    lastName:"Laurent",   gender:"female",role:"customer", jobTitle:"" },
];

// ── Employees (Employee model) ────────────────────────────────────────────────
const EMPLOYEE_SEEDS = [
  { fname:"Augustin",  lname:"Delacroix", email:"augustin@hedj.test",  department:"Design",           jobTitle:"Lead Designer",       role:"admin" },
  { fname:"Yuki",      lname:"Tanaka",    email:"yuki@hedj.test",      department:"Fulfillment",       jobTitle:"Warehouse Lead",       role:"operations" },
  { fname:"Priya",     lname:"Sharma",    email:"priya@hedj.test",     department:"Human Resources",   jobTitle:"HR Manager",           role:"HR" },
  { fname:"Marco",     lname:"Ricci",     email:"marco@hedj.test",     department:"Finance",           jobTitle:"Financial Analyst",    role:"accountant" },
  { fname:"Zara",      lname:"Okonkwo",   email:"zara@hedj.test",      department:"Sales",             jobTitle:"Sales Associate",      role:"readonly" },
  { fname:"Lars",      lname:"Eriksson",  email:"lars@hedj.test",      department:"Design",            jobTitle:"UI/UX Designer",       role:"designer" },
  { fname:"Amara",     lname:"Diallo",    email:"amara@hedj.test",     department:"Operations",        jobTitle:"Logistics Coordinator",role:"operations" },
  { fname:"Kenji",     lname:"Watanabe",  email:"kenji@hedj.test",     department:"Management",        jobTitle:"Project Manager",      role:"manager" },
  { fname:"Elena",     lname:"Vasquez",   email:"elena@hedj.test",     department:"Human Resources",   jobTitle:"Recruiter",            role:"HR" },
  { fname:"Darius",    lname:"Khoury",    email:"darius@hedj.test",    department:"Finance",           jobTitle:"Accounts Manager",     role:"accountant" },
  { fname:"Sasha",     lname:"Petrov",    email:"sasha@hedj.test",     department:"Warehouse",         jobTitle:"Stock Controller",     role:"readonly" },
  { fname:"Amina",     lname:"Hassan",    email:"amina@hedj.test",     department:"Design",            jobTitle:"Junior Designer",      role:"designer" },
  { fname:"Diego",     lname:"Morales",   email:"diego@hedj.test",     department:"Fulfillment",       jobTitle:"Driver",               role:"readonly" },
  { fname:"Freya",     lname:"Nilsson",   email:"freya@hedj.test",     department:"Sales",             jobTitle:"Sales Manager",        role:"manager" },
  { fname:"Omar",      lname:"Farouk",    email:"omar@hedj.test",      department:"Management",        jobTitle:"COO",                  role:"admin" },
];

// ── Products ──────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // Kitchens (5)
  { name:"Atlas Kitchen Suite", category:"Kitchens", collection:"kitchens", price:18500, stock:4, sku:"KIT-001", description:"Minimalist handleless kitchen in matte anthracite with stone countertops." },
  { name:"Forma Kitchen Compact", category:"Kitchens", collection:"kitchens", price:12800, stock:6, sku:"KIT-002", description:"Space-efficient kitchen for urban apartments with soft-close drawers." },
  { name:"Celestia Island Kitchen", category:"Kitchens", collection:"kitchens", price:24000, stock:2, sku:"KIT-003", description:"Luxury island kitchen with waterfall quartz countertop and integrated appliances." },
  { name:"Nordic Oak Kitchen", category:"Kitchens", collection:"kitchens", price:15200, stock:5, sku:"KIT-004", description:"Warm Scandinavian kitchen with solid oak veneer and brushed brass hardware." },
  { name:"Monolith Dark Kitchen", category:"Kitchens", collection:"kitchens", price:21000, stock:3, sku:"KIT-005", description:"Dramatic all-dark kitchen with smoked glass upper cabinets." },
  // Bedrooms (5)
  { name:"Serenity Bedroom Suite", category:"Bedrooms", collection:"bedrooms", price:8200,  stock:8, sku:"BED-001", description:"Calming bedroom with upholstered headboard and matching bedside tables." },
  { name:"Dune Platform Bed", category:"Bedrooms", collection:"bedrooms", price:4500,  stock:12, sku:"BED-002", description:"Low-profile platform bed in natural linen with storage drawers." },
  { name:"Luminary Wardrobe System", category:"Bedrooms", collection:"bedrooms", price:6800,  stock:7, sku:"BED-003", description:"Modular wardrobe with interior LED lighting and velvet interior." },
  { name:"Onyx Bedroom Collection", category:"Bedrooms", collection:"bedrooms", price:11000, stock:3, sku:"BED-004", description:"Premium dark bedroom set with marble night stands and mirror headboard." },
  { name:"Cloud Nine Mattress", category:"Bedrooms", collection:"bedrooms", price:2200,  stock:20, sku:"BED-005", description:"Memory foam mattress with temperature regulation and 10-year warranty." },
  // Outdoor (5)
  { name:"Riviera Outdoor Sofa Set", category:"Outdoor", collection:"outdoor", price:7800,  stock:5, sku:"OUT-001", description:"All-weather rattan sofa set with Sunbrella cushions and glass table." },
  { name:"Terrace Dining Collection", category:"Outdoor", collection:"outdoor", price:5400,  stock:8, sku:"OUT-002", description:"Teak outdoor dining set for 6 with powder-coated aluminum chairs." },
  { name:"Hammock Haven Daybed", category:"Outdoor", collection:"outdoor", price:3200,  stock:10, sku:"OUT-003", description:"Luxury outdoor daybed with retractable sunshade." },
  { name:"Strata Fire Table", category:"Outdoor", collection:"outdoor", price:4200,  stock:6, sku:"OUT-004", description:"Gas fire pit table with lava rock fill and weatherproof finish." },
  { name:"Pergola Lounge Set", category:"Outdoor", collection:"outdoor", price:9500,  stock:3, sku:"OUT-005", description:"Complete pergola with retractable canopy and built-in planters." },
  // Complements (5)
  { name:"Aura Floor Lamp", category:"Complements", collection:"complements", price:890,   stock:25, sku:"ACC-001", description:"Sculptural arc floor lamp with adjustable arm and linen shade." },
  { name:"Vessel Side Table", category:"Complements", collection:"complements", price:560,   stock:30, sku:"ACC-002", description:"Ceramic and brass side table for living and bedroom settings." },
  { name:"Atlas Wall Art Set", category:"Complements", collection:"complements", price:1200,  stock:15, sku:"ACC-003", description:"Set of 3 abstract canvas prints in earthy tones." },
  { name:"Helix Bookcase", category:"Complements", collection:"complements", price:1850,  stock:10, sku:"ACC-004", description:"Open bookcase with twisted metal frame and walnut shelves." },
  { name:"Mist Diffuser Set", category:"Complements", collection:"complements", price:320,   stock:50, sku:"ACC-005", description:"Ultrasonic aromatherapy diffuser with 10 essential oil blends." },
  // Seating (5)
  { name:"Gravity Lounge Chair", category:"Seating", collection:"complements", price:3800,  stock:8, sku:"SEA-001", description:"Reclining lounge chair with walnut base and leather cushion." },
  { name:"Arca Sofa Three-Seater", category:"Seating", collection:"complements", price:6500,  stock:5, sku:"SEA-002", description:"Contemporary three-seater sofa in boucle fabric with oak legs." },
  { name:"Pebble Accent Chair", category:"Seating", collection:"complements", price:1800,  stock:12, sku:"SEA-003", description:"Round accent chair in velvet with swivel base." },
  { name:"Tower Dining Chair x2", category:"Seating", collection:"kitchens", price:980,   stock:40, sku:"SEA-004", description:"Set of 2 dining chairs in powder-coated steel with upholstered seat." },
  { name:"Float Bean Bag XL", category:"Seating", collection:"complements", price:450,   stock:35, sku:"SEA-005", description:"Extra-large bean bag in waterproof microfiber, indoor/outdoor." },
  // Lighting (3)
  { name:"Luna Pendant Light", category:"Lighting", collection:"complements", price:680,   stock:20, sku:"LGT-001", description:"Hand-blown glass pendant with dimmable LED, suitable for dining tables." },
  { name:"Strip LED System", category:"Lighting", collection:"complements", price:280,   stock:45, sku:"LGT-002", description:"Smart LED strip system, 5m, app-controlled with RGBW colours." },
  { name:"Solar Garden Path Set", category:"Lighting", collection:"outdoor", price:190,   stock:60, sku:"LGT-003", description:"Set of 6 solar-powered pathway lights in stainless steel." },
  // Office (2)
  { name:"Zenith Standing Desk", category:"Office", collection:"complements", price:2200,  stock:15, sku:"OFF-001", description:"Electric height-adjustable desk with memory preset and bamboo top." },
  { name:"Ergon Pro Chair", category:"Office", collection:"complements", price:1450,  stock:18, sku:"OFF-002", description:"Fully adjustable ergonomic chair with mesh back and lumbar support." },
];

// ── Helper functions ──────────────────────────────────────────────────────────
const upsertUser = async (data) => {
  const ex = await User.findOne({ email: data.email });
  if (ex) return ex;
  const payload = { ...data, password: await hash(QA_PASS), status:"active" };
  if (payload.role === "customer") delete payload.department;
  return User.create(payload);
};

const upsertEmployee = async (data) => {
  const ex = await Employee.findOne({ email: data.email });
  if (ex) return ex;
  const emp = new Employee({ ...data, password: QA_PASS, status:"active" });
  emp.password = QA_PASS;
  return emp.save();
};

const upsertProduct = async (data) => {
  const ex = await Product.findOne({ sku: data.sku });
  if (ex) return ex;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  return Product.create({ ...data, slug, status:"active", featured: Math.random() > 0.7 });
};

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

const main = async () => {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB.\n");

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("── Seeding Users ─────────────────────────────────────");
  const users = {};
  for (const u of USER_SEEDS) {
    const doc = await upsertUser(u);
    users[u.role] = users[u.role] || doc;
    users[u.username] = doc;
    console.log(`  ${doc._id ? "✓" : "↻"} ${u.role.padEnd(12)} ${u.email}`);
  }

  // ── Employees ─────────────────────────────────────────────────────────────
  console.log("\n── Seeding Employees ─────────────────────────────────");
  const emps = [];
  for (const e of EMPLOYEE_SEEDS) {
    const doc = await upsertEmployee(e);
    emps.push(doc);
    console.log(`  ✓ ${e.role.padEnd(12)} ${e.email}`);
  }

  // ── Products ──────────────────────────────────────────────────────────────
  console.log("\n── Seeding Products ──────────────────────────────────");
  const products = [];
  for (const p of PRODUCTS) {
    const doc = await upsertProduct(p);
    products.push(doc);
  }
  console.log(`  ✓ ${products.length} products seeded`);

  // ── Orders ────────────────────────────────────────────────────────────────
  console.log("\n── Seeding Orders ────────────────────────────────────");
  const ORDER_STATUSES = ["new","new","confirmed","in_production","in_production","ready","delivered","delivered","delivered","cancelled","new","confirmed","in_production","ready","delivered"];
  let ordersCreated = 0;
  const customerUsers = USER_SEEDS.filter(u => u.role === "customer").map(u => users[u.username]).filter(Boolean);

  for (let i = 0; i < 15; i++) {
    const num = `HJ-QA-${String(i+1).padStart(3,"0")}`;
    if (await Order.findOne({ orderNumber: num })) { console.log(`  ↻ Order ${num}`); continue; }
    const customer = rnd(customerUsers) || users.customer;
    const prod = products[i % products.length];
    await Order.create({
      orderNumber: num,
      customerId: customer?._id,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Test Customer",
      customerEmail: customer?.email || "test@hedj.test",
      items: [{ name: prod.name, quantity: 1, unitPrice: prod.price, total: prod.price, sku: prod.sku }],
      subtotal: prod.price, tax: Math.round(prod.price*0.1), total: Math.round(prod.price*1.1),
      status: ORDER_STATUSES[i],
      paymentStatus: ORDER_STATUSES[i] === "delivered" ? "paid" : "pending",
      deliveryAddress: { line1:`${i+1} QA Street`, city:"London", country:"UK" },
    });
    ordersCreated++;
  }
  console.log(`  ✓ ${ordersCreated} orders seeded`);

  // ── Leads ─────────────────────────────────────────────────────────────────
  console.log("\n── Seeding Leads ─────────────────────────────────────");
  const LEAD_STATUSES = ["new","new","contacted","contacted","qualified","proposal","proposal","won","won","lost","archived","new","contacted","qualified","proposal"];
  const LEAD_NAMES = ["Apex Interiors","Studio Bloom","The Richmond Hotel","Verde Restaurant Group","Bright Homes Ltd","Crestview Apartments","Nordic Living Co","Casa Lux Dubai","Riviera Residences","Pacific Coast Hotels","Amber Design Studio","Greystone Properties","Lumière Hospitality","Atlas Living","Zenith Developments"];
  let leadsCreated = 0;
  for (let i = 0; i < 15; i++) {
    const email = `lead${i+1}@example.com`;
    if (await Lead.findOne({ email })) { continue; }
    await Lead.create({
      name: LEAD_NAMES[i], email, phone: `+44 7700 9000${String(i).padStart(2,"0")}`,
      company: LEAD_NAMES[i], projectType: rnd(["Residential","Commercial","Hospitality","Office"]),
      status: LEAD_STATUSES[i], priority: rnd(["low","medium","high","urgent"]),
      estimatedValue: (i+1) * 8500, source: rnd(["website","referral","instagram","exhibition","direct"]),
      notes: `QA lead #${i+1} — ${LEAD_NAMES[i]} interested in full interior design package.`,
    });
    leadsCreated++;
  }
  console.log(`  ✓ ${leadsCreated} leads seeded`);

  // ── Quotes ────────────────────────────────────────────────────────────────
  console.log("\n── Seeding Quotes ────────────────────────────────────");
  const QUOTE_STATUSES = ["draft","pending","sent","accepted","rejected","expired","converted","cancelled","draft","sent"];
  let quotesCreated = 0;
  for (let i = 0; i < 10; i++) {
    const qn = `QT-QA-${String(i+1).padStart(3,"0")}`;
    if (await Quote.findOne({ quoteNumber: qn })) { continue; }
    const p1 = products[i % products.length];
    const p2 = products[(i+1) % products.length];
    const subtotal = p1.price + p2.price;
    await Quote.create({
      quoteNumber: qn,
      customerName: LEAD_NAMES[i % LEAD_NAMES.length],
      customerEmail: `quote${i+1}@example.com`,
      project: `Interior Design Project ${i+1}`,
      status: QUOTE_STATUSES[i],
      items: [
        { name: p1.name, quantity:1, unitPrice: p1.price, total: p1.price },
        { name: p2.name, quantity:1, unitPrice: p2.price, total: p2.price },
      ],
      subtotal, tax: Math.round(subtotal*0.1), total: Math.round(subtotal*1.1),
      validUntil: new Date(Date.now() + 30*24*60*60*1000),
      notes: `QA quote #${i+1}`,
    });
    quotesCreated++;
  }
  console.log(`  ✓ ${quotesCreated} quotes seeded`);

  // ── Customer Addresses + Wishlist ─────────────────────────────────────────
  console.log("\n── Seeding Customer Addresses ────────────────────────");
  const custUser = users["qa_customer"];
  if (custUser) {
    const existAddr = await Address.findOne({ userId: custUser._id });
    if (!existAddr) {
      await Address.create({ userId: custUser._id, label:"Home", fullName:"Ivy Thornton", line1:"42 Hedgehog Lane", city:"London", country:"UK", postalCode:"SW1A 1AA", isDefaultShipping:true, isDefaultBilling:true });
      await Address.create({ userId: custUser._id, label:"Office", fullName:"Ivy Thornton", line1:"55 Commerce Row", city:"London", country:"UK", postalCode:"EC1V 9BJ" });
      console.log("  ✓ 2 addresses for qa.customer");
    } else { console.log("  ↻ Addresses already exist for qa.customer"); }

    // Wishlist
    if (!custUser.wishlist?.length && products.length >= 3) {
      custUser.wishlist = [products[0]._id, products[5]._id, products[10]._id];
      await custUser.save();
      console.log("  ✓ Wishlist: 3 products added to qa.customer");
    }
  }

  // ── Attendance (10 days) ──────────────────────────────────────────────────
  console.log("\n── Seeding Attendance ────────────────────────────────");
  const today = new Date(); today.setHours(0,0,0,0);
  let attCreated = 0;
  for (const emp of emps.slice(0, 8)) {
    for (let d = 0; d < 10; d++) {
      const date = new Date(today); date.setDate(date.getDate() - d);
      const day = date.getDay();
      if (day === 0 || day === 6) continue; // skip weekends
      try {
        const ci = new Date(date); ci.setHours(d === 3 ? 9 : 8, d === 3 ? 20 : 45, 0, 0);
        const co = new Date(date); co.setHours(17, d % 2 === 0 ? 15 : 30, 0, 0);
        await AttendanceRecord.findOneAndUpdate(
          { employeeId: emp._id, date },
          { $setOnInsert: {
            employeeName:`${emp.fname} ${emp.lname}`, employeeEmail:emp.email,
            department:emp.department, date, clockIn:ci, clockOut:co,
            breakMinutes:30, totalWorkedMinutes: Math.round((co-ci)/60000-30),
            status: d === 3 ? "late" : "present", source:"system",
          }},
          { upsert:true }
        );
        attCreated++;
      } catch {}
    }
  }
  console.log(`  ✓ ${attCreated} attendance records seeded`);

  // ── Leave Requests ────────────────────────────────────────────────────────
  console.log("\n── Seeding Leave Requests ────────────────────────────");
  let leaveCreated = 0;
  const leaveData = [
    { type:"vacation",    startDate:"2026-07-01", endDate:"2026-07-07", reason:"Annual leave",    status:"pending" },
    { type:"sick_leave",  startDate:"2026-05-12", endDate:"2026-05-13", reason:"Flu",             status:"approved" },
    { type:"leave_early", startDate:"2026-05-19", endDate:"2026-05-19", leaveEarlyTime:"14:00",   reason:"Dentist",  status:"approved" },
    { type:"time_off",    startDate:"2026-05-21", endDate:"2026-05-21", hoursRequested:2,          reason:"Errand",   status:"rejected", rejectionReason:"Insufficient notice" },
    { type:"remote_day",  startDate:"2026-06-01", endDate:"2026-06-01", reason:"Focus work",      status:"pending" },
    { type:"vacation",    startDate:"2026-08-10", endDate:"2026-08-17", reason:"Summer holiday",  status:"escalated" },
  ];
  for (let i = 0; i < Math.min(leaveData.length, emps.length); i++) {
    const emp = emps[i];
    const ld = leaveData[i];
    const exists = await LeaveRequest.findOne({ employeeId: emp._id, type: ld.type, startDate: new Date(ld.startDate) });
    if (exists) continue;
    await LeaveRequest.create({
      ...ld, employeeId: emp._id,
      employeeName:`${emp.fname} ${emp.lname}`, employeeEmail:emp.email,
      department:emp.department, startDate:new Date(ld.startDate), endDate:new Date(ld.endDate),
    });
    leaveCreated++;
  }
  console.log(`  ✓ ${leaveCreated} leave requests seeded`);

  // ── Approval Requests ─────────────────────────────────────────────────────
  console.log("\n── Seeding Approvals ─────────────────────────────────");
  let appsCreated = 0;
  const approvalData = [
    { requestType:"Leave Request",   priority:"high",   description:"Vacation approval for Q3", status:"pending" },
    { requestType:"Purchase Approval",priority:"medium", description:"Office furniture for new hires", status:"approved" },
    { requestType:"Module Access",   priority:"low",    description:"Designer requesting analytics access", status:"pending" },
    { requestType:"Expense Claim",   priority:"medium", description:"Travel expenses — design fair Berlin", status:"rejected" },
    { requestType:"Leave Request",   priority:"urgent", description:"Emergency medical leave extension", status:"escalated" },
  ];
  for (let i = 0; i < approvalData.length; i++) {
    const emp = emps[i % emps.length];
    const exists = await ApprovalRequest.findOne({ employeeName:`${emp.fname} ${emp.lname}`, requestType:approvalData[i].requestType });
    if (exists) continue;
    await ApprovalRequest.create({
      ...approvalData[i], employeeId: emp._id,
      employeeName:`${emp.fname} ${emp.lname}`, department:emp.department,
      currentApproverName: emps[0].fname + " " + emps[0].lname,
      currentApproverId: emps[0]._id,
    });
    appsCreated++;
  }
  console.log(`  ✓ ${appsCreated} approval requests seeded`);

  // ── ERP Apps ──────────────────────────────────────────────────────────────
  console.log("\n── Seeding ERP Apps ──────────────────────────────────");
  const erpApps = [
    { name:"Inventory Manager", slug:"inventory-manager", layer:"primary",   icon:"inventory", purpose:"Real-time stock tracking across all warehouses.", status:"active" },
    { name:"HR Hub",            slug:"hr-hub",            layer:"primary",   icon:"groups",    purpose:"Employee management, attendance, and leave.",     status:"active" },
    { name:"Finance Suite",     slug:"finance-suite",     layer:"primary",   icon:"payments",  purpose:"Invoicing, quotes, P&L reporting.",               status:"active" },
    { name:"CRM Module",        slug:"crm-module",        layer:"secondary", icon:"contacts",  purpose:"Lead and customer relationship management.",       status:"active" },
    { name:"Analytics Engine",  slug:"analytics-engine",  layer:"secondary", icon:"analytics", purpose:"Business intelligence and reporting dashboard.",   status:"active" },
    { name:"Design Studio",     slug:"design-studio",     layer:"optional",  icon:"palette",   purpose:"Project tracking and design asset management.",    status:"planned" },
  ];
  let erpCreated = 0;
  for (const app of erpApps) {
    const ex = await ERPApp.findOne({ slug: app.slug });
    if (!ex) { await ERPApp.create(app); erpCreated++; }
  }
  console.log(`  ✓ ${erpCreated} ERP apps seeded`);

  // ── Departments ───────────────────────────────────────────────────────────
  const DEPT_DATA = [
    { name:"Design",           code:"DSG" },
    { name:"Fulfillment",      code:"FUL" },
    { name:"Human Resources",  code:"HR"  },
    { name:"Finance",          code:"FIN" },
    { name:"Sales",            code:"SAL" },
    { name:"Management",       code:"MGT" },
    { name:"Operations",       code:"OPS" },
    { name:"Warehouse",        code:"WHS" },
  ];
  let deptsCreated = 0;
  for (const d of DEPT_DATA) {
    const ex = await Department.findOne({ code: d.code }).catch(() => null);
    if (!ex) {
      try { await Department.create({ ...d, description:`${d.name} department.` }); deptsCreated++; } catch {}
    }
  }
  if (deptsCreated) console.log(`  ✓ ${deptsCreated} departments seeded`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("Seed complete. All QA accounts password: 12345678\n");
  console.log("┌──────────────┬──────────────────────────────────┬──────────────────────────────────────────┐");
  console.log("│ Role         │ Email                            │ Expected Landing                         │");
  console.log("├──────────────┼──────────────────────────────────┼──────────────────────────────────────────┤");
  const rows = [
    ["super_admin",  "qa.superadmin@hedj.test",  "/admin/dashboard (full access)"],
    ["admin",        "qa.admin@hedj.test",        "/admin/dashboard (full access)"],
    ["manager",      "qa.manager@hedj.test",      "/admin/dashboard (limited nav)"],
    ["HR",           "qa.hr@hedj.test",           "/admin/dashboard (HR nav)"],
    ["accountant",   "qa.accountant@hedj.test",   "/admin/dashboard (finance nav)"],
    ["operations",   "qa.operations@hedj.test",   "/admin/dashboard (ops nav)"],
    ["designer",     "qa.designer@hedj.test",     "/admin/dashboard (design nav)"],
    ["employee",     "qa.employee@hedj.test",     "/admin/dashboard (self-service only)"],
    ["customer",     "qa.customer@hedj.test",     "/dashboard (customer dashboard)"],
  ];
  rows.forEach(([r,e,l]) => console.log(`│ ${r.padEnd(12)} │ ${e.padEnd(32)} │ ${l.padEnd(40)} │`));
  console.log("└──────────────┴──────────────────────────────────┴──────────────────────────────────────────┘");

  await mongoose.disconnect();
  process.exit(0);
};

main().catch(err => { console.error(err); process.exit(1); });
