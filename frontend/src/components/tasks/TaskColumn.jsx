import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import TaskCard from './TaskCard';

// ════════════════════════════════════════════════════════════
// TaskColumn — READ ONLY for this workshop
//
// This component renders one column of the Kanban board.
// It receives an array of tasks and maps over them to render TaskCards.
//
// Things to notice as you read:
//   - Props: id, label, color, tasks, onAddTask, onEditTask, onDeleteTask
//   - tasks.map() — rendering a list of components from an array
//   - {tasks.length === 0 && ...} — conditional empty state
//   - useDroppable hook — makes this column a drop target
//
// You do NOT write anything here today.
// ════════════════════════════════════════════════════════════

const TaskColumn = ({ id, label, color, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`p-4 min-h-[800px] transition-all ${
        isOver ? 'ring-4 ring-completed ring-opacity-50 scale-105 rounded-xl' : ''
      }`}
    >
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <h3 className="font-bold text-gunmetal text-lg">{label}</h3>
            <span className="text-sm text-smoke bg-gray-200 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Add Task Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddTask}
          className="w-full py-2 border-2 border-dashed border-smoke rounded-lg text-smoke hover:border-completed hover:text-completed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <FaPlus />
          <span>Add Task</span>
        </motion.button>
      </div>

      {/* Tasks List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </motion.div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="text-6xl mb-4">📋</div>
          <p className="text-smoke text-sm">No tasks yet</p>
        </motion.div>
      )}
    </div>
  );
};

export default TaskColumn;