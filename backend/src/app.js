import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { issueToken, rateLimit, requireAuth } from './auth.js';
import { seedDemoData } from './demo.js';

const CATEGORIES = ['upcoming', 'in_progress', 'priority', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];
const SESSION_TYPES = ['work', 'short_break', 'long_break'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (res, status, message) => res.status(status).json({ status: 'error', message });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });
const formatTask = (task) => ({ ...task, is_completed: Boolean(task.is_completed) });

/** A whole number within [min, max], or null when the value is anything else. */
function wholeNumber(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/**
 * Validate the task fields present in `body`. Returns { values } holding only
 * the recognised, cleaned fields, or { error } describing the first problem.
 */
export function readTaskFields(body, { requireTitle }) {
  const values = {};
  if (body.title !== undefined || requireTitle) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return { error: 'A task needs a title' };
    if (title.length > 200) return { error: 'Keep the title under 200 characters' };
    values.title = title;
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') return { error: 'Description must be text' };
    const description = (body.description || '').trim();
    if (description.length > 2000) return { error: 'Keep the description under 2000 characters' };
    values.description = description || null;
  }
  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) return { error: `Category must be one of: ${CATEGORIES.join(', ')}` };
    values.category = body.category;
  }
  if (body.priority_level !== undefined) {
    if (!PRIORITIES.includes(body.priority_level)) return { error: `Priority must be one of: ${PRIORITIES.join(', ')}` };
    values.priority_level = body.priority_level;
  }
  if (body.due_date !== undefined) {
    if (body.due_date !== null && body.due_date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(body.due_date)) {
      return { error: 'Due date must look like 2026-01-31' };
    }
    values.due_date = body.due_date || null;
  }
  for (const [field, max] of [['estimated_pomodoros', 50], ['completed_pomodoros', 500]]) {
    if (body[field] === undefined) continue;
    const n = wholeNumber(body[field], 0, max);
    if (n === null) return { error: `${field} must be a whole number from 0 to ${max}` };
    values[field] = n;
  }
  return { values };
}

/**
 * Build the Express app around a database and a signing secret. Kept separate
 * from server.js so tests can run it against an in-memory database.
 */
export function createApp({ db, secret, corsOrigin = process.env.CORS_ORIGIN, quiet = false }) {
  const app = express();
  const auth = requireAuth(secret);

  // By default only the local dev frontend may call the API from a browser.
  const origins = (corsOrigin || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((o) => o.trim());
  app.use(cors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(express.json({ limit: '100kb' }));
  if (!quiet) {
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  app.get('/health', (_req, res) => res.json({ status: 'ok', message: 'TaskTrackr backend is running' }));

  // ---- Accounts -----------------------------------------------------------

  const authLimit = rateLimit();

  app.post('/api/auth/register', authLimit, async (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!name || !email || !password) return fail(res, 400, 'Name, email and password are all required');
    if (name.length > 100) return fail(res, 400, 'Keep the name under 100 characters');
    if (!EMAIL.test(email) || email.length > 254) return fail(res, 400, 'Enter a valid email address');
    // bcrypt ignores everything past 72 bytes, so a longer password would be silently weakened.
    if (password.length < 8 || Buffer.byteLength(password) > 72) return fail(res, 400, 'Use a password of 8 to 72 characters');
    if (db.get('SELECT id FROM users WHERE email = ?', [email])) return fail(res, 409, 'Email already registered');

    const hash = await bcrypt.hash(password, 10);
    const { id } = db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    const user = { id, name, email };
    res.status(201).json({ status: 'success', message: 'Account created', data: { user, token: issueToken(id, secret) } });
  });

  app.post('/api/auth/login', authLimit, async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) return fail(res, 400, 'Email and password are required');
    const user = db.get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    // The same message for an unknown email and a wrong password, so the form cannot be used to list accounts.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return fail(res, 401, 'Invalid email or password');
    res.json({ status: 'success', message: 'Login successful', data: { user: publicUser(user), token: issueToken(user.id, secret) } });
  });

  // A throwaway account with sample data, so a visitor can look around without signing up.
  app.post('/api/auth/demo', authLimit, async (_req, res) => {
    const email = `demo-${crypto.randomBytes(6).toString('hex')}@demo.tasktrackr`;
    const hash = await bcrypt.hash(crypto.randomBytes(18).toString('base64url'), 10);
    const { id } = db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Demo user', email, hash]);
    seedDemoData(db, id);
    res.status(201).json({ status: 'success', message: 'Demo workspace created', data: { user: { id, name: 'Demo user', email }, token: issueToken(id, secret) } });
  });

  app.get('/api/auth/me', auth, (req, res) => {
    const user = db.get('SELECT id, name, email FROM users WHERE id = ?', [req.userId]);
    if (!user) return fail(res, 401, 'Sign in to continue');
    res.json({ status: 'success', data: { user } });
  });

  // ---- Tasks: every query is scoped to the signed-in user ------------------

  app.get('/api/tasks', auth, (req, res) => {
    const tasks = db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC, id DESC', [req.userId]);
    res.json({ status: 'success', data: tasks.map(formatTask) });
  });

  app.post('/api/tasks', auth, (req, res) => {
    const { values, error } = readTaskFields(req.body, { requireTitle: true });
    if (error) return fail(res, 400, error);
    const category = values.category ?? 'upcoming';
    const done = category === 'completed';
    const { id } = db.run(
      `INSERT INTO tasks (user_id, title, description, category, due_date, priority_level, estimated_pomodoros, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, values.title, values.description ?? null, category, values.due_date ?? null, values.priority_level ?? 'medium',
        values.estimated_pomodoros ?? 1, done ? 1 : 0, done ? new Date().toISOString() : null],
    );
    res.status(201).json({ status: 'success', message: 'Task created', data: formatTask(db.get('SELECT * FROM tasks WHERE id = ?', [id])) });
  });

  app.put('/api/tasks/:id', auth, (req, res) => {
    const id = wholeNumber(req.params.id, 1, Number.MAX_SAFE_INTEGER);
    if (id === null) return fail(res, 400, 'Valid task ID is required');
    const { values, error } = readTaskFields(req.body, { requireTitle: false });
    if (error) return fail(res, 400, error);

    // Moving a task into or out of Completed keeps its completion flag and timestamp in step.
    if (values.category !== undefined) {
      const done = values.category === 'completed';
      values.is_completed = done ? 1 : 0;
      values.completed_at = done ? new Date().toISOString() : null;
    }
    const fields = Object.keys(values);
    if (fields.length === 0) return fail(res, 400, 'Nothing to update');

    // Column names come from readTaskFields' fixed list, never from the request.
    const assignments = [...fields.map((f) => `${f} = ?`), 'updated_at = ?'].join(', ');
    const { changes } = db.run(`UPDATE tasks SET ${assignments} WHERE id = ? AND user_id = ?`,
      [...fields.map((f) => values[f]), new Date().toISOString(), id, req.userId]);
    if (changes === 0) return fail(res, 404, 'Task not found');
    res.json({ status: 'success', message: 'Task updated', data: formatTask(db.get('SELECT * FROM tasks WHERE id = ?', [id])) });
  });

  app.delete('/api/tasks/:id', auth, (req, res) => {
    const id = wholeNumber(req.params.id, 1, Number.MAX_SAFE_INTEGER);
    if (id === null) return fail(res, 400, 'Valid task ID is required');
    const { changes } = db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (changes === 0) return fail(res, 404, 'Task not found');
    res.json({ status: 'success', message: 'Task deleted' });
  });

  // ---- Pomodoro sessions ---------------------------------------------------

  app.post('/api/pomodoro', auth, (req, res) => {
    const { task_id, session_type, started_at, ended_at, completed, notes } = req.body;
    if (!SESSION_TYPES.includes(session_type)) return fail(res, 400, `session_type must be one of: ${SESSION_TYPES.join(', ')}`);
    const minutes = wholeNumber(req.body.duration_minutes, 1, 600);
    if (minutes === null) return fail(res, 400, 'duration_minutes must be a whole number from 1 to 600');
    if (typeof started_at !== 'string' || Number.isNaN(Date.parse(started_at))) return fail(res, 400, 'started_at must be a date');
    if (ended_at != null && (typeof ended_at !== 'string' || Number.isNaN(Date.parse(ended_at)))) return fail(res, 400, 'ended_at must be a date');
    if (notes != null && (typeof notes !== 'string' || notes.length > 1000)) return fail(res, 400, 'Keep notes under 1000 characters');

    let taskId = null;
    if (task_id != null && task_id !== '') {
      taskId = wholeNumber(task_id, 1, Number.MAX_SAFE_INTEGER);
      // A session can only be attached to one of the user's own tasks.
      if (taskId === null || !db.get('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.userId])) {
        return fail(res, 404, 'Task not found');
      }
    }
    const { id } = db.run(
      `INSERT INTO pomodoro_sessions (user_id, task_id, session_type, duration_minutes, started_at, ended_at, completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, taskId, session_type, minutes, started_at, ended_at ?? null, completed === false || completed === 0 ? 0 : 1, notes ?? null],
    );
    // A finished focus session counts towards its task. Done here, in one
    // statement, so two tabs finishing at once cannot lose an update; the
    // estimate grows with it rather than showing "5 / 4".
    let task = null;
    if (taskId !== null && session_type === 'work' && completed !== false && completed !== 0) {
      db.run(
        `UPDATE tasks SET completed_pomodoros = completed_pomodoros + 1,
                estimated_pomodoros = MAX(estimated_pomodoros, completed_pomodoros + 1), updated_at = ?
         WHERE id = ? AND user_id = ?`,
        [new Date().toISOString(), taskId, req.userId],
      );
      task = formatTask(db.get('SELECT * FROM tasks WHERE id = ?', [taskId]));
    }
    res.status(201).json({ status: 'success', message: 'Pomodoro session saved', session_id: id, task });
  });

  app.get('/api/pomodoro', auth, (req, res) => {
    const sessions = db.all(
      `SELECT ps.id, ps.task_id, ps.session_type, ps.duration_minutes, ps.started_at, ps.ended_at, ps.completed,
              ps.notes, ps.created_at, t.title AS task_title, t.category AS task_category
       FROM pomodoro_sessions ps LEFT JOIN tasks t ON ps.task_id = t.id
       WHERE ps.user_id = ? ORDER BY ps.started_at DESC LIMIT 200`,
      [req.userId],
    );
    const data = sessions.map((s) => ({ ...s, completed: Boolean(s.completed) }));
    res.json({ status: 'success', data, count: data.length });
  });

  // ---- The built frontend, when there is one ------------------------------
  // `npm run build` then `npm start` serves the whole app from this one port.
  const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'dist');
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use((_req, res) => fail(res, 404, 'Endpoint not found'));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return fail(res, 400, 'Request body is not valid JSON');
    if (err.type === 'entity.too.large') return fail(res, 413, 'Request body is too large');
    console.error('Error:', err);
    fail(res, 500, 'Internal server error');
  });

  return app;
}
