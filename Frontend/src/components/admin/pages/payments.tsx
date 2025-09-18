import React, { useState, useEffect } from "react";
import axios from "../../../hooks/api";

interface Payment {
  id: number;
  user: string;
  bookingId: number;
  amount: number;
  method: "Stripe" | "PayPal" | "Swish" | "Klarna";
  date: string;
  status: "pending" | "completed" | "failed" | "refunded";
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    date: "",
    status: "",
    method: "",
  });

  // Fetch payments from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("/payments/");
        setPayments(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Refund a payment via backend
  const handleRefund = async (id: number) => {
    try {
      await axios.post(`/payments/${id}/refund/`);
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "refunded" } : p))
      );
    } catch (err) {
      console.error(err);
      alert("Refund failed. Please try again.");
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const filteredPayments = payments.filter((p) => {
    return (
      (!filters.date || p.date === filters.date) &&
      (!filters.status || p.status === filters.status) &&
      (!filters.method || p.method === filters.method)
    );
  });

  const getStatusBadge = (status: Payment["status"]) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-gray-200 text-gray-600",
    };
    return styles[status];
  };

  if (loading) return <p className="p-6">Loading payments...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payments Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        >
          <option value="">Filter by status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          name="method"
          value={filters.method}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        >
          <option value="">Filter by method</option>
          <option value="Stripe">Stripe</option>
          <option value="PayPal">PayPal</option>
          <option value="Swish">Swish</option>
          <option value="Klarna">Klarna</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Payment ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Booking ID</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-3 text-center text-gray-500">
                  No payments found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{payment.id}</td>
                  <td className="p-3">{payment.user}</td>
                  <td className="p-3">#{payment.bookingId}</td>
                  <td className="p-3">${payment.amount}</td>
                  <td className="p-3">{payment.method}</td>
                  <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className={`p-3 px-3 py-1 rounded text-sm font-medium ${getStatusBadge(payment.status)}`}>
                    {payment.status}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => alert(`Viewing payment ${payment.id}`)}
                      className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      View
                    </button>
                    {payment.status === "completed" && (
                      <button
                        onClick={() => handleRefund(payment.id)}
                        className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
