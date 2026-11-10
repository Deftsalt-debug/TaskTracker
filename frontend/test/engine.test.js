import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../src/timer/engine.js';

const MIN = 60_000;
const T0 = 1_000_000_000;

test('a fresh timer is an idle 25-minute focus session', () => {
  const t = engine.initialTimer();
  assert.equal(t.phase, 'work');
  assert.equal(t.status, 'idle');
  assert.equal(engine.remainingMs(t, T0), 25 * MIN);
  assert.equal(engine.progress(t, T0), 0);
});

test('running time comes from the end time, so a stalled tab cannot drift', () => {
  const t = engine.start(engine.initialTimer(), T0);
  assert.equal(t.endsAt, T0 + 25 * MIN);
  // No ticks happened in between; ten minutes later it simply reads fifteen left.
  assert.equal(engine.remainingMs(t, T0 + 10 * MIN), 15 * MIN);
  assert.equal(engine.progress(t, T0 + 10 * MIN), 0.4);
  assert.equal(engine.isDue(t, T0 + 25 * MIN - 1), false);
  assert.equal(engine.isDue(t, T0 + 25 * MIN), true);
  assert.equal(engine.remainingMs(t, T0 + 99 * MIN), 0);
});

test('pause keeps the remaining time and resume continues from it', () => {
  const paused = engine.pause(engine.start(engine.initialTimer(), T0), T0 + 10 * MIN);
  assert.equal(paused.status, 'paused');
  assert.equal(engine.remainingMs(paused, T0 + 50 * MIN), 15 * MIN, 'time does not pass while paused');
  const resumed = engine.start(paused, T0 + 60 * MIN);
  assert.equal(resumed.endsAt, T0 + 75 * MIN);
  assert.equal(resumed.startedAt, T0, 'still the same session');
  assert.equal(engine.start(resumed, T0 + 61 * MIN), resumed, 'starting a running timer changes nothing');
  assert.equal(engine.pause(paused, T0), paused);
});

test('finishing focus sessions cycles breaks, with a long one every fourth', () => {
  let t = engine.selectTask(engine.initialTimer(), 7);
  const phases = [];
  for (let i = 0; i < 8; i += 1) {
    const { state, session } = engine.finish(engine.start(t, T0), T0 + 25 * MIN);
    if (i % 2 === 0) assert.deepEqual(session, { phase: 'work', taskId: 7, startedAt: T0, endedAt: T0 + 25 * MIN, minutes: 25, completed: true });
    else assert.equal(session.taskId, null, 'a break is not logged against the task');
    t = state;
    phases.push(t.phase);
    assert.equal(t.status, 'idle');
    assert.equal(t.startedAt, null);
  }
  assert.deepEqual(phases, ['short_break', 'work', 'short_break', 'work', 'short_break', 'work', 'long_break', 'work']);
  assert.equal(t.completedWork, 4);
  assert.equal(engine.remainingMs(t, T0), 25 * MIN);
});

test('skipping records the time actually spent and does not count as a finished session', () => {
  const running = engine.start(engine.initialTimer(), T0);
  const { state, session } = engine.finish(running, T0 + 7 * MIN, { completed: false });
  assert.equal(session.completed, false);
  assert.equal(session.minutes, 7);
  assert.equal(state.completedWork, 0);
  assert.equal(state.phase, 'short_break');
  assert.equal(engine.finish(engine.initialTimer(), T0, { completed: false }).session, null, 'nothing to save for a session never started');
});

test('reset and phase switching return to a full, idle phase', () => {
  const running = engine.start(engine.initialTimer(), T0);
  assert.deepEqual(engine.reset(running), { ...engine.initialTimer(), durations: running.durations });
  const longBreak = engine.goToPhase(running, 'long_break');
  assert.equal(longBreak.status, 'idle');
  assert.equal(engine.remainingMs(longBreak, T0), 15 * MIN);
});

test('durations are clamped; an idle phase adopts its new length, a running one does not', () => {
  const idle = engine.setDurations(engine.initialTimer(), { work: '50', short_break: 0, long_break: 999 });
  assert.deepEqual(idle.durations, { work: 50, short_break: 1, long_break: 120 });
  assert.equal(engine.remainingMs(idle, T0), 50 * MIN);
  assert.equal(engine.setDurations(engine.initialTimer(), { work: 'abc' }).durations.work, 25);
  const running = engine.setDurations(engine.start(engine.initialTimer(), T0), { work: 50 });
  assert.equal(engine.remainingMs(running, T0), 25 * MIN);
});

test('restoreTimer accepts a good save and repairs a bad one', () => {
  const running = engine.selectTask(engine.start(engine.initialTimer(), T0), 3);
  assert.deepEqual(engine.restoreTimer(JSON.parse(JSON.stringify(running))), running);
  assert.deepEqual(engine.restoreTimer(null), engine.initialTimer());
  assert.deepEqual(engine.restoreTimer('nonsense'), engine.initialTimer());
  const repaired = engine.restoreTimer({ phase: 'nap', status: 'running', endsAt: 'soon', taskId: '3', completedWork: -2, durations: { work: 5000 } });
  assert.equal(repaired.phase, 'work');
  assert.equal(repaired.status, 'idle', 'running with no end time cannot be trusted');
  assert.equal(repaired.taskId, null);
  assert.equal(repaired.completedWork, 0);
  assert.equal(repaired.durations.work, 120);
});

test('formatClock rounds up so the display never shows 00:00 early', () => {
  assert.equal(engine.formatClock(25 * MIN), '25:00');
  assert.equal(engine.formatClock(25 * MIN - 1), '25:00');
  assert.equal(engine.formatClock(61_000), '01:01');
  assert.equal(engine.formatClock(400), '00:01');
  assert.equal(engine.formatClock(0), '00:00');
  assert.equal(engine.formatClock(-5), '00:00');
});
