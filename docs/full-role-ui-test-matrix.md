# Hedj Commerce — Full Role UI Test Matrix

**Date:** 2026-05-20  
**QA Password for all test accounts:** `12345678`

---

## Role → Default Redirect

| Role | Login Redirect | Shell |
|------|---------------|-------|
| customer | /dashboard (CustomerDashboard) | PublicCommerceShell |
| employee | /admin/dashboard | AdminShell (limited nav) |
| designer | /admin/dashboard | AdminShell (limited nav) |
| operations | /admin/dashboard | AdminShell (limited nav) |
| HR | /admin/dashboard | AdminShell (limited nav) |
| accountant | /admin/dashboard | AdminShell (limited nav) |
| manager | /admin/dashboard | AdminShell (full staff nav) |
| admin | /admin/dashboard | AdminShell (all nav items) |
| super_admin | /admin/dashboard | AdminShell (all nav items) |

---

## Sidebar Nav Visibility by Role

| Nav Item | admin | manager | HR | accountant | operations | designer | employee | customer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Overview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Orders | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Products | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Customers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Employees | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Leads | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Quotes | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Leave Requests | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Email Outbox | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ERP Architecture | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Page-by-Page: Visible Buttons & Actions

### /admin/dashboard
| Button/Action | admin | manager | HR | accountant | operations | designer | employee |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View KPI cards | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View recent orders | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

### /admin/orders
| Button/Action | admin | manager | operations | others |
|---|:---:|:---:|:---:|:---:|
| View pipeline | ✅ | ✅ | ✅ | ❌ |
| Advance order status | ✅ | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ❌ | ❌ | ❌ |

### /admin/products
| Button/Action | admin | operations | designer | others |
|---|:---:|:---:|:---:|:---:|
| View product list | ✅ | ✅ | ✅ | ❌ |
| Add Product button | ✅ | ❌ | ❌ | ❌ |
| Edit Product button | ✅ | ✅ | ❌ | ❌ |
| Delete/Archive button | ✅ | ❌ | ❌ | ❌ |
| Upload image | ✅ | ❌ | ❌ | ❌ |
| Export Excel | ✅ | ✅ | ❌ | ❌ |
| Import Excel | ✅ | ❌ | ❌ | ❌ |

### /admin/employees
| Button/Action | admin | HR | manager | others |
|---|:---:|:---:|:---:|:---:|
| View employee list | ✅ | ✅ | ✅ | ❌ |
| Invite New Employee | ✅ | ✅ | ❌ | ❌ |
| Archive employee | ✅ | ✅ | ❌ | ❌ |
| Export Excel | ✅ | ✅ | ❌ | ❌ |
| Upload photo | ✅ | ✅ | ❌ | ❌ |

### /admin/attendance
| Button/Action | admin | HR | manager | others |
|---|:---:|:---:|:---:|:---:|
| View all records | ✅ | ✅ | ✅ | ❌ |
| Add Record | ✅ | ✅ | ✅ | ❌ |
| Edit Record | ✅ | ✅ | ✅ | ❌ |
| Delete Record | ✅ | ✅ | ❌ | ❌ |
| Export Excel | ✅ | ✅ | ✅ | ❌ |
| Import Excel | ✅ | ✅ | ❌ | ❌ |

### /admin/leave
| Button/Action | admin | HR | manager | others |
|---|:---:|:---:|:---:|:---:|
| View all requests | ✅ | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ✅ | ❌ |
| Reject | ✅ | ✅ | ✅ | ❌ |
| Escalate | ✅ | ✅ | ✅ | ❌ |
| Export Excel | ✅ | ✅ | ✅ | ❌ |

### /admin/analytics
| Button/Action | admin | manager | accountant | others |
|---|:---:|:---:|:---:|:---:|
| View charts | ✅ | ✅ | ✅ | ❌ |
| Export CSV | ✅ | ❌ | ✅ | ❌ |

### /admin/erp/approvals
| Button/Action | admin | manager | others |
|---|:---:|:---:|:---:|
| View requests | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ❌ |
| Reject | ✅ | ✅ | ❌ |

### /admin/settings
| Action | admin | all others |
|---|:---:|:---:|
| Access page | ✅ | ❌ (redirect to /admin/dashboard) |

### /dashboard (CustomerDashboard)
| Button/Action | customer | All staff roles |
|---|:---:|:---:|
| View own orders | ✅ | ✅ (if authenticated) |
| Order View Details link | ✅ | ✅ |
| Address Book CRUD | ✅ | ✅ |
| Remove Payment Method | ✅ | ✅ |
| Upload Profile Photo | ✅ | ✅ |
| Save Profile (real API) | ✅ | ✅ |
| Wishlist | ✅ | ✅ |
| Logout | ✅ | ✅ |

---

## Actions Fixed in This QA Pass

| Page | Action | Was | Fixed To |
|---|---|---|---|
| CustomerDashboard | Save Profile | Toast "saved locally" (fake) | PUT /api/users/:id (real) |
| CustomerDashboard | Remove Payment Method | Toast "contact support" (stub) | DELETE /api/customer/payment-methods/:id (real) |
| CustomerDashboard | Order "View Details" | Toast with order number (stub) | Link to /dashboard?order=:id |
| AdminShell | Profile display | Hardcoded "Julianne Vose" | Live user from AuthContext |
| AdminShell | Sidebar nav | All items shown to all staff | Permission-filtered per role |
| AdminEmployees | Invite button | No permission check | Hidden unless employees.invite |
| AdminEmployees | Export button | Missing | Added for employees.exportExcel |
| App.js | Route guards | Only admin/customer | Extended to all 8 staff roles |

---

## QA Test Accounts

| Role | Email | Password |
|------|-------|----------|
| super_admin | qa.superadmin@hedj.test | 12345678 |
| admin | qa.admin@hedj.test | 12345678 |
| manager | qa.manager@hedj.test | 12345678 |
| HR | qa.hr@hedj.test | 12345678 |
| accountant | qa.accountant@hedj.test | 12345678 |
| operations | qa.operations@hedj.test | 12345678 |
| designer | qa.designer@hedj.test | 12345678 |
| employee | qa.employee@hedj.test | 12345678 |
| customer | qa.customer@hedj.test | 12345678 |

Seed with: `node server/scripts/seedAllRoles.js`
