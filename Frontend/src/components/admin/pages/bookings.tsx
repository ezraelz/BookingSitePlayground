import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../hooks/api";

interface Booking {
  id: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  playground: {
    id: number;
    name: string;
  };
  time_slot: {
    id: number;
    start_time: string;
    end_time: string;
  };
  date: string;
  status: string;
  is_paid: boolean;
  total_amount: number;
  created_at: string;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter, paymentFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/booking/');
      setBookings(res.data);
    } catch (error) {
      toast.error('Failed to fetch bookings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let result = bookings.filter(booking =>
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.playground.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().includes(searchTerm)
    );

    if (statusFilter !== "all") {
      result = result.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter(booking => booking.date === dateFilter);
    }

    if (paymentFilter !== "all") {
      result = result.filter(booking => 
        paymentFilter === "paid" ? booking.is_paid : !booking.is_paid
      );
    }

    setFilteredBookings(result);
  };

  const handleStatusChange = async (id: number, status: Booking["status"]) => {
    setLoadingId(id);
    try {
      await axios.put(`/booking/${id}/`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update booking status.');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (isPaid: boolean) => {
    return isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all booking requests</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Payment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
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

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Playground & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {formatDate(booking.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                      <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      <div className="text-sm text-gray-500">{booking.guest_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.playground.name}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatTime(booking.time_slot.start_time)} - {formatTime(booking.time_slot.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(booking.is_paid)}`}>
                        {booking.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                      {booking.is_paid && (
                        <div className="text-sm text-gray-500 mt-1">${booking.total_amount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => alert(`Viewing booking ${booking.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking.id, "approved")}
                            disabled={loadingId === booking.id}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
                            title="Confirm booking"
                          >
                            {loadingId === booking.id ? (
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                            disabled={loadingId === booking.id}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Cancel booking"
                          >
                            {loadingId === booking.id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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
                        {searchTerm || statusFilter !== 'all' || dateFilter || paymentFilter !== 'all'
                          ? 'Try adjusting your search or filter parameters'
                          : 'No bookings have been made yet'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && filteredBookings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900">{filteredBookings.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredBookings.filter(b => b.status === "pending").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredBookings.filter(b => b.status === "approved").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-2xl font-bold text-blue-600">
              ${filteredBookings.filter(b => b.is_paid).reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;