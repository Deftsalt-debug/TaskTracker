import { loadTimerState } from './timerState';

const now = Date.parse('2026-09-30T10:00:00Z');
const saved = (value) => ({ getItem: () => JSON.stringify(value) });

test('ignores broken JSON and unavailable storage', () => {
  expect(loadTimerState({ getItem() { throw new Error('Disabled'); } }, now).timeLeft).toBe(1500);
  expect(loadTimerState({ getItem: () => '{' }, now).isActive).toBe(false);
});

test('validates saved durations, time and completion count', () => {
  const state = loadTimerState(saved({ durations: { work: -1, short_break: 60 },
    timeLeft: 9000, sessionsCompleted: -4, sessionType: 'oops' }), now);
  expect(state.durations).toEqual({ work: 1500, short_break: 60, long_break: 900 });
  expect(state.timeLeft).toBe(1500);
  expect(state.sessionsCompleted).toBe(0);
  expect(state.sessionType).toBe('work');
});

test('counts time away only for a running timer and keeps its original start', () => {
  const start = new Date(now - 120000).toISOString();
  const state = { timeLeft: 100, isActive: true, lastUpdate: now - 20000, sessionStartTime: start };
  expect(loadTimerState(saved(state), now).timeLeft).toBe(80);
  expect(loadTimerState(saved(state), now).sessionStartTime).toBe(start);
  expect(loadTimerState(saved({ ...state, isActive: false }), now).timeLeft).toBe(100);
});

test('an expired legacy timer keeps a reconstructed start for history', () => {
  const state = loadTimerState(saved({ timeLeft: 20, isActive: true, lastUpdate: now - 30000 }), now);
  expect(state.timeLeft).toBe(0);
  expect(state.sessionStartTime).toBe(new Date(now - 30000 - 1480000).toISOString());
});
