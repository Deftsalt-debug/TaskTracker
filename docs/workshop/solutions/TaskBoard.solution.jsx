import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

const TaskBoard = ({ tasks, onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskMoved }) => {
  const [activeId, setActiveId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const categories = [
    { id: 'priority', label: 'Priority', color: 'bg-priority' },
    { id: 'upcoming', label: 'Upcoming', color: 'bg-upcoming' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-inProgress' },
    { id: 'completed', label: 'Completed', color: 'bg-completed' }
  ];

  const getTasksByCategory = (category) => {
    return tasks.filter(task => task.category === category);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = parseInt(active.id);
    const newCategory = over.id;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.category !== newCategory) {
      // Optimistically update UI
      onTaskMoved(taskId, newCategory);
      
      // Update on server
      try {
        await axiosInstance.put(`/tasks/${taskId}`, {
          category: newCategory
        });
        toast.success('Task moved successfully!');
      } catch (error) {
        // Revert on error
        onTaskMoved(taskId, task.category);
        toast.error('Failed to move task');
      }
    }

    setActiveId(null);
  };

  const handleAddTask = (category) => {
    setEditingTask({ category });
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      onTaskDeleted(taskId);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const activeTask = tasks.find(t => t.id === activeId);

  // Calculate the height of the tallest column (including header)
  const getColumnHeight = (categoryId) => {
    const categoryTasks = getTasksByCategory(categoryId);
    // Base height: header (approx 150px) + each task (approx 120px) + spacing
    const baseHeight = 200; // Header height
    const taskHeight = categoryTasks.length * 190; // 120px per task + 3px spacing
    return baseHeight + taskHeight;
  };

  const maxHeight = Math.max(...categories.map(cat => getColumnHeight(cat.id)));

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-8 relative">
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                <TaskColumn
                  id={category.id}
                  label={category.label}
                  color={category.color}
                  tasks={getTasksByCategory(category.id)}
                  onAddTask={() => handleAddTask(category.id)}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </motion.div>

              {/* Border line between columns - only show between columns on large screens */}
              {index < categories.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: maxHeight > 100 ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute hidden lg:block"
                  style={{
                    left: `${((index + 1) / categories.length) * 100}%`,
                    top: 0,
                    width: '1px',
                    height: `${maxHeight}px`,
                    background: `linear-gradient(to bottom, rgba(125, 138, 150, 0.3) 0%, rgba(125, 138, 150, 0.2) 60%, rgba(125, 138, 150, 0) 100%)`,
                    transition: 'height 0.3s ease-in-out'
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="transform rotate-3 scale-105">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {modalOpen && (
          <TaskModal
            task={editingTask}
            onClose={() => {
              setModalOpen(false);
              setEditingTask(null);
            }}
            onSave={(savedTask) => {
              // Check if this is an update (task already has an id) or a new task
              if (editingTask && editingTask.id) {
                onTaskUpdated(savedTask);
              } else {
                onTaskCreated(savedTask);
              }
              setModalOpen(false);
              setEditingTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskBoard;
