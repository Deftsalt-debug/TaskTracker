import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const PomodoroTimer = ({ tasks }) => {
  // Load initial state from localStorage or use defaults
  const loadTimerState = () => {
    try {
      const saved = localStorage.getItem('pomodoroTimer');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
    return {
      timeLeft: 25 * 60,
      isActive: false,
      sessionType: 'work',
      sessionsCompleted: 0,
      selectedTask: null,
      durations: {
        work: 25 * 60,
        short_break: 5 * 60,
        long_break: 15 * 60
      },
      lastUpdate: Date.now()
    };
  };

  const initialState = loadTimerState();

  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [isActive, setIsActive] = useState(initialState.isActive);
  const [sessionType, setSessionType] = useState(initialState.sessionType);
  const [sessionsCompleted, setSessionsCompleted] = useState(initialState.sessionsCompleted);
  const [selectedTask, setSelectedTask] = useState(initialState.selectedTask);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const audioRef = useRef(null);

  const [durations, setDurations] = useState(initialState.durations);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      timeLeft,
      isActive,
      sessionType,
      sessionsCompleted,
      selectedTask,
      durations,
      lastUpdate: Date.now()
    };
    localStorage.setItem('pomodoroTimer', JSON.stringify(state));
  }, [timeLeft, isActive, sessionType, sessionsCompleted, selectedTask, durations]);

  // Calculate elapsed time when component mounts if timer was active
  useEffect(() => {
    if (initialState.isActive && initialState.lastUpdate) {
      const elapsed = Math.floor((Date.now() - initialState.lastUpdate) / 1000);
      const newTimeLeft = Math.max(0, initialState.timeLeft - elapsed);
      setTimeLeft(newTimeLeft);
      
      // If time ran out while away, complete the session
      if (newTimeLeft === 0) {
        handleSessionComplete();
      }
    }
  }, []);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    playNotification();

    // Save session to database
    if (sessionStartTime) {
      saveSession(true);
    }

    if (sessionType === 'work') {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      toast.success('🎉 Work session complete! Take a break.');

      // Update task pomodoro count if task is selected
      if (selectedTask) {
        updateTaskPomodoros(selectedTask);
      }

      // Switch to break
      if (newCount % 4 === 0) {
        setSessionType('long_break');
        setTimeLeft(durations.long_break);
      } else {
        setSessionType('short_break');
        setTimeLeft(durations.short_break);
      }
    } else {
      toast.success('Break complete! Ready for another session?');
      setSessionType('work');
      setTimeLeft(durations.work);
    }
  };

  const updateTaskPomodoros = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === parseInt(taskId));
      if (task) {
        const newCompletedPomodoros = (task.completed_pomodoros || 0) + 1;
        const currentEstimated = task.estimated_pomodoros || 3;
        
        // If completed pomodoros would exceed estimated, increase estimated to match
        const newEstimatedPomodoros = Math.max(currentEstimated, newCompletedPomodoros);
        
        await axiosInstance.put(`/tasks/${taskId}`, {
          completed_pomodoros: newCompletedPomodoros,
          estimated_pomodoros: newEstimatedPomodoros
        });
        
        if (newEstimatedPomodoros > currentEstimated) {
          toast.success(`✅ Pomodoro recorded! Target increased to ${newEstimatedPomodoros}`);
        } else {
          toast.success('✅ Pomodoro recorded!');
        }
        
        window.dispatchEvent(new Event('taskChange'));
      }
    } catch (error) {
      console.error('Error updating task pomodoros:', error);
    }
  };

  const saveSession = async (completed = true) => {
    if (!sessionStartTime) return;

    try {
      const endTime = new Date().toISOString();
      const durationMinutes = Math.round(durations[sessionType] / 60);
      
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        console.error('User ID not found');
        return;
      }

      await axiosInstance.post('/pomodoro', {
        user_id: user.id,
        task_id: selectedTask || null,
        session_type: sessionType,
        duration_minutes: durationMinutes,
        started_at: sessionStartTime,
        ended_at: endTime,
        completed: completed ? 1 : 0,
        notes: null
      });
    } catch (error) {
      console.error('Error saving pomodoro session:', error);
    } finally {
      setSessionStartTime(null);
    }
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      // Starting timer - record start time
      setSessionStartTime(new Date().toISOString());
    } else {
      // Pausing timer - save incomplete session
      if (sessionStartTime) {
        saveSession(false);
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    // Save incomplete session if timer was running
    if (isActive && sessionStartTime) {
      saveSession(false);
    }
    setIsActive(false);
    setTimeLeft(durations[sessionType]);
    setSessionStartTime(null);
  };

  const switchSession = (type) => {
    setIsActive(false);
    setSessionType(type);
    setTimeLeft(durations[type]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[sessionType] - timeLeft) / durations[sessionType]) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sessionColors = {
    work: '#708238',
    short_break: '#A4B3A4',
    long_break: '#556b2f'
  };

  const updateDuration = (type, minutes) => {
    // Cap at 999 minutes
    const cappedMinutes = Math.min(999, Math.max(1, minutes));
    setDurations(prev => ({ ...prev, [type]: cappedMinutes * 60 }));
    if (sessionType === type && !isActive) {
      setTimeLeft(cappedMinutes * 60);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="timer-container bg-white bg-opacity-80 backdrop-blur-md rounded-3xl shadow-2xl p-3 sm:p-5 w-full max-w-xl relative max-h-[95vh] overflow-y-auto"
      >
        {/* Settings Gear Icon */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 text-gray-600 hover:text-gunmetal transition-colors z-10"
          title="Timer Settings"
        >
          <FaCog size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* Progress to long break - Top */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 mb-2 sm:mb-3"
        >
          <span className="text-xs text-gray-600 font-medium">Progress to long break:</span>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < sessionsCompleted % 4 ? 'bg-completed scale-110' : 'bg-gray-300'
              }`}
            >
              {i < sessionsCompleted % 4 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <FaCheck size={6} className="text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Session Type Selector */}
        <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          {[
            { type: 'work', label: 'Work', icon: '💼' },
            { type: 'short_break', label: 'Short Break', icon: '☕' },
            { type: 'long_break', label: 'Long Break', icon: '🌴' }
          ].map((session) => (
            <motion.button
              key={session.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchSession(session.type)}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                sessionType === session.type
                  ? 'bg-gunmetal text-white shadow-lg'
                  : 'bg-gray-200 text-gunmetal hover:bg-gray-300'
              }`}
            >
              <div className="text-base sm:text-xl mb-0.5">{session.icon}</div>
              <div className="text-xs hidden sm:block">{session.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Circular Timer - Responsive */}
        <div className="relative flex items-center justify-center mb-2 sm:mb-3">
          <svg className="transform -rotate-90 w-52 h-52 sm:w-64 sm:h-64" viewBox="0 0 280 280">
            {/* Background Circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress Circle with smooth animation */}
            <motion.circle
              cx="140"
              cy="140"
              r="120"
              stroke={sessionColors[sessionType]}
              strokeWidth="16"
              fill="none"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 - (progress / 100) * 2 * Math.PI * 120}
              strokeLinecap="round"
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 120 - (progress / 100) * 2 * Math.PI * 120,
                stroke: sessionColors[sessionType]
              }}
              transition={{ 
                strokeDashoffset: { duration: 1, ease: "easeInOut" },
                stroke: { duration: 0.5 }
              }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              key={`${Math.floor(timeLeft / 60)}-${timeLeft % 60}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
              className="text-4xl sm:text-5xl font-bold text-gunmetal mb-1"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="text-smoke text-xs sm:text-sm font-medium">
              {sessionType === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
            </div>
            {sessionsCompleted > 0 && (
              <div className="text-xs text-gray-600 mt-1 font-semibold">
                {sessionsCompleted} completed today
              </div>
            )}
          </div>
        </div>

        {/* Task Selector */}
        {sessionType === 'work' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 sm:mb-3"
          >
            <label className="block text-xs font-medium text-gunmetal mb-1">
              📝 Working on:
            </label>
            <div className="relative">
              <select
                value={selectedTask || ''}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent bg-white shadow-sm hover:border-gray-400 transition-colors appearance-none cursor-pointer font-medium text-gray-700"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="" className="text-gray-500">Select a task (optional)</option>
                {tasks.slice(0, 100).map((task) => (
                  <option key={task.id} value={task.id} className="py-2 text-gray-700">
                    {task.title.length > 40 ? task.title.substring(0, 40) + '...' : task.title}
                  </option>
                ))}
              </select>
              {tasks.length === 0 && (
                <p className="text-xs text-gray-500 mt-1 italic">No tasks available</p>
              )}
              {tasks.length > 4 && (
                <p className="text-xs text-gray-500 mt-1">Scroll to see more tasks ({tasks.length} total)</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTimer}
            className="bg-completed text-white p-4 sm:p-5 rounded-full shadow-xl hover:bg-inProgress transition-colors"
          >
            {isActive ? <FaPause size={20} className="sm:w-6 sm:h-6" /> : <FaPlay size={20} className="sm:w-6 sm:h-6 ml-0.5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="bg-gunmetal text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-smoke transition-colors"
          >
            <FaRedo size={16} className="sm:w-5 sm:h-5" />
          </motion.button>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS56+ebSw4OT6Xh8LZjHAU2jdXzzn0vBSd6yO/ekkAKElyx6OynUxQKQ5zd8sFuJAU=" preload="auto" />
      </motion.div>

      {/* Settings Modal Popup */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gunmetal mb-2">⚙️ Timer Settings</h2>
                <p className="text-sm text-gray-600 mb-6">Customize your Pomodoro durations (in minutes)</p>

                {/* Settings Form */}
                <div className="space-y-5">
                  {/* Work Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gunmetal mb-2">
                      💼 Work Session
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={Math.floor(durations.work / 60)}
                        onChange={(e) => updateDuration('work', parseInt(e.target.value) || 25)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent text-lg font-semibold"
                      />
                      <span className="text-gray-600 font-medium">minutes</span>
                    </div>
                  </div>

                  {/* Short Break Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gunmetal mb-2">
                      ☕ Short Break
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={Math.floor(durations.short_break / 60)}
                        onChange={(e) => updateDuration('short_break', parseInt(e.target.value) || 5)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent text-lg font-semibold"
                      />
                      <span className="text-gray-600 font-medium">minutes</span>
                    </div>
                  </div>

                  {/* Long Break Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gunmetal mb-2">
                      🌴 Long Break
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={Math.floor(durations.long_break / 60)}
                        onChange={(e) => updateDuration('long_break', parseInt(e.target.value) || 15)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent text-lg font-semibold"
                      />
                      <span className="text-gray-600 font-medium">minutes</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> After 4 work sessions, you'll get a long break. Changes apply when you switch sessions.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-6 py-3 bg-completed text-white rounded-lg font-semibold hover:bg-inProgress transition-colors shadow-md"
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PomodoroTimer;