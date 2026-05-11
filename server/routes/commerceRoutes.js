import express from "express";
import {
  convertQuote,
  createOrder,
  dashboardData,
  getStore,
  orderDisplay,
  resetStore,
} from "../data/demoStore.js";

const router = express.Router();

const byIdOrSlug = (items, id) => items.find((item) => item.id === id || item.slug === id);

router.get("/health", (req, res) => {
  res.json({ ok: true, mode: process.env.MONGO_URL ? "mongo" : "demo" });
});

router.post("/seed/reset", (req, res) => {
  res.json({ data: resetStore() });
});

router.get("/products", (req, res) => {
  const { collection } = req.query;
  const products = collection
    ? getStore().products.filter(
        (product) => product.collection.toLowerCase() === String(collection).toLowerCase()
      )
    : getStore().products;

  res.json({ count: products.length, data: products });
});

router.get("/products/low-stock", (req, res) => {
  const items = getStore().products.filter(
    (product) => Number(product.stock) <= Number(product.lowStockThreshold || 5)
  );
  res.json({ count: items.length, items });
});

router.get("/products/:id", (req, res) => {
  const product = byIdOrSlug(getStore().products, req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ product });
});

router.post("/products", (req, res) => {
  const store = getStore();
  const product = {
    id: req.body.id || req.body.name?.toLowerCase().replace(/\s+/g, "-"),
    slug: req.body.slug || req.body.name?.toLowerCase().replace(/\s+/g, "-"),
    stock: 0,
    lowStockThreshold: 5,
    inStock: true,
    images: [],
    ...req.body,
  };
  store.products = [product, ...store.products];
  res.status(201).json({ product });
});

router.patch("/products/:id", (req, res) => {
  const store = getStore();
  let updated = null;
  store.products = store.products.map((product) => {
    if (product.id !== req.params.id && product.slug !== req.params.id) return product;
    updated = { ...product, ...req.body };
    return updated;
  });
  if (!updated) return res.status(404).json({ message: "Product not found" });
  return res.json({ product: updated });
});

router.get("/collections", (req, res) => {
  res.json({ count: getStore().collections.length, collections: getStore().collections });
});

router.get("/collections/:slug", (req, res) => {
  const collection = byIdOrSlug(getStore().collections, req.params.slug);
  if (!collection) return res.status(404).json({ message: "Collection not found" });
  return res.json({ collection });
});

router.get("/cart", (req, res) => {
  res.json({ cart: req.session?.cart || [] });
});

router.post("/cart/add", (req, res) => {
  const item = req.body.item || req.body;
  const quantity = Math.max(1, Number(item.quantity || 1));
  const cart = req.session?.cart || [];
  const existing = cart.find((cartItem) => cartItem.id === item.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  if (req.session) req.session.cart = cart;
  res.json({ message: "Added to cart", cart });
});

router.patch("/cart/:id", (req, res) => {
  const cart = req.session?.cart || [];
  const quantity = Math.max(0, Number(req.body.quantity || 0));
  const nextCart = quantity
    ? cart.map((item) => (item.id === req.params.id ? { ...item, quantity } : item))
    : cart.filter((item) => item.id !== req.params.id);
  if (req.session) req.session.cart = nextCart;
  res.json({ cart: nextCart });
});

router.delete("/cart/:id", (req, res) => {
  const cart = (req.session?.cart || []).filter((item) => item.id !== req.params.id);
  if (req.session) req.session.cart = cart;
  res.json({ cart });
});

router.delete("/cart", (req, res) => {
  if (req.session) req.session.cart = [];
  res.json({ cart: [] });
});

router.post("/checkout", (req, res) => {
  const order = createOrder(req.body);
  if (req.session) req.session.cart = [];
  res.status(201).json({ order });
});

router.get("/orders", (req, res) => {
  res.json({ orders: getStore().orders.map(orderDisplay) });
});

router.get("/admin/dashboard", (req, res) => {
  res.json({ dashboard: dashboardData() });
});

router.get("/admin/orders", (req, res) => {
  res.json({ orders: getStore().orders.map(orderDisplay) });
});

router.get("/admin/orders/:id", (req, res) => {
  const order = getStore().orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json({ order: orderDisplay(order) });
});

router.patch("/admin/orders/:id/status", (req, res) => {
  const store = getStore();
  let updated = null;
  store.orders = store.orders.map((order) => {
    if (order.id !== req.params.id) return order;
    updated = orderDisplay({ ...order, status: req.body.status || order.status });
    return updated;
  });
  if (!updated) return res.status(404).json({ message: "Order not found" });
  return res.json({ order: updated });
});

router.get("/admin/customers", (req, res) => {
  res.json({ customers: getStore().customers });
});

router.get("/admin/customers/:id", (req, res) => {
  const customer = getStore().customers.find((item) => item.id === req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  return res.json({ customer });
});

router.get("/admin/leads", (req, res) => {
  res.json({ leads: getStore().leads });
});

router.post("/admin/leads", (req, res) => {
  const store = getStore();
  const lead = {
    id: `lead-${Date.now()}`,
    status: "new",
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  store.leads = [lead, ...store.leads];
  res.status(201).json({ lead });
});

router.patch("/admin/leads/:id", (req, res) => {
  const store = getStore();
  let updated = null;
  store.leads = store.leads.map((lead) => {
    if (lead.id !== req.params.id) return lead;
    updated = { ...lead, ...req.body };
    return updated;
  });
  if (!updated) return res.status(404).json({ message: "Lead not found" });
  return res.json({ lead: updated });
});

router.get("/admin/quotes", (req, res) => {
  res.json({ quotes: getStore().quotes });
});

router.post("/admin/quotes", (req, res) => {
  const store = getStore();
  const quote = {
    id: `quote-${Date.now()}`,
    status: "draft",
    createdAt: new Date().toISOString(),
    items: req.body.items || ["Custom Hedj scope"],
    ...req.body,
    amount: Number(req.body.amount || 0),
  };
  store.quotes = [quote, ...store.quotes];
  res.status(201).json({ quote });
});

router.post("/admin/quotes/:id/convert", (req, res) => {
  const result = convertQuote(req.params.id);
  if (!result) return res.status(404).json({ message: "Quote not found" });
  return res.status(201).json(result);
});

router.get("/admin/employees", (req, res) => {
  res.json({ employees: getStore().employees });
});

router.get("/admin/analytics", (req, res) => {
  res.json({ analytics: dashboardData() });
});

router.get("/admin/inventory/low-stock", (req, res) => {
  const items = getStore().products.filter(
    (product) => Number(product.stock) <= Number(product.lowStockThreshold || 5)
  );
  res.json({ count: items.length, items });
});

router.patch("/admin/inventory/:id", (req, res) => {
  const store = getStore();
  let updated = null;
  store.products = store.products.map((product) => {
    if (product.id !== req.params.id) return product;
    const stock = Number(req.body.stock ?? product.stock);
    updated = { ...product, stock, inStock: stock > 0 };
    return updated;
  });
  if (!updated) return res.status(404).json({ message: "Product not found" });
  return res.json({ product: updated });
});

router.get("/notifications", (req, res) => {
  res.json({ notifications: getStore().notifications });
});

export default router;
