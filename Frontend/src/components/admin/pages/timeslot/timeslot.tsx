import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Timeslot {
  id: number;
  field: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  status: "available" | "booked";
  bookedBy?: { id: number; name: string; email: string }; // link to booking/user
}

const Timeslot: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([
    {
      id: 1,
      field: "Playground A",
      date: "2025-09-20",
      start_time: "10:00",
      end_time: "12:00",
      price: 200,
      status: "available",
    },
    {
      id: 2,
      field: "Playground B",
      date: "2025-09-20",
      start_time: "14:00",
      end_time: "16:00",
      price: 250,
      status: "booked",
      bookedBy: { id: 101, name: "John Doe", email: "john@example.com" },
    },
  ]);

  const [form, setForm] = useState({
    field: "",
    date: "",
    start_time: "",
    end_time: "",
    price: "",
    status: "available",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: Timeslot = {
      id: timeslots.length + 1,
      field: form.field,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      price: Number(form.price),
      status: form.status as "available" | "booked",
      bookedBy:
        form.status === "booked"
          ? { id: 999, name: "Temp User", email: "user@example.com" }
          : undefined,
    };
    setTimeslots([...timeslots, newSlot]);
    setForm({
      field: "",
      date: "",
      start_time: "",
      end_time: "",
      price: "",
      status: "available",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Timeslots</h2>

      {/* Timeslot List */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Field</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Start</th>
              <th className="p-3 border">End</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Booked By</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeslots.map((slot) => (
              <tr key={slot.id} className="hover:bg-gray-50">
                <td className="p-3 border">{slot.field}</td>
                <td className="p-3 border">{slot.date}</td>
                <td className="p-3 border">{slot.start_time}</td>
                <td className="p-3 border">{slot.end_time}</td>
                <td className="p-3 border">${slot.price}</td>
                <td className="p-3 border">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      slot.status === "available"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {slot.status}
                  </span>
                </td>
                <td className="p-3 border">
                  {slot.bookedBy ? (
                    <Link
                      to={`/dashboard/users/${slot.bookedBy.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {slot.bookedBy.name} <br />
                      <span className="text-sm text-gray-500">
                        {slot.bookedBy.email}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-3 border space-x-2">
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    Edit
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Timeslot Form */}
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Add Timeslot</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="field"
            placeholder="Playground Name"
            value={form.field}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          >
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Timeslot
          </button>
        </form>
      </div>
    </div>
  );
};

export default Timeslot;
