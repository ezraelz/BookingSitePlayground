import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  EyeIcon,
  TrashIcon,
  PencilSquareIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  UserPlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../../hooks/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, search, statusFilter, roleFilter, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users/');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let result = users.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(user => 
        statusFilter === "active" ? user.is_active : !user.is_active
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key as keyof User] < b[sortConfig.key as keyof User]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof User] > b[sortConfig.key as keyof User]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (userId: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      try {
        await axios.delete(`/users/${userId}/`);
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } catch (err) {
        toast.error('Failed to delete user.');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHeaderClass = (key: string) => {
    if (!sortConfig) return '';
    return sortConfig.key === key ? 'text-blue-600 font-semibold' : '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all system users and their permissions</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/users/add')}
          className="flex items-center bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Status</label>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Role</label>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('username')}
              >
                <div className="flex items-center">
                  User
                  <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('email')}
              >
                <div className="flex items-center">
                  Email
                  <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('role')}
              >
                <div className="flex items-center">
                  Role
                  <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('is_active')}
              >
                <div className="flex items-center">
                  Status
                  <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('created_at')}
              >
                <div className="flex items-center">
                  Joined
                  <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-indigo-800">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => navigate(`/dashboard/users/detail/${user.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50"
                      title="View details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/users/edit/${user.id}`)}
                      className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded-md hover:bg-yellow-50"
                      title="Edit user"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50"
                      title="Delete user"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <UserPlusIcon className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mt-1">
                      {search || statusFilter !== 'all' || roleFilter !== 'all' 
                        ? 'Try adjusting your search or filter parameters' 
                        : 'Get started by adding your first user'
                      }
                    </p>
                    {(search || statusFilter !== 'all' || roleFilter !== 'all') ? (
                      <button
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('all');
                          setRoleFilter('all');
                        }}
                        className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset filters
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/dashboard/users/add')}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add User
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (optional) */}
      {filteredUsers.length > 0 && !loading && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
            <span className="font-medium">{users.length}</span> users
          </div>
          {/* Pagination controls would go here */}
        </div>
      )}
    </div>
  );
};

export default Users;