/* Sample content for the demo workspace: a believable week of student work. */

const DAY = 24 * 60 * 60 * 1000;
const dateOnly = (ms) => new Date(ms).toISOString().slice(0, 10);

const TASKS = [
  { title: 'Submit operating systems lab report', description: 'Scheduling algorithms comparison. Include the Gantt charts.', category: 'priority', priority: 'high', due: 1, estimated: 4, done: 2 },
  { title: 'Fix login redirect bug', description: 'Users land on a blank page after signing in on mobile Safari.', category: 'priority', priority: 'high', due: 2, estimated: 2, done: 0 },
  { title: 'Revise graph algorithms', description: 'Dijkstra, Bellman-Ford and when each one applies.', category: 'in_progress', priority: 'medium', due: 3, estimated: 5, done: 3 },
  { title: 'Draft the hackathon pitch deck', description: 'Six slides: problem, demo, how it works, what is next.', category: 'in_progress', priority: 'medium', due: 5, estimated: 3, done: 1 },
  { title: 'Read chapter 7 of the database textbook', description: 'Normal forms. Make one page of notes.', category: 'upcoming', priority: 'medium', due: 6, estimated: 2, done: 0 },
  { title: 'Plan the club workshop', description: 'Book the room and write the sign-up form.', category: 'upcoming', priority: 'low', due: 9, estimated: 2, done: 0 },
  { title: 'Refactor the task card component', description: null, category: 'upcoming', priority: 'low', due: null, estimated: 1, done: 0 },
  { title: 'Set up the project repository', description: 'README, licence and CI.', category: 'completed', priority: 'medium', due: -2, estimated: 2, done: 2, completedAgo: 2 },
  { title: 'Finish linear algebra problem set', description: null, category: 'completed', priority: 'high', due: -1, estimated: 3, done: 3, completedAgo: 1 },
  { title: 'Email the project supervisor', description: null, category: 'completed', priority: 'low', due: 0, estimated: 1, done: 1, completedAgo: 0 },
];

/** Fill a new user's workspace with tasks in every column and a few days of focus sessions. */
export function seedDemoData(db, userId, now = Date.now()) {
  const ids = TASKS.map((task) => {
    const completedAt = task.category === 'completed' ? new Date(now - task.completedAgo * DAY - 3 * 3600 * 1000).toISOString() : null;
    return db.run(
      `INSERT INTO tasks (user_id, title, description, category, due_date, priority_level, estimated_pomodoros, completed_pomodoros, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, task.title, task.description, task.category, task.due === null ? null : dateOnly(now + task.due * DAY), task.priority,
        task.estimated, task.done, completedAt ? 1 : 0, completedAt],
    ).id;
  });

  // One 25-minute work session per completed pomodoro, spread over the last few days.
  let slot = 0;
  TASKS.forEach((task, index) => {
    for (let i = 0; i < task.done; i += 1) {
      const startedAt = now - (slot % 4) * DAY - (2 + (slot % 3) * 2) * 3600 * 1000 - i * 40 * 60 * 1000;
      db.run(
        `INSERT INTO pomodoro_sessions (user_id, task_id, session_type, duration_minutes, started_at, ended_at, completed)
         VALUES (?, ?, 'work', 25, ?, ?, 1)`,
        [userId, ids[index], new Date(startedAt).toISOString(), new Date(startedAt + 25 * 60 * 1000).toISOString()],
      );
      slot += 1;
    }
  });
}
