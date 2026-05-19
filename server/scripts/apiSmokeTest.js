/**
 * Hedj Commerce — API Smoke Test
 * Usage: node server/scripts/apiSmokeTest.js [base_url]
 *
 * Tests all key endpoints and prints a pass/fail table.
 * Exits with code 1 if any critical test fails.
 */

const BASE = process.argv[2] || "http://localhost:4000";

let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

async function req(method, path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) };
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data;
    const ct = res.headers.get("content-type") || "";
    try { data = ct.includes("json") ? await res.json() : await res.text(); } catch { data = null; }
    return { status: res.status, data, isJson: ct.includes("json") };
  } catch (err) {
    return { status: 0, data: null, isJson: false, error: err.message };
  }
}

function test(label, { status, data, isJson, error }, expectStatus, expectJson = true, critical = false) {
  const statusOk = status === expectStatus;
  const jsonOk = !expectJson || isJson;
  const pass = statusOk && jsonOk && !error;
  const result = pass ? "✅ PASS" : critical ? "❌ FAIL" : "⚠️  WARN";
  if (pass) passed++; else if (critical) failed++; else skipped++;
  const note = error ? error : (!statusOk ? `got ${status}` : !jsonOk ? "HTML response (not JSON)" : "");
  results.push({ result, label, expected: expectStatus, actual: status, note });
  console.log(`${result}  [${String(expectStatus).padEnd(3)}] ${label}${note ? "  — " + note : ""}`);
  return { pass, data };
}

async function run() {
  console.log(`\n🧪  Hedj API Smoke Test — ${BASE}\n${"─".repeat(60)}`);

  // ── Health ──────────────────────────────────────────────────
  console.log("\n📌  HEALTH");
  const root = await req("GET", "/");
  test("GET /  (root health)", root, 200, true, true);

  const health = await req("GET", "/api/health");
  test("GET /api/health", health, 200, true, true);

  // ── Products (demo store — no auth needed) ──────────────────
  console.log("\n📌  PRODUCTS (demo)");
  const products = await req("GET", "/api/products");
  const prodTest = test("GET /api/products", products, 200, true, true);

  const prodById = await req("GET", "/api/products/obsidian-kitchen-island");
  test("GET /api/products/:id (demo slug)", prodById, 200, true, true);

  const prodSlug = await req("GET", "/api/products/slug/obsidian-kitchen-island");
  test("GET /api/products/slug/:slug", prodSlug, 200, true, true);

  const prodCollection = await req("GET", "/api/products?collection=Kitchens");
  test("GET /api/products?collection=Kitchens", prodCollection, 200, true, true);

  const lowStock = await req("GET", "/api/products/low-stock");
  test("GET /api/products/low-stock", lowStock, 200, true, false);

  const prod404 = await req("GET", "/api/products/nonexistent-slug-xyz");
  test("GET /api/products/:id  (404 → JSON)", prod404, 404, true, true);

  // ── Collections ─────────────────────────────────────────────
  console.log("\n📌  COLLECTIONS (demo)");
  const collections = await req("GET", "/api/collections");
  test("GET /api/collections", collections, 200, true, true);

  const collBySlug = await req("GET", "/api/collections/Kitchens");
  test("GET /api/collections/:slug", collBySlug, 200, true, false);

  // ── Cart (session-based) ────────────────────────────────────
  console.log("\n📌  CART (session)");
  const cartGet = await req("GET", "/api/cart");
  test("GET /api/cart", cartGet, 200, true, false);

  const cartAdd = await req("POST", "/api/cart/items", {
    body: { id: "obsidian-kitchen-island", name: "The Obsidian Kitchen Island", price: 12450, quantity: 1 },
  });
  test("POST /api/cart/items (add item)", cartAdd, 200, true, false);

  // ── Checkout ─────────────────────────────────────────────────
  console.log("\n📌  CHECKOUT (demo)");
  const checkout = await req("POST", "/api/checkout", {
    body: {
      customer: { firstName: "Customer", lastName: "Tester", email: "customer.tester+hedj@example.com", phone: "+201000000000" },
      items: [{ id: "obsidian-kitchen-island", name: "The Obsidian Kitchen Island", price: 12450, quantity: 1 }],
      totals: { subtotal: 12450, install: 450, tax: 1021, total: 13921 },
    },
  });
  const checkoutRes = test("POST /api/checkout", checkout, 201, true, true);
  const newOrderId = checkoutRes.data?.order?.id;

  // ── Admin (demo, no auth) ─────────────────────────────────────
  console.log("\n📌  ADMIN (demo)");
  const adminDash = await req("GET", "/api/admin/dashboard");
  test("GET /api/admin/dashboard (demo)", adminDash, 200, true, false);

  const adminOrders = await req("GET", "/api/admin/orders");
  test("GET /api/admin/orders (demo)", adminOrders, 200, true, false);

  if (newOrderId) {
    const orderById = await req("GET", `/api/admin/orders/${newOrderId}`);
    test("GET /api/admin/orders/:id (just created)", orderById, 200, true, false);

    const statusUpdate = await req("PATCH", `/api/admin/orders/${newOrderId}/status`, {
      body: { status: "confirmed" },
    });
    test("PATCH /api/admin/orders/:id/status", statusUpdate, 200, true, false);
  }

  const adminCustomers = await req("GET", "/api/admin/customers");
  test("GET /api/admin/customers (demo)", adminCustomers, 200, true, false);

  const adminLeads = await req("GET", "/api/admin/leads");
  test("GET /api/admin/leads (demo)", adminLeads, 200, true, false);

  const adminQuotes = await req("GET", "/api/admin/quotes");
  test("GET /api/admin/quotes (demo)", adminQuotes, 200, true, false);

  const adminEmployees = await req("GET", "/api/admin/employees");
  test("GET /api/admin/employees (demo)", adminEmployees, 200, true, false);

  const analytics = await req("GET", "/api/analytics");
  test("GET /api/analytics", analytics, 200, true, false);

  // ── Auth (MongoDB required) ──────────────────────────────────
  console.log("\n📌  AUTH (requires MongoDB)");
  const loginBadPass = await req("POST", "/api/users/login", {
    body: { email: "notexist@example.com", password: "wrongpass" },
  });
  if (loginBadPass.status === 503) {
    console.log("⚠️  SKIP  MongoDB unavailable — auth tests skipped");
    skipped += 5;
    results.push({ result: "⚠️  SKIP", label: "AUTH (MongoDB unavailable)", note: "Run seed script when DB is connected" });
  } else {
    test("POST /api/users/login (wrong creds → 401)", loginBadPass, 401, true, true);

    const loginNoBody = await req("POST", "/api/users/login", { body: {} });
    test("POST /api/users/login (empty body → 400)", loginNoBody, 400, true, true);

    const signupTest = await req("POST", "/api/users/signup", {
      body: {
        username: `smoke_${Date.now()}`,
        email: `smoke_${Date.now()}@example.com`,
        password: "SmokeTest123!",
        firstName: "Smoke",
        lastName: "Test",
        gender: "prefer-not-to-say",
      },
    });
    const signupResult = test("POST /api/users/signup (new user)", signupTest, 201, true, true);
    const smokeToken = signupResult.data?.token;

    if (smokeToken) {
      const checkAuth = await req("GET", "/api/users/checkAuth", { token: smokeToken });
      test("GET /api/users/checkAuth (valid token)", checkAuth, 200, true, true);

      const getUser = await req("GET", `/api/users/${signupResult.data?.user?._id}`, { token: smokeToken });
      test("GET /api/users/:id (own user)", getUser, 200, true, true);
    }
  }

  // ── ERP (demo, no auth) ──────────────────────────────────────
  console.log("\n📌  ERP (demo)");
  const erpApps = await req("GET", "/api/erp/apps");
  test("GET /api/erp/apps (demo)", erpApps, 200, true, false);

  const erpDepts = await req("GET", "/api/erp/departments");
  test("GET /api/erp/departments (demo)", erpDepts, 200, true, false);

  const erpEmps = await req("GET", "/api/erp/employees");
  test("GET /api/erp/employees (demo)", erpEmps, 200, true, false);

  const erpHier = await req("GET", "/api/erp/employees/hierarchy");
  test("GET /api/erp/employees/hierarchy (demo)", erpHier, 200, true, false);

  const erpApprovals = await req("GET", "/api/erp/approval-requests");
  test("GET /api/erp/approval-requests (demo)", erpApprovals, 200, true, false);

  const erpSchema = await req("GET", "/api/erp/schema");
  test("GET /api/erp/schema (static)", erpSchema, 200, true, false);

  // ── Unknown API → JSON 404 (not HTML) ───────────────────────
  console.log("\n📌  ERROR HANDLING");
  const unknownApi = await req("GET", "/api/this-route-does-not-exist");
  test("GET /api/unknown (→ JSON 404, not HTML)", unknownApi, 404, true, true);

  // ── Summary ───────────────────────────────────────────────────
  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅ PASSED: ${passed}  ❌ FAILED: ${failed}  ⚠️  WARN/SKIP: ${skipped}`);
  console.log(`Total: ${passed + failed + skipped}\n`);

  if (failed > 0) {
    console.log("Critical failures:");
    results.filter((r) => r.result.includes("FAIL")).forEach((r) => console.log(`  ❌  ${r.label}: ${r.note}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("❌  Smoke test runner crashed:", err.message);
  process.exit(1);
});
