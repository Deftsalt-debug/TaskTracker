import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaStepForward, FaCog } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import { useTimer } from '../timer/TimerContext';
import { DURATION_LIMITS, LONG_BREAK_EVERY, PHASES, PHASE_LABELS, formatClock } from '../timer/engine';

const ring = { work: 'stroke-completed', short_break: 'stroke-inProgress', long_break: 'stroke-priority' };
const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The Pomodoro timer. The timer itself lives in TimerContext; this page is its face. */
const FocusPage = () => {
  const { timer, remainingMs, progress, start, pause, reset, skip, goToPhase, selectTask, setDurations } = useTimer();
  const [tasks, setTasks] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const load = () => axiosInstance.get('/tasks')
      .then((response) => setTasks(response.data.data.filter((task) => task.category !== 'completed')))
      .catch(() => {});
    load();
    window.addEventListener('tasksStale', load);
    return () => window.removeEventListener('tasksStale', load);
  }, []);

  const running = timer.status === 'running';
  const toggle = running ? pause : start;

  // Space starts and pauses, unless a control that uses Space itself has focus.
  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== 'Space' || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(event.target.tagName)) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const task = tasks.find((t) => t.id === timer.taskId);
  const untilLongBreak = LONG_BREAK_EVERY - (timer.completedWork % LONG_BREAK_EVERY);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="max-w-xl mx-auto py-4 sm:py-8">
      <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
        <div className="flex p-1 rounded-xl bg-gray-100" role="group" aria-label="Session type">
          {PHASES.map((phase) => (
            <button
              key={phase}
              type="button"
              aria-pressed={timer.phase === phase}
              onClick={() => goToPhase(phase)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-completed ${
                timer.phase === phase ? 'bg-white text-gunmetal shadow' : 'text-smoke hover:text-gunmetal'
              }`}
            >
              {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>

        <div className="relative mx-auto mt-7 w-full max-w-[280px] aspect-square">
          <svg viewBox="0 0 280 280" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="140" cy="140" r={RADIUS} fill="none" strokeWidth="12" className="stroke-gray-100" />
            <circle
              cx="140" cy="140" r={RADIUS} fill="none" strokeWidth="12" strokeLinecap="round"
              className={`${ring[timer.phase]} transition-[stroke-dashoffset] duration-500 ease-linear`}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * progress}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-smoke">{timer.status === 'paused' ? 'Paused' : PHASE_LABELS[timer.phase]}</p>
            <p role="timer" aria-live="off" className="text-6xl font-bold text-gunmetal tabular-nums leading-tight">{formatClock(remainingMs)}</p>
            <p className="text-sm text-smoke line-clamp-2">{timer.phase === 'work' ? (task ? task.title : 'No task selected') : 'Step away from the screen'}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={reset} aria-label="Reset this session" className="grid place-items-center w-12 h-12 rounded-full bg-gray-100 text-gunmetal hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors"><FaRedo aria-hidden="true" /></button>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center gap-2.5 min-w-[160px] h-14 px-8 rounded-full bg-completed text-white text-lg font-semibold shadow hover:bg-primary-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-completed transition"
          >
            {running ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
            {running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'}
          </button>
          <button type="button" onClick={skip} aria-label="Skip to the next session" className="grid place-items-center w-12 h-12 rounded-full bg-gray-100 text-gunmetal hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors"><FaStepForward aria-hidden="true" /></button>
        </div>
        <p className="mt-3 text-center text-xs text-smoke">Press <kbd className="px-1.5 py-0.5 rounded border border-gray-300 font-sans">Space</kbd> to start or pause. The timer keeps running on other pages.</p>

        <div className="mt-7">
          <label htmlFor="focus-task" className="block text-sm font-semibold text-gunmetal mb-1.5">Working on</label>
          <select
            id="focus-task"
            value={timer.taskId ?? ''}
            onChange={(e) => selectTask(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-300 bg-white text-gunmetal focus:outline-none focus:ring-2 focus:ring-completed"
          >
            <option value="">No task: just keep time</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title} ({t.completed_pomodoros || 0}/{t.estimated_pomodoros || 0})</option>
            ))}
          </select>
          {task && <p className="mt-1.5 text-xs text-smoke">Each finished focus session adds one to this task's count.</p>}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3" aria-label={`${timer.completedWork} focus sessions finished`}>
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: LONG_BREAK_EVERY }, (_, i) => (
                <span key={i} className={`w-3 h-3 rounded-full ${i < timer.completedWork % LONG_BREAK_EVERY || (timer.completedWork > 0 && timer.completedWork % LONG_BREAK_EVERY === 0 && timer.phase === 'long_break') ? 'bg-completed' : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-sm text-smoke"><span className="font-semibold text-gunmetal">{timer.completedWork}</span> done · long break in {untilLongBreak}</p>
          </div>
          <button type="button" onClick={() => setShowSettings((open) => !open)} aria-expanded={showSettings} aria-controls="timer-settings" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gunmetal hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-completed transition-colors">
            <FaCog aria-hidden="true" />Lengths
          </button>
        </div>

        {showSettings && (
          <fieldset id="timer-settings" className="mt-4 grid grid-cols-3 gap-3">
            <legend className="sr-only">Session lengths in minutes</legend>
            {PHASES.map((phase) => (
              <label key={phase} className="block text-xs font-semibold text-smoke">
                {PHASE_LABELS[phase]} (min)
                <input
                  type="number"
                  inputMode="numeric"
                  min={DURATION_LIMITS.min}
                  max={DURATION_LIMITS.max}
                  value={timer.durations[phase]}
                  onChange={(e) => e.target.value && setDurations({ [phase]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-base font-semibold text-gunmetal tabular-nums focus:outline-none focus:ring-2 focus:ring-completed"
                />
              </label>
            ))}
          </fieldset>
        )}
      </div>
    </motion.div>
  );
};

export default FocusPage;
