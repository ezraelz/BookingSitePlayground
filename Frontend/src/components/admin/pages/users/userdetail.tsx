import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../../hooks/api";
import { toast } from "react-toastify";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams(); // get user id from route
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchUsers = async () => {
        try {
          const res = await axios.get(`/users/${id}`);
          setUser(res.data);
        } catch (err) {
          toast.error('Failed to fetch users.');
          console.error(err);
        }
      };
  
      fetchUsers();
    }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">User Details</h2>

      {/* User Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="text-lg font-semibold">{user.username}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-semibold">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-600">
            {user.role}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              user.is_active === true
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {user.is_active === true ? 'Active' : 'InActive'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created At</p>
          <p className="text-lg font-semibold">{user.created_at}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Last Login</p>
          <p className="text-lg font-semibold">{user.last_login}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
          Edit
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Delete
        </button>
        <button 
           onClick={()=> navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Back
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
