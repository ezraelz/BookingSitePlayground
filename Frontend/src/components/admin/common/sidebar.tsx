import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  UserCircleIcon,
  CalendarIcon,
  CreditCardIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  matchPattern?: RegExp;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // Get user data safely
    setUsername(localStorage.getItem('username') || 'User');
    setEmail(localStorage.getItem('email') || 'user@example.com');
  }, []);

  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard', matchPattern: /^\/dashboard\/?$/ },
    { name: 'Users', icon: UsersIcon, path: '/dashboard/users', matchPattern: /^\/dashboard\/users/ },
    { name: 'Timeslots', icon: CalendarIcon, path: '/dashboard/timeslots', matchPattern: /^\/dashboard\/timeslots/ },
    { name: 'Bookings', icon: CalendarIcon, path: '/dashboard/bookings', matchPattern: /^\/dashboard\/bookings/ },
    { name: 'Payments', icon: CreditCardIcon, path: '/dashboard/payments', matchPattern: /^\/dashboard\/payments/ },
    { name: 'Playgrounds', icon: CubeIcon, path: '/dashboard/playgrounds', matchPattern: /^\/dashboard\/playgrounds/ },
    { name: 'Analytics', icon: ChartBarIcon, path: '/dashboard/analytics', matchPattern: /^\/dashboard\/analytics/ },
    { name: 'Settings', icon: CogIcon, path: '/dashboard/settings', matchPattern: /^\/dashboard\/settings/ },
  ];

  const isActiveNavItem = (item: NavItem): boolean => {
    if (item.matchPattern) {
      return item.matchPattern.test(location.pathname);
    }
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const handleKeyPress = (
    event: React.KeyboardEvent,
    callback: () => void
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed top-0 left-0 z-50 transition-all duration-300 flex flex-col overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <h2 className="text-xl font-semibold truncate select-none">
            Admin Panel
          </h2>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          tabIndex={0}
          onKeyDown={(e) => handleKeyPress(e, onToggle)}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="w-5 h-5" />
          ) : (
            <ChevronDoubleLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-2 border-b border-gray-700 flex items-center">
        <UserCircleIcon className="w-10 h-10 text-gray-400 flex-shrink-0" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate select-none">{username}</p>
            <p className="text-xs text-gray-400 truncate select-none">{email}</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-1 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveNavItem(item);

            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center p-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyPress(e, () => navigate(item.path))}
                >
                  <IconComponent 
                    className={`w-5 h-5 min-w-[1.25rem] ${isActive ? 'text-white' : 'text-gray-400'}`} 
                  />
                  {!collapsed && (
                    <span className="ml-3 truncate select-none">{item.name}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex w-full items-center p-3 rounded-md text-gray-300 hover:bg-red-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          tabIndex={0}
          onKeyDown={(e) => handleKeyPress(e, handleLogout)}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 min-w-[1.25rem]" />
          {!collapsed && <span className="ml-3 select-none">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;