import test from 'node:test';
import assert from 'node:assert/strict';
import { daysUntil, describeDue, isSameLocalDay, parseDay } from '../src/lib/dates.js';

const today = new Date(2026, 10, 10, 15, 30); // Tuesday 10 November 2026, mid-afternoon

test('parseDay reads a calendar day as local midnight', () => {
  const day = parseDay('2026-11-10');
  assert.deepEqual([day.getFullYear(), day.getMonth(), day.getDate(), day.getHours()], [2026, 10, 10, 0]);
  assert.equal(parseDay(''), null);
  assert.equal(parseDay(null), null);
  assert.equal(parseDay('next week'), null);
});

test('daysUntil counts whole days whatever the time of day', () => {
  assert.equal(daysUntil(parseDay('2026-11-10'), today), 0);
  assert.equal(daysUntil(parseDay('2026-11-11'), today), 1);
  assert.equal(daysUntil(parseDay('2026-11-01'), today), -9);
});

test('describeDue words the date by how close it is', () => {
  assert.deepEqual(describeDue('2026-11-01', today), { label: '9 days overdue', tone: 'overdue' });
  assert.deepEqual(describeDue('2026-11-09', today), { label: 'Due yesterday', tone: 'overdue' });
  assert.deepEqual(describeDue('2026-11-10', today), { label: 'Due today', tone: 'soon' });
  assert.deepEqual(describeDue('2026-11-11', today), { label: 'Due tomorrow', tone: 'soon' });
  assert.equal(describeDue('2026-11-13', today).tone, 'later');
  assert.match(describeDue('2026-11-13', today).label, /^Due \w+day$/);
  assert.equal(describeDue('2026-12-25', today).tone, 'later');
  assert.equal(describeDue(null, today), null);
});

test('isSameLocalDay compares local calendar days', () => {
  assert.equal(isSameLocalDay(new Date(2026, 10, 10, 0, 5).toISOString(), today), true);
  assert.equal(isSameLocalDay(new Date(2026, 10, 9, 23, 55).toISOString(), today), false);
  assert.equal(isSameLocalDay('not a date', today), false);
});
