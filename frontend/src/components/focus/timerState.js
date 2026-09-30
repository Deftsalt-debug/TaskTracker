const DEFAULT_DURATIONS = { work: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 };

// Read once when the timer mounts. A broken/older saved value should never
// turn the clock into NaN or lose an active session's history after a reload.
export function loadTimerState(storage, now = Date.now()) {
  const defaults = {
    timeLeft: DEFAULT_DURATIONS.work,
    isActive: false,
    sessionType: 'work',
    sessionsCompleted: 0,
    selectedTask: null,
    durations: { ...DEFAULT_DURATIONS },
    sessionStartTime: null,
    lastUpdate: now
  };
  try {
    storage = storage ?? globalThis.localStorage;
    const saved = JSON.parse(storage.getItem('pomodoroTimer'));
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
    const durations = { ...DEFAULT_DURATIONS };
    for (const type of Object.keys(durations)) {
      const value = saved.durations?.[type];
      if (Number.isInteger(value) && value >= 60 && value <= 999 * 60) durations[type] = value;
    }
    const sessionType = Object.hasOwn(durations, saved.sessionType) ? saved.sessionType : 'work';
    const timeLeft = Number.isFinite(saved.timeLeft)
      ? Math.max(0, Math.min(durations[sessionType], Math.floor(saved.timeLeft)))
      : durations[sessionType];
    const isActive = saved.isActive === true;
    const lastUpdate = Number.isFinite(saved.lastUpdate) ? Math.min(now, saved.lastUpdate) : now;
    const elapsed = isActive ? Math.max(0, Math.floor((now - lastUpdate) / 1000)) : 0;
    // Older saves didn't include started_at. Reconstruct it from the time
    // already spent so these sessions can still reach History.
    const sessionStartTime = typeof saved.sessionStartTime === 'string' &&
      Number.isFinite(Date.parse(saved.sessionStartTime))
      ? saved.sessionStartTime
      : isActive ? new Date(lastUpdate - (durations[sessionType] - timeLeft) * 1000).toISOString() : null;
    return {
      ...defaults, durations, sessionType, isActive, sessionStartTime,
      timeLeft: Math.max(0, timeLeft - elapsed),
      sessionsCompleted: Number.isSafeInteger(saved.sessionsCompleted) && saved.sessionsCompleted >= 0
        ? saved.sessionsCompleted : 0,
      selectedTask: typeof saved.selectedTask === 'string' || Number.isSafeInteger(saved.selectedTask)
        ? saved.selectedTask : null
    };
  } catch {
    return defaults;
  }
}
