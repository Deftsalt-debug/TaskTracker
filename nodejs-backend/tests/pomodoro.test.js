import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.DB_PATH = ':memory:';
const { default: db } = await import('../config/database.js');
const { savePomodoroSession, getPomodoroHistory } = await import('../controllers/pomodoroController.js');

before(async () => {
  await db.run("INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Student', 'student@example.test', 'test-only')");
});
after(() => db.close());

async function request(handler, body = {}, query = {}) {
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await handler({ body, query }, response);
  return response;
}

test('history round-trip preserves a reloaded start time and a partial session duration', async () => {
  const session = {
    user_id: 1, session_type: 'work', duration_minutes: 0.5,
    started_at: '2026-09-30T10:00:00.000Z', ended_at: '2026-09-30T10:00:30.000Z', completed: 0,
  };
  const saved = await request(savePomodoroSession, session);
  assert.equal(saved.statusCode, 201);
  const history = await request(getPomodoroHistory, {}, { user_id: 1 });
  const row = history.body.data.find(row => row.id === saved.body.session_id);
  assert.equal(row.started_at, session.started_at);
  assert.equal(row.duration_minutes, 0.5);
  assert.equal(row.completed, false);
});

test('a completed session is returned as completed and ordered ahead of earlier history', async () => {
  const saved = await request(savePomodoroSession, {
    user_id: 1, session_type: 'work', duration_minutes: 25,
    started_at: '2026-09-30T11:00:00.000Z', ended_at: '2026-09-30T11:25:00.000Z', completed: 1,
  });
  const history = await request(getPomodoroHistory, {}, { user_id: 1 });
  assert.equal(history.body.data[0].id, saved.body.session_id);
  assert.equal(history.body.data[0].completed, true);
  assert.equal(history.body.data[0].duration_minutes, 25);
});
