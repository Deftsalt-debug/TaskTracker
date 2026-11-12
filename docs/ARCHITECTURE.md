# Architecture

TaskTrackr is a React frontend and an Express API backed by one local SQLite file.
The root package orchestrates two separate packages; each package's lockfile is required by `npm run setup`.

| Module | Responsibility |
| --- | --- |
| `backend/src/app.js` | Routes, validation and API responses |
| `backend/src/auth.js` | Signed tokens, password/session handling and rate limits |
| `backend/src/db.js` | SQLite schema and database connection |
| `backend/src/demo.js` | Synthetic demo workspace |
| `frontend/src/pages/` | Tasks, focus, history and authentication pages |
| `frontend/src/timer/engine.js` | Pure timer transitions and deadline arithmetic |
| `frontend/src/timer/TimerContext.jsx` | App-wide timer state and persistence |
| `scripts/dev.mjs` | Starts and stops frontend/backend development processes |

## Data and authentication

Passwords are hashed with bcrypt. Sign-in returns a seven-day HMAC-SHA256 token containing a user ID and expiry.
The backend derives the user from a verified token, not a user ID supplied with a task request. Task/session queries are scoped to that user.
Tokens are stored in localStorage, which is accessible to page scripts. The app has no password-recovery flow.
`SESSION_SECRET` must contain at least 32 characters in production; a random development secret invalidates existing sessions on restart.
SQLite storage is local; ephemeral hosts lose it. A demo workspace creates synthetic records, not a separate read-only frontend mode.

## Timer and serving

The timer records deadlines rather than relying on interval ticks for elapsed time. State survives frontend navigation and reloads.
Completed work sessions are recorded through the API and update the associated task's count.
Vite proxies `/api` in development. After building, Express serves `frontend/dist` and the API from the same origin.
No separate static host or database service is required for this architecture.

## API reference

Base URL: `/api`. Requests and responses are JSON. Every response has a `status` of `success` or `error`; errors carry a `message`.

All routes except the three under "Accounts" that create a session need an `Authorization: Bearer <token>` header and return `401` without a valid one.

### Accounts

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/auth/register` | `name`, `email`, `password` (8–72 characters) | `201` with `data.user` and `data.token` |
| `POST` | `/auth/login` | `email`, `password` | `data.user` and `data.token` |
| `POST` | `/auth/demo` | none | `201` with a new throwaway user, sample data, and a token |
| `GET` | `/auth/me` | | `data.user` for the token |

The three session-creating POST routes share a limit of 20 requests per 15 minutes per address (`429` beyond it).

### Tasks

A task has `id`, `title`, `description`, `category` (`upcoming`, `in_progress`, `priority`, `completed`), `priority_level` (`low`, `medium`, `high`), `due_date` (`YYYY-MM-DD` or null), `estimated_pomodoros`, `completed_pomodoros`, `is_completed`, `completed_at`, `created_at`, `updated_at`.

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/tasks` | | `data`: the signed-in user's tasks, newest first |
| `POST` | `/tasks` | `title` (required) and any other editable field | `201` with the created task in `data` |
| `PUT` | `/tasks/:id` | any editable fields | the updated task in `data` |
| `DELETE` | `/tasks/:id` | | confirmation |

Setting `category` to `completed` sets `is_completed` and `completed_at`; any other category clears them. A task that belongs to someone else, or does not exist, returns `404`.

### Focus sessions

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/pomodoro` | `session_type` (`work`, `short_break`, `long_break`), `duration_minutes` (1–600), `started_at`, optional `ended_at`, `task_id`, `completed`, `notes` | `201` with `session_id`, and `task` when a task's count changed |
| `GET` | `/pomodoro` | | `data`: the 200 most recent sessions with `task_title` and `task_category`; `count` |

A completed `work` session with a `task_id` adds one to that task's `completed_pomodoros`, raising `estimated_pomodoros` if needed.

### Other

`GET /health` (no `/api` prefix, no token) returns `{ "status": "ok" }`.
