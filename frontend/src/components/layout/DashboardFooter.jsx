import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { isSameLocalDay } from '../../lib/dates';

const empty = { total: 0, upcoming: 0, in_progress: 0, priority: 0, completed: 0, today: 0 };

const Stat = ({ label, value, dot }) => (
  <div className="flex flex-col items-center min-w-[56px]">
    <dd className="text-xl font-bold text-white tabular-nums">{value}</dd>
    <dt className="flex items-center gap-1.5 text-xs text-gray-300">
      {dot && <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden="true" />}{label}
    </dt>
  </div>
);

/** A strip of live counts under every page; refreshes whenever tasks change. */
const DashboardFooter = () => {
  const [stats, setStats] = useState(empty);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const tasks = (await axiosInstance.get('/tasks')).data.data;
        if (cancelled) return;
        const next = { ...empty, total: tasks.length };
        for (const task of tasks) {
          next[task.category] += 1;
          if (task.completed_at && isSameLocalDay(task.completed_at)) next.today += 1;
        }
        setStats(next);
      } catch {
        // The page itself reports load failures; the footer just keeps its last numbers.
      }
    };
    refresh();
    window.addEventListener('taskChange', refresh);
    window.addEventListener('tasksStale', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('taskChange', refresh);
      window.removeEventListener('tasksStale', refresh);
    };
  }, []);

  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const circumference = 2 * Math.PI * 16;

  return (
    <footer className="hidden sm:block bg-gunmetal py-2.5 px-6" aria-label="Task summary">
      <dl className="max-w-5xl mx-auto flex items-center justify-between gap-6 m-0">
        <Stat label="Total" value={stats.total} />
        <Stat label="Priority" value={stats.priority} dot="bg-priority" />
        <Stat label="Upcoming" value={stats.upcoming} dot="bg-upcoming" />
        <Stat label="In progress" value={stats.in_progress} dot="bg-inProgress" />
        <Stat label="Completed" value={stats.completed} dot="bg-completed ring-1 ring-white/40" />
        <Stat label="Done today" value={stats.today} />
        <div className="flex items-center gap-2.5">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90" aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-white/15" />
            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-paleGreen transition-[stroke-dashoffset] duration-500" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - rate / 100)} />
          </svg>
          <div className="flex flex-col">
            <dd className="text-xl font-bold text-white tabular-nums leading-tight">{rate}%</dd>
            <dt className="text-xs text-gray-300">complete</dt>
          </div>
        </div>
      </dl>
    </footer>
  );
};

export default DashboardFooter;
