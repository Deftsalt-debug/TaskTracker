import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskBoard from '../components/tasks/TaskBoard';
import axiosInstance from '../api/axiosInstance';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        toast.error('User not found. Please login again.');
        return;
      }

      const response = await axiosInstance.get(`/tasks?user_id=${user.id}`);
      if (response.data.status === 'success') {
        setTasks(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    toast.success('Task created successfully!');
    window.dispatchEvent(new Event('taskChange'));
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => parseInt(t.id) === parseInt(updatedTask.id) ? updatedTask : t));
    toast.success('Task updated successfully!');
    window.dispatchEvent(new Event('taskChange'));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => parseInt(t.id) !== parseInt(taskId)));
    toast.success('Task deleted successfully!');
    window.dispatchEvent(new Event('taskChange'));
  };

  const handleTaskMoved = (taskId, newCategory) => {
    setTasks(tasks.map(t => parseInt(t.id) === parseInt(taskId) ? { ...t, category: newCategory } : t));
    window.dispatchEvent(new Event('taskChange'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-completed border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onTaskMoved={handleTaskMoved}
        />
      )}
    </motion.div>
  );
};

export default TasksPage;
