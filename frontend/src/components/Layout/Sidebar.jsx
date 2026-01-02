import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, 
  FaProjectDiagram, 
  FaUsers, 
  FaBuilding,
  FaCrown,
  FaUser,
  FaTimes
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isSuperAdmin, isTenantAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Define nav items based on role
  const getNavItems = () => {
    if (isSuperAdmin) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { path: '/projects', label: 'Projects', icon: FaProjectDiagram },
        { path: '/tenants', label: 'Tenants', icon: FaBuilding }
      ];
    }
    
    if (isTenantAdmin) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { path: '/projects', label: 'Projects', icon: FaProjectDiagram },
        { path: '/users', label: 'Users', icon: FaUsers }
      ];
    }
    
    // Regular users
    return [
      { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt }
    ];
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 rounded-lg">
          <FaCrown className="text-yellow-600" />
          <span className="text-xs font-semibold text-yellow-800">Super Admin</span>
        </div>
      );
    }
    
    if (isTenantAdmin) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg">
          <FaUser className="text-purple-600" />
          <span className="text-xs font-semibold text-purple-800">Tenant Admin</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-lg">
        <FaUser className="text-blue-600" />
        <span className="text-xs font-semibold text-blue-800">User</span>
      </div>
    );
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 
          min-h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close Button (Mobile Only) */}
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* User Info Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          {getRoleBadge()}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`text-lg ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1 h-6 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-semibold text-gray-700 mb-1">Multi-Tenant SaaS</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;