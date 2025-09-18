import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddUser: React.FC = () => {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    status: "active",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New User Data:", form);

    // TODO: send data to backend via API
    // await api.post("/users", form);
  };

  return (
    <div className="bg-white shadow rounded-lg p-7 max-w-lg mx-auto mt-2">
       <button 
           onClick={()=> navigate(-1)}
           className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back
        </button>
      <h2 className="text-xl font-bold mb-3">Add New User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
