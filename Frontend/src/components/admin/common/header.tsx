import React from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  collapsed: boolean;
  sidebarWidth: number;
}

const Header: React.FC<HeaderProps> = ({ sidebarWidth }) => {
  return (
    <header
      className="bg-gray-800 text-white h-16 fixed top-0 right-0 flex items-center justify-between px-4 sm:px-6 z-10 shadow"
      style={{ left: sidebarWidth }}
    >
      {/* Left: Title */}
      <h1 className="text-lg font-semibold"></h1>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        <button
          aria-label="Notifications"
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <BellIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <UserCircleIcon className="w-6 h-6" />
          <span className="hidden md:inline-block text-sm font-medium">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
