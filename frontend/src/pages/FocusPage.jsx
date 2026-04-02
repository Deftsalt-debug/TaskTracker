import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '../components/focus/PomodoroTimer';
import axiosInstance from '../api/axiosInstance';

const FocusPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;

      const response = await axiosInstance.get(`/tasks?user_id=${user.id}`);
      if (response.data.status === 'success') {
        // Only show incomplete tasks
        const incompleteTasks = response.data.data.filter(t => t.category !== 'completed');
        setTasks(incompleteTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex items-center justify-center py-2 sm:py-4 overflow-hidden"
    >
      <PomodoroTimer tasks={tasks} />
    </motion.div>
  );
};

export default FocusPage;
