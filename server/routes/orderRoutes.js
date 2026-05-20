import express from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../middleware/AuthMiddleware.js";
import Order from "../model/Order.js";
import Product from "../model/productsmodel.js";

const router = express.Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── POST /api/orders — customer checkout creates a real Mongo order ──────────
router.post("/", isAuthenticated, asyncRoute(async (req, res) => {
  const { items = [], delivery = {}, payment = {}, totals = {}, customer = {} } = req.body;

  if (!items.length) {
    return res.status(400).json({ success: false, message: "Order must contain at least one item." });
  }

  // Resolve product details from Mongo (validate they exist and are active)
  const resolvedItems = [];
  for (const item of items) {
    const productId = item.productId || item.id;
    let name = item.name;
    let unitPrice = Number(item.price || item.unitPrice || 0);
    let imageUrl = item.imageUrl || "";
    let sku = item.sku || "";

    if (productId && isValidId(productId)) {
      const prod = await Product.findById(productId).select("name price imageUrl sku status").lean();
      if (prod && prod.status !== "archived") {
        name = prod.name;
        unitPrice = prod.price;
        imageUrl = prod.imageUrl || "";
        sku = prod.sku || "";
      }
    }

    const qty = Math.max(1, Number(item.quantity || 1));
    resolvedItems.push({ productId: productId || null, name: name || "Product", quantity: qty, unitPrice, total: unitPrice * qty, imageUrl, sku });
  }

  const subtotal = resolvedItems.reduce((s, i) => s + i.total, 0);
  const tax = Number(totals.tax ?? Math.round(subtotal * 0.08));
  const installationFee = Number(totals.install ?? 450);
  const total = Number(totals.total ?? subtotal + tax + installationFee);

  const customerName = customer.name ||
    [req.user.firstName, req.user.lastName].filter(Boolean).join(" ") ||
    req.user.username || "Customer";

  const order = await Order.create({
    orderNumber: `HJ-${Date.now().toString().slice(-6)}`,
    customerId: req.user._id,
    customerName,
    customerEmail: req.user.email,
    items: resolvedItems,
    subtotal,
    tax,
    installationFee,
    total,
    status: "new",
    paymentStatus: "pending",
    installationPreference: delivery.installType || "full",
    deliveryAddress: {
      line1: delivery.address || customer.address || "",
      city: delivery.city || customer.city || "",
      country: delivery.country || customer.country || "UK",
    },
    notes: req.body.notes || "",
  });

  return res.status(201).json({ success: true, order });
}));

// ── GET /api/orders/my — customer sees only their own orders ─────────────────
router.get("/my", isAuthenticated, asyncRoute(async (req, res) => {
  const orders = await Order.find({ customerId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  return res.json({ success: true, orders, count: orders.length });
}));

// ── GET /api/orders/:id — customer sees one of their own orders ───────────────
router.get("/:id", isAuthenticated, asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id." });
  }
  const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  return res.json({ success: true, order });
}));

// ── PATCH /api/orders/:id/cancel — customer cancels own new order ─────────────
router.patch("/:id/cancel", isAuthenticated, asyncRoute(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id." });
  }
  const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  if (!["new", "confirmed"].includes(order.status)) {
    return res.status(409).json({ success: false, message: `Cannot cancel order in status: ${order.status}.` });
  }
  order.status = "cancelled";
  await order.save();
  return res.json({ success: true, order, message: "Order cancelled." });
}));

export default router;
