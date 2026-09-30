# 📋 TaskTrackr

A task board with a Pomodoro timer, built with React, Express and SQLite. Move tasks
between Priority, Upcoming, In Progress and Completed, then pick one to work on in
the timer. The sage and olive colours are part of the app's look.

This started as a Web Technologies workshop project. It covers React state, drag
and drop, API calls and a small database, with a few improvements added since then.

## Run it locally

You need Node.js and npm. The current review ran the tests and builds on Node
26.10.0. SQLite comes through the backend's npm dependencies; you don't need MySQL,
XAMPP or phpMyAdmin.

From the project folder, start the backend in one terminal:

```bash
cd nodejs-backend
npm install
npm start
```

Start the frontend in a second terminal, also from the project folder:

```bash
cd frontend
npm ci
npm start
```

Open [localhost:3000](http://localhost:3000), register an account and log in. The API
runs at [localhost:8080/api](http://localhost:8080/api); its health check is
[localhost:8080/health](http://localhost:8080/health).

The backend creates `nodejs-backend/database/tasktrackr.db` and its tables on first
start. See [database setup](DATABASE_SETUP.md) for the file location and backups,
or [prerequisites](PREREQUISITES.md) if installation fails.

## What's here

- A four-column board with draggable tasks and search by title or description.
- Task details, due dates, priority levels and estimated/completed Pomodoros.
- A timer with adjustable work, short-break and long-break durations. The defaults
  are 25, 5 and 15 minutes; every fourth completed work session selects a long break.
- Saved timer state in the browser. Reloading accounts for time away; pausing and
  resuming keep one session rather than creating a new history row each time.
- SQLite history for completed and interrupted sessions. Interrupted sessions
  record the time actually spent, and failed saves show an error.
- Task completion flags and timestamps that follow moves into and out of Completed.
- Framer Motion animations, toast messages and a layout that adapts to screen size.

The register/login flow hashes passwords with bcryptjs, but the API does not yet
check whether the caller owns a task or session. Keep it as a local workshop app
until that is addressed. Login does not issue a verified session or JWT.

## Project layout

```text
frontend/        React 18, React Router, Tailwind, @dnd-kit and Axios
nodejs-backend/  Express routes, controllers and SQLite setup
  tests/         Controller and session-history regressions
  database/      The generated SQLite file
database/       Earlier SQL schema files, kept for reference
```

The root `database/` folder is reference material. The running Node backend defines
its SQLite schema in `nodejs-backend/config/database.js`.

## API

The main routes are:

| Method | Path | Use |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a user |
| POST | `/api/auth/login` | Check login details |
| GET / POST | `/api/tasks` | Fetch a user's tasks / create a task |
| PUT / DELETE | `/api/tasks/:id` | Update / delete a task |
| POST | `/api/pomodoro` | Save a session |
| GET | `/api/pomodoro?user_id=1` | Read the latest 100 sessions for that user |

See [API_REFERENCE.md](API_REFERENCE.md) for request bodies, responses and the
older `.php` route aliases. Those aliases still call the Node controllers.

## Checks

From `nodejs-backend/`:

```bash
npm test
```

From `frontend/`:

```bash
npm test -- --watchAll=false --runInBand
npm run build
```

The review passed 13 backend tests and nine frontend timer tests, plus the frontend
build. That covers the regressions in [CHANGELOG.md](CHANGELOG.md), including timer
reloads, pause/resume and saved history. It doesn't replace trying drag and drop
and the full login-to-history flow in a browser.

## Things still to work on

User authorization is the main gap before public multi-user hosting. Other possible
additions are task tags, subtasks, a calendar view, keyboard shortcuts and export.
Search is already implemented; broader date/category filters would be a separate
addition. These are ideas, not a promised release plan.

## Educational use

Created for the 2nd Semester Web Technologies workshop / mini project. The existing
project describes its use as educational; it does not include a separate licence
file.
