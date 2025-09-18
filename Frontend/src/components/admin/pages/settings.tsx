import React, { useState } from "react";

const Settings: React.FC = () => {
  // Example user role: "admin" or "super-admin"
  const [userRole] = useState<"admin" | "super-admin">("admin");

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    password: "",
  });

  const [general, setGeneral] = useState({
    currency: "USD",
    timezone: "GMT+3",
    maxBookingHours: 4,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleGeneralChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGeneral({ ...general, [name]: value });
  };

  const handleNotificationsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleSave = () => {
    alert("Settings saved!");
    // Here you would send data to API
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={profile.name}
            onChange={handleProfileChange}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={profile.email}
            onChange={handleProfileChange}
            className="border px-3 py-2 rounded w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={profile.password}
            onChange={handleProfileChange}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="currency"
            value={general.currency}
            onChange={handleGeneralChange}
            className="border px-3 py-2 rounded w-full"
            disabled={userRole !== "super-admin"} // only editable for super-admin
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="ETB">ETB</option>
          </select>

          <select
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

          <input
            type="number"
            name="maxBookingHours"
            value={general.maxBookingHours}
            onChange={handleGeneralChange}
            placeholder="Max Booking Hours"
            className="border px-3 py-2 rounded w-full"
            disabled={userRole !== "super-admin"}
          />
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
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Save Settings
      </button>
    </div>
  );
};

export default Settings;
