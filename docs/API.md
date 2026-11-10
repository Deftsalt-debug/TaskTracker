# API reference

Base URL: `/api`. Requests and responses are JSON. Every response has a `status` of `success` or `error`; errors carry a `message`.

All routes except the three under "Accounts" that create a session need an `Authorization: Bearer <token>` header and return `401` without a valid one.

## Accounts

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/auth/register` | `name`, `email`, `password` (8–72 characters) | `201` with `data.user` and `data.token` |
| `POST` | `/auth/login` | `email`, `password` | `data.user` and `data.token` |
| `POST` | `/auth/demo` | none | `201` with a new throwaway user, sample data, and a token |
| `GET` | `/auth/me` | | `data.user` for the token |

These routes share a limit of 20 requests per 15 minutes per address (`429` beyond it).

## Tasks

A task has `id`, `title`, `description`, `category` (`upcoming`, `in_progress`, `priority`, `completed`), `priority_level` (`low`, `medium`, `high`), `due_date` (`YYYY-MM-DD` or null), `estimated_pomodoros`, `completed_pomodoros`, `is_completed`, `completed_at`, `created_at`, `updated_at`.

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/tasks` | | `data`: the signed-in user's tasks, newest first |
| `POST` | `/tasks` | `title` (required) and any other editable field | `201` with the created task in `data` |
| `PUT` | `/tasks/:id` | any editable fields | the updated task in `data` |
| `DELETE` | `/tasks/:id` | | confirmation |

Setting `category` to `completed` sets `is_completed` and `completed_at`; any other category clears them. A task that belongs to someone else, or does not exist, returns `404`.

## Focus sessions

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/pomodoro` | `session_type` (`work`, `short_break`, `long_break`), `duration_minutes` (1–600), `started_at`, optional `ended_at`, `task_id`, `completed`, `notes` | `201` with `session_id`, and `task` when a task's count changed |
| `GET` | `/pomodoro` | | `data`: the 200 most recent sessions with `task_title` and `task_category`; `count` |

A completed `work` session with a `task_id` adds one to that task's `completed_pomodoros`, raising `estimated_pomodoros` if needed.

## Other

`GET /health` (no `/api` prefix, no token) returns `{ "status": "ok" }`.
