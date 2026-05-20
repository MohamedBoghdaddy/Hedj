import { createInitialDemoStore } from "./demoData";
import { getAuthHeaders } from "./authHeaders";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://hedj.onrender.com");

const STORE_KEY = "hedjDemoStore";

const clone = (value) => JSON.parse(JSON.stringify(value));

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStore = () => {
  const initialStore = createInitialDemoStore();

  if (!hasStorage()) return clone(initialStore);

  try {
    const existing = window.localStorage.getItem(STORE_KEY);
    if (!existing) {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(initialStore));
      return clone(initialStore);
    }

    return { ...initialStore, ...JSON.parse(existing) };
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initialStore));
    return clone(initialStore);
  }
};

const saveStore = (store) => {
  if (hasStorage()) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }
  return store;
};

const request = async (path, options = {}) => {
  const headers = getAuthHeaders({
    "Content-Type": "application/json",
    ...(options.headers || {}),
  });
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers,
    ...options,
    body:
      options.body &&
      typeof options.body !== "string" &&
      !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      const error = new Error(json.message || json.error || `Request failed: ${response.status}`);
      error.status = response.status;
      error.payload = json;
      throw error;
    } catch (error) {
      if (error.message && error.message !== "Unexpected end of JSON input") throw error;
      const fallbackError = new Error(text || `Request failed: ${response.status}`);
      fallbackError.status = response.status;
      throw fallbackError;
    }
  }

  if (response.status === 204) return null;
  return response.json();
};

const withFallback = async (path, options, fallback, normalize = (data) => data) => {
  try {
    return normalize(await request(path, options));
  } catch {
    return fallback();
  }
};

const unwrapList = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const unwrapItem = (payload, key) => payload?.[key] || payload?.data || payload;

const money = (amount) => `$${Math.round(amount || 0).toLocaleString()}`;

const orderAmount = (order) => Number(order.total || order.amount || 0);

const orderDisplay = (order) => ({
  ...order,
  customer: order.customer || { name: order.customerName },
  customerName: order.customerName || order.customer?.name || "Guest Customer",
  amountLabel: money(orderAmount(order)),
  itemsSummary:
    order.itemsSummary ||
    (order.items || []).map((item) => item.name).join(", ") ||
    "Custom Hedj order",
});

const buildDashboard = (store) => {
  const orders = store.orders.map(orderDisplay);
  const totalSales = orders.reduce((sum, order) => sum + orderAmount(order), 0);
  const pendingQuotes = store.quotes.filter((quote) => quote.status !== "converted").length;
  const lowStock = store.products.filter(
    (product) => Number(product.stock) <= Number(product.lowStockThreshold || 5)
  );

  return {
    totalSales,
    totalOrders: orders.length,
    totalCustomers: store.customers.length,
    pendingQuotes,
    lowStockCount: lowStock.length,
    recentOrders: orders.slice(0, 5),
    notifications: store.notifications,
    lowStock,
    revenueByCollection: [
      { name: "Kitchens", pct: 58, color: "var(--color-primary)" },
      { name: "Complements", pct: 27, color: "var(--color-on-tertiary-container)" },
      { name: "Outdoor", pct: 15, color: "var(--color-secondary)" },
    ],
    salesTrend: [38000, 49000, 26000, 58000, 62000, 42000, 53000, 67000],
    salesMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  };
};

const createOrderFromCheckout = (payload) => {
  const store = readStore();
  const items = payload.items || [];
  const customer = payload.customer || {};
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const install = Number(payload.totals?.install ?? 450);
  const tax = Number(payload.totals?.tax ?? Math.round(subtotal * 0.082));
  const total = Number(payload.totals?.total ?? subtotal + install + tax);
  const orderId = `HJ-${Date.now().toString().slice(-6)}`;
  const customerName =
    customer.name ||
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    "Guest Customer";

  const order = orderDisplay({
    id: orderId,
    customerId: customer.id || null,
    customerName,
    customer,
    amount: subtotal,
    total,
    status: "new",
    itemsSummary: items.map((item) => item.name).join(", "),
    items: items.map((item) => ({
      productId: item.id || item.productId,
      name: item.name,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      material: item.material,
      finish: item.finish,
    })),
    delivery: payload.delivery || {},
    payment: payload.payment || {},
    createdAt: new Date().toISOString(),
  });

  store.orders = [order, ...store.orders];
  store.products = store.products.map((product) => {
    const purchased = order.items.find((item) => item.productId === product.id);
    if (!purchased) return product;
    const nextStock = Math.max(0, Number(product.stock || 0) - purchased.quantity);
    return { ...product, stock: nextStock, inStock: nextStock > 0 };
  });
  store.notifications = [
    {
      id: `notif-order-${order.id}`,
      type: "gold",
      tag: "New Order Created",
      name: order.customerName,
      desc: `${order.itemsSummary} moved into the orders pipeline.`,
      createdAt: order.createdAt,
    },
    ...store.notifications,
  ];

  saveStore(store);
  return { order };
};

const createOrderFromQuote = (quoteId) => {
  const store = readStore();
  const quote = store.quotes.find((item) => item.id === quoteId);
  if (!quote) throw new Error("Quote not found");

  if (quote.orderId) {
    return {
      quote,
      order: orderDisplay(store.orders.find((order) => order.id === quote.orderId)),
    };
  }

  const items = quote.items.map((name) => {
    const product = store.products.find((item) => item.name === name);
    return {
      productId: product?.id || name.toLowerCase().replace(/\s+/g, "-"),
      name,
      quantity: 1,
      price: product?.price || Math.round(quote.amount / quote.items.length),
    };
  });

  const order = orderDisplay({
    id: `HJ-${Date.now().toString().slice(-6)}`,
    customerName: quote.customerName,
    customer: { name: quote.customerName },
    amount: quote.amount,
    total: quote.amount,
    status: "confirmed",
    itemsSummary: quote.items.join(", "),
    items,
    assignee: "Marcus Tan",
    depositPaid: true,
    createdAt: new Date().toISOString(),
    quoteId: quote.id,
  });

  quote.status = "converted";
  quote.orderId = order.id;
  store.orders = [order, ...store.orders];
  store.notifications = [
    {
      id: `notif-quote-${quote.id}`,
      type: "gold",
      tag: "Quote Converted",
      name: quote.customerName,
      desc: `${quote.project} is now order ${order.id}.`,
      createdAt: order.createdAt,
    },
    ...store.notifications,
  ];
  saveStore(store);

  return { quote, order };
};

export const commerceApi = {
  getProducts: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return request(`/api/products${params ? `?${params}` : ""}`).then((payload) =>
      unwrapList(payload, "products")
    );
  },

  getAdminProducts: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return request(`/api/admin/products${params ? `?${params}` : ""}`).then((payload) =>
      unwrapList(payload, "products")
    );
  },

  createProduct: (payload) =>
    request("/api/admin/products", { method: "POST", body: payload }),

  updateProduct: (productId, payload) =>
    request(`/api/admin/products/${productId}`, { method: "PUT", body: payload }),

  deleteProduct: (productId) =>
    request(`/api/admin/products/${productId}`, { method: "DELETE" }),

  getProductBySlug: (slug) =>
    withFallback(
      `/api/products/slug/${slug}`,
      {},
      () => readStore().products.find((product) => product.slug === slug || product.id === slug),
      (payload) => unwrapItem(payload, "product")
    ),

  getCollections: () =>
    withFallback(
      "/api/collections",
      {},
      () => readStore().collections,
      (payload) => unwrapList(payload, "collections")
    ),

  addCartItem: (item) =>
    withFallback(
      "/api/cart/items",
      { method: "POST", body: { item } },
      () => ({ cartItem: item }),
      (payload) => payload
    ),

  updateCartItem: (itemId, quantity) =>
    withFallback(
      `/api/cart/items/${itemId}`,
      { method: "PATCH", body: { quantity } },
      () => ({ cart: [] }),
      (payload) => payload
    ),

  removeCartItem: (itemId) =>
    withFallback(
      `/api/cart/items/${itemId}`,
      { method: "DELETE" },
      () => ({ cart: [] }),
      (payload) => payload
    ),

  checkout: async (payload) => {
    // Try the real Mongo order endpoint first; fall back to demo store if not authenticated
    try {
      const result = await request("/api/orders", { method: "POST", body: payload });
      return result;
    } catch (err) {
      // 401 = not logged in — fall back to demo store checkout
      if (err.status === 401) return createOrderFromCheckout(payload);
      throw err;
    }
  },

  getDashboard: () =>
    request("/api/admin/dashboard/summary").catch(() => buildDashboard(readStore())),

  getOrders: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return request(`/api/admin/orders${params ? `?${params}` : ""}`).then(
      (payload) => unwrapList(payload, "orders")
    );
  },

  getOrder: (orderId) =>
    request(`/api/admin/orders/${orderId}`).then((payload) => unwrapItem(payload, "order")),

  createOrder: (payload) =>
    request("/api/admin/orders", { method: "POST", body: payload }),

  updateOrder: (orderId, payload) =>
    request(`/api/admin/orders/${orderId}`, { method: "PATCH", body: payload }),

  updateOrderStatus: (orderId, status) =>
    request(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status },
    }).then((payload) => unwrapItem(payload, "order")),

  cancelOrder: (orderId) =>
    request(`/api/admin/orders/${orderId}`, { method: "DELETE" }),

  // ── Customer order routes (own orders only) ─────────────────────────────────
  placeOrder: (payload) =>
    request("/api/orders", { method: "POST", body: payload }),

  getMyOrders: () =>
    request("/api/orders/my").then((payload) => unwrapList(payload, "orders")),

  getMyOrder: (orderId) =>
    request(`/api/orders/${orderId}`).then((payload) => unwrapItem(payload, "order")),

  cancelMyOrder: (orderId) =>
    request(`/api/orders/${orderId}/cancel`, { method: "PATCH" }),

  getCustomers: () =>
    withFallback(
      "/api/admin/customers",
      {},
      () => readStore().customers,
      (payload) => unwrapList(payload, "customers")
    ),

  getCustomer: (customerId) =>
    withFallback(
      `/api/admin/customers/${customerId}`,
      {},
      () => readStore().customers.find((customer) => customer.id === customerId),
      (payload) => unwrapItem(payload, "customer")
    ),

  getLeads: () =>
    request("/api/admin/leads").then((payload) => unwrapList(payload, "leads")),

  createLead: (leadInput) =>
    request("/api/admin/leads", { method: "POST", body: leadInput }),

  updateLead: (leadId, leadInput) =>
    request(`/api/admin/leads/${leadId}`, { method: "PUT", body: leadInput }),

  updateLeadStatus: (leadId, status) =>
    request(`/api/admin/leads/${leadId}/status`, { method: "PATCH", body: { status } }),

  deleteLead: (leadId) =>
    request(`/api/admin/leads/${leadId}`, { method: "DELETE" }),

  getQuotes: () =>
    request("/api/admin/quotes").then((payload) => unwrapList(payload, "quotes")),

  createQuote: (quoteInput) =>
    request("/api/admin/quotes", { method: "POST", body: quoteInput }),

  updateQuote: (quoteId, quoteInput) =>
    request(`/api/admin/quotes/${quoteId}`, { method: "PUT", body: quoteInput }),

  updateQuoteStatus: (quoteId, status) =>
    request(`/api/admin/quotes/${quoteId}/status`, { method: "PATCH", body: { status } }),

  sendQuote: (quoteId) =>
    request(`/api/admin/quotes/${quoteId}/send`, { method: "POST" }),

  downloadQuotePdf: async (quoteId) => {
    const response = await fetch(`${API_URL}/api/admin/quotes/${quoteId}/pdf`, {
      credentials: "include",
      headers: getAuthHeaders({}),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `PDF request failed: ${response.status}`);
    }
    return response.blob();
  },

  convertQuoteToOrder: (quoteId) =>
    withFallback(
      `/api/admin/quotes/${quoteId}/convert`,
      { method: "POST" },
      () => createOrderFromQuote(quoteId),
      (payload) => payload
    ),

  getEmployees: () =>
    request("/api/admin/employees").then((payload) => unwrapList(payload, "employees")),

  createEmployee: (employeeInput) =>
    request("/api/admin/employees", { method: "POST", body: employeeInput }),

  updateEmployee: (employeeId, employeeInput) =>
    request(`/api/admin/employees/${employeeId}`, { method: "PUT", body: employeeInput }),

  deleteEmployee: (employeeId) =>
    request(`/api/admin/employees/${employeeId}`, { method: "DELETE" }),

  getAnalytics: () =>
    withFallback(
      "/api/admin/analytics",
      {},
      () => buildDashboard(readStore()),
      (payload) => unwrapItem(payload, "analytics")
    ),

  getLowStockInventory: () =>
    withFallback(
      "/api/admin/inventory/low-stock",
      {},
      () =>
        readStore().products.filter(
          (product) => Number(product.stock) <= Number(product.lowStockThreshold || 5)
        ),
      (payload) => unwrapList(payload, "items")
    ),

  updateProductStock: (productId, stock) =>
    request(`/api/admin/products/${productId}/stock`, {
      method: "PATCH",
      body: { stock },
    }).then((payload) => unwrapItem(payload, "product")),

  updateProductStatus: (productId, status) =>
    request(`/api/admin/products/${productId}/status`, {
      method: "PATCH",
      body: { status },
    }).then((payload) => unwrapItem(payload, "product")),
};

// ─── Supabase hybrid storage helpers ─────────────────────────────────────────────
// All uploads go through the Express backend — the browser never touches
// the Supabase service-role key.

const uploadRequest = async (path, formData) => {
  const { getAuthHeaders } = await import("./authHeaders");
  const headers = getAuthHeaders({});
  // Remove Content-Type so the browser sets the multipart boundary automatically
  delete headers["Content-Type"];

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      const error = new Error(json.message || json.error || `Upload failed: ${response.status}`);
      error.status = response.status;
      error.payload = json;
      throw error;
    } catch (error) {
      if (error.message && error.message !== "Unexpected end of JSON input") throw error;
      const fallbackError = new Error(text || `Upload failed: ${response.status}`);
      fallbackError.status = response.status;
      throw fallbackError;
    }
  }
  return response.json();
};

export const storageApi = {
  /** Upload the main image for a product. Returns { product, imageUrl }. */
  uploadProductImage: (productId, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return uploadRequest(`/api/admin/products/${productId}/image`, fd);
  },

  /** Upload multiple gallery images for a product. Returns { product, uploaded }. */
  uploadProductGallery: (productId, files) => {
    const fd = new FormData();
    files.forEach((file) => fd.append("images", file));
    return uploadRequest(`/api/admin/products/${productId}/gallery`, fd);
  },

  /** Upload the logged-in user's profile photo. Returns { user, photoUrl }. */
  uploadMyProfilePhoto: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return uploadRequest("/api/users/me/profile-photo", fd);
  },

  /** Upload an employee's profile photo (admin). Returns { employee, photoUrl }. */
  uploadEmployeePhoto: (employeeId, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return uploadRequest(`/api/admin/employees/${employeeId}/profile-photo`, fd);
  },

  /** Create a new employee record and send an invite email in one step.
   *  Returns { employee, status, inviteUrl, message }. */
  createAndInviteEmployee: (data) =>
    request("/api/admin/employees/invite", { method: "POST", body: data }),

  /** Re-send an invite to an existing employee. Returns { status, inviteUrl }. */
  sendEmployeeInvite: (employeeId) =>
    request(`/api/admin/employees/${employeeId}/send-invite`, { method: "POST" }),

  /** List email outbox (admin). Optional filters: status, toEmail, relatedEntityType. */
  listEmailOutbox: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    return request(`/api/admin/emails/outbox${params ? `?${params}` : ""}`);
  },

  /** Get email event logs for a specific outbox entry (admin). */
  getEmailLogs: (outboxId) =>
    request(`/api/admin/emails/outbox/${outboxId}/logs`),

  retryEmail: (outboxId) =>
    request(`/api/admin/emails/outbox/${outboxId}/send`, { method: "POST" }),
};

// ─── Customer account APIs ────────────────────────────────────────────────────

export const customerApi = {
  // Address book
  getAddresses: () => request("/api/customer/addresses").then((p) => p.addresses || []),
  createAddress: (data) => request("/api/customer/addresses", { method: "POST", body: data }),
  updateAddress: (id, data) => request(`/api/customer/addresses/${id}`, { method: "PATCH", body: data }),
  deleteAddress: (id) => request(`/api/customer/addresses/${id}`, { method: "DELETE" }),
  setDefaultAddress: (id, type = "shipping") =>
    request(`/api/customer/addresses/${id}/default`, { method: "PATCH", body: { type } }),

  // Payment methods (metadata only — no card processing)
  getPaymentMethods: () => request("/api/customer/payment-methods").then((p) => p.paymentMethods || []),
  removePaymentMethod: (id) => request(`/api/customer/payment-methods/${id}`, { method: "DELETE" }),
  setDefaultPaymentMethod: (id) =>
    request(`/api/customer/payment-methods/${id}/default`, { method: "PATCH" }),

  // Wishlist
  getWishlist: () => request("/api/customer/wishlist").then((p) => p.wishlist || []),
  addToWishlist: (productId) => request(`/api/customer/wishlist/${productId}`, { method: "POST" }),
  removeFromWishlist: (productId) => request(`/api/customer/wishlist/${productId}`, { method: "DELETE" }),
  clearWishlist: () => request("/api/customer/wishlist", { method: "DELETE" }),
};

export const supportApi = {
  createInquiry: (payload) =>
    request("/api/support", { method: "POST", body: payload }),
};

export const erpApi = {
  getOverview: () => request("/api/admin/erp/overview"),
  getApps: () => request("/api/admin/erp/apps"),
  getSchema: () => request("/api/admin/erp/schema"),
  getDepartments: () => request("/api/admin/erp/departments"),
  getJobPositions: () => request("/api/admin/erp/job-positions"),
  getApprovals: () => request("/api/admin/erp/approvals"),
  getApproval: (id) => request(`/api/admin/erp/approvals/${id}`),
  approve: (id) => request(`/api/admin/erp/approvals/${id}/approve`, { method: "POST" }),
  reject: (id) => request(`/api/admin/erp/approvals/${id}/reject`, { method: "POST" }),
  checkIntegrations: () => request("/api/admin/erp/integrations/check", { method: "POST" }),
  getEmployeeHierarchy: () => request("/api/admin/erp/hierarchy"),
  getERPEmployees: () => request("/api/admin/erp/employees"),
};

// ─── Attendance API ───────────────────────────────────────────────────────────
export const attendanceApi = {
  // Admin/HR: all records
  list: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return request(`/api/admin/attendance${params ? `?${params}` : ""}`);
  },
  create: (data) => request("/api/admin/attendance", { method: "POST", body: data }),
  update: (id, data) => request(`/api/admin/attendance/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/api/admin/attendance/${id}`, { method: "DELETE" }),

  // Employee self-service
  getMy: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    return request(`/api/attendance/my${params ? `?${params}` : ""}`);
  },
  clockIn:  () => request("/api/attendance/clock-in",  { method: "POST" }),
  clockOut: (data = {}) => request("/api/attendance/clock-out", { method: "POST", body: data }),

  // Export (direct download)
  exportUrl: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return `${API_URL}/api/admin/export/attendance.xlsx${params ? `?${params}` : ""}`;
  },
};

// ─── Leave Request API ────────────────────────────────────────────────────────
export const leaveApi = {
  // Admin/HR/Manager
  list: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return request(`/api/admin/leave${params ? `?${params}` : ""}`);
  },
  get: (id) => request(`/api/admin/leave/${id}`),
  approve: (id) => request(`/api/admin/leave/${id}/approve`, { method: "PATCH" }),
  reject: (id, reason) => request(`/api/admin/leave/${id}/reject`, { method: "PATCH", body: { rejectionReason: reason } }),
  escalate: (id, data = {}) => request(`/api/admin/leave/${id}/escalate`, { method: "PATCH", body: data }),

  // Employee self-service
  getMy: () => request("/api/leave/my"),
  request: (data) => request("/api/leave/request", { method: "POST", body: data }),
  cancel: (id) => request(`/api/leave/${id}/cancel`, { method: "PATCH" }),

  // Export
  exportUrl: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return `${API_URL}/api/admin/export/leave.xlsx${params ? `?${params}` : ""}`;
  },
};

// ─── Import / Export API ──────────────────────────────────────────────────────
export const importExportApi = {
  importFile: async (file, type) => {
    const { getAuthHeaders: getH } = await import("./authHeaders");
    const headers = getH({});
    delete headers["Content-Type"];
    const fd = new FormData();
    fd.append("file", file);
    const url = `${API_URL}/api/admin/import${type ? `?type=${type}` : ""}`;
    const res = await fetch(url, { method: "POST", headers, body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Import failed" }));
      throw new Error(err.message || "Import failed");
    }
    return res.json();
  },

  templateUrl: (type) => `${API_URL}/api/admin/export/template/${type}`,
  exportEmployeesUrl: () => `${API_URL}/api/admin/export/employees.xlsx`,
  exportAttendanceUrl: (filters = {}) => `${API_URL}/api/admin/export/attendance.xlsx?${new URLSearchParams(filters)}`,
  exportLeaveUrl: (filters = {}) => `${API_URL}/api/admin/export/leave.xlsx?${new URLSearchParams(filters)}`,
};

export { API_URL };
