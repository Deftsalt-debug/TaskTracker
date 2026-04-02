import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaClock, FaFire } from 'react-icons/fa';

// ════════════════════════════════════════════════════════════
// TaskCard — READ ONLY for this workshop
//
// This component receives one task object as a prop
// and displays it as a card.
//
// Things to notice as you read:
//   - Props: task, onEdit, onDelete, isDragging
//   - useState for the delete confirmation toggle
//   - Conditional rendering: {!isCompleted && (...)}
//   - How task.title, task.description etc. are accessed from props
//   - The useDraggable hook (from DnD Kit) — makes the card draggable
//
// You do NOT write anything here today.
// ════════════════════════════════════════════════════════════

const TaskCard = ({ task, onEdit, onDelete, isDragging }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    disabled: isDragging
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  const categoryColors = {
    upcoming: 'bg-upcoming',
    in_progress: 'bg-inProgress',
    priority: 'bg-priority',
    completed: 'bg-completed'
  };

  const categoryBgOpacity = {
    upcoming: 'bg-upcoming bg-opacity-100',
    in_progress: 'bg-inProgress bg-opacity-100',
    priority: 'bg-priority bg-opacity-80',
    completed: 'bg-completed bg-opacity-100'
  };

  // Text colors for each category based on the new optimized palette
  const categoryTextColors = {
    priority: {
      title: '#1D1B19', // dark brownish-gray for title
      secondary: '#3E3B39' // lighter brownish-gray for secondary text
    },
    upcoming: {
      title: '#1F2720', // dark charcoal green for title (keep same)
      secondary: '#38433A' // slightly lighter for secondary text (keep same)
    },
    in_progress: {
      title: '#1F261E', // dark fern green for title
      secondary: '#2E342A' // lighter fern green for secondary
    },
    completed: {
      title: '#ffffffff', // off-white for title
      secondary: '#E0E4DA' // lighter beige for secondary
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Compact view for completed tasks
  const isCompleted = task.category === 'completed';

  const CardContent = (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`rounded-lg ${isCompleted ? 'p-2.5' : 'p-3'} shadow-md hover:shadow-xl transition-all cursor-move ${categoryBgOpacity[task.category] || 'bg-gray-100'} ${
        isDragging ? 'opacity-50' : ''
      }`}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {/* Title - Color based on category */}
      <p 
        className="font-bold text-base sm:text-lg mb-1.5 line-clamp-2"
        style={{ color: categoryTextColors[task.category]?.title || '#000000' }}
      >
        {task.title}
      </p>

      {/* Show details only for non-completed tasks */}
      {!isCompleted && (
        <>
          {/* Priority Badge */}
          {task.priority_level && task.priority_level !== 'medium' && (
            <div className="flex items-center gap-1 mb-1.5">
              <FaFire className={`text-xs ${priorityColors[task.priority_level]}`} />
              <span className={`text-xs font-semibold uppercase ${priorityColors[task.priority_level]}`}>
                {task.priority_level}
              </span>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <p 
              className="text-xs mb-2 line-clamp-2"
              style={{ color: categoryTextColors[task.category]?.secondary || '#4B5563' }}
            >
              {task.description}
            </p>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div 
              className="flex items-center gap-1.5 text-xs mb-2"
              style={{ color: categoryTextColors[task.category]?.secondary || '#4B5563' }}
            >
              <FaClock size={10} />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}

          {/* Pomodoro Progress */}
          {task.estimated_pomodoros > 0 && (
            <div className="mb-2">
              <div 
                className="flex items-center justify-between text-xs mb-1"
                style={{ color: categoryTextColors[task.category]?.secondary || '#4B5563' }}
              >
                <span className="font-medium">🍅 Pomodoros</span>
                <span className="font-semibold">{task.completed_pomodoros || 0} / {task.estimated_pomodoros}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((task.completed_pomodoros || 0) / task.estimated_pomodoros) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-green-600 h-1.5 rounded-full"
                />
              </div>
              {/* Time Spent */}
              {task.completed_pomodoros > 0 && (
                <div 
                  className="text-xs mt-1 font-medium"
                  style={{ color: categoryTextColors[task.category]?.secondary || '#4B5563' }}
                >
                  ⏱️ Time spent: {(task.completed_pomodoros * 25)} min
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <AnimatePresence mode="wait">
        {!showDeleteConfirm ? (
          <motion.div 
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-2 ${!isCompleted ? 'pt-2 border-t border-gray-300' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit && onEdit(task);
              }}
              className="p-1.5 hover:text-blue-600 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              style={{ color: categoryTextColors[task.category]?.secondary }}
              type="button"
            >
              <FaEdit size={12} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowDeleteConfirm(true);
              }}
              className="p-1.5 hover:text-red-600 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
              style={{ color: categoryTextColors[task.category]?.secondary }}
              type="button"
            >
              <FaTrash size={12} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col gap-2 ${!isCompleted ? 'pt-2 border-t border-gray-300' : ''}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold text-red-600">Delete this task?</p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300 transition-colors"
                type="button"
              >
                No
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete && onDelete(task.id);
                }}
                className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                type="button"
              >
                Yes
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return isDragging ? (
    <div className="opacity-50">{CardContent}</div>
  ) : (
    CardContent
  );
};

export default TaskCard;