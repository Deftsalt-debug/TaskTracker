import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

const DashboardFooter = () => {
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    inProgress: 0,
    priority: 0,
    completed: 0,
    completionRate: 0,
    todayCompleted: 0,
  });

  useEffect(() => {
    fetchStats();
    
    // Listen for task changes and refetch stats
    const handleTaskChange = () => fetchStats();
    window.addEventListener('taskChange', handleTaskChange);
    
    return () => {
      window.removeEventListener('taskChange', handleTaskChange);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;

      const response = await axiosInstance.get(`/tasks?user_id=${user.id}`);
      if (response.data.status === 'success') {
        const tasks = response.data.data;
        const total = tasks.length;
        const upcoming = tasks.filter(t => t.category === 'upcoming').length;
        const inProgress = tasks.filter(t => t.category === 'in_progress').length;
        const priority = tasks.filter(t => t.category === 'priority').length;
        const completed = tasks.filter(t => t.category === 'completed').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Today's completed tasks
        const today = new Date().toISOString().split('T')[0];
        const todayCompleted = tasks.filter(t => t.completed_at && t.completed_at.startsWith(today)).length;

        setStats({ total, upcoming, inProgress, priority, completed, completionRate, todayCompleted });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ label, value, color }) => (
    <div className="flex flex-col items-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );

  return (
    <footer className="hidden sm:block bg-gunmetal border-t border-gray-700 py-2 px-6 sticky bottom-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-8">
          <StatCard label="Total" value={stats.total} color="text-white" />
          <StatCard label="Upcoming" value={stats.upcoming} color="text-paleGreen" />
          <StatCard label="Progress" value={stats.inProgress} color="text-[#708238]" />
          <StatCard label="Priority" value={stats.priority} color="text-[#9a6b4f]" />
          <StatCard label="Done" value={stats.completed} color="text-[#556b2f]" />
          
          {/* Completion Rate */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12">
              <svg className="transform -rotate-90 w-12 h-12">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-700" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-green-400"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - stats.completionRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                {stats.completionRate}%
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">Done</div>
          </div>

          {/* Today */}
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-green-400">{stats.todayCompleted}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;