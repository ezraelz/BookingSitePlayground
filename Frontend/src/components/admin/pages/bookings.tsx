import React, { useEffect, useState } from "react";
import axios from "../../../hooks/api";

interface Booking {
  id: number;
  guest_name: string;
  playground: {
    name: string;
  };
  time_slot: {
    start_time: string;
    end_time: string;
  };
  date: string;
  status: string;
  is_paid: boolean;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(()=> {
    const fetchBookings = async ()=> {
      const res = await axios.get('/booking/');
      setBookings(res.data);
    }
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: number, status: Booking["status"]) => {
    setLoadingId(id);
    try {
      await axios.put(`/booking/${id}/`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } finally {
      setLoadingId(null);
    }
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
              <th className="p-3 text-left">Paid</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{booking.id}</td>
                <td className="p-3">{booking.guest_name}</td>
                <td className="p-3">{booking.playground.name}</td>
                <td className="p-3">{booking.time_slot.start_time} - {booking.time_slot.end_time}</td>
                <td className="p-3">{booking.date}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      booking.is_paid === true
                        ? "bg-green-100 text-green-700"
                        : booking.is_paid === false
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.is_paid === true ? 'Paid' : 'UnPaid'}
                  </span>
                </td>
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
