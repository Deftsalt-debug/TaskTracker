/* Date helpers. Due dates are plain calendar days ("2026-01-31"), so they are
   handled as local days; `new Date("2026-01-31")` would read them as UTC
   midnight and show the wrong day west of Greenwich. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** A "YYYY-MM-DD" string as local midnight, or null. */
export function parseDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** Whole days from `today` to `day`; negative when `day` is in the past. */
export function daysUntil(day, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((day - start) / DAY_MS);
}

/**
 * How a due date should read on a card.
 * tone: 'overdue' | 'soon' (today or tomorrow) | 'later'
 */
export function describeDue(value, today = new Date()) {
  const day = parseDay(value);
  if (!day) return null;
  const days = daysUntil(day, today);
  if (days < -1) return { label: `${-days} days overdue`, tone: 'overdue' };
  if (days === -1) return { label: 'Due yesterday', tone: 'overdue' };
  if (days === 0) return { label: 'Due today', tone: 'soon' };
  if (days === 1) return { label: 'Due tomorrow', tone: 'soon' };
  if (days < 7) return { label: `Due ${day.toLocaleDateString(undefined, { weekday: 'long' })}`, tone: 'later' };
  return { label: `Due ${day.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`, tone: 'later' };
}

/** True when an ISO timestamp falls on the same local calendar day as `today`. */
export function isSameLocalDay(iso, today = new Date()) {
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && date.toDateString() === today.toDateString();
}
