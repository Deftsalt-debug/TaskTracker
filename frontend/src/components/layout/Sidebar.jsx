import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTasks, FaBullseye, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
    
    navigate('/login');
    onClose();
  };

  const menuItems = [
    { icon: FaTasks, label: 'Tasks', path: '/tasks' },
    { icon: FaBullseye, label: 'Focus Mode', path: '/focus' },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
      />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-80 bg-smoke shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gunmetal">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-6">
          <div className="flex flex-col gap-3">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.path)}
                className={`w-full py-4 px-6 rounded-lg font-medium text-left flex items-center gap-3 transition-all ${
                  location.pathname === item.path
                    ? 'bg-gunmetal text-white shadow-lg'
                    : 'bg-gunmetal bg-opacity-50 text-gray-200 hover:bg-gunmetal hover:text-white'
                }`}
              >
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-6 border-t border-gunmetal">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-4 px-6 rounded-lg bg-red-600 text-white font-medium flex items-center justify-center gap-3 hover:bg-red-700 transition-colors shadow-lg"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
