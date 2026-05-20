import mongoose from "mongoose";
import Order from "../model/Order.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const VALID_STATUSES = ["new", "confirmed", "in_production", "ready", "delivered", "cancelled"];

const sanitize = (v) => (typeof v === "string" ? v.trim() : v);

const buildOrderPayload = (body, { partial = false } = {}) => {
  const p = {};

  ["orderNumber", "customerName", "customerEmail", "notes", "assignedEmployeeName"].forEach((f) => {
    if (body[f] !== undefined) p[f] = sanitize(body[f]);
  });

  if (body.customerId !== undefined) p.customerId = body.customerId || null;
  if (body.assignedEmployeeId !== undefined) p.assignedEmployeeId = body.assignedEmployeeId || null;

  ["subtotal", "tax", "installationFee", "discount", "total"].forEach((f) => {
    if (body[f] !== undefined) p[f] = Number(body[f]) || 0;
  });

  if (body.status !== undefined) p.status = sanitize(body.status);
  if (body.paymentStatus !== undefined) p.paymentStatus = sanitize(body.paymentStatus);
  if (body.installationPreference !== undefined) p.installationPreference = sanitize(body.installationPreference);
  if (body.estimatedDays !== undefined) p.estimatedDays = body.estimatedDays ? Number(body.estimatedDays) : null;

  if (Array.isArray(body.items)) {
    p.items = body.items.map((item) => ({
      productId: item.productId || null,
      name: sanitize(item.name) || "Item",
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
      imageUrl: item.imageUrl || "",
      sku: item.sku || "",
    }));
  }

  if (body.deliveryAddress && typeof body.deliveryAddress === "object") {
    p.deliveryAddress = {
      line1: sanitize(body.deliveryAddress.line1) || "",
      city: sanitize(body.deliveryAddress.city) || "",
      country: sanitize(body.deliveryAddress.country) || "",
    };
  }

  return p;
};

const generateOrderNumber = () => `HJ-${Date.now().toString().slice(-6)}`;

export const listAdminOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 100));

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customerId", "firstName lastName email")
        .populate("assignedEmployeeId", "fname lname")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    const normalised = orders.map((o) => {
      const obj = o.toObject();
      if (obj.customerId) {
        obj._resolvedCustomerName = `${obj.customerId.firstName} ${obj.customerId.lastName}`.trim() || obj.customerName;
      } else {
        obj._resolvedCustomerName = obj.customerName;
      }
      if (obj.assignedEmployeeId) {
        obj._resolvedAssigneeName = `${obj.assignedEmployeeId.fname} ${obj.assignedEmployeeId.lname}`.trim();
      } else {
        obj._resolvedAssigneeName = obj.assignedEmployeeName;
      }
      return obj;
    });

    return res.json({ success: true, count: orders.length, total, orders: normalised });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminOrder = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id." });
  }
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "firstName lastName email")
      .populate("assignedEmployeeId", "fname lname email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createAdminOrder = async (req, res) => {
  try {
    const payload = buildOrderPayload(req.body);
    if (!payload.orderNumber) payload.orderNumber = generateOrderNumber();

    if (payload.status && !VALID_STATUSES.includes(payload.status)) {
      return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    const order = await Order.create(payload);
    return res.status(201).json({ success: true, order });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Order number already exists." });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminOrder = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id." });
  }
  try {
    const payload = buildOrderPayload(req.body, { partial: true });
    if (payload.status && !VALID_STATUSES.includes(payload.status)) {
      return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id." });
  }
  const status = typeof req.body.status === "string" ? req.body.status.trim() : "";
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelAdminOrder = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid order id." });
  }
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.json({ success: true, order, message: "Order cancelled." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
