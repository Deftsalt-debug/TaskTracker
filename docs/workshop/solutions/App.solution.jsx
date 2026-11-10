import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TasksPage from '../pages/TasksPage';
import FocusPage from '../pages/FocusPage';
import HistoryPage from '../pages/HistoryPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Navbar from '../components/layout/Navbar';
import DashboardFooter from '../components/layout/DashboardFooter';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Listen for storage changes to update authentication state
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    
    // Check on mount
    checkAuth();
    
    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab changes
    window.addEventListener('authChange', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-sageMist flex flex-col">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/tasks" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/tasks" />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <div className="flex flex-col h-screen">
                  {/* Navbar */}
                  <Navbar />

                  {/* Main Content */}
                  <Routes>
                    <Route path="/" element={<Navigate to="/tasks" replace />} />
                    <Route 
                      path="/tasks" 
                      element={
                        <div className="flex-1 px-6 py-0 overflow-y-auto">
                          <TasksPage />
                        </div>
                      } 
                    />
                    <Route 
                      path="/focus" 
                      element={
                        <div className="flex-1 px-6 py-0 overflow-hidden">
                          <FocusPage />
                        </div>
                      } 
                    />
                    <Route 
                      path="/history" 
                      element={
                        <div className="flex-1 px-6 py-0 overflow-y-auto">
                          <HistoryPage />
                        </div>
                      } 
                    />
                  </Routes>

                  {/* Dashboard Footer */}
                  <DashboardFooter />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
