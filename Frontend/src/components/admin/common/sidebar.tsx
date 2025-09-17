import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(window.location.pathname);

  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Users', icon: UsersIcon, path: '/dashboard/users' },
    { name: 'Timeslot', icon: UsersIcon, path: '/dashboard/timeslots' },
    { name: 'Fields', icon: UsersIcon, path: '/dashboard/fields' },
    { name: 'Analytics', icon: ChartBarIcon, path: '/dashboard/analytics' },
    { name: 'Settings', icon: CogIcon, path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const handleNavClick = (path: string) => {
    setActivePath(path);
  };

  const handleKeyPress = (event: React.KeyboardEvent, callback: Function, ...args: any[]) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback(...args);
    }
  };

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed top-0 left-0 z-50 transition-all duration-300 flex flex-col overflow-hidden ${
        collapsed ? 'w-16' : 'w-54'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <h2 className="text-xl font-semibold truncate">Admin Panel</h2>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          tabIndex={0}
          onKeyPress={(e) => handleKeyPress(e, onToggle)}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="w-5 h-5" />
          ) : (
            <ChevronDoubleLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <UserCircleIcon className="w-10 h-10 text-gray-400" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@example.com</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePath === item.path;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  tabIndex={0}
                  onKeyPress={(e) => handleKeyPress(e, handleNavClick, item.path)}
                >
                  <IconComponent className="w-5 h-5 min-w-[1.25rem]" />
                  {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex w-full items-center p-3 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          tabIndex={0}
          onKeyPress={(e) => handleKeyPress(e, handleLogout)}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 min-w-[1.25rem]" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;