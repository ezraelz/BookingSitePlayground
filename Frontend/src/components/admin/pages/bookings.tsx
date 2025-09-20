import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

// ---- Local axios instance (no external hook)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    Accept: "application/json",
    // Don't override transformRequest; let axios JSON-encode objects by default.
  },
  withCredentials: false,
});

type BookingStatus = "pending" | "approved" | "cancelled";

interface PlaygroundLite {
  id: number;
  name: string;
  price_per_session?: string | number;
  price_per_hour?: string | number;
}

interface TimeSlotLite {
  id: number;
  start_time: string; // "06:00:00"
  end_time: string;   // "08:00:00"
}

interface Booking {
  id: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  playground: PlaygroundLite;
  time_slot: TimeSlotLite;
  date: string;         // "YYYY-MM-DD"
  status: BookingStatus;
  is_paid: boolean;
  total_amount?: number;
  created_at: string;
  updated_at?: string;
  user?: number | null;
  series?: number | null;
  chapa_tx_ref?: string;
  price_etb?: string | number;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");

  // details modal
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, searchTerm, statusFilter, dateFilter, paymentFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get<Booking[]>("/booking/");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Failed to fetch bookings.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const res = await api.get<Booking>(`/booking/${id}/`);
      setSelected(res.data);
    } catch (error) {
      const local = bookings.find((b) => b.id === id) || null;
      setSelected(local);
      if (!local) toast.error("Failed to load booking details.");
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (id: number) => {
    setShowDetail(true);
    setSelected(null);
    fetchBookingDetail(id);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelected(null);
  };

  const filterBookings = () => {
    let result = bookings.filter((b) => {
      const q = searchTerm.toLowerCase();
      return (
        (b.guest_name || "").toLowerCase().includes(q) ||
        (b.guest_email || "").toLowerCase().includes(q) ||
        (b.playground?.name || "").toLowerCase().includes(q) ||
        String(b.id).includes(searchTerm)
      );
    });

    if (statusFilter !== "all") result = result.filter((b) => b.status === statusFilter);
    if (dateFilter) result = result.filter((b) => b.date === dateFilter);
    if (paymentFilter !== "all") result = result.filter((b) => (paymentFilter === "paid" ? b.is_paid : !b.is_paid));

    setFilteredBookings(result);
  };

  const confirmAction = async (message: string) => {
    return window.confirm(message);
  };

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    const verb = status === "approved" ? "approve" : "cancel";
    const ok = await confirmAction(`Are you sure you want to ${verb} booking #${id}?`);
    if (!ok) return;

    setLoadingId(id);
    try {
      // Send plain object; axios will JSON-encode it.
      await api.put(`/booking/${id}/`, { status });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status, is_paid: status === "approved" ? true : b.is_paid } : b
        )
      );
      toast.success(`Booking ${status} successfully`);
      if (showDetail && selected?.id === id) {
        fetchBookingDetail(id);
      }
    } catch (error) {
      toast.error("Failed to update booking status.");
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

  const formatDateTime = (iso: string | undefined) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const formatTime = (timeString: string) => {
    const [hStr, mStr] = timeString.split(":");
    const hours = parseInt(hStr || "0", 10);
    const minutes = mStr ?? "00";
    const period = hours >= 12 ? "PM" : "AM";
    const twelve = hours % 12 || 12;
    return `${twelve}:${minutes} ${period}`;
  };

  const getStatusPill = (status: BookingStatus) => {
    const map: Record<BookingStatus, string> = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentPill = (isPaid: boolean) =>
    isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

  const toNumber = (v: unknown) => (typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0);

  const bookingAmount = (b: Booking) => {
    if (typeof b.total_amount === "number") return b.total_amount;
    if (typeof b.price_etb === "number" || typeof b.price_etb === "string") return toNumber(b.price_etb);
    const perSession =
      toNumber(b.playground?.price_per_session) || toNumber(b.playground?.price_per_hour);
    return perSession || 0;
  };

  const totalRevenue = filteredBookings
    .filter((b) => b.is_paid)
    .reduce((sum, b) => sum + bookingAmount(b), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all booking requests</p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
          title="Refresh"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== "all" || dateFilter || paymentFilter !== "all") && (
          <div className="flex items-center mt-4 flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {searchTerm}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Status: {statusFilter}
              </span>
            )}
            {dateFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Date: {formatDate(dateFilter)}
              </span>
            )}
            {paymentFilter !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Payment: {paymentFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("");
                setPaymentFilter("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2 flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Playground & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{b.id}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {formatDate(b.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{b.guest_name}</div>
                      <div className="text-sm text-gray-500">{b.guest_email}</div>
                      <div className="text-sm text-gray-500">{b.guest_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{b.playground?.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatTime(b.time_slot.start_time)} – {formatTime(b.time_slot.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentPill(b.is_paid)}`}>
                        {b.is_paid ? "Paid" : "Unpaid"}
                      </span>
                      {b.is_paid && (
                        <div className="text-sm text-gray-600 mt-1">
                          ETB {bookingAmount(b).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusPill(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetail(b.id)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>

                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(b.id, "approved")}
                            disabled={loadingId === b.id}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
                            title="Approve booking"
                          >
                            {loadingId === b.id ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleStatusChange(b.id, "cancelled")}
                            disabled={loadingId === b.id}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Cancel booking"
                          >
                            {loadingId === b.id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <CalendarDaysIcon className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="font-medium">No bookings found</p>
                      <p className="text-sm mt-1">
                        {searchTerm || statusFilter !== "all" || dateFilter || paymentFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "No bookings have been made yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {!loading && filteredBookings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900">{filteredBookings.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredBookings.filter((b) => b.status === "pending").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredBookings.filter((b) => b.status === "approved").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-2xl font-bold text-blue-600">
              ETB {totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-detail-title"
        >
          <div className="absolute inset-0 bg-black/30" onClick={closeDetail} aria-hidden="true" />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 id="booking-detail-title" className="text-xl font-bold text-gray-900">
                  Booking Details
                </h2>
                {selected && (
                  <p className="text-sm text-gray-500 mt-1">
                    #{selected.id} • {formatDate(selected.date)}
                  </p>
                )}
              </div>
              <button
                onClick={closeDetail}
                className="text-gray-500 hover:text-gray-700 rounded-md p-2 hover:bg-gray-50"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {detailLoading || !selected ? (
              <div className="py-10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusPill(selected.status)}`}>
                      {selected.status}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-xs text-gray-500">Payment</div>
                    <div className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentPill(selected.is_paid)}`}>
                      {selected.is_paid ? "Paid" : "Unpaid"}
                    </div>
                    {selected.is_paid && (
                      <div className="mt-1 text-sm text-gray-700">
                        ETB {bookingAmount(selected).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Guest</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Name:</span> {selected.guest_name || "-"}</div>
                    <div><span className="text-gray-500">Email:</span> {selected.guest_email || "-"}</div>
                    <div><span className="text-gray-500">Phone:</span> {selected.guest_phone || "-"}</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Playground & Time</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500">Playground:</span> {selected.playground?.name || "-"}</div>
                    <div><span className="text-gray-500">Date:</span> {formatDate(selected.date)}</div>
                    <div>
                      <span className="text-gray-500">Time:</span>{" "}
                      {formatTime(selected.time_slot.start_time)} – {formatTime(selected.time_slot.end_time)}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Meta</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Created:</span> {formatDateTime(selected.created_at)}</div>
                    <div><span className="text-gray-500">Updated:</span> {formatDateTime(selected.updated_at)}</div>
                    <div><span className="text-gray-500">User ID:</span> {selected.user ?? "-"}</div>
                    <div><span className="text-gray-500">Series ID:</span> {selected.series ?? "-"}</div>
                    <div className="md:col-span-2"><span className="text-gray-500">Chapa Ref:</span> {selected.chapa_tx_ref || "-"}</div>
                  </div>
                </div>

                {selected.status === "pending" && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleStatusChange(selected.id, "cancelled")}
                      disabled={loadingId === selected.id}
                      className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {loadingId === selected.id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id, "approved")}
                      disabled={loadingId === selected.id}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {loadingId === selected.id ? "Approving..." : "Approve Booking"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
