import React, { useEffect, useState } from "react";
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import axios from "../../../hooks/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ---------- helpers ---------- */

// Safe number → localized string
const fmt = (v: unknown, fractionDigits = 0) =>
  Number(v ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

// Prefer ETB by default. Change label if you use USD.
const money = (v: unknown) => `ETB ${fmt(v, 2)}`;

const formatISODate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

/* ---------- types lenient to API ---------- */

interface TimeslotObj {
  id: number;
  start_time?: string;
  end_time?: string;
  time?: string;
  is_active?: boolean;
}

interface PlaygroundType {
  id: number;
  name: string;
  location?: string;
  price_per_hour?: number | string;     // frontend legacy
  price_per_session?: number | string;  // backend alt
  is_active: boolean;
  timeslots?: TimeslotObj[];
}

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
}

type BookingStatusAPI = "pending" | "approved" | "cancelled" | string;

interface Booking {
  id: number;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  playground: {
    name: string;
  };
  // backend might return "time_slot" as object or "timeslot" as string
  time_slot?: { start_time: string; end_time: string };
  timeslot?: string;
  date: string; // YYYY-MM-DD
  status: BookingStatusAPI;
}

/* ---------- component ---------- */

const Overview: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [playgrounds, setPlaygrounds] = useState<PlaygroundType[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [activities, setActivities] = useState<Array<{ id: number; text: string; time: string; type: string }>>([]);

  const navigate = useNavigate();

  const [loading, setLoading] = useState({
    playgrounds: true,
    users: true,
    bookings: true,
    revenue: true,
    chart: true,
    activities: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({
          playgrounds: true,
          users: true,
          bookings: true,
          revenue: true,
          chart: true,
          activities: true,
        });

        const [playgroundsRes, usersRes, bookingsRes, revenueRes, chartRes, activitiesRes] = await Promise.all([
          axios.get("/fields/"),
          axios.get("/users/"),
          axios.get("/booking/"),
          axios.get("/revenue/?month=2025-09"),
          axios.get("/bookings/stats/?range=week"),
          axios.get("/activities/"),
        ]);

        setPlaygrounds(Array.isArray(playgroundsRes.data) ? playgroundsRes.data : []);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setRevenue(Number(revenueRes?.data?.total ?? 0));

        const labels = Array.isArray(chartRes?.data?.labels) ? chartRes.data.labels : [];
        const values = Array.isArray(chartRes?.data?.values) ? chartRes.data.values : [];

        setChartData({
          labels,
          datasets: [
            {
              label: "Bookings",
              data: values,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "#6366f1",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 4,
            },
          ],
        });

        setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Keep safe defaults so the UI still renders
        setPlaygrounds([]);
        setUsers([]);
        setBookings([]);
        setRevenue(0);
        setChartData({ labels: [], datasets: [] });
        setActivities([]);
      } finally {
        setLoading({
          playgrounds: false,
          users: false,
          bookings: false,
          revenue: false,
          chart: false,
          activities: false,
        });
      }
    };

    fetchData();
  }, []);

  const todayISO = new Date().toISOString().split("T")[0];

  // Normalize API booking status to Title Case for the pill
  const prettyStatus = (s: string) => {
    const v = (s || "").toLowerCase();
    if (v === "approved") return "Approved";
    if (v === "pending") return "Pending";
    if (v === "cancelled") return "Cancelled";
    return s || "Unknown";
  };

  const statusPill = (s: string) => {
    const v = (s || "").toLowerCase();
    if (v === "approved") return "bg-green-100 text-green-800";
    if (v === "pending") return "bg-amber-100 text-amber-800";
    if (v === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
    };

  const getActivityIcon = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "booking":
        return <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />;
      case "payment":
        return <CurrencyDollarIcon className="w-5 h-5 text-green-500" />;
      case "user":
        return <UsersIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <EyeIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // price helper (supports both API field names)
  const priceForPlayground = (pg: PlaygroundType) =>
    Number(pg?.price_per_session ?? pg?.price_per_hour ?? 0);

  const summaryCards = [
    {
      title: "Total Playgrounds",
      value: playgrounds.length,
      icon: BuildingStorefrontIcon,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "+2.5%",
      loading: loading.playgrounds,
    },
    {
      title: "Bookings Today",
      value: bookings.filter((b) => b.date === todayISO).length,
      icon: ClipboardDocumentListIcon,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "+12.4%",
      loading: loading.bookings,
    },
    {
      title: "Monthly Revenue",
      value: money(revenue), // <- safe
      icon: CurrencyDollarIcon,
      color: "bg-gradient-to-r from-amber-500 to-amber-600",
      trend: "+8.3%",
      loading: loading.revenue,
    },
    {
      title: "Active Users",
      value: users.length,
      icon: UsersIcon,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "+5.7%",
      loading: loading.users,
    },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#f9fafb",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" } },
      x: { grid: { display: false } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Generate Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  {card.loading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof card.value === "number" ? fmt(card.value) : String(card.value)}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">{card.trend}</span>
                    <span className="text-xs text-gray-500 ml-1">from last week</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings Chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Bookings Overview</h3>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-80">
              {loading.chart ? (
                <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg" />
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
            </div>
            <ul className="space-y-4">
              {loading.activities ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full mr-3" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                    </div>
                  </li>
                ))
              ) : activities.length > 0 ? (
                activities.slice(0, 6).map((act) => (
                  <li key={act.id} className="flex items-start">
                    <div className="p-1.5 bg-gray-100 rounded-lg mr-3 mt-0.5">{getActivityIcon(act.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{act.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{act.time}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <button
                onClick={() => navigate("/dashboard/bookings")}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Playground</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.bookings ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                        </td>
                        <td className="py-3">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
                        </td>
                        <td className="py-3">
                          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                        </td>
                        <td className="py-3">
                          <div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-sm font-medium text-gray-900">{b.guest_name}</td>
                        <td className="py-3 text-sm text-gray-700">{b.playground?.name ?? "-"}</td>
                        <td className="py-3 text-sm text-gray-700">{formatISODate(b.date)}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusPill(b.status)}`}>
                            {prettyStatus(b.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Playgrounds */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Playgrounds</h3>
              <button
                onClick={() => navigate("/dashboard/playgrounds")}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-4">
              {loading.playgrounds ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-xl p-4 bg-gray-50 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                ))
              ) : (
                playgrounds.slice(0, 3).map((pg) => (
                  <div key={pg.id} className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{pg.name}</h4>
                        {pg.location && <p className="text-sm text-gray-600 mt-1">{pg.location}</p>}
                        <p className="text-sm text-gray-700 mt-1">{money(priceForPlayground(pg))}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          pg.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pg.is_active ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
