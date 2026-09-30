import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

// Every test uses a fresh in-memory database, never the app's saved tasks.
process.env.DB_PATH = ':memory:';
const { default: db } = await import('../config/database.js');
const { createTask, updateTask, deleteTask } = await import('../controllers/tasksController.js');

before(async () => {
  await db.run("INSERT INTO users (id, name, email, password_hash) VALUES (1, 'Student', 'student@example.test', 'test-only')");
});
after(() => db.close());

async function request(handler, body = {}, id) {
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  await handler({ params: { id }, query: {}, body }, response);
  return response;
}

async function makeTask(category = 'upcoming') {
  const response = await request(createTask, { user_id: 1, title: 'Finish the assignment', category });
  assert.equal(response.statusCode, 201);
  return response.body.data.id;
}

test('a task created in Completed gets a completion flag and timestamp', async () => {
  const id = await makeTask('completed');
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
  assert.equal(task.is_completed, 1);
  assert.ok(task.completed_at);
});

test('moving a completed task back to work clears its completion data', async () => {
  const id = await makeTask('completed');
  await request(updateTask, { category: 'in_progress' }, String(id));
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
  assert.equal(task.category, 'in_progress');
  assert.equal(task.is_completed, 0);
  assert.equal(task.completed_at, null);
});

test('editing a completed task keeps the original finish time', async () => {
  const id = await makeTask('completed');
  const originalTime = '2026-09-01T12:00:00.000Z';
  await db.run('UPDATE tasks SET completed_at = ? WHERE id = ?', [originalTime, id]);
  await request(updateTask, { category: 'completed', title: 'Assignment done' }, String(id));
  assert.equal((await db.get('SELECT * FROM tasks WHERE id = ?', [id])).completed_at, originalTime);
});

test('the board category wins over a conflicting completion flag', async () => {
  const id = await makeTask();
  await request(updateTask, { category: 'completed', is_completed: false }, String(id));
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
  assert.equal(task.is_completed, 1);
  assert.ok(task.completed_at);
});

for (const id of ['1oops', '1.5', '-1', '0', 'Infinity']) {
  test(`invalid task ID ${id} cannot update or delete tasks`, async () => {
    const before = await db.all('SELECT * FROM tasks');
    assert.equal((await request(updateTask, { title: 'Oops' }, id)).statusCode, 400);
    assert.equal((await request(deleteTask, {}, id)).statusCode, 400);
    assert.deepEqual(await db.all('SELECT * FROM tasks'), before);
  });
}

test('the old body-ID update endpoint still works', async () => {
  const id = await makeTask();
  assert.equal((await request(updateTask, { id, category: 'completed' })).statusCode, 200);
  assert.equal((await db.get('SELECT * FROM tasks WHERE id = ?', [id])).is_completed, 1);
});

test('updating a missing task returns 404', async () => {
  assert.equal((await request(updateTask, { title: 'Missing' }, '99999')).statusCode, 404);
});
