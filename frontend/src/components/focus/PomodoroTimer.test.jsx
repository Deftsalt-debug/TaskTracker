import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import PomodoroTimer from './PomodoroTimer';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

jest.mock('../../api/axiosInstance', () => ({ post: jest.fn(), put: jest.fn() }));
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));
jest.mock('framer-motion', () => {
  const React = require('react');
  const element = (tag) => ({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }) =>
    React.createElement(tag, props, children);
  return { motion: { div: element('div'), button: element('button'), circle: element('circle') },
    AnimatePresence: ({ children }) => children };
});

let root, container;
const now = Date.parse('2026-09-30T10:00:00Z');
const start = new Date(now - 10000).toISOString();
const seed = (state = {}) => localStorage.setItem('pomodoroTimer', JSON.stringify({
  timeLeft: 60, isActive: false, sessionType: 'work', sessionsCompleted: 0,
  durations: { work: 60, short_break: 60, long_break: 60 },
  sessionStartTime: null, lastUpdate: now, ...state,
}));
const button = (label) => container.querySelector(`button[aria-label="${label}"]`);
const click = (label) => act(() => button(label).dispatchEvent(new MouseEvent('click', { bubbles: true })));
const mount = () => act(() => root.render(<React.StrictMode><PomodoroTimer tasks={[]} /></React.StrictMode>));

beforeEach(() => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(now);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const entries = new Map();
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    clear: () => entries.clear(),
  } });
  localStorage.setItem('user', JSON.stringify({ id: 1 }));
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  axiosInstance.post.mockResolvedValue({});
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('reload completes an expired timer once, including in StrictMode', () => {
  seed({ timeLeft: 5, isActive: true, lastUpdate: now - 10000, sessionStartTime: start });
  mount();
  expect(axiosInstance.post).toHaveBeenCalledTimes(1);
  expect(axiosInstance.post).toHaveBeenCalledWith('/pomodoro', expect.objectContaining({
    started_at: start, duration_minutes: 1, completed: 1,
  }));
  expect(JSON.parse(localStorage.getItem('pomodoroTimer')).sessionsCompleted).toBe(1);
});

test('pause and resume keep one session and exclude paused time from its duration', () => {
  seed(); mount(); click('Start timer');
  act(() => jest.advanceTimersByTime(20000));
  click('Pause timer');
  expect(axiosInstance.post).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(60000));
  click('Start timer');
  act(() => jest.advanceTimersByTime(40000));
  expect(axiosInstance.post).toHaveBeenCalledTimes(1);
  expect(axiosInstance.post.mock.calls[0][1]).toEqual(expect.objectContaining({ duration_minutes: 1, completed: 1 }));
});

test('reset records only actual elapsed time, even before a throttled callback', () => {
  seed(); mount(); click('Start timer');
  jest.setSystemTime(now + 30000);
  click('Reset timer');
  expect(axiosInstance.post.mock.calls[0][1]).toEqual(expect.objectContaining({ duration_minutes: 0.5, completed: 0 }));
});

test('pausing after the deadline completes the session instead of stranding it at zero', () => {
  seed(); mount(); click('Start timer');
  jest.setSystemTime(now + 61000);
  click('Pause timer');
  expect(axiosInstance.post.mock.calls[0][1].completed).toBe(1);
  expect(JSON.parse(localStorage.getItem('pomodoroTimer')).sessionType).toBe('short_break');
});

test('a failed history request is reported', async () => {
  axiosInstance.post.mockRejectedValueOnce(new Error('Offline'));
  jest.spyOn(console, 'error').mockImplementation(() => {});
  seed({ timeLeft: 0, isActive: true, sessionStartTime: start });
  await act(async () => { root.render(<PomodoroTimer />); });
  expect(toast.error).toHaveBeenCalledWith('Could not save this session to history.');
});
