import { useEffect, useMemo } from "react";
import Chart from "chart.js/auto";

const Report = () => {
  // Memoize chart data to avoid unnecessary re-renders
  const salesData = useMemo(
    () => ({
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Living Room Sales",
          backgroundColor: "rgba(75,192,192,1)",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: [150, 180, 200, 190, 220, 210, 230],
        },
        {
          label: "Bedroom Sales",
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          data: [120, 130, 110, 140, 125, 135, 130],
        },
      ],
    }),
    []
  );

  const inventoryData = useMemo(
    () => ({
      labels: ["Chairs", "Sofas", "Tables", "Beds", "Cabinets"],
      datasets: [
        {
          label: "Inventory",
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 2,
          data: [50, 40, 30, 25, 20],
        },
      ],
    }),
    []
  );

  const customerData = useMemo(
    () => ({
      labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      datasets: [
        {
          label: "Visits",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          data: [80, 85, 90, 95, 100],
        },
      ],
    }),
    []
  );

  useEffect(() => {
    const salesChart = new Chart(document.getElementById("sales-chart"), {
      type: "bar",
      data: salesData,
      options: { responsive: true, maintainAspectRatio: false },
    });

    const inventoryChart = new Chart(
      document.getElementById("inventory-chart"),
      {
        type: "bar",
        data: inventoryData,
        options: { responsive: true, maintainAspectRatio: false },
      }
    );

    const customerChart = new Chart(document.getElementById("customer-chart"), {
      type: "doughnut",
      data: customerData,
      options: { responsive: true, maintainAspectRatio: false },
    });

    return () => {
      salesChart.destroy();
      inventoryChart.destroy();
      customerChart.destroy();
    };
  }, [salesData, inventoryData, customerData]);

  return (
    <div className="report-container" id="Report">
      <h2>Monthly Furniture Sales</h2>
      <div className="chart-container">
        <canvas id="sales-chart" />
      </div>

      <h2>Inventory Overview</h2>
      <div className="chart-container">
        <canvas id="inventory-chart" />
      </div>

      <h2>Customer Engagement</h2>
      <div className="chart-container">
        <canvas id="customer-chart" />
      </div>
    </div>
  );
};

export default Report;
