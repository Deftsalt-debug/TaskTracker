import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTasks, FaBullseye, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { getUser, signOut } from '../../auth';
import { useTimer } from '../../timer/TimerContext';
import { PHASE_LABELS, formatClock } from '../../timer/engine';

const navItems = [
  { icon: FaTasks, label: 'Tasks', path: '/tasks' },
  { icon: FaBullseye, label: 'Focus', path: '/focus' },
  { icon: FaHistory, label: 'History', path: '/history' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { timer, remainingMs } = useTimer();
  const user = getUser();
  const ticking = timer.status !== 'idle';

  return (
    <header className="py-3 px-3 sm:px-6 flex items-center justify-between gap-3">
      <NavLink to="/tasks" className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-completed">
        <span aria-hidden="true" className="grid place-items-center w-8 h-8 rounded-lg bg-completed text-white font-bold">✓</span>
        <span className="text-lg sm:text-xl font-bold text-gunmetal">TaskTrackr</span>
      </NavLink>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {ticking && (
          <button
            type="button"
            onClick={() => navigate('/focus')}
            aria-label={`${PHASE_LABELS[timer.phase]} timer, ${formatClock(remainingMs)} left${timer.status === 'paused' ? ', paused' : ''}. Open the timer.`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 text-gunmetal font-semibold tabular-nums hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${timer.status === 'running' ? 'bg-red-500 animate-pulse' : 'bg-smoke'}`} aria-hidden="true" />
            {formatClock(remainingMs)}
          </button>
        )}
        <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `px-2.5 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-completed ${
                isActive ? 'bg-gunmetal text-white shadow' : 'text-gunmetal hover:bg-white/70'
              }`}
            >
              <item.icon aria-hidden="true" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sr-only sm:hidden">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => { signOut(); navigate('/login'); }}
          title={user ? `Signed in as ${user.name}` : undefined}
          className="px-2.5 sm:px-3 py-2 rounded-lg text-gunmetal font-medium flex items-center gap-2 text-sm sm:text-base hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors"
        >
          <FaSignOutAlt aria-hidden="true" />
          <span className="hidden md:inline">Sign out</span>
          <span className="sr-only md:hidden">Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
