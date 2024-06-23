import React, { useEffect } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js

const Report = () => {
  // Sample data for charts
  const salesData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Living Room Sales',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: [150, 180, 200, 190, 220, 210, 230], // Sample sales data for living room furniture
      },
      {
        label: 'Bedroom Sales',
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        data: [120, 130, 110, 140, 125, 135, 130], // Sample sales data for bedroom furniture
      },
    ],
  };

  const inventoryData = {
    labels: ['Chairs', 'Sofas', 'Tables', 'Beds', 'Cabinets'],
    datasets: [
      {
        label: 'Inventory',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 2,
        data: [50, 40, 30, 25, 20], // Sample inventory quantities
      },
    ],
  };

  const customerData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Visits',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        data: [80, 85, 90, 95, 100], // Sample customer engagement data (visits)
      },
    ],
  };

  useEffect(() => {
    // Create charts
    const salesChart = new Chart(document.getElementById('sales-chart'), {
      type: 'bar',
      data: salesData,
      options: { responsive: true, maintainAspectRatio: false },
    });

    const inventoryChart = new Chart(document.getElementById('inventory-chart'), {
      type: 'bar',
      data: inventoryData,
      options: { responsive: true, maintainAspectRatio: false },
    });

    const customerChart = new Chart(document.getElementById('customer-chart'), {
      type: 'doughnut',
      data: customerData,
      options: { responsive: true, maintainAspectRatio: false },
    });

    // Cleanup function to destroy charts when component unmounts
    return () => {
      // Destroy charts explicitly
      salesChart.destroy();
      inventoryChart.destroy();
      customerChart.destroy();
    };
  }, [salesData, inventoryData, customerData]); // Include data dependencies if needed

  return (
    <div className="report-container" id='Report'>
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
