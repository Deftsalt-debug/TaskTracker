import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskBoard from '../components/tasks/TaskBoard';
import axiosInstance from '../api/axiosInstance';

const TasksPage = () => {

  // TODO 1: Declare a state variable called 'tasks'
  // It should start as an empty array []
  // Hint: const [tasks, setTasks] = useState([]);


  // TODO 2: Declare a state variable called 'loading'
  // It should start as true — the page is loading when it first opens
  // Hint: const [loading, setLoading] = useState(true);


  // TODO 3: Call fetchTasks() when the page first loads
  // useEffect runs code after the component renders
  // The empty [] means "run this only once, on first load"
  // Hint: useEffect(() => { fetchTasks(); }, []);


  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        toast.error('User not found. Please login again.');
        return;
      }

      // TODO 4: Fetch tasks from the API
      // Use axiosInstance to make a GET request to '/tasks?user_id={user.id}'
      // Store the result in a variable called 'response'
      // Hint: const response = await axiosInstance.get(`/tasks?user_id=${user.id}`);


      // TODO 5: Update the tasks state with the data you just fetched
      // Check if response.data.status === 'success'
      // If yes, call setTasks() with response.data.data
      // Hint: if (response.data.status === 'success') { setTasks(response.data.data); }


    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      // TODO 6: Stop the loading spinner
      // Set loading to false — this runs whether the request succeeded or failed
      // Hint: setLoading(false);

    }
  };

  const handleTaskCreated = (newTask) => {
    // TODO 7: Add the new task to the existing tasks array
    // Important: you must create a NEW array — never mutate state directly
    // The spread operator ... copies all existing items, then adds the new one
    // Hint: setTasks([...tasks, newTask]);

    toast.success('Task created successfully!');
  };

  const handleTaskUpdated = (updatedTask) => {
    // TODO 8: Replace the old version of this task with the updated one
    // Use tasks.map() — if the task id matches, return updatedTask, otherwise return the original
    // Hint: setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));

    toast.success('Task updated successfully!');
  };

  const handleTaskDeleted = (taskId) => {
    // TODO 9: Remove this task from the array
    // Use tasks.filter() — keep only tasks whose id does NOT match taskId
    // Hint: setTasks(tasks.filter(t => t.id !== taskId));

    toast.success('Task deleted successfully!');
  };

  // ── PRE-WRITTEN: Don't modify ──
  const handleTaskMoved = (taskId, newCategory) => {
    setTasks(tasks.map(t => parseInt(t.id) === parseInt(taskId) ? { ...t, category: newCategory } : t));
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