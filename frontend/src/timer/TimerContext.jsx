import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import * as engine from './engine';

/*
 * The one timer for the whole app. It lives above the pages, so it keeps
 * running while you look at the board or your history, and it is saved to
 * localStorage so a reload picks it up where it was.
 */

const STORAGE_KEY = 'tasktrackr:timer';
const TimerContext = createContext(null);

function load() {
  try {
    return engine.restoreTimer(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return engine.initialTimer();
  }
}

/** A short two-note chime, generated on the spot so there is no audio file to ship. */
function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = frequency;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const at = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.2, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      osc.start(at);
      osc.stop(at + 0.55);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // No audio available (or blocked until the user interacts): the toast still shows.
  }
}

async function saveSession(session) {
  try {
    await axiosInstance.post('/pomodoro', {
      task_id: session.taskId,
      session_type: session.phase,
      duration_minutes: session.minutes,
      started_at: new Date(session.startedAt).toISOString(),
      ended_at: new Date(session.endedAt).toISOString(),
      completed: session.completed,
    });
    // The server adds a finished focus session to its task; let the board and footer refresh.
    window.dispatchEvent(new Event('tasksStale'));
  } catch {
    toast.error('That session could not be saved to your history.');
  }
}

export function TimerProvider({ children }) {
  const [timer, setTimer] = useState(load);
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef(timer);
  timerRef.current = timer;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
  }, [timer]);

  /** End the current phase, save it, and move on. */
  const complete = useCallback((completed) => {
    const current = timerRef.current;
    const { state, session } = engine.finish(current, Date.now(), { completed });
    timerRef.current = state;
    setTimer(state);
    if (session) saveSession(session);
    if (completed) {
      chime();
      toast.success(current.phase === 'work' ? 'Focus session done. Time for a break.' : 'Break over. Ready for the next one?');
    }
  }, []);

  // Tick while running. The tick only refreshes the display and checks the
  // end time; the countdown itself comes from the stored end time.
  useEffect(() => {
    if (timer.status !== 'running') return undefined;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (engine.isDue(timerRef.current, current)) complete(true);
    };
    tick();
    const id = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timer.status, complete]);

  // The countdown in the tab title, so it is visible from another tab.
  useEffect(() => {
    document.title = timer.status === 'running'
      ? `${engine.formatClock(engine.remainingMs(timer, now))} · ${engine.PHASE_LABELS[timer.phase]} · TaskTrackr`
      : 'TaskTrackr';
    return () => {
      document.title = 'TaskTrackr';
    };
  }, [timer, now]);

  const value = useMemo(() => {
    const update = (fn) => setTimer((state) => fn(state, Date.now()));
    return {
      timer,
      remainingMs: engine.remainingMs(timer, now),
      progress: engine.progress(timer, now),
      start: () => { setNow(Date.now()); update(engine.start); },
      pause: () => update(engine.pause),
      reset: () => update(engine.reset),
      skip: () => complete(false),
      goToPhase: (phase) => update((state) => engine.goToPhase(state, phase)),
      selectTask: (taskId) => update((state) => engine.selectTask(state, taskId)),
      setDurations: (durations) => update((state) => engine.setDurations(state, durations)),
    };
  }, [timer, now, complete]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error('useTimer must be used inside <TimerProvider>');
  return value;
}
