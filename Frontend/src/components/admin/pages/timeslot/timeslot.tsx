import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../../hooks/api";

interface Timeslot {
  id: number;
  start_time: string;
  end_time: string;
  price_per_hour: number;
  status: "available" | "booked";
}

const Timeslot: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    start_time: "",
    end_time: "",
    price_per_hour: "",
    status: "available" as "available" | "booked",
  });

  useEffect(() => {
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    try {
      setLoading(true);
      const timeslotRes = await axios.get('/timeslot/');
      setTimeslots(timeslotRes.data);
    } catch (err) {
      toast.error('Failed to fetch timeslots.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/timeslot/${editingId}/`, form);
        toast.success('Timeslot updated successfully');
        setEditingId(null);
      } else {
        await axios.post(`/timeslot/`, form);
        toast.success('Timeslot added successfully');
      }
      setForm({
        start_time: "",
        end_time: "",
        price_per_hour: "",
        status: "available",
      });
      fetchTimeslots();
    } catch (err) {
      toast.error(editingId ? 'Failed to update timeslot.' : 'Failed to add timeslot.');
      console.error(err);
    }
  };

  const handleEdit = (timeslot: Timeslot) => {
    setForm({
      start_time: timeslot.start_time,
      end_time: timeslot.end_time,
      price_per_hour: timeslot.price_per_hour.toString(),
      status: timeslot.status,
    });
    setEditingId(timeslot.id);
  };

  const handleCancelEdit = () => {
    setForm({
      start_time: "",
      end_time: "",
      price_per_hour: "",
      status: "available",
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this timeslot?')) {
      try {
        await axios.delete(`/timeslot/${id}/`);
        toast.success('Timeslot deleted successfully');
        fetchTimeslots();
      } catch (err) {
        toast.error('Failed to delete timeslot.');
        console.error(err);
      }
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Timeslot Management</h1>
        <p className="text-gray-600 mt-2">Create and manage available booking timeslots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeslot List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">All Timeslots</h2>
            <span className="text-sm text-gray-500">
              {timeslots.length} {timeslots.length === 1 ? 'timeslot' : 'timeslots'}
            </span>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : timeslots.length > 0 ? (
            <div className="space-y-3">
              {timeslots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-medium">{formatTime(slot.start_time)}</span>
                        <ArrowsRightLeftIcon className="w-3 h-3 mx-1" />
                        <span className="font-medium">{formatTime(slot.end_time)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>${slot.price_per_hour}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slot.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(slot)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit timeslot"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete timeslot"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="font-medium">No timeslots found</p>
              <p className="text-sm mt-1">Create your first timeslot to get started</p>
            </div>
          )}
        </div>

        {/* Add/Edit Timeslot Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? 'Edit Timeslot' : 'Add New Timeslot'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                name="price_per_hour"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.price_per_hour}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex-1"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                {editingId ? 'Update Timeslot' : 'Add Timeslot'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Form Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure end time is after start time</li>
              <li>• Set appropriate pricing for different time slots</li>
              <li>• Mark as "Booked" for maintenance or unavailable periods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeslot;