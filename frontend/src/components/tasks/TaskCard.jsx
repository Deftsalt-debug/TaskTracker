import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FaEdit, FaTrash, FaRegCalendarAlt, FaPlay, FaCheck, FaGripVertical } from 'react-icons/fa';
import { describeDue } from '../../lib/dates';

const accent = {
  priority: 'border-l-priority',
  upcoming: 'border-l-upcoming',
  in_progress: 'border-l-inProgress',
  completed: 'border-l-completed',
};

const priorityPill = {
  high: 'bg-red-50 text-red-700 ring-red-200',
  medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  low: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

const dueTone = {
  overdue: 'text-red-700 font-semibold',
  soon: 'text-amber-800 font-semibold',
  later: 'text-smoke',
};

const iconButton = 'grid place-items-center w-8 h-8 rounded-md text-smoke hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors';

/**
 * One task on the board. The grip (and the card body) drags it between
 * columns; with the keyboard, focus the grip, press Space, move with the arrow
 * keys and press Space again to drop.
 */
const TaskCard = ({ task, onEdit, onDelete, onFocus, overlay = false }) => {
  const [confirming, setConfirming] = useState(false);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: task.id, disabled: overlay });

  const done = task.category === 'completed';
  const due = done ? null : describeDue(task.due_date);
  const estimated = task.estimated_pomodoros || 0;
  const completed = task.completed_pomodoros || 0;
  const percent = estimated > 0 ? Math.min(100, Math.round((completed / estimated) * 100)) : 0;

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      className={`group relative bg-white rounded-xl border border-gray-200 border-l-4 ${accent[task.category] || 'border-l-smoke'} p-3.5 shadow-sm transition-shadow touch-manipulation ${
        overlay ? 'shadow-2xl rotate-2 cursor-grabbing' : 'hover:shadow-md cursor-grab'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start gap-2">
        <h4 className={`flex-1 min-w-0 text-[15px] font-semibold leading-snug break-words ${done ? 'text-smoke line-through decoration-smoke/50' : 'text-gunmetal'}`}>
          {task.title}
        </h4>
        {!overlay && (
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            type="button"
            aria-label={`Move “${task.title}” to another column`}
            className={`${iconButton} -mr-1.5 -mt-1 cursor-grab opacity-40 group-hover:opacity-100 focus-visible:opacity-100`}
          >
            <FaGripVertical size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      {!done && task.description && <p className="mt-1.5 text-sm text-smoke line-clamp-2">{task.description}</p>}

      {!done && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className={`px-2 py-0.5 rounded-full ring-1 ring-inset font-semibold capitalize ${priorityPill[task.priority_level] || priorityPill.medium}`}>
            {task.priority_level || 'medium'}
          </span>
          {due && (
            <span className={`inline-flex items-center gap-1 ${dueTone[due.tone]}`}>
              <FaRegCalendarAlt size={11} aria-hidden="true" />{due.label}
            </span>
          )}
        </div>
      )}

      {!done && estimated > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-smoke mb-1">
            <span>Focus sessions</span>
            <span className="font-semibold text-gunmetal tabular-nums">{completed} / {estimated}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={estimated} aria-valuenow={Math.min(completed, estimated)} aria-label="Focus sessions completed">
            <div className="h-full rounded-full bg-inProgress transition-[width] duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {!overlay && (
        // Stop pointer events here so pressing a button never starts a drag.
        <div className="mt-3 flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {confirming ? (
            <div className="flex items-center gap-2 w-full" role="group" aria-label="Confirm delete">
              <span className="text-xs font-semibold text-red-700 flex-1">Delete this task?</span>
              <button type="button" autoFocus onClick={() => setConfirming(false)} className="px-3 py-1.5 rounded-md bg-gray-100 text-gunmetal text-xs font-semibold hover:bg-gray-200">Keep</button>
              <button type="button" onClick={() => onDelete(task.id)} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700">Delete</button>
            </div>
          ) : (
            <>
              {done ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-completed mr-auto"><FaCheck size={10} aria-hidden="true" />Done</span>
              ) : (
                <button type="button" onClick={() => onFocus(task)} className="inline-flex items-center gap-1.5 mr-auto px-2.5 py-1.5 rounded-md text-xs font-semibold text-completed hover:bg-completed hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors">
                  <FaPlay size={9} aria-hidden="true" />Focus
                </button>
              )}
              <button type="button" onClick={() => onEdit(task)} aria-label={`Edit “${task.title}”`} className={`${iconButton} hover:text-gunmetal`}><FaEdit size={13} aria-hidden="true" /></button>
              <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete “${task.title}”`} className={`${iconButton} hover:text-red-700`}><FaTrash size={12} aria-hidden="true" /></button>
            </>
          )}
        </div>
      )}
    </article>
  );
};

export default TaskCard;
