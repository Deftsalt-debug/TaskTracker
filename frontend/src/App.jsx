import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TasksPage from './pages/TasksPage';
import FocusPage from './pages/FocusPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/layout/Navbar';
import DashboardFooter from './components/layout/DashboardFooter';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // ── PRE-WRITTEN: Don't modify ──
  // This useEffect watches for login/logout events across the whole app
  // and keeps isAuthenticated in sync with localStorage
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  return (
    // TODO R1: Wrap everything in <Router>
    // React Router needs a single <Router> at the very top of your app.
    // All routing only works inside this wrapper.
    // Hint: <Router> ... your JSX ... </Router>

    <Router>
    <div className="min-h-screen bg-sageMist flex flex-col">
      <Toaster position="top-right" />

      {/* TODO R2: Wrap the block below in a <Routes> component */}
      {/* <Routes> looks at the current URL and renders only the matching <Route> */}
      {/* Think of it like a switch statement for URLs */}
      {/* Hint: wrap the two <Route> lines below inside <Routes> ... </Routes> */}
      <Routes>

        {/* TODO R3: Add a <Route> for the /login path */}
        {/* If the user is NOT logged in → show <LoginPage /> */}
        {/* If they ARE logged in → redirect to /tasks using <Navigate to="/tasks" /> */}
        {/* Hint: <Route path="/login" element={condition ? <A /> : <B />} /> */}
        <Route path="login" element={isAuthenticated ? <Navigate to="/tasks" /> : <LoginPage />} />
        {/* TODO R4: Add a <Route> for /register — same pattern as R3 above */}
        {/* If NOT logged in → show <RegisterPage /> */}
        {/* If already logged in → redirect to /tasks */}
        <Route path="register" element={isAuthenticated ? <Navigate to="/tasks" /> : <RegisterPage/>} />
        {/* ── PRE-WRITTEN: Protected area — Do not modify ── */}
        {/* This catches all other URLs and checks if the user is logged in */}
        {/* If not logged in, it redirects to /login automatically */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex flex-col h-screen">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Navigate to="/tasks" replace />} />

                  {/* TODO R5: Add a <Route> for /tasks that renders <TasksPage /> */}
                  {/* Wrap TasksPage inside: <div className="flex-1 px-6 py-0 overflow-y-auto"> */}
                  {/* Hint: <Route path="/tasks" element={<div ...><TasksPage /></div>} /> */}
                  <Route path="/tasks" element={<div className="flex-1 px-6 py-0 overflow-y-auto"> <TasksPage /> </div>}/>
                  {/* ── PRE-WRITTEN: Focus and History routes ── */}
                  <Route path="/focus" element={<div className="flex-1 px-6 py-0 overflow-hidden"><FocusPage /></div>} />
                  <Route path="/history" element={<div className="flex-1 px-6 py-0 overflow-y-auto"><HistoryPage /></div>} />
                </Routes>
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