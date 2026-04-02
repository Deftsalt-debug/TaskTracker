import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaClock, FaTasks, FaCheckCircle, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const HistoryPage = () => {
  const [pomodoroHistory, setPomodoroHistory] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pomodoro'); // 'pomodoro' or 'tasks'
  const [stats, setStats] = useState({
    totalPomodoros: 0,
    totalMinutes: 0,
    completedTasks: 0,
    averageSessionsPerTask: 0
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        toast.error('User not found. Please login again.');
        return;
      }
      
      // Fetch Pomodoro History
      const pomodoroResponse = await axiosInstance.get(`/pomodoro?user_id=${user.id}`);
      if (pomodoroResponse.data.status === 'success') {
        setPomodoroHistory(pomodoroResponse.data.data || []);
      }

      // Fetch All Tasks and Filter for Completed Ones
      const tasksResponse = await axiosInstance.get(`/tasks?user_id=${user.id}`);
      if (tasksResponse.data.status === 'success') {
        const completedTasks = tasksResponse.data.data.filter(t => t.is_completed);
        setTaskHistory(completedTasks || []);
      }

      // Calculate stats after both are fetched
      calculateStats(pomodoroResponse.data.data || [], tasksResponse.data.data?.filter(t => t.is_completed) || []);
      
    } catch (error) {
      toast.error('Failed to load history');
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pomodoros, tasks) => {
    const totalPomodoros = pomodoros.filter(p => p.completed).length;
    const totalMinutes = pomodoros
      .filter(p => p.completed)
      .reduce((sum, p) => sum + parseInt(p.duration_minutes || 0), 0);
    const completedTasks = tasks.length;
    const averageSessionsPerTask = completedTasks > 0 ? (totalPomodoros / completedTasks).toFixed(1) : 0;

    setStats({
      totalPomodoros,
      totalMinutes,
      completedTasks,
      averageSessionsPerTask
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'work':
        return 'bg-completed text-white';
      case 'short_break':
        return 'bg-yellow-500 text-white';
      case 'long_break':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'priority':
        return 'bg-priority text-gunmetal';
      case 'in_progress':
        return 'bg-inProgress text-white';
      case 'completed':
        return 'bg-completed text-white';
      default:
        return 'bg-upcoming text-gunmetal';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-completed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaHistory className="text-3xl text-completed" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gunmetal">History</h1>
        </div>
        <p className="text-smoke text-sm sm:text-base">
          Track your productivity journey and pomodoro sessions
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
      >
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-completed text-xl" />
            <span className="text-xs sm:text-sm text-smoke">Total Pomodoros</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gunmetal">{stats.totalPomodoros}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-blue-500 text-xl" />
            <span className="text-xs sm:text-sm text-smoke">Total Time</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gunmetal">{formatDuration(stats.totalMinutes)}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-green-500 text-xl" />
            <span className="text-xs sm:text-sm text-smoke">Tasks Done</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gunmetal">{stats.completedTasks}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <FaTasks className="text-purple-500 text-xl" />
            <span className="text-xs sm:text-sm text-smoke">Avg Sessions</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gunmetal">{stats.averageSessionsPerTask}</p>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-4"
      >
        <button
          onClick={() => setActiveTab('pomodoro')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'pomodoro'
              ? 'bg-completed text-white shadow-md'
              : 'bg-white text-gunmetal hover:bg-gray-100'
          }`}
        >
          <FaClock className="inline mr-2" />
          Pomodoro Sessions ({pomodoroHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'tasks'
              ? 'bg-completed text-white shadow-md'
              : 'bg-white text-gunmetal hover:bg-gray-100'
          }`}
        >
          <FaTasks className="inline mr-2" />
          Completed Tasks ({taskHistory.length})
        </button>
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
      >
        {activeTab === 'pomodoro' ? (
          // Pomodoro History
          <div className="space-y-3">
            {pomodoroHistory.length === 0 ? (
              <div className="text-center py-12">
                <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-smoke text-lg">No pomodoro sessions yet</p>
                <p className="text-sm text-gray-400 mt-2">Start a focus session to see your history here</p>
              </div>
            ) : (
              pomodoroHistory.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSessionTypeColor(session.session_type)}`}>
                          {session.session_type.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${session.completed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {session.completed ? 'Completed' : 'Incomplete'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gunmetal text-lg">
                        {session.task_title || 'No Task Selected'}
                      </h3>
                      {session.notes && (
                        <p className="text-sm text-smoke mt-1">{session.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-smoke">
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{session.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{formatDate(session.started_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          // Task History
          <div className="space-y-3">
            {taskHistory.length === 0 ? (
              <div className="text-center py-12">
                <FaTasks className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-smoke text-lg">No completed tasks yet</p>
                <p className="text-sm text-gray-400 mt-2">Complete some tasks to see your accomplishments here</p>
              </div>
            ) : (
              taskHistory.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryColor(task.category)}`}>
                          {task.category.replace('_', ' ')}
                        </span>
                        <FaCheckCircle className="text-green-500" />
                      </div>
                      <h3 className="font-semibold text-gunmetal text-lg mb-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-smoke mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-smoke">
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {task.completed_pomodoros || 0} / {task.estimated_pomodoros || 0} Pomodoros
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-smoke mb-1">Completed</p>
                      <p className="text-sm font-medium text-gunmetal">
                        {formatDate(task.completed_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
