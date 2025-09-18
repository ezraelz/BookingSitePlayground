import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "customer";
  status: "active" | "suspended";
  joined: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated API fetch
    setUsers([
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "customer",
        status: "active",
        joined: "2025-01-12",
      },
      {
        id: 2,
        name: "Admin User",
        email: "admin@playground.com",
        role: "admin",
        status: "active",
        joined: "2024-11-05",
      },
      {
        id: 3,
        name: "Manager Jane",
        email: "jane@playground.com",
        role: "manager",
        status: "suspended",
        joined: "2024-09-23",
      },
    ]);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users</h2>
        <button 
          onClick={()=> navigate(`/dashboard/users/add`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="py-2 px-3 border">#</th>
              <th className="py-2 px-3 border">Name</th>
              <th className="py-2 px-3 border">Email</th>
              <th className="py-2 px-3 border">Role</th>
              <th className="py-2 px-3 border">Status</th>
              <th className="py-2 px-3 border">Joined</th>
              <th className="py-2 px-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 text-sm">
                <td className="py-2 px-3 border">{index + 1}</td>
                <td className="py-2 px-3 border">{user.name}</td>
                <td className="py-2 px-3 border">{user.email}</td>
                <td className="py-2 px-3 border capitalize">{user.role}</td>
                <td
                  className={`py-2 px-3 border font-medium ${
                    user.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {user.status}
                </td>
                <td className="py-2 px-3 border">{user.joined}</td>
                <td className="py-2 px-3 border space-x-2">
                  <button 
                    onClick={()=> navigate(`/dashboard/users/detail/${user.id}`)}
                    className="text-blue-600 hover:underline">
                    View
                  </button>
                  <button className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
