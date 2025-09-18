import React, { useState } from "react";

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
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 1,
      user: "John Doe",
      bookingId: 101,
      amount: 50,
      method: "Stripe",
      date: "2025-09-18",
      status: "completed",
    },
    {
      id: 2,
      user: "Jane Smith",
      bookingId: 102,
      amount: 80,
      method: "PayPal",
      date: "2025-09-17",
      status: "pending",
    },
    {
      id: 3,
      user: "Ali Mohammed",
      bookingId: 103,
      amount: 60,
      method: "Klarna",
      date: "2025-09-16",
      status: "failed",
    },
  ]);

  const handleRefund = (id: number) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "refunded" } : p))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payments Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="date" className="border p-2 rounded w-48" />
        <select className="border p-2 rounded w-48">
          <option value="">Filter by status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="border p-2 rounded w-48">
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
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{payment.id}</td>
                <td className="p-3">{payment.user}</td>
                <td className="p-3">#{payment.bookingId}</td>
                <td className="p-3">${payment.amount}</td>
                <td className="p-3">{payment.method}</td>
                <td className="p-3">{payment.date}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      payment.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : payment.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {payment.status}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
