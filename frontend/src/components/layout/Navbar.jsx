import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTasks, FaBullseye, FaHistory, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const navItems = [
    { icon: FaTasks, label: 'Tasks', path: '/tasks' },
    { icon: FaBullseye, label: 'Focus', path: '/focus' },
    { icon: FaHistory, label: 'History', path: '/history' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-transparent backdrop-blur-sm py-3 px-3 sm:px-6 flex items-center justify-between"
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2"
      >
        <div className="text-2xl sm:text-3xl">✓</div>
        <h1 className="text-lg sm:text-2xl font-bold text-gunmetal">TaskTrackr</h1>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {navItems.map((item) => (
          <motion.button
            key={item.path}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(item.path)}
            className={`px-2 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-all text-sm sm:text-base ${
              location.pathname === item.path
                ? 'bg-gunmetal text-white shadow-md'
                : 'text-gunmetal hover:bg-gunmetal hover:text-white'
            }`}
          >
            <item.icon className="text-sm sm:text-base" />
            <span className="hidden sm:inline">{item.label}</span>
          </motion.button>
        ))}

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-2 sm:px-4 py-2 rounded-lg bg-red-600 text-white font-medium flex items-center gap-1 sm:gap-2 hover:bg-red-700 transition-colors shadow-md text-sm sm:text-base"
        >
          <FaSignOutAlt className="text-sm sm:text-base" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
