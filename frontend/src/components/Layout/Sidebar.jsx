import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiFolderPlus, FiUsers, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';


const Sidebar = ({ isOpen }) => {
  const { user, isTenantAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/projects', icon: FiFolderPlus, label: 'Projects' },
    { to: '/users', icon: FiUsers, label: 'Users', adminOnly: true },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          if (item.adminOnly && !isTenantAdmin) return null;
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
