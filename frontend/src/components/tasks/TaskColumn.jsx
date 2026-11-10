import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import TaskCard from './TaskCard';

const emptyHint = {
  priority: 'Nothing urgent. Enjoy it.',
  upcoming: 'Add what is coming next.',
  in_progress: 'Drag a task here when you start it.',
  completed: 'Finished tasks land here.',
};

/** One column of the board, and a drop target for dragged cards. */
const TaskColumn = ({ id, label, color, tasks, filtered, onAddTask, onEditTask, onDeleteTask, onFocusTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`column-${id}`}
      className={`flex flex-col rounded-2xl p-3 transition-colors ${isOver ? 'bg-white/70 ring-2 ring-completed' : 'bg-white/35'}`}
    >
      <header className="flex items-center gap-2 px-1 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} aria-hidden="true" />
        <h3 id={`column-${id}`} className="font-bold text-gunmetal">{label}</h3>
        <span className="text-xs font-semibold text-gunmetal bg-white/80 px-2 py-0.5 rounded-full tabular-nums" aria-label={`${tasks.length} tasks`}>{tasks.length}</span>
        <button
          type="button"
          onClick={onAddTask}
          aria-label={`Add a task to ${label}`}
          className="ml-auto grid place-items-center w-8 h-8 rounded-lg text-gunmetal hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors"
        >
          <FaPlus size={12} aria-hidden="true" />
        </button>
      </header>

      <div className="flex flex-col gap-2.5 min-h-[120px]">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.18 }}>
              <TaskCard task={task} onEdit={onEditTask} onDelete={onDeleteTask} onFocus={onFocusTask} />
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={onAddTask}
            className="flex-1 grid place-items-center rounded-xl border-2 border-dashed border-smoke/40 text-sm text-smoke px-3 py-8 hover:border-completed hover:text-completed transition-colors"
          >
            {filtered ? 'No matching tasks.' : emptyHint[id]}
          </button>
        )}
      </div>
    </section>
  );
};

export default TaskColumn;
