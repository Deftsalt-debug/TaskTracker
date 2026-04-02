import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

// ════════════════════════════════════════════════════════════
// TaskModal — READ ONLY for this workshop
//
// This is the form for creating and editing tasks.
// It is a great example of "controlled inputs" in React.
//
// Things to notice as you read:
//   - formData state — every input's value lives in state
//   - handleChange — one function updates any field using e.target.name
//   - useEffect — pre-fills the form when editing an existing task
//   - handleSubmit — POST (create) vs PUT (update) based on task.id
//
// You do NOT write anything here today.
// ════════════════════════════════════════════════════════════

const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'upcoming',
    due_date: '',
    priority_level: 'medium',
    estimated_pomodoros: 3
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'upcoming',
        due_date: task.due_date || '',
        priority_level: task.priority_level || 'medium',
        estimated_pomodoros: task.estimated_pomodoros || 3
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      toast.error('User not found');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, user_id: user.id };
      
      if (task && task.id) {
        // Update existing task
        const response = await axiosInstance.put(`/tasks/${task.id}`, payload);
        if (response.data.status === 'success') {
          const updatedTask = { 
            ...task, 
            ...formData, 
            id: task.id, 
            user_id: user.id, 
            completed_pomodoros: task.completed_pomodoros || 0 
          };
          console.log('Task updated:', updatedTask);
          onSave(updatedTask);
        } else {
          throw new Error(response.data.message || 'Update failed');
        }
      } else {
        // Create new task
        const response = await axiosInstance.post('/tasks', payload);
        if (response.data.status === 'success') {
          const newTask = { 
            ...formData, 
            id: parseInt(response.data.data.id), // Ensure ID is a number
            user_id: user.id,
            completed_pomodoros: 0,
            created_at: new Date().toISOString()
          };
          console.log('Task created:', newTask);
          onSave(newTask);
        } else {
          throw new Error(response.data.message || 'Creation failed');
        }
      }
    } catch (error) {
      console.error('Save task error:', error);
      toast.error(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gunmetal">
            {task && task.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-smoke hover:text-gunmetal transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gunmetal mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gunmetal mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Row 1: Category and Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gunmetal mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="priority">Priority</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gunmetal mb-1">
                Priority
              </label>
              <select
                name="priority_level"
                value={formData.priority_level}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Row 2: Due Date and Pomodoros */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gunmetal mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gunmetal mb-1">
                Estimated Pomodoros
              </label>
              <input
                type="number"
                name="estimated_pomodoros"
                value={formData.estimated_pomodoros}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-completed text-white py-2 rounded-lg font-semibold hover:bg-inProgress transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{task && task.id ? 'Update Task' : 'Create Task'}</span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gunmetal hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TaskModal;