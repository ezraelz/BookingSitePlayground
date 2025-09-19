import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/header';
import Sidebar from '../common/sidebar';

const AdminBaseLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? 64 : 160; // px values (w-16 / w-64)

  return (
    <div className="min-h-screen bg-gray-50 flex-wrap">
      {/* Sidebar */}
      <Sidebar collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content Area */}
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header */}
        <Header collapsed={isCollapsed} sidebarWidth={sidebarWidth} />

        {/* Outlet for Nested Routes */}
        <main className="pt-16 p-4 ml-1 min-h-[calc(100vh - 64px)] flex-wrap">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminBaseLayout;
