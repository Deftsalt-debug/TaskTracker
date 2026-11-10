import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskBoard from '../components/tasks/TaskBoard';
import axiosInstance, { errorMessage } from '../api/axiosInstance';

/** Owns the task list: loads it once, then applies each change the board reports. */
const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setFailed('');
    try {
      const response = await axiosInstance.get('/tasks');
      setTasks(response.data.data);
    } catch (error) {
      setFailed(errorMessage(error, 'Could not load your tasks.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // A focus session finishing elsewhere changes a task's count; pick that up quietly.
    const refresh = () => axiosInstance.get('/tasks').then((response) => setTasks(response.data.data)).catch(() => {});
    window.addEventListener('tasksStale', refresh);
    return () => window.removeEventListener('tasksStale', refresh);
  }, []);

  // The footer statistics listen for this to refresh themselves.
  const announce = () => window.dispatchEvent(new Event('taskChange'));

  const handleTaskCreated = (newTask) => {
    setTasks((current) => [newTask, ...current]);
    toast.success('Task created');
    announce();
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((current) => current.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    announce();
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((current) => current.filter((t) => t.id !== taskId));
    toast.success('Task deleted');
    announce();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-label="Loading tasks">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-completed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center bg-white rounded-2xl shadow p-8" role="alert">
        <p className="text-lg font-semibold text-gunmetal">{failed}</p>
        <button onClick={fetchTasks} className="mt-5 px-5 py-2.5 rounded-lg bg-completed text-white font-semibold hover:bg-primary-700 transition-colors">Try again</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="h-full">
      <TaskBoard tasks={tasks} onTaskCreated={handleTaskCreated} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} />
    </motion.div>
  );
};

export default TasksPage;
