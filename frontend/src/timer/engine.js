/*
 * The Pomodoro timer as plain data and pure functions.
 *
 * A running timer stores the moment it ends (`endsAt`), not a count that is
 * decremented every second. Browsers slow or pause timers in background tabs,
 * so a decrementing counter drifts; an end time is always right, and survives
 * a page reload or a trip to another page.
 */

export const PHASES = ['work', 'short_break', 'long_break'];
export const PHASE_LABELS = { work: 'Focus', short_break: 'Short break', long_break: 'Long break' };
export const DEFAULT_DURATIONS = { work: 25, short_break: 5, long_break: 15 };
export const DURATION_LIMITS = { min: 1, max: 120 };
/** A long break follows every fourth focus session. */
export const LONG_BREAK_EVERY = 4;

export function initialTimer(durations = DEFAULT_DURATIONS) {
  return {
    phase: 'work',
    status: 'idle', // 'idle' | 'running' | 'paused'
    endsAt: null, // ms timestamp while running
    remainingMs: durations.work * 60_000, // authoritative while idle or paused
    startedAt: null, // ms timestamp the current session first started
    completedWork: 0, // focus sessions finished in this run of the app
    taskId: null,
    durations: { ...durations },
  };
}

const phaseMs = (state, phase = state.phase) => state.durations[phase] * 60_000;

/** Milliseconds left in the current phase at `now`. */
export function remainingMs(state, now) {
  return state.status === 'running' ? Math.max(0, state.endsAt - now) : state.remainingMs;
}

/** 0–1 through the current phase. */
export function progress(state, now) {
  const total = phaseMs(state);
  return total > 0 ? Math.min(1, Math.max(0, 1 - remainingMs(state, now) / total)) : 0;
}

export function isDue(state, now) {
  return state.status === 'running' && now >= state.endsAt;
}

export function start(state, now) {
  if (state.status === 'running') return state;
  const left = state.remainingMs > 0 ? state.remainingMs : phaseMs(state);
  return { ...state, status: 'running', endsAt: now + left, remainingMs: left, startedAt: state.startedAt ?? now };
}

export function pause(state, now) {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', remainingMs: remainingMs(state, now), endsAt: null };
}

/** Back to the full length of a phase, not running. */
export function goToPhase(state, phase) {
  return { ...state, phase, status: 'idle', endsAt: null, remainingMs: phaseMs(state, phase), startedAt: null };
}

export const reset = (state) => goToPhase(state, state.phase);

export function nextPhase(phase, completedWork) {
  if (phase !== 'work') return 'work';
  return completedWork > 0 && completedWork % LONG_BREAK_EVERY === 0 ? 'long_break' : 'short_break';
}

/**
 * Finish the current phase (it ran out, or the user skipped it).
 * Returns the next state and, when the phase had been started, a record of the
 * session to save. `completed` is false for a skipped session.
 */
export function finish(state, now, { completed = true } = {}) {
  const completedWork = state.completedWork + (state.phase === 'work' && completed ? 1 : 0);
  const session = state.startedAt === null ? null : {
    phase: state.phase,
    taskId: state.phase === 'work' ? state.taskId : null,
    startedAt: state.startedAt,
    endedAt: now,
    // A finished session counts its full length; a skipped one, the time actually spent.
    minutes: completed ? state.durations[state.phase] : Math.max(1, Math.round((phaseMs(state) - remainingMs(state, now)) / 60_000)),
    completed,
  };
  return { state: goToPhase({ ...state, completedWork }, nextPhase(state.phase, completedWork)), session };
}

export function selectTask(state, taskId) {
  return { ...state, taskId: taskId ?? null };
}

/** Change phase lengths (minutes). An untouched, idle phase picks up its new length at once. */
export function setDurations(state, durations) {
  const clean = { ...state.durations };
  for (const phase of PHASES) {
    const minutes = Math.round(Number(durations[phase]));
    if (Number.isFinite(minutes)) clean[phase] = Math.min(DURATION_LIMITS.max, Math.max(DURATION_LIMITS.min, minutes));
  }
  const next = { ...state, durations: clean };
  return state.status === 'idle' ? { ...next, remainingMs: clean[state.phase] * 60_000 } : next;
}

/** A saved state, checked field by field; anything unexpected falls back to a fresh timer. */
export function restoreTimer(saved) {
  const fresh = initialTimer();
  if (!saved || typeof saved !== 'object') return fresh;
  const durations = setDurations(fresh, saved.durations || {}).durations;
  const phase = PHASES.includes(saved.phase) ? saved.phase : 'work';
  const status = ['idle', 'running', 'paused'].includes(saved.status) ? saved.status : 'idle';
  const number = (value, fallback) => (Number.isFinite(value) && value >= 0 ? value : fallback);
  const state = {
    phase,
    status,
    endsAt: status === 'running' ? number(saved.endsAt, null) : null,
    remainingMs: number(saved.remainingMs, durations[phase] * 60_000),
    startedAt: saved.startedAt === null ? null : number(saved.startedAt, null),
    completedWork: Math.floor(number(saved.completedWork, 0)),
    taskId: Number.isInteger(saved.taskId) ? saved.taskId : null,
    durations,
  };
  return state.status === 'running' && state.endsAt === null ? goToPhase(state, phase) : state;
}

/** "24:59" */
export function formatClock(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
