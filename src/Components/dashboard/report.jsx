import React, { useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // Import Chart.js

const Report = () => {
  // Sample data for charts
  const salesData = {
    labels : ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Sales',
        backgroundColor: 'rgba(75,192,192,1)',
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 2,
        data: [65, 59, 80, 81, 56, 55, 40],
      },
    ],
  };

  const inventoryData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: 'Inventory',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 2,
        data: [12, 19, 3, 5, 2, 3],
      },
    ],
  };

  const customerData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Customers',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        data: [30, 25, 50, 40, 60],
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
      type: 'line',
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
      <div className="chart-container">
        <canvas id="sales-chart" />
      </div>
      <div className="chart-container">
        <canvas id="inventory-chart" />
      </div>
      <div className="chart-container">
        <canvas id="customer-chart" />
      </div>
    </div>
  );
};

export default Report;
