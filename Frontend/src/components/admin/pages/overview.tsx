import React, { useEffect, useState } from "react";
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
import {
  UserPlusIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "../../../hooks/api";

// Register Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
interface TimeslotType {
  id: number;
  time: string;
  is_active: boolean;
}
interface PlaygroundType {
  id: number;
  name: string;
  location: string;
  price_per_hour: number;
  is_active: boolean;
  timeslots: TimeslotType[];
}
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}
interface Booking {
  id: number;
  guest_name: string;
  playground: {
    name: string;
  };
  timeslot: string;
  date: string;
  status: string;
}

const Overview: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundType[]>([]);
  const navigate = useNavigate();
  
  useEffect(()=> {
    const fetchPlayground = async ()=> {
      const res = await axios.get('/fields/');
      setPlaygrounds(res.data);
    }
    const fetchUsers = async ()=> {
      const res = await axios.get('/users/');
      setUsers(res.data);
    }
    const fetchBookings = async ()=> {
      const res = await axios.get('/booking/');
      setBookings(res.data);
    }
    fetchPlayground();
    fetchUsers();
    fetchBookings();
  }, []);

   const summaryCards = [
    { title: "Total Playgrounds", value: playgrounds.length, icon: BuildingStorefrontIcon, color: "bg-blue-600" },
    { title: "Bookings Today", value: bookings.length, icon: ClipboardDocumentListIcon, color: "bg-green-600" },
    { title: "Revenue (This Month)", value: "$4,560", icon: CurrencyDollarIcon, color: "bg-yellow-600" },
    { title: "Active Users", value: users.length, icon: UsersIcon, color: "bg-purple-600" },
  ];

  // 📈 Chart Data
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Bookings",
        data: [12, 19, 8, 15, 22, 30, 25],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: true, position: "top" as const } },
    scales: { y: { beginAtZero: true } },
  };

  // 🔔 Recent Activity
  const activities = [
    { id: 1, text: "User John booked Field 1", time: "2h ago" },
    { id: 2, text: "Admin updated pricing", time: "5h ago" },
    { id: 3, text: "New user signup: Alice", time: "1d ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 📊 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xl font-semibold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 📈 Bookings Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings Overview</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* 📋 Recent Bookings Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 text-sm font-medium text-gray-600">User</th>
                <th className="p-3 text-sm font-medium text-gray-600">Playground</th>
                <th className="p-3 text-sm font-medium text-gray-600">Date</th>
                <th className="p-3 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-700">{booking.guest_name}</td>
                  <td className="p-3 text-sm text-gray-700">{booking.playground.name}</td>
                  <td className="p-3 text-sm text-gray-700">{booking.date}</td>
                  <td className="p-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🏟️ Playgrounds List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Playgrounds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {playgrounds.map((pg) => (
              <div key={pg.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                <h4 className="font-semibold text-gray-800">{pg.name}</h4>
                <p className="text-sm text-gray-600">{pg.location}</p>
                <p className="text-sm text-gray-700">{pg.price_per_hour}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    pg.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {pg.is_active ? "Available" : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 🔔 Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <ul className="space-y-3">
            {activities.map((act) => (
              <li key={act.id} className="flex justify-between text-sm text-gray-600">
                <span>{act.text}</span>
                <span className="text-gray-500">{act.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Overview;
