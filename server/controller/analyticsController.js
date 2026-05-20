import mongoose from "mongoose";
import Product from "../model/productsmodel.js";
import User from "../model/usermodel.js";
import Lead from "../model/Lead.js";
import Quote from "../model/Quote.js";
import Order from "../model/Order.js";
import ApprovalRequest from "../model/ApprovalRequest.js";

// ─── Shared helper ────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const nMonthsAgo = (n) => { const d = new Date(); d.setMonth(d.getMonth() - n); return d; };

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── GET /api/analytics ───────────────────────────────────────────────────────
// Kept for backward compat — public-safe subset of dashboard summary.
export const Analytics = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable." });
    }

    const [totalOrders, totalCustomers, totalProducts, lowStock] = await Promise.all([
      Order.countDocuments({ status: { $ne: "cancelled" } }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "active", $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
    ]);

    // Monthly order totals for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: "cancelled" } } },
      { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const salesTrend = monthlyOrders.map((m) => Math.round(m.revenue));
    const salesMonths = monthlyOrders.map((m) => monthNames[(m._id - 1) % 12]);
    const totalSales = salesTrend.reduce((s, v) => s + v, 0);

    return res.json({
      success: true,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount: lowStock,
      totalSales,
      salesTrend: salesTrend.length ? salesTrend : [0],
      salesMonths: salesMonths.length ? salesMonths : ["—"],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/dashboard/summary ─────────────────────────────────────────
// Full admin dashboard summary — requires admin auth (verified in route mount).
export const getDashboardSummary = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable." });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalOrders,
      totalCustomers,
      pendingQuotes,
      pendingApprovals,
      lowStockProducts,
      recentOrders,
      recentLeads,
      monthlyRevenue,
    ] = await Promise.all([
      Order.countDocuments({ status: { $ne: "cancelled" } }),
      User.countDocuments({ role: "customer" }),
      Quote.countDocuments({ status: { $in: ["draft", "pending", "sent"] } }),
      ApprovalRequest.countDocuments({ status: "pending" }),
      Product.find({ status: "active", $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] } })
        .select("name stock lowStockThreshold imageUrl category")
        .limit(5)
        .lean(),
      Order.find({ status: { $ne: "cancelled" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber customerName total status createdAt")
        .lean(),
      Lead.find({ status: { $nin: ["won", "lost", "archived"] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name company status priority estimatedValue createdAt")
        .lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: "cancelled" } } },
        { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
        { $sort: { "_id": 1 } },
      ]),
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const salesTrend = monthlyRevenue.map((m) => Math.round(m.revenue));
    const salesMonths = monthlyRevenue.map((m) => monthNames[(m._id - 1) % 12]);
    const totalSales = salesTrend.reduce((s, v) => s + v, 0);

    // Integration health alerts
    const alerts = [];
    if (lowStockProducts.length > 0) {
      alerts.push({ type: "warning", message: `${lowStockProducts.length} product(s) are low on stock`, link: "/admin/products" });
    }
    if (pendingApprovals > 0) {
      alerts.push({ type: "info", message: `${pendingApprovals} approval request(s) pending`, link: "/admin/erp/approvals" });
    }
    if (pendingQuotes > 0) {
      alerts.push({ type: "info", message: `${pendingQuotes} quote(s) awaiting action`, link: "/admin/quotes" });
    }

    return res.json({
      success: true,
      totalSales,
      totalOrders,
      totalCustomers,
      pendingQuotes,
      pendingApprovals,
      lowStockCount: lowStockProducts.length,
      recentOrders,
      recentLeads,
      lowStockProducts,
      alerts,
      salesTrend: salesTrend.length ? salesTrend : [0],
      salesMonths: salesMonths.length ? salesMonths : ["—"],
      revenueByCollection: [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/analytics/overview ───────────────────────────────────────
// Full analytics for the AdminAnalytics page — requires admin auth.
export const getAnalyticsOverview = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });

    const { months = 6 } = req.query;
    const since = nMonthsAgo(Number(months) || 6);

    const [
      monthlyRevenue,
      categoryRevenue,
      topProducts,
      orderStatusCounts,
      totalRevenue,
      totalOrders,
      totalCustomers,
      lowStockCount,
      leadConversion,
      quoteConversion,
    ] = await Promise.all([
      // Monthly revenue trend
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
        { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Revenue by product category (from order items)
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "prod" } },
        { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
        { $group: {
          _id: { $ifNull: ["$prod.category", "Uncategorised"] },
          revenue: { $sum: "$items.total" },
          unitsSold: { $sum: "$items.quantity" },
        }},
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),

      // Top products by revenue
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $group: {
          _id: "$items.name",
          revenue: { $sum: "$items.total" },
          unitsSold: { $sum: "$items.quantity" },
        }},
        { $sort: { revenue: -1 } },
        { $limit: 6 },
      ]),

      // Orders by status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.countDocuments({ status: { $ne: "cancelled" } }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ status: "active", $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] } }),

      // Lead conversion (won/total non-archived)
      Promise.all([
        Lead.countDocuments({ status: "won" }),
        Lead.countDocuments({ status: { $nin: ["archived"] } }),
      ]),

      // Quote conversion (accepted/total non-cancelled-expired)
      Promise.all([
        Quote.countDocuments({ status: "accepted" }),
        Quote.countDocuments({ status: { $nin: ["cancelled", "expired"] } }),
      ]),
    ]);

    const totalSales = totalRevenue[0]?.total || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const maxCatRevenue = Math.max(...categoryRevenue.map((c) => c.revenue), 1);
    const categoryBars = categoryRevenue.map((c) => ({
      label: c._id,
      height: Math.round((c.revenue / maxCatRevenue) * 100),
      revenue: c.revenue,
      unitsSold: c.unitsSold,
    }));

    const orderStatusMap = {};
    orderStatusCounts.forEach((s) => { orderStatusMap[s._id] = s.count; });

    const salesTrend = monthlyRevenue.map((m) => Math.round(m.revenue));
    const salesMonths = monthlyRevenue.map((m) => MONTH_NAMES[(m._id - 1) % 12]);

    const [leadsWon, leadsTotal] = leadConversion;
    const [quotesAccepted, quotesTotal] = quoteConversion;

    // Performance log rows: top products
    const performanceRows = topProducts.map((p, i) => ({
      id: `#REF-${String(i + 1).padStart(5, "0")}`,
      name: p._id,
      unitsSold: p.unitsSold,
      revenue: p.revenue,
      status: p.revenue > 5000 ? "Active" : p.revenue > 1000 ? "In Review" : "Low",
    }));

    return res.json({
      success: true,
      totalSales,
      totalOrders,
      avgOrderValue,
      totalCustomers,
      lowStockCount,
      leadConversionRate: leadsTotal > 0 ? Math.round((leadsWon / leadsTotal) * 100) : 0,
      quoteConversionRate: quotesTotal > 0 ? Math.round((quotesAccepted / quotesTotal) * 100) : 0,
      categoryBars,
      topProducts,
      orderStatusMap,
      salesTrend,
      salesMonths,
      performanceRows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/admin/analytics/export.csv ─────────────────────────────────────
export const exportAnalyticsCSV = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });

    const orders = await Order.find({ status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const header = ["orderNumber", "customerName", "status", "paymentStatus", "subtotal", "tax", "installationFee", "total", "createdAt"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.customerName || "",
      o.status,
      o.paymentStatus,
      o.subtotal,
      o.tax,
      o.installationFee,
      o.total,
      new Date(o.createdAt).toISOString().slice(0, 10),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="hedj-analytics-${Date.now()}.csv"`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
