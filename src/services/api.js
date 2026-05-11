import { createInitialDemoStore } from "./demoData";

const API_URL =
  process.env.REACT_APP_API_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
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
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

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
  getProducts: (filters = {}) =>
    withFallback(
      "/api/products",
      {},
      () => {
        const products = readStore().products;
        if (!filters.collection) return products;
        return products.filter(
          (product) => product.collection.toLowerCase() === filters.collection.toLowerCase()
        );
      },
      (payload) => unwrapList(payload, "products")
    ),

  getProductBySlug: (slug) =>
    withFallback(
      `/api/products/${slug}`,
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
      "/api/cart/add",
      { method: "POST", body: { item } },
      () => ({ cartItem: item }),
      (payload) => payload
    ),

  checkout: (payload) =>
    withFallback(
      "/api/checkout",
      { method: "POST", body: payload },
      () => createOrderFromCheckout(payload),
      (payload) => payload
    ),

  getDashboard: () =>
    withFallback(
      "/api/admin/dashboard",
      {},
      () => buildDashboard(readStore()),
      (payload) => unwrapItem(payload, "dashboard")
    ),

  getOrders: () =>
    withFallback(
      "/api/admin/orders",
      {},
      () => readStore().orders.map(orderDisplay),
      (payload) => unwrapList(payload, "orders").map(orderDisplay)
    ),

  getOrder: (orderId) =>
    withFallback(
      `/api/admin/orders/${orderId}`,
      {},
      () => orderDisplay(readStore().orders.find((order) => order.id === orderId)),
      (payload) => orderDisplay(unwrapItem(payload, "order"))
    ),

  updateOrderStatus: (orderId, status) =>
    withFallback(
      `/api/admin/orders/${orderId}/status`,
      { method: "PATCH", body: { status } },
      () => {
        const store = readStore();
        store.orders = store.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        );
        saveStore(store);
        return orderDisplay(store.orders.find((order) => order.id === orderId));
      },
      (payload) => orderDisplay(unwrapItem(payload, "order"))
    ),

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
    withFallback(
      "/api/admin/leads",
      {},
      () => readStore().leads,
      (payload) => unwrapList(payload, "leads")
    ),

  getQuotes: () =>
    withFallback(
      "/api/admin/quotes",
      {},
      () => readStore().quotes,
      (payload) => unwrapList(payload, "quotes")
    ),

  createQuote: (quoteInput) =>
    withFallback(
      "/api/admin/quotes",
      { method: "POST", body: quoteInput },
      () => {
        const store = readStore();
        const quote = {
          id: `quote-${Date.now()}`,
          status: "draft",
          createdAt: new Date().toISOString(),
          items: quoteInput.items || ["Custom Hedj scope"],
          ...quoteInput,
          amount: Number(quoteInput.amount || 0),
        };
        store.quotes = [quote, ...store.quotes];
        saveStore(store);
        return { quote };
      },
      (payload) => payload
    ),

  convertQuoteToOrder: (quoteId) =>
    withFallback(
      `/api/admin/quotes/${quoteId}/convert`,
      { method: "POST" },
      () => createOrderFromQuote(quoteId),
      (payload) => payload
    ),

  getEmployees: () =>
    withFallback(
      "/api/admin/employees",
      {},
      () => readStore().employees,
      (payload) => unwrapList(payload, "employees")
    ),

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
    withFallback(
      `/api/admin/inventory/${productId}`,
      { method: "PATCH", body: { stock } },
      () => {
        const store = readStore();
        store.products = store.products.map((product) =>
          product.id === productId
            ? { ...product, stock: Number(stock), inStock: Number(stock) > 0 }
            : product
        );
        saveStore(store);
        return store.products.find((product) => product.id === productId);
      },
      (payload) => unwrapItem(payload, "product")
    ),
};
