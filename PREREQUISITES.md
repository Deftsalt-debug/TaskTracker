# TaskTrackr setup

You need Node.js with npm and a terminal. Git is useful for cloning the project;
your choice of editor doesn't affect how it runs. The review used Node 26.10.0 on
macOS. That is the checked version, rather than a promise that every Node version
will work.

## Check the tools

Install Node from [nodejs.org](https://nodejs.org/) or your usual version manager,
then open a new terminal and check:

```bash
node --version
npm --version
```

The frontend uses Create React App (`react-scripts`), React 18 and Tailwind. The
backend uses Express and the `sqlite3` npm package. npm installs the project
libraries; there is no separate MySQL or PHP setup.

## Install and start

These commands work from the project folder on macOS, Linux or Windows. Use two
terminals so both servers can stay running.

Backend terminal:

```bash
cd nodejs-backend
npm install
npm start
```

Frontend terminal:

```bash
cd frontend
npm ci
npm start
```

Open [localhost:3000](http://localhost:3000). The backend listens on port 8080;
[its health endpoint](http://localhost:8080/health) should return JSON.

The frontend has a lockfile, so `npm ci` installs those versions. The backend
doesn't include one and uses `npm install`. Don't remove an existing lockfile just
to get past an install error; check the error and your Node version first.

## If installation fails

- **`node` or `npm` isn't found:** reopen the terminal after installation and check
  that Node is on your PATH.
- **A `sqlite3` native build fails:** it may need Python and your platform's C/C++
  build tools if a matching prebuilt binary isn't available. On macOS, these are
  the Xcode Command Line Tools; on Windows, Visual Studio C++ Build Tools; on
  Linux, a compiler and make. Install them through the normal platform tools, then
  retry `npm install` in `nodejs-backend/`.
- **Port 3000 or 8080 is busy:** stop the other server normally or use a free port.
  Changing the backend `PORT` also requires updating the frontend API URL in
  `frontend/src/api/axiosInstance.js`, which currently expects 8080.
- **The database won't open:** see [DATABASE_SETUP.md](DATABASE_SETUP.md). Its file
  and parent directory need to be writable.

## Check the project

From the backend folder, `npm test` runs the SQLite controller/history tests. From
the frontend folder, run:

```bash
npm test -- --watchAll=false --runInBand
npm run build
```

[README.md](README.md) covers the app itself and its current limits.
[API_REFERENCE.md](API_REFERENCE.md) has the routes and request examples.

## Optional tools

[Git](https://git-scm.com/) is useful for cloning and keeping changes; its
[Windows installer](https://git-scm.com/download/win) is linked here too.
[VS Code](https://code.visualstudio.com/) is one editor option
([downloads](https://code.visualstudio.com/Download)). Neither tool is required
if you already have the project folder and another editor.
