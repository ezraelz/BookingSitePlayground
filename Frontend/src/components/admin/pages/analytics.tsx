import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { UsersIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import axios from "../../../hooks/api";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookingPerPlayground, setBookingPerPlayground] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchBookingsPerUser();
    fetchBookingPerPlayground()
  }, []);
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/bookings/per_month/');
      setBookings(res.data);
      console.log('bpm', res.data)
    } catch (error) {
      toast.error('Failed to fetch bookings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBookingPerPlayground = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/revenue/per_playground/');
      setBookingPerPlayground(res.data);
      console.log('bpm', res.data)
    } catch (error) {
      toast.error('Failed to fetch bookings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsPerUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/bookings/per_user/');
      setUsers(res.data);
      console.log('bpm', res.data)
    } catch (error) {
      toast.error('Failed to fetch bookings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const bookingsData = {
    labels: bookings.months,
    datasets: [
      {
        label: "Bookings",
        data: bookings.values,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueData = {
    labels: bookingPerPlayground.labels,
    datasets: [
      {
        label: bookingPerPlayground.values,
        data: [500, 700, 300, 450],
        backgroundColor: ["#2563eb", "#22c55e", "#facc15", "#f97316"],
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
      title: {
        display: true,
        text: "Analytics Overview",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Bookings Over Time</h3>
          <Line data={bookingsData} options={chartOptions} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Revenue per Playground</h3>
          <Bar data={revenueData} options={chartOptions} />
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Top Users</h3>
        <ul className="space-y-2">
         
            <li
              
              className="flex justify-between border p-2 rounded hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-500" />
                {users.labels}
              </span>
              <span className="font-medium">{users.values} bookings</span>
            </li>
      
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
