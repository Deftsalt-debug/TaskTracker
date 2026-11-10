import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp, readTaskFields } from '../src/app.js';
import { issueToken, resolveSecret, verifyToken } from '../src/auth.js';
import { openDatabase } from '../src/db.js';

const SECRET = 'test-secret-test-secret-test-secret-1234';

/** Start the API on a free port against a fresh in-memory database. */
async function start(t) {
  const db = openDatabase(':memory:');
  const server = createApp({ db, secret: SECRET, quiet: true }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => { server.close(); db.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, { token, body } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  };
  const signUp = async (name) => {
    const res = await call('POST', '/api/auth/register', { body: { name, email: `${name}@example.com`, password: 'correct-horse' } });
    assert.equal(res.status, 201);
    return res.json.data;
  };
  return { call, signUp };
}

test('tokens: round trip, tamper, expiry, wrong secret', () => {
  const now = 1_000_000;
  const token = issueToken(42, SECRET, now);
  assert.equal(verifyToken(token, SECRET, now + 1000), 42);
  assert.equal(verifyToken(token, 'another-secret-another-secret-another', now), null);
  assert.equal(verifyToken(token, SECRET, now + 8 * 24 * 3600 * 1000), null, 'expired');
  const [payload, signature] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ uid: 1, exp: now + 9e9 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${signature}`, SECRET, now), null, 'payload swapped under an old signature');
  assert.equal(verifyToken(`${payload}.`, SECRET, now), null);
  assert.equal(verifyToken('7', SECRET, now), null, 'a bare user id is not a token');
  assert.equal(verifyToken(undefined, SECRET, now), null);
});

test('resolveSecret refuses to start in production without a real secret', () => {
  assert.throws(() => resolveSecret({ NODE_ENV: 'production' }));
  assert.throws(() => resolveSecret({ NODE_ENV: 'production', SESSION_SECRET: 'short' }));
  assert.equal(resolveSecret({ NODE_ENV: 'production', SESSION_SECRET: SECRET }), SECRET);
  assert.equal(resolveSecret({}).length, 64);
});

test('readTaskFields cleans good input and names the first problem', () => {
  assert.deepEqual(readTaskFields({ title: '  Write report ', category: 'priority', estimated_pomodoros: '4', bogus: 1 }, { requireTitle: true }).values,
    { title: 'Write report', category: 'priority', estimated_pomodoros: 4 });
  assert.match(readTaskFields({}, { requireTitle: true }).error, /title/);
  assert.match(readTaskFields({ title: '   ' }, { requireTitle: false }).error, /title/);
  assert.match(readTaskFields({ category: 'done' }, { requireTitle: false }).error, /Category/);
  assert.match(readTaskFields({ due_date: 'tomorrow' }, { requireTitle: false }).error, /Due date/);
  assert.match(readTaskFields({ estimated_pomodoros: 2.5 }, { requireTitle: false }).error, /whole number/);
  assert.deepEqual(readTaskFields({ due_date: '' , description: '  ' }, { requireTitle: false }).values, { due_date: null, description: null });
});

test('register and login: validation, duplicate, wrong password', async (t) => {
  const { call } = await start(t);
  const good = { name: 'Asha', email: 'Asha@Example.com', password: 'correct-horse' };
  assert.equal((await call('POST', '/api/auth/register', { body: { ...good, password: 'short' } })).status, 400);
  assert.equal((await call('POST', '/api/auth/register', { body: { ...good, email: 'not-an-email' } })).status, 400);

  const created = await call('POST', '/api/auth/register', { body: good });
  assert.equal(created.status, 201);
  assert.equal(created.json.data.user.email, 'asha@example.com');
  assert.ok(created.json.data.token);
  assert.equal(created.json.data.user.password_hash, undefined);
  assert.equal((await call('POST', '/api/auth/register', { body: { ...good, email: 'ASHA@example.com' } })).status, 409);

  const wrong = await call('POST', '/api/auth/login', { body: { email: good.email, password: 'wrong-password' } });
  const unknown = await call('POST', '/api/auth/login', { body: { email: 'nobody@example.com', password: 'wrong-password' } });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong.json, unknown.json, 'no hint about which accounts exist');

  const login = await call('POST', '/api/auth/login', { body: { email: 'asha@example.com', password: good.password } });
  assert.equal(login.status, 200);
  const me = await call('GET', '/api/auth/me', { token: login.json.data.token });
  assert.equal(me.json.data.user.name, 'Asha');
});

test('every data route needs a valid token', async (t) => {
  const { call } = await start(t);
  for (const [method, path] of [['GET', '/api/tasks'], ['POST', '/api/tasks'], ['PUT', '/api/tasks/1'], ['DELETE', '/api/tasks/1'], ['GET', '/api/pomodoro'], ['POST', '/api/pomodoro'], ['GET', '/api/auth/me']]) {
    assert.equal((await call(method, path, { body: method === 'GET' ? undefined : {} })).status, 401, `${method} ${path} without a token`);
    assert.equal((await call(method, path, { token: '1', body: method === 'GET' ? undefined : {} })).status, 401, `${method} ${path} with a bare user id`);
  }
});

test('task lifecycle, with completion kept in step with the column', async (t) => {
  const { call, signUp } = await start(t);
  const { token } = await signUp('asha');

  assert.equal((await call('POST', '/api/tasks', { token, body: { title: ' ' } })).status, 400);
  const created = await call('POST', '/api/tasks', { token, body: { title: 'Draft essay', category: 'priority', estimated_pomodoros: 3, due_date: '2026-12-01' } });
  assert.equal(created.status, 201);
  const id = created.json.data.id;
  assert.equal(created.json.data.is_completed, false);

  const done = await call('PUT', `/api/tasks/${id}`, { token, body: { category: 'completed' } });
  assert.equal(done.json.data.is_completed, true);
  assert.ok(done.json.data.completed_at);

  const reopened = await call('PUT', `/api/tasks/${id}`, { token, body: { category: 'in_progress', completed_pomodoros: 2 } });
  assert.equal(reopened.json.data.is_completed, false);
  assert.equal(reopened.json.data.completed_at, null);
  assert.equal(reopened.json.data.completed_pomodoros, 2);

  assert.equal((await call('PUT', `/api/tasks/${id}`, { token, body: { category: 'nonsense' } })).status, 400);
  assert.equal((await call('PUT', `/api/tasks/${id}`, { token, body: { user_id: 99 } })).status, 400, 'nothing recognised to update');
  assert.equal((await call('GET', '/api/tasks', { token })).json.data.length, 1);
  assert.equal((await call('DELETE', `/api/tasks/${id}`, { token })).status, 200);
  assert.equal((await call('DELETE', `/api/tasks/${id}`, { token })).status, 404);
});

test("one user cannot read, change, delete or log time against another user's tasks", async (t) => {
  const { call, signUp } = await start(t);
  const asha = await signUp('asha');
  const ravi = await signUp('ravi');
  const task = (await call('POST', '/api/tasks', { token: asha.token, body: { title: 'Private plan' } })).json.data;

  // Passing someone else's user_id, as the old API allowed, changes nothing.
  assert.deepEqual((await call('GET', `/api/tasks?user_id=${asha.user.id}`, { token: ravi.token })).json.data, []);
  assert.equal((await call('PUT', `/api/tasks/${task.id}`, { token: ravi.token, body: { title: 'Hijacked' } })).status, 404);
  assert.equal((await call('DELETE', `/api/tasks/${task.id}`, { token: ravi.token })).status, 404);
  const session = { task_id: task.id, session_type: 'work', duration_minutes: 25, started_at: new Date().toISOString() };
  assert.equal((await call('POST', '/api/pomodoro', { token: ravi.token, body: session })).status, 404);

  assert.equal((await call('GET', '/api/tasks', { token: asha.token })).json.data[0].title, 'Private plan');
  assert.equal((await call('POST', '/api/pomodoro', { token: asha.token, body: session })).status, 201);
  assert.equal((await call('GET', '/api/pomodoro', { token: asha.token })).json.data[0].task_title, 'Private plan');
  assert.equal((await call('GET', '/api/pomodoro', { token: ravi.token })).json.count, 0);
});

test('pomodoro validation and malformed JSON', async (t) => {
  const { call, signUp } = await start(t);
  const { token } = await signUp('asha');
  const ok = { session_type: 'work', duration_minutes: 25, started_at: new Date().toISOString() };
  assert.equal((await call('POST', '/api/pomodoro', { token, body: { ...ok, session_type: 'nap' } })).status, 400);
  assert.equal((await call('POST', '/api/pomodoro', { token, body: { ...ok, duration_minutes: 0 } })).status, 400);
  assert.equal((await call('POST', '/api/pomodoro', { token, body: { ...ok, started_at: 'whenever' } })).status, 400);
  assert.equal((await call('POST', '/api/pomodoro', { token, body: ok })).status, 201);
  assert.equal((await call('GET', '/api/nope')).status, 404);
});

test('demo workspace: a signed-in throwaway account with seeded tasks and sessions', async (t) => {
  const { call } = await start(t);
  const demo = await call('POST', '/api/auth/demo');
  assert.equal(demo.status, 201);
  const { token } = demo.json.data;
  const tasks = (await call('GET', '/api/tasks', { token })).json.data;
  assert.equal(tasks.length, 10);
  for (const category of ['priority', 'upcoming', 'in_progress', 'completed']) {
    assert.ok(tasks.some((task) => task.category === category), `has a ${category} task`);
  }
  assert.ok(tasks.filter((task) => task.category === 'completed').every((task) => task.is_completed && task.completed_at));
  const sessions = (await call('GET', '/api/pomodoro', { token })).json;
  assert.equal(sessions.count, tasks.reduce((sum, task) => sum + task.completed_pomodoros, 0));

  const other = await call('POST', '/api/auth/demo');
  assert.notEqual(other.json.data.user.id, demo.json.data.user.id, 'each visitor gets their own workspace');
});

test('a finished focus session counts towards its task; breaks and skipped sessions do not', async (t) => {
  const { call, signUp } = await start(t);
  const { token } = await signUp('asha');
  const task = (await call('POST', '/api/tasks', { token, body: { title: 'Essay', estimated_pomodoros: 1 } })).json.data;
  const base = { task_id: task.id, duration_minutes: 25, started_at: new Date().toISOString() };

  const first = await call('POST', '/api/pomodoro', { token, body: { ...base, session_type: 'work' } });
  assert.equal(first.json.task.completed_pomodoros, 1);
  assert.equal(first.json.task.estimated_pomodoros, 1);
  const second = await call('POST', '/api/pomodoro', { token, body: { ...base, session_type: 'work' } });
  assert.equal(second.json.task.completed_pomodoros, 2);
  assert.equal(second.json.task.estimated_pomodoros, 2, 'the estimate grows instead of reading 2 / 1');

  assert.equal((await call('POST', '/api/pomodoro', { token, body: { ...base, session_type: 'work', completed: false } })).json.task, null);
  assert.equal((await call('POST', '/api/pomodoro', { token, body: { ...base, session_type: 'short_break' } })).json.task, null);
  assert.equal((await call('GET', '/api/tasks', { token })).json.data[0].completed_pomodoros, 2);
});
