import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../../../hooks/api";

interface Profile {
  username: string;
  email: string;
  role: string;
  password?: string;
}

interface GeneralSettings {
  currency: string;
  timezone: string;
  maxBookingHours: number;
}

interface Notifications {
  email: boolean;
  sms: boolean;
}

const Settings: React.FC = () => {
  const userRole = localStorage.getItem("role") || "user"; // Fallback to 'user'
  const id = localStorage.getItem("id") || ""; // Fallback to empty string
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    username: localStorage.getItem("username") || "",
    email: localStorage.getItem("email") || "",
    role: userRole,
    password: "",
  });
  const [general, setGeneral] = useState<GeneralSettings>({
    currency: "USD",
    timezone: "GMT+3",
    maxBookingHours: 4,
  });
  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    sms: false,
  });

  // Validate email format
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate form inputs
  const validateForm = () => {
    if (!profile.username) return "Username is required";
    if (!isValidEmail(profile.email)) return "Invalid email format";
    if (profile.password && profile.password.length < 8) return "Password must be at least 8 characters";
    if (general.maxBookingHours < 1) return "Max booking hours must be positive";
    return null;
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneral({ ...general, [name]: name === "maxBookingHours" ? parseInt(value) : value });
  };

  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      // Save profile
      await axios.put(`/users/${id}/`, {
        ...profile,
        password: profile.password || undefined, // Exclude empty password
      });

      // Save general settings (if super-admin)
      if (userRole === "super-admin") {
        await axios.put(`/settings/general/`, general);
      }

      // Save notifications
      await axios.put(`/users/${id}/notifications/`, notifications);

      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Username"
              value={profile.username}
              onChange={handleProfileChange}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={profile.email}
              onChange={handleProfileChange}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              id="role"
              type="text"
              name="role"
              value={profile.role}
              className="border px-3 py-2 rounded w-full bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="New Password"
              value={profile.password}
              onChange={handleProfileChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        </form>
      </div>

      {/* General Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={general.currency}
              onChange={handleGeneralChange}
              className="border px-3 py-2 rounded w-full"
              disabled={userRole !== "super-admin"}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="ETB">ETB</option>
            </select>
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={general.timezone}
              onChange={handleGeneralChange}
              className="border px-3 py-2 rounded w-full"
              disabled={userRole !== "super-admin"}
            >
              <option value="GMT+0">GMT+0</option>
              <option value="GMT+3">GMT+3</option>
              <option value="GMT+5">GMT+5</option>
            </select>
          </div>
          <div>
            <label htmlFor="maxBookingHours" className="block text-sm font-medium text-gray-700">
              Max Booking Hours
            </label>
            <input
              id="maxBookingHours"
              type="number"
              name="maxBookingHours"
              value={general.maxBookingHours}
              onChange={handleGeneralChange}
              placeholder="Max Booking Hours"
              className="border px-3 py-2 rounded w-full"
              disabled={userRole !== "super-admin"}
              min="1"
            />
          </div>
        </div>
        {userRole !== "super-admin" && (
          <p className="mt-2 text-sm text-gray-500">
            Some settings are only editable by super-admins.
          </p>
        )}
      </div>

      {/* Notifications Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="email"
              checked={notifications.email}
              onChange={handleNotificationsChange}
            />
            Email Notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sms"
              checked={notifications.sms}
              onChange={handleNotificationsChange}
            />
            SMS Notifications
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Save All Settings"}
      </button>
    </div>
  );
};

export default Settings;