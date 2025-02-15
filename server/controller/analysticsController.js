import asyncHandler from "express-async-handler";

// Sample analytics data (Replace this with database logic)
const Analytics = asyncHandler(async (req, res) => {
  try {
    const analyticsData = {
      totalUsers: 1024,
      totalSales: 25600,
      activeCustomers: 785,
      totalOrders: 3245,
      salesTrend: [2000, 3000, 4500, 5000, 7000, 8000, 10000],
      salesMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
});

export { Analytics };
