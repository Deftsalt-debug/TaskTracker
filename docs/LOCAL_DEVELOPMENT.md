# Local development

Use Node.js 22.13 or newer, including its built-in SQLite support.

```bash
npm run setup
npm run dev
```

The root setup command installs the backend and frontend lockfiles separately. Keep both lockfiles.
Development starts Express on `http://localhost:8080` and Vite on `http://localhost:5173`; Vite forwards `/api` to the backend.
For a phone on the same Wi-Fi, run the backend and `npm run dev --prefix frontend -- --host` in separate terminals.

## Single-server build

```bash
npm run build
npm start
```

Open `http://localhost:8080`. The API serves the frontend build as well as its own routes.
Before setting `NODE_ENV=production`, configure a stable random `SESSION_SECRET` of at least 32 characters through the host's private environment settings.
Never place secrets in frontend `VITE_*` values, a committed file or an issue.

## Backend configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | API/listening port |
| `SESSION_SECRET` | Random at startup in development | Signs tokens; required in production |
| `DATABASE_PATH` | `backend/data/tasktrackr.db` | SQLite path; use persistent storage for durable records |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated permitted browser origins |

`VITE_API_TARGET` optionally changes the development proxy target; the default is `http://localhost:8080`.
The backend reads process environment variables; no automatic `.env` loader is configured.

## Verification

`npm test` runs API tests against an in-memory database and pure frontend timer/date tests.
`npm run verify` adds the production build. CI runs this on pushes and pull requests.
Lint and static type checking are not configured; adding development tooling remains a separate decision.
Run `npm audit --prefix backend` and `npm audit --prefix frontend` to inspect current advisories without modifying packages.
Avoid `npm audit fix --force` as routine cleanup: it can change behavior and requires separate review.

## Common limits

A browser token becomes invalid after a development-server restart unless a stable secret was configured.
Check that the backend is running before diagnosing frontend API errors. `GET /health` needs no token.
Deleting a local SQLite file deletes its records; back it up before any intentional reset.
Demo accounts and real accounts share the same backend and storage lifecycle. Do not promise durable hosted storage on an ephemeral filesystem.
