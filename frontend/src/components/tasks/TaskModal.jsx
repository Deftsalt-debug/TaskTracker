import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axiosInstance, { errorMessage } from '../../api/axiosInstance';

/** The create / edit form. Every input is controlled by `formData`. */
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

  // Escape closes the form, as a dialog should.
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      // The server returns the saved task, so the board shows exactly what was stored.
      const response = task && task.id
        ? await axiosInstance.put(`/tasks/${task.id}`, formData)
        : await axiosInstance.post('/tasks', formData);
      onSave(response.data.data);
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to save task'));
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl my-4 sm:my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h2 id="task-modal-title" className="text-lg sm:text-xl font-bold text-gunmetal">
            {task && task.id ? 'Edit task' : 'New task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center w-9 h-9 rounded-lg text-smoke hover:text-gunmetal hover:bg-gray-100 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-gunmetal mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="task-title" name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              placeholder="What needs doing?"
              maxLength={200}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-medium text-gunmetal mb-1">
              Description
            </label>
            <textarea
              id="task-description" name="description"
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
              <label htmlFor="task-category" className="block text-xs font-medium text-gunmetal mb-1">
                Category
              </label>
              <select
                id="task-category" name="category"
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
              <label htmlFor="task-priority_level" className="block text-xs font-medium text-gunmetal mb-1">
                Priority
              </label>
              <select
                id="task-priority_level" name="priority_level"
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
              <label htmlFor="task-due_date" className="block text-xs font-medium text-gunmetal mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="task-due_date" name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-completed focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="task-estimated_pomodoros" className="block text-xs font-medium text-gunmetal mb-1">
                Estimated Pomodoros
              </label>
              <input
                type="number"
                id="task-estimated_pomodoros" name="estimated_pomodoros"
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