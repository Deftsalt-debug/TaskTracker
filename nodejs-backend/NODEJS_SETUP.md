# TaskTrackr Node backend

Express routes and an SQLite database for the task board and Pomodoro history.
This replaced the earlier PHP/MySQL setup. The old `.php` URLs are aliases to the
same Node controllers; PHP isn't needed to run them.

## Start it

Install Node.js with npm from [nodejs.org](https://nodejs.org/) or your usual
version manager. The review used Node 26.10.0 on macOS. From the project root:

```bash
cd nodejs-backend
npm install
npm start
```

There is no backend lockfile in this checkout, so these instructions use
`npm install`. `npm run dev` uses nodemon to restart after source changes.

The default port is 8080. Check [localhost:8080/health](http://localhost:8080/health):

```json
{"status":"ok","message":"TaskTrackr backend is running"}
```

Start the frontend in a separate terminal from the project root:

```bash
cd frontend
npm ci
npm start
```

Open [localhost:3000](http://localhost:3000). The frontend's Axios setup uses the
page's hostname with port 8080 and `/api`. See the [main README](../README.md)
for the full app and its limits.

## Database and configuration

The backend creates `database/tasktrackr.db` on first start. `config/database.js`
defines `users`, `tasks`, `pomodoro_sessions` and `user_preferences`; the last table
is available for future server-side preference storage.

| Variable | Default | Use |
| --- | --- | --- |
| `PORT` | 8080 | Express port |
| `CORS_ORIGIN` | `*` | Allowed request origin |
| `DB_PATH` | `database/tasktrackr.db` beside the backend | SQLite file; set before starting Node |

`DATABASE_PATH`, listed in the old guide, isn't read by the code. `DB_PATH` is read
when the database module is imported, before `dotenv.config()` runs, so pass it in
the process environment. From this folder on macOS/Linux:

```bash
DB_PATH=./database/tasktrackr-dev.db npm start
```

The selected file's parent folder must exist. [DATABASE_SETUP.md](../DATABASE_SETUP.md)
has Windows syntax and backup/restore notes. Stop the backend normally before
copying or replacing its database.

## Routes and checks

The API is under `/api/auth`, `/api/tasks` and `/api/pomodoro`.
[API_REFERENCE.md](../API_REFERENCE.md) lists the request/response bodies and aliases.

```bash
npm test
```

The controller tests use the real SQLite engine with `DB_PATH=:memory:`. The review
passed 13 backend tests without changing the saved task database.

Passwords use bcryptjs, queries use parameters and SQLite enables foreign keys.
Login does not issue a verified session, and routes don't check record ownership.
Changing CORS or `NODE_ENV` does not add those checks; this remains a local workshop
app until user authorization is implemented.

## If something fails

- Check the backend terminal and the frontend browser console first.
- If a port is busy, stop the other server normally or choose a free port. A
  changed backend port also needs a matching frontend API URL.
- If SQLite can't open the file, check its path and directory permissions. Keep a
  backup before replacing a database; don't delete saved tasks to troubleshoot a
  dependency error.
- For native dependency build errors, see [PREREQUISITES.md](../PREREQUISITES.md).

For a phone on the same local network, use the computer's LAN address with port
3000 for the frontend and 8080 for the API. Both servers must be reachable from
that device. This doesn't turn the app into a public hosting setup.
