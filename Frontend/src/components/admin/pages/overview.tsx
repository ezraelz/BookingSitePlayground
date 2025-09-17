import React from "react";
import { UsersIcon, ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Overview: React.FC = () => {
  const summaryData = [
    { title: "Total Users", value: "1,234", icon: UsersIcon, color: "bg-blue-600" },
    { title: "Active Sessions", value: "456", icon: ChartBarIcon, color: "bg-green-600" },
    { title: "New Signups", value: "78", icon: ClockIcon, color: "bg-yellow-600" },
  ];

  const recentActivities = [
    { id: 1, action: "User John Doe signed up", time: "2 hours ago" },
    { id: 2, action: "Admin updated settings", time: "4 hours ago" },
    { id: 3, action: "New report generated", time: "Yesterday" },
  ];

  // Chart.js data
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Active Users",
        data: [200, 300, 250, 400, 350, 500],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-7xl mx-auto w-full flex flex-col space-y-6">
        {/* Page Title */}
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {summaryData.map((item) => (
            <div
            key={item.title}
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
            >
            <div className={`p-3 rounded-full ${item.color}`}>
                <item.icon className="w-8 h-8 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-xl font-semibold text-gray-800">{item.value}</p>
            </div>
            </div>
        ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity</h3>
        <Line data={chartData} options={chartOptions} />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <ul className="space-y-4">
            {recentActivities.map((activity) => (
            <li key={activity.id} className="flex justify-between items-center">
                <span className="text-gray-600">{activity.action}</span>
                <span className="text-sm text-gray-500">{activity.time}</span>
            </li>
            ))}
        </ul>
        </div>
    </div>
    </div>
  );
};

export default Overview;
