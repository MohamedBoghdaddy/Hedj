import { createInitialDemoStore } from "../../src/services/demoData.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

let store = clone(createInitialDemoStore());

export const getStore = () => store;

export const resetStore = () => {
  store = clone(createInitialDemoStore());
  return clone(store);
};

export const money = (amount) => `$${Math.round(Number(amount || 0)).toLocaleString()}`;

export const orderDisplay = (order) => ({
  ...order,
  customerName: order.customerName || order.customer?.name || "Guest Customer",
  amountLabel: money(order.total || order.amount),
  itemsSummary:
    order.itemsSummary ||
    (order.items || []).map((item) => item.name).join(", ") ||
    "Custom Hedj order",
});

export const dashboardData = () => {
  const orders = store.orders.map(orderDisplay);
  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total || order.amount || 0),
    0
  );
  const lowStock = store.products.filter(
    (product) => Number(product.stock) <= Number(product.lowStockThreshold || 5)
  );

  return {
    totalSales,
    totalOrders: orders.length,
    totalCustomers: store.customers.length,
    pendingQuotes: store.quotes.filter((quote) => quote.status !== "converted").length,
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

export const createOrder = (payload) => {
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
    const stock = Math.max(0, Number(product.stock || 0) - purchased.quantity);
    return { ...product, stock, inStock: stock > 0 };
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

  return order;
};

export const convertQuote = (quoteId) => {
  const quote = store.quotes.find((item) => item.id === quoteId);
  if (!quote) return null;

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

  return { quote, order };
};
