import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axiosInstance, { errorMessage } from '../../api/axiosInstance';
import { useTimer } from '../../timer/TimerContext';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

const categories = [
  { id: 'priority', label: 'Priority', color: 'bg-priority' },
  { id: 'upcoming', label: 'Upcoming', color: 'bg-upcoming' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-inProgress' },
  { id: 'completed', label: 'Completed', color: 'bg-completed' },
];
const labelOf = (id) => categories.find((c) => c.id === id)?.label ?? id;

// Arrow keys move a picked-up card one column left or right.
const columnKeyboardCoordinates = (event, { currentCoordinates }) => {
  const step = Math.max(240, window.innerWidth / 5);
  if (event.code === 'ArrowRight') return { ...currentCoordinates, x: currentCoordinates.x + step };
  if (event.code === 'ArrowLeft') return { ...currentCoordinates, x: currentCoordinates.x - step };
  return undefined;
};

/** The four-column board: search, drag and drop between columns, and the create / edit modal. */
const TaskBoard = ({ tasks, onTaskCreated, onTaskUpdated, onTaskDeleted }) => {
  const navigate = useNavigate();
  const { selectTask } = useTimer();
  const [activeId, setActiveId] = useState(null);
  const [editingTask, setEditingTask] = useState(null); // a task, or { category } for a new one
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  const sensors = useSensors(
    // A small movement threshold lets a plain click through to the card's buttons.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );

  // "/" focuses search and "n" starts a new task, unless you are typing somewhere.
  useEffect(() => {
    const onKey = (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey || editingTask) return;
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        setEditingTask({ category: 'upcoming' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingTask]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tasks;
    return tasks.filter((t) => `${t.title} ${t.description || ''}`.toLowerCase().includes(needle));
  }, [tasks, query]);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    const newCategory = over.id;
    if (!task || task.category === newCategory) return;

    // Move the card at once, then confirm with the server; put it back if that fails.
    onTaskUpdated({ ...task, category: newCategory });
    try {
      const response = await axiosInstance.put(`/tasks/${task.id}`, { category: newCategory });
      onTaskUpdated(response.data.data);
    } catch (error) {
      onTaskUpdated(task);
      toast.error(errorMessage(error, 'Failed to move task'));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      onTaskDeleted(taskId);
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to delete task'));
    }
  };

  const handleFocusTask = (task) => {
    selectTask(task.id);
    navigate('/focus');
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pt-1 pb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke" size={13} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white/80 border border-white text-gunmetal placeholder:text-smoke focus:outline-none focus:ring-2 focus:ring-completed [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-md text-smoke hover:bg-gray-100"><FaTimes size={12} aria-hidden="true" /></button>
          ) : (
            <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-gray-300 text-[11px] text-smoke font-sans" aria-hidden="true">/</kbd>
          )}
        </div>
        {query.trim() && <p className="text-sm text-gunmetal" role="status">{visible.length} of {tasks.length} tasks</p>}
        <button
          type="button"
          onClick={() => setEditingTask({ category: 'upcoming' })}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-completed text-white font-semibold shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-completed transition-colors"
        >
          <FaPlus size={12} aria-hidden="true" />New task
          <kbd className="hidden sm:inline px-1.5 rounded bg-white/20 text-[11px] font-sans" aria-hidden="true">N</kbd>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Picked up ${tasks.find((t) => t.id === active.id)?.title}.`,
            onDragOver: ({ over }) => (over ? `Over ${labelOf(over.id)}.` : ''),
            onDragEnd: ({ over }) => (over ? `Dropped in ${labelOf(over.id)}.` : 'Drop cancelled.'),
            onDragCancel: () => 'Move cancelled.',
          },
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-8 items-start">
          {categories.map((category) => (
            <TaskColumn
              key={category.id}
              id={category.id}
              label={category.label}
              color={category.color}
              tasks={visible.filter((task) => task.category === category.id)}
              filtered={Boolean(query.trim())}
              onAddTask={() => setEditingTask({ category: category.id })}
              onEditTask={setEditingTask}
              onDeleteTask={handleDeleteTask}
              onFocusTask={handleFocusTask}
            />
          ))}
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
      </DndContext>

      <AnimatePresence>
        {editingTask && (
          <TaskModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onSave={(savedTask) => {
              if (editingTask.id) {
                onTaskUpdated(savedTask);
                toast.success('Task updated');
              } else {
                onTaskCreated(savedTask);
              }
              setEditingTask(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskBoard;
