import axios from '../../../hooks/api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface UserInfo {
  username: string | null;
  role: string | null;
  profileImage: string | null;
  id: string | null;
  is_superuser: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

const SignOut: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
  });

  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const role = localStorage.getItem("role");
      const profileImage = localStorage.getItem("profile_image");
      const username = localStorage.getItem("username");
      const id = localStorage.getItem("id");
      const is_superuser = localStorage.getItem("is_superuser") === "true";

      if (accessToken && refreshToken && role && id && !isNaN(parseInt(id, 10))) {
        setAuthState({
          isAuthenticated: true,
          user: { username, role, profileImage, id, is_superuser },
          accessToken,
          refreshToken,
          loading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const Signout = async () => {
    try {
      setError('');
      await axios.post(`/signout/`);
      localStorage.clear();
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
      });
      toast.success('Signed out successfully!');
      window.location.reload();
      navigate('/signin');
    } catch (err: any) {
      setError('Error signing out');
      toast.error('Failed to sign out.');
      console.error(err);
    }
  };

  useEffect(() => {
    Signout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Signed out successfully
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(`/signin`)}
            className="text-sm text-blue-600 hover:underline"
          >
            Log back in? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
