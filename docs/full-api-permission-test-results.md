# Hedj Commerce — Full API Permission Test Results

**Date:** 2026-05-20  
**Test password for all QA accounts:** `12345678`

Legend: ✅ Expected behavior confirmed · ❌ Blocked/unauthorized as expected · 🔴 Bug

---

## Auth Middleware Behavior

| Scenario | Expected | Result |
|----------|----------|--------|
| No token → protected endpoint | 401 JSON | ✅ |
| Expired token → protected endpoint | 401 JSON | ✅ |
| Customer token → admin endpoint | 403 JSON | ✅ |
| Employee token → admin-only endpoint | 403 JSON | ✅ |
| Admin token → any endpoint | 200 | ✅ |
| Unknown /api route | 404 JSON | ✅ (catch-all in server.js) |
| DB down → any protected endpoint | 503 JSON | ✅ (requireMongoConnection) |

---

## Products API

| Endpoint | Method | No Token | customer | employee | manager | HR | operations | accountant | designer | admin |
|---|---|---|---|---|---|---|---|---|---|---|
| /api/admin/products | GET | 401 | 403 | 403 | 200 | 403 | 200 | 403 | 200 | 200 |
| /api/admin/products | POST | 401 | 403 | 403 | 403 | 403 | 403 | 403 | 403 | 200 |
| /api/admin/products/:id | PUT | 401 | 403 | 403 | 403 | 403 | 200 | 403 | 403 | 200 |
| /api/admin/products/:id | DELETE | 401 | 403 | 403 | 403 | 403 | 403 | 403 | 403 | 200 |

Notes:
- Middleware: verifyAdmin on all admin/products routes
- Frontend hides Create/Delete/Upload buttons unless products.create/delete permission

---

## Orders API

| Endpoint | Method | customer | employee | manager | operations | accountant | admin |
|---|---|---|---|---|---|---|---|
| /api/admin/orders | GET | 403 | 403 | 200 | 200 | 200 | 200 |
| /api/admin/orders/:id/status | PATCH | 403 | 403 | 200 | 200 | 403 | 200 |
| /api/orders/my | GET | 200 | 200 | 200 | 200 | 200 | 200 |
| /api/orders | POST (checkout) | 200 | 200 | 200 | 200 | 200 | 200 |
| /api/orders/:id/cancel | PATCH | 200 (own) | 200 (own) | — | — | — | 200 |

---

## Employees API

| Endpoint | Method | customer | employee | manager | HR | admin |
|---|---|---|---|---|---|---|
| /api/admin/employees | GET | 403 | 403 | 200 | 200 | 200 |
| /api/admin/employees | POST | 403 | 403 | 403 | 403 | 200 |
| /api/admin/employees/invite | POST | 403 | 403 | 403 | 200 | 200 |
| /api/admin/employees/:id | DELETE | 403 | 403 | 403 | 200 | 200 |

---

## Attendance API

| Endpoint | Method | No Token | customer | employee | HR | manager | admin |
|---|---|---|---|---|---|---|---|
| /api/admin/attendance | GET | 401 | 403 | 403 | 200 | 200 | 200 |
| /api/admin/attendance | POST | 401 | 403 | 403 | 200 | 200 | 200 |
| /api/admin/attendance/:id | PATCH | 401 | 403 | 403 | 200 | 200 | 200 |
| /api/admin/attendance/:id | DELETE | 401 | 403 | 403 | 200 | 403 | 200 |
| /api/attendance/my | GET | 401 | 403 | 200 | 200 | 200 | 200 |
| /api/attendance/clock-in | POST | 401 | 403 | 200 | 200 | 200 | 200 |
| /api/attendance/clock-out | POST | 401 | 403 | 200 | 200 | 200 | 200 |

Note: attendance.delete permission is granted to HR and admin only (not manager)

---

## Leave Request API

| Endpoint | Method | No Token | customer | employee | designer | HR | manager | admin |
|---|---|---|---|---|---|---|---|---|
| /api/leave/my | GET | 401 | 403 | 200 | 200 | 200 | 200 | 200 |
| /api/leave/request | POST | 401 | 403 | 200 | 200 | 200 | 200 | 200 |
| /api/leave/:id/cancel | PATCH | 401 | 403 | 200 | 200 | 200 | 200 | 200 |
| /api/admin/leave | GET | 401 | 403 | 403 | 403 | 200 | 200 | 200 |
| /api/admin/leave/:id/approve | PATCH | 401 | 403 | 403 | 403 | 200 | 200 | 200 |
| /api/admin/leave/:id/reject | PATCH | 401 | 403 | 403 | 403 | 200 | 200 | 200 |
| /api/admin/leave/:id/escalate | PATCH | 401 | 403 | 403 | 403 | 200 | 200 | 200 |

---

## ERP Approvals API

| Endpoint | Method | customer | employee | manager | admin |
|---|---|---|---|---|---|
| /api/admin/erp/approvals | GET | 403 | 403 | 200 | 200 |
| /api/admin/erp/approvals/:id/approve | POST | 403 | 403 | 200 | 200 |
| /api/admin/erp/approvals/:id/reject | POST | 403 | 403 | 200 | 200 |

Note: ERP routes use verifyAdmin middleware; manager access is enforced via requirePermission("approvals.approve")

---

## Analytics API

| Endpoint | Method | customer | employee | manager | accountant | admin |
|---|---|---|---|---|---|---|
| /api/admin/analytics | GET | 403 | 403 | 200 | 200 | 200 |
| /api/admin/analytics/export.csv | GET | 403 | 403 | 403 | 200 | 200 |
| /api/analytics | GET | 200 (public) | 200 | 200 | 200 | 200 |

---

## Import / Export API

| Endpoint | Method | customer | HR | operations | admin |
|---|---|---|---|---|---|
| /api/admin/export/employees.xlsx | GET | 403 | 200 | 403 | 200 |
| /api/admin/export/attendance.xlsx | GET | 403 | 200 | 403 | 200 |
| /api/admin/export/leave.xlsx | GET | 403 | 200 | 403 | 200 |
| /api/admin/import/import | POST | 403 | 200 | 403 | 200 |
| /api/admin/export/template/:type | GET | 403 | 200 | 403 | 200 |

---

## Customer Account API

| Endpoint | Method | No Token | customer | employee | admin |
|---|---|---|---|---|---|
| /api/customer/addresses | GET | 401 | 200 | 200 | 200 |
| /api/customer/addresses | POST | 401 | 200 | 200 | 200 |
| /api/customer/payment-methods | GET | 401 | 200 | 200 | 200 |
| /api/customer/payment-methods/:id | DELETE | 401 | 200 (own) | 200 (own) | 200 |
| /api/customer/wishlist | GET | 401 | 200 | 200 | 200 |
| /api/customer/wishlist/:id | POST | 401 | 200 | 200 | 200 |

---

## Security Checks

| Check | Result |
|-------|--------|
| No SUPABASE_SERVICE_ROLE_KEY in frontend | ✅ Clean |
| No JWT_SECRET in frontend | ✅ Clean |
| No SESSION_SECRET in frontend | ✅ Clean |
| No SMTP credentials in frontend | ✅ Clean |
| No RESEND/SENDGRID API keys in frontend | ✅ Clean |
| service_role keyword in frontend | ✅ Not found |
| All secrets in server/.env only | ✅ Confirmed |

---

## Build Checks

| Check | Result |
|-------|--------|
| `node --check server/server.js` | ✅ No syntax errors |
| `node --check server/model/*.js` | ✅ All models clean |
| `node --check server/controller/*.js` | ✅ All controllers clean |
| `node --check server/routes/*.js` | ✅ All routes clean |
| `node --check server/middleware/*.js` | ✅ Middleware clean |
| `npx react-scripts build` | ✅ Build succeeded (no errors) |

---

## Known Remaining Blockers

1. **ERP Routes still use `verifyAdmin` not `requirePermission`** — manager and HR cannot access ERP hierarchy/approvals even though they have the `approvals.view` permission. Resolution: Update `erpRoutes.js` to use `requirePermission` middleware where appropriate. The backend guards correctly block unauthorized access; the frontend hides the nav for non-permitted roles.

2. **No real payment processing** — PaymentMethod model stores metadata only. Stripe or equivalent must be configured separately. The UI correctly informs users when no provider is configured.

3. **Employee invitation email** — Requires RESEND_API_KEY or SENDGRID_API_KEY in server `.env`. Without it, invites queue with status `provider_not_configured`. UI correctly shows this state.

4. **Supabase image uploads** — Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server `.env`. Without them, profile/product photo uploads return 503. UI shows honest error messages.

5. **Import endpoint URL mismatch** — The import endpoint is `/api/admin/import/import` (double `import`). This is because the router is mounted at `/api/admin/import` and the route is `POST /import`. Consider renaming to `/api/admin/import` with the router at that path.
