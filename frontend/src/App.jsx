import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TasksPage from './pages/TasksPage';
import FocusPage from './pages/FocusPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/layout/Navbar';
import DashboardFooter from './components/layout/DashboardFooter';
import { getToken } from './auth';
import { TimerProvider } from './timer/TimerContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));

  // Signing in or out anywhere (including another tab) updates the routes below.
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(Boolean(getToken()));
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-sageMist flex flex-col">
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/tasks" replace /> : <AuthPage mode="login" />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/tasks" replace /> : <AuthPage mode="register" />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <TimerProvider>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <main className="flex-1 min-h-0 flex flex-col">
                    <Routes>
                      <Route path="/tasks" element={<div className="flex-1 px-3 sm:px-6 overflow-y-auto"><TasksPage /></div>} />
                      <Route path="/focus" element={<div className="flex-1 px-3 sm:px-6 overflow-y-auto"><FocusPage /></div>} />
                      <Route path="/history" element={<div className="flex-1 px-3 sm:px-6 overflow-y-auto"><HistoryPage /></div>} />
                      <Route path="*" element={<Navigate to="/tasks" replace />} />
                    </Routes>
                  </main>
                  <DashboardFooter />
                </div>
                </TimerProvider>
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
