import React, { useState } from "react";

interface Booking {
  id: number;
  user: string;
  playground: string;
  timeslot: string;
  date: string;
  status: "pending" | "approved" | "canceled";
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      user: "John Doe",
      playground: "Green Field",
      timeslot: "10:00 AM - 11:00 AM",
      date: "2025-09-18",
      status: "pending",
    },
    {
      id: 2,
      user: "Jane Smith",
      playground: "Blue Arena",
      timeslot: "01:00 PM - 02:00 PM",
      date: "2025-09-19",
      status: "approved",
    },
  ]);

  const handleStatusChange = (id: number, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bookings Management</h1>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          className="border p-2 rounded w-48"
          placeholder="Filter by date"
        />
        <select className="border p-2 rounded w-48">
          <option value="">Filter by status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Booking ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Playground</th>
              <th className="p-3 text-left">Timeslot</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{booking.id}</td>
                <td className="p-3">{booking.user}</td>
                <td className="p-3">{booking.playground}</td>
                <td className="p-3">{booking.timeslot}</td>
                <td className="p-3">{booking.date}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      booking.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => alert(`Viewing booking ${booking.id}`)}
                    className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, "approved")}
                    className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, "canceled")}
                    className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
