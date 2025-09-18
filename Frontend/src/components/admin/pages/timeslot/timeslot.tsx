import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../../../hooks/api";

interface Timeslot {
  id: number;
  start_time: string;
  end_time: string;
  price: number;
  status: "available" | "booked";
}

const Timeslot: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);

  const [form, setForm] = useState({
    start_time: "",
    end_time: "",
    price: "",
    status: "available",
  });

  useEffect(() => {
      const fetchTimeslotsAndAvailability = async () => {
  
        try {
          // Fetch timeslots from /timeslot/
          const timeslotRes = await axios.get('/timeslot/');
          const timeslots: Timeslot[] = timeslotRes.data;
  
          setTimeslots(timeslots);
        } catch (err) {
          toast.error('Failed to fetch timeslots or availability. Displaying default schedule.');
          console.error(err);
        }
      };
  
      fetchTimeslotsAndAvailability();
    }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`/timeslot/`, form);
    setForm({
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
              <th className="p-3 border">No</th>
              <th className="p-3 border">Start</th>
              <th className="p-3 border">End</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeslots.map((slot, index) => (
              <tr key={slot.id} className="hover:bg-gray-50">
                <td className="p-3 border">{index + 1}</td>
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
