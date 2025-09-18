import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../hooks/api";

interface Payment {
  id: number;
  user: string;
  bookingId: number;
  amount: number;
  method: "Stripe" | "PayPal" | "Swish" | "Klarna";
  date: string;
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_id?: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    date: "",
    status: "",
    method: "",
    search: "",
  });

  // Fetch payments from backend
  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/payments/");
      setPayments(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let result = payments.filter((payment) =>
      payment.user.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.bookingId.toString().includes(filters.search) ||
      payment.transaction_id?.toLowerCase().includes(filters.search.toLowerCase())
    );

    if (filters.date) {
      result = result.filter((payment) => payment.date === filters.date);
    }

    if (filters.status) {
      result = result.filter((payment) => payment.status === filters.status);
    }

    if (filters.method) {
      result = result.filter((payment) => payment.method === filters.method);
    }

    setFilteredPayments(result);
  };

  // Refund a payment via backend
  const handleRefund = async (id: number) => {
    if (!window.confirm("Are you sure you want to process this refund?")) return;
    
    setRefundingId(id);
    try {
      await axios.post(`/payments/${id}/refund/`);
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "refunded" } : p))
      );
      toast.success("Refund processed successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Refund failed. Please try again.");
    } finally {
      setRefundingId(null);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      date: "",
      status: "",
      method: "",
      search: "",
    });
  };

  const getStatusBadge = (status: Payment["status"]) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`;
  };

  const getMethodIcon = (method: Payment["method"]) => {
    const icons = {
      Stripe: "💳",
      PayPal: "📊",
      Swish: "📱",
      Klarna: "🛒",
    };
    return icons[method];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const refundedAmount = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all payment transactions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Refunded</p>
              <p className="text-2xl font-bold text-gray-600">{formatCurrency(refundedAmount)}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ArrowTrendingDownIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search users, booking ID, or transaction ID..."
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              name="method"
              value={filters.method}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Methods</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Swish">Swish</option>
              <option value="Klarna">Klarna</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.date || filters.status || filters.method || filters.search) && (
          <div className="flex items-center mt-4 flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
              </span>
            )}
            {filters.date && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Date: {formatDate(filters.date)}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Status: {filters.status}
              </span>
            )}
            {filters.method && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Method: {filters.method}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2 flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{payment.id}</div>
                      {payment.transaction_id && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {payment.transaction_id}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{payment.user}</span>
                      </div>
                      <div className="text-sm text-gray-500">Booking #{payment.bookingId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getMethodIcon(payment.method)}</span>
                        <span className="text-sm text-gray-700">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(payment.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(payment.status)}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => alert(`Viewing payment ${payment.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {payment.status === "completed" && (
                        <button
                          onClick={() => handleRefund(payment.id)}
                          disabled={refundingId === payment.id}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Process refund"
                        >
                          {refundingId === payment.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ArrowPathIcon className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <CurrencyDollarIcon className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="font-medium">No payments found</p>
                      <p className="text-sm mt-1">
                        {filters.search || filters.date || filters.status || filters.method
                          ? 'Try adjusting your search or filter parameters'
                          : 'No payments have been processed yet'
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

      {/* Summary */}
      {!loading && filteredPayments.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
            <div className="text-sm font-medium text-gray-900">
              Total: {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;