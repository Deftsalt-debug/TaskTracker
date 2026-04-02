# Prerequisites & Setup Guide

> Covers two projects you'll need during the workshop:
> - **TaskTrackr** — Full-stack app (React + Node.js/Express + SQLite)
> - **workshop-demo** — React demo project used during teaching

---

## What You Need to Install

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| **Node.js** | 16 or higher | `node -v` |
| **npm** | Comes with Node | `npm -v` |
| **Git** | Any recent version | `git --version` |
| **Google Chrome** | Latest | Recommended browser |

---

## 1. Install Node.js

### Windows
1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version
3. Run the installer — keep all defaults, make sure **"Add to PATH"** is checked
4. Open a new Command Prompt and verify:
   ```
   node -v
   npm -v
   ```

### macOS
```bash
# Option A — download installer
# Go to https://nodejs.org and download the LTS .pkg

# Option B — Homebrew
brew install node
node -v && npm -v
```

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v
```

---

## 2. Install Git

### Windows
1. Download from [https://git-scm.com](https://git-scm.com)
2. Run installer — keep all defaults
3. Verify: `git --version`

### macOS
```bash
# Usually pre-installed. If not:
brew install git
```

### Linux
```bash
sudo apt-get install git    # Debian/Ubuntu
sudo dnf install git        # Fedora
```

---

## 3. Clone the Repositories

```bash
# TaskTrackr
git clone https://github.com/Anshul-0211/TaskTrackr_Rect_WS.git

# Workshop Demo
git clone https://github.com/Legion-Corpse/workshop-demo.git
```

---

## 4. Run TaskTrackr

> **You need TWO terminals open at the same time** — one for the backend, one for the frontend. Do not close either.

### Terminal 1 — Backend

```bash
cd TaskTrackr_Rect_WS/nodejs-backend
npm install
npm start
```

Expected output:
```
Server running on http://localhost:8080
Database connected.
```

> No `.env` file needed — the backend works out of the box with defaults.

---

### Terminal 2 — Frontend

Open a **new, separate terminal**:

```bash
cd TaskTrackr_Rect_WS/frontend
npm install
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

The app will open in your browser automatically. If not, go to [http://localhost:3000](http://localhost:3000).

---

### Port Conflict?

If you see `EADDRINUSE` or "port already in use":

**Windows (run Command Prompt as Administrator):**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_FROM_ABOVE> /F

netstat -ano | findstr :8080
taskkill /PID <PID_FROM_ABOVE> /F
```

**macOS / Linux:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

---

## 5. Run the Workshop Demo

```bash
cd workshop-demo
npm install
npm run dev
```

Expected output:
```
  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in Chrome.

---

## Quick Reference

| Project | Directory | Start Command | URL |
|---------|-----------|---------------|-----|
| TaskTrackr Backend | `nodejs-backend/` | `npm start` | http://localhost:8080 |
| TaskTrackr Frontend | `frontend/` | `npm start` | http://localhost:3000 |
| Workshop Demo | `workshop-demo/` | `npm run dev` | http://localhost:5173 |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `node: command not found` | Node not installed or not in PATH — reinstall, then open a fresh terminal |
| `npm install` fails with EACCES (Mac/Linux) | Don't use `sudo npm install` — use nvm to manage Node instead |
| Frontend can't connect to backend | Start the backend first and confirm it's running on :8080 |
| SQLite error on first run | Normal — the database file is created automatically on first start |
| Workshop demo shows blank page | Check browser console; verify the import in `src/App.jsx` is correct |
