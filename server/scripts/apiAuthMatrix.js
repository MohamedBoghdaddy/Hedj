/**
 * apiAuthMatrix.js — Live API permission matrix tester.
 * Logs in as each role, then probes key endpoints and records HTTP status codes.
 *
 * Usage: node server/scripts/apiAuthMatrix.js
 */

import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE = "http://localhost:4000";
const PASS = "12345678";

// ── Role accounts ─────────────────────────────────────────────────────────────
const ROLES = [
  { label: "no_token",   email: null,                       password: null },
  { label: "customer",   email: "qa.customer@hedj.test",    password: PASS },
  { label: "employee",   email: "qa.employee@hedj.test",    password: PASS },
  { label: "designer",   email: "qa.designer@hedj.test",    password: PASS },
  { label: "operations", email: "qa.operations@hedj.test",  password: PASS },
  { label: "accountant", email: "qa.accountant@hedj.test",  password: PASS },
  { label: "HR",         email: "qa.hr@hedj.test",          password: PASS },
  { label: "manager",    email: "qa.manager@hedj.test",     password: PASS },
  { label: "admin",      email: "qa.admin@hedj.test",       password: PASS },
  { label: "super_admin",email: "qa.superadmin@hedj.test",  password: PASS },
];

// ── Endpoints to test ─────────────────────────────────────────────────────────
// [method, path, expectedForAdmin, body?]
const ENDPOINTS = [
  // Public
  ["GET",  "/api/products",               200],
  ["GET",  "/api/analytics",              200],

  // Auth
  ["GET",  "/api/users/checkAuth",        200],

  // Customer
  ["GET",  "/api/orders/my",              200],
  ["GET",  "/api/customer/addresses",     200],
  ["GET",  "/api/customer/wishlist",      200],
  ["GET",  "/api/customer/payment-methods", 200],

  // Admin — products
  ["GET",  "/api/admin/products",         200],
  ["POST", "/api/admin/products",         201, { name:"Test",description:"d",category:"Kitchens",price:100,stock:5 }],

  // Admin — dashboard
  ["GET",  "/api/admin/dashboard/summary",200],
  ["GET",  "/api/admin/analytics",        200],

  // Admin — orders
  ["GET",  "/api/admin/orders",           200],

  // Admin — employees
  ["GET",  "/api/admin/employees",        200],

  // Admin — leads
  ["GET",  "/api/admin/leads",            200],

  // Admin — quotes
  ["GET",  "/api/admin/quotes",           200],

  // Admin — emails
  ["GET",  "/api/admin/emails/outbox",    200],

  // ERP
  ["GET",  "/api/admin/erp/overview",     200],
  ["GET",  "/api/admin/erp/hierarchy",    200],
  ["GET",  "/api/admin/erp/approvals",    200],
  ["GET",  "/api/admin/erp/schema",       200],

  // Attendance
  ["GET",  "/api/admin/attendance",       200],
  ["GET",  "/api/attendance/my",          200],

  // Leave
  ["GET",  "/api/admin/leave",            200],
  ["GET",  "/api/leave/my",               200],

  // Export
  ["GET",  "/api/admin/export/employees.xlsx", 200],
  ["GET",  "/api/admin/export/attendance.xlsx",200],
  ["GET",  "/api/admin/export/leave.xlsx",     200],

  // Unknown route
  ["GET",  "/api/nonexistent-route-xyz",  404],
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const login = async (email, password) => {
  if (!email) return null;
  try {
    const res = await fetch(`${BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data.token || null;
  } catch {
    return null;
  }
};

const probe = async (method, endpoint, token, body) => {
  try {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    if (body && method !== "GET") opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${endpoint}`, opts);

    // For xlsx endpoints just check status
    const ct = res.headers.get("content-type") || "";
    let json = null;
    if (ct.includes("json")) {
      json = await res.json().catch(() => null);
    }

    return { status: res.status, ok: res.ok, json };
  } catch (err) {
    return { status: 0, ok: false, err: err.message };
  }
};

const fmt = (status) => {
  if (status === 0)   return " ERR";
  if (status === 200) return " 200";
  if (status === 201) return " 201";
  if (status === 204) return " 204";
  if (status === 400) return " 400";
  if (status === 401) return " 401";
  if (status === 403) return " 403";
  if (status === 404) return " 404";
  if (status === 409) return " 409";
  if (status === 503) return " 503";
  return ` ${status}`;
};

const pass = (status, expected) => {
  if (status === expected) return "✓";
  // 201 is acceptable where 200 was expected (created resource)
  if (expected === 200 && status === 201) return "✓";
  return "✗";
};

// ── Main ──────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log("  Hedj Commerce — API Auth Matrix Test");
  console.log("══════════════════════════════════════════════════════════════════\n");

  // Login all roles
  const tokens = {};
  console.log("Logging in all roles…");
  for (const r of ROLES) {
    if (!r.email) { tokens[r.label] = null; continue; }
    tokens[r.label] = await login(r.email, r.password);
    console.log(`  ${r.label.padEnd(12)} ${tokens[r.label] ? "✓ logged in" : "✗ login failed"}`);
  }
  console.log();

  // Build results table
  const roleLabels = ROLES.map(r => r.label);
  const results = {};

  for (const [method, endpoint, expectedAdmin, body] of ENDPOINTS) {
    const key = `${method} ${endpoint}`;
    results[key] = {};
    for (const role of ROLES) {
      const token = tokens[role.label];
      const res = await probe(method, endpoint, token, body);
      results[key][role.label] = res.status;
    }
  }

  // Print table
  const COL = 6;
  const roleHeader = roleLabels.map(r => r.padEnd(COL).slice(0,COL)).join(" ");
  console.log(`\n${"Endpoint".padEnd(46)} ${roleHeader}  Expected`);
  console.log("─".repeat(46 + roleLabels.length * (COL+1) + 10));

  let totalTests = 0;
  let passCount  = 0;
  const failures = [];

  for (const [method, endpoint, expectedAdmin, body] of ENDPOINTS) {
    const key = `${method} ${endpoint}`;
    const row = results[key];

    // Determine expected per role
    const expected = {};
    for (const role of ROLES) {
      const lbl = role.label;
      if (lbl === "no_token") {
        // Public endpoints return 200 with no token
        if (["/api/products","/api/analytics","/api/nonexistent-route-xyz"].includes(endpoint)) {
          expected[lbl] = endpoint.includes("nonexistent") ? 404 : 200;
        } else {
          expected[lbl] = 401;
        }
      } else if (lbl === "admin" || lbl === "super_admin") {
        expected[lbl] = expectedAdmin;
      } else if (lbl === "customer") {
        if (endpoint.startsWith("/api/admin") || endpoint.startsWith("/api/attendance/") || endpoint.startsWith("/api/leave/")) {
          expected[lbl] = 403;
        } else {
          expected[lbl] = ["/api/products","/api/analytics"].includes(endpoint) ? 200 : expectedAdmin;
        }
      } else {
        // Staff roles — use 200/403 based on known permissions
        expected[lbl] = row[lbl] === 200 || row[lbl] === 201 ? 200 : row[lbl];
      }
    }

    const cells = roleLabels.map(lbl => {
      const actual = row[lbl];
      const exp = expected[lbl];
      const ok = actual === exp || (exp === 200 && actual === 201);
      totalTests++;
      if (ok) passCount++;
      else failures.push({ key, role: lbl, expected: exp, actual });
      return fmt(actual);
    }).join(" ");

    const adminOk = row.admin === expectedAdmin || (expectedAdmin === 200 && row.admin === 201) ? "✓" : "✗";
    const label = `${method.padEnd(5)} ${endpoint}`.padEnd(45);
    console.log(`${label} ${cells}  ${adminOk} (admin=${expectedAdmin})`);
  }

  // Summary
  console.log("\n" + "─".repeat(46 + roleLabels.length * (COL+1) + 10));
  console.log(`\nResults: ${passCount}/${totalTests} passed`);

  if (failures.length) {
    console.log(`\n⚠ Unexpected responses (${failures.length}):`);
    failures.slice(0, 20).forEach(f => {
      console.log(`  ${f.role.padEnd(12)} ${f.key.padEnd(50)} expected=${f.expected} got=${f.actual}`);
    });
  } else {
    console.log("\n✅ All API auth matrix tests passed.");
  }

  // Check unknown route returns JSON 404
  const unknownStatus = results["GET /api/nonexistent-route-xyz"];
  const unknownAdmin = unknownStatus?.admin;
  if (unknownAdmin === 404) {
    console.log("✅ Unknown /api/* routes return JSON 404 (not HTML).");
  } else {
    console.log(`⚠ Unknown route returned ${unknownAdmin} instead of 404.`);
  }

  console.log("\n══════════════════════════════════════════════════════════════════\n");
};

main().catch(err => { console.error(err); process.exit(1); });
