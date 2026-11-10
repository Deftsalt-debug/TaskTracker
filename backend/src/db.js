import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * SQLite through Node's built-in driver, so there is no native module to
 * compile on install. The schema is created on first run; there is nothing to
 * set up by hand.
 */

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'upcoming' CHECK (category IN ('upcoming', 'in_progress', 'priority', 'completed')),
    due_date DATE,
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
    estimated_pomodoros INTEGER DEFAULT 3,
    completed_pomodoros INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_id INTEGER,
    session_type TEXT DEFAULT 'work' CHECK (session_type IN ('work', 'short_break', 'long_break')),
    duration_minutes INTEGER NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    completed BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_id ON pomodoro_sessions(task_id);
`;

export const DEFAULT_DB_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'tasktrackr.db');

/**
 * Open (and if needed create) a database.
 * @param {string} file A path, or ':memory:' for a throwaway database in tests.
 */
export function openDatabase(file = process.env.DATABASE_PATH || DEFAULT_DB_PATH) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new DatabaseSync(file);
  sqlite.exec(SCHEMA);

  return {
    /** Run a statement that changes rows; returns the new row id and the number of rows changed. */
    run(sql, params = []) {
      const result = sqlite.prepare(sql).run(...params);
      return { id: Number(result.lastInsertRowid), changes: Number(result.changes) };
    },
    /** First matching row, or undefined. */
    get(sql, params = []) {
      return sqlite.prepare(sql).get(...params);
    },
    /** Every matching row. */
    all(sql, params = []) {
      return sqlite.prepare(sql).all(...params);
    },
    close() {
      sqlite.close();
    },
  };
}
