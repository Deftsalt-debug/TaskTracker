# TaskTrackr Node.js Backend Setup Guide

> Complete migration from PHP/MySQL to Node.js/SQLite

## 📋 Overview

This guide walks you through setting up the new Node.js + SQLite backend for TaskTrackr. The new backend maintains complete API compatibility with the original PHP backend.

## ✅ Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional)

> ⚠️ **Important**: XAMPP, PHP, and MySQL are NO LONGER needed!

## 🚀 Installation Steps

### Step 1: Navigate to Backend Directory

```bash
cd nodejs-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `sqlite3` - SQLite database driver
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `nodemon` - Development auto-reload (optional)

### Step 3: Start the Backend Server

**For development (with auto-reload):**
```bash
npm run dev
```

**For production:**
```bash
npm start
```

The backend will start on **http://localhost:8080**

You should see:
```
🚀 TaskTrackr backend running on http://localhost:8080
📝 API base URL: http://localhost:8080/api
Connected to SQLite database at: ./database/tasktrackr.db
Database schema initialized successfully
```

### Step 4: Verify Backend is Running

Open your browser and visit:
- **Health check**: http://localhost:8080/health
- Should return: `{"status":"ok","message":"TaskTrackr backend is running"}`

### Step 5: Frontend Configuration

The frontend is already configured to use the new backend!

**Verify in** `frontend/src/api/axiosInstance.js`:
```javascript
return 'http://localhost:8080/api';  // Updated from /backend/api
```

### Step 6: Start Frontend

```bash
cd frontend
npm install  # if not already done
npm start
```

Access the app at: **http://localhost:3000**

## 🗄️ Database

### Database Location
```
nodejs-backend/database/tasktrackr.db
```

The SQLite database is automatically created on first run.

### Database Tables

The following tables are automatically created:

1. **users** - User accounts and authentication
2. **tasks** - Task management with categories
3. **pomodoro_sessions** - Pomodoro timer history
4. **user_preferences** - User settings (for future features)

### Backup Your Data

To backup the database:
```bash
# Copy the database file
cp nodejs-backend/database/tasktrackr.db nodejs-backend/database/tasktrackr.db.backup
```

To restore:
```bash
cp nodejs-backend/database/tasktrackr.db.backup nodejs-backend/database/tasktrackr.db
```

## 📡 API Endpoints

All endpoints are now under `/api/` prefix.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |

**Backward compatibility** (old PHP paths still work):
- `POST /api/auth/register.php`
- `POST /api/auth/login.php`

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks?user_id={id}` | Get user's tasks |
| `POST` | `/api/tasks` | Create new task |
| `PUT` | `/api/tasks/{id}` | Update task |
| `DELETE` | `/api/tasks/{id}` | Delete task |

**Backward compatibility (old PHP paths still work):
- `GET /api/tasks/get_tasks.php?user_id={id}`
- `POST /api/tasks/create_task.php`
- `PUT /api/tasks/update_task.php`
- `DELETE /api/tasks/delete_task.php`

### Pomodoro

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pomodoro` | Save pomodoro session |
| `GET` | `/api/pomodoro?user_id={id}` | Get pomodoro history |

**Backward compatibility (old PHP paths still work):
- `POST /api/pomodoro/save.php`
- `GET /api/pomodoro/history.php?user_id={id}`

## 🔧 Configuration

### .env File

Located at `nodejs-backend/.env`:

```env
NODE_ENV=development
PORT=8080
DATABASE_PATH=./database/tasktrackr.db
CORS_ORIGIN=*
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (development/production) |
| `PORT` | `8080` | Server port (same as old backend!) |
| `DATABASE_PATH` | `./database/tasktrackr.db` | SQLite database location |
| `CORS_ORIGIN` | `*` | CORS allowed origins (set to frontend URL in production) |

## 📱 Mobile Access

To access from your phone on the same WiFi:

1. **Find your computer's IP:**
   ```bash
   # Windows
   ipconfig
   
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Access from phone:**
   - Frontend: `http://192.168.1.100:3000`
   - Backend health check: `http://192.168.1.100:8080/health`

3. **Troubleshooting:**
   - Both devices must be on same WiFi
   - Check Windows Firewall if requests fail
   - Verify backend is running on port 8080

## 🐛 Troubleshooting

### Error: Port 8080 already in use

Check if another process is using port 8080:
```bash
# Windows
netstat -ano | findstr :8080

# Kill the process (replace PID with the process ID)
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```env
PORT=8081
```

Then update frontend to use the new port.

### Error: CORS issues

Database is being created but frontend can't reach backend:

1. **Check CORS_ORIGIN in .env:**
   ```env
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Restart backend:**
   ```bash
   npm start
   ```

### Error: Database file corrupted

If you see database errors:

1. **Backup your data:**
   ```bash
   cp database/tasktrackr.db database/tasktrackr.db.corrupted
   ```

2. **Delete and restart:**
   ```bash
   rm database/tasktrackr.db
   npm start  # New database will be created
   ```

### Frontend shows network errors

1. **Verify backend is running:**
   - Check console output in backend terminal
   - Visit http://localhost:8080/health in browser

2. **Check axios baseURL:**
   - Open `frontend/src/api/axiosInstance.js`
   - Should show: `http://localhost:8080/api`

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for CORS errors or network tab

## 🎯 Differences from PHP Backend

| Aspect | PHP Backend | Node.js Backend |
|--------|------------|-----------------|
| **Language** | PHP 8.0+ | Node.js 16+ |
| **Database** | MySQL 8.0+ | SQLite 3 |
| **Port** | 8080 | 8080 ✅ Same! |
| **API Format** | PHP files (`.php`) | RESTful endpoints |
| **Password Hashing** | `password_hash()` | bcryptjs |
| **Admin Panel** | phpMyAdmin | Direct file-based |
| **Performance** | Good | Better (async/await) |
| **Deployment** | Requires server with PHP | Single Node.js process |

### API Response Format (SAME)

Both backends return identical JSON format:

```json
{
  "status": "success",
  "message": "...",
  "data": {...}
}
```

### Boolean Fields

SQLite stores booleans as 0/1, but we automatically convert them to `true/false` in responses.

## 🚀 Deployment (Optional)

To deploy Node.js backend to production:

### Option 1: Heroku (Easiest)

1. **Create Heroku account:** https://heroku.com
2. **Install Heroku CLI**
3. **Deploy:**
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Option 2: Traditional Server

1. **SSH into server**
2. **Install Node.js**
3. **Copy backend files**
4. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "tasktrackr-backend"
   pm2 save
   ```
5. **Configure nginx/Apache as reverse proxy**

## 📊 Performance Notes

The Node.js backend with SQLite provides:
- ✅ Faster response times (async/await)
- ✅ Better concurrency handling
- ✅ Built-in compression
- ✅ Connection pooling
- ✅ Automatic query optimization via indexes

## 🔐 Security Notes

- ✅ Passwords hashed with bcryptjs (same strength as PHP)
- ✅ CORS enabled for cross-origin requests
- ✅ SQL injection prevention (parameterized queries)
- ✅ Foreign key constraints enabled
- ✅ Data validation on all endpoints

> **For production**, update `.env`:
> ```env
> NODE_ENV=production
> CORS_ORIGIN=https://yourdomain.com
> ```

## 📚 Project Structure

```
nodejs-backend/
├── config/
│   └── database.js          # SQLite setup & schema
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── tasksController.js   # Task logic
│   └── pomodoroController.js # Pomodoro logic
├── routes/
│   ├── auth.js              # Auth routes
│   ├── tasks.js             # Task routes
│   └── pomodoro.js          # Pomodoro routes
├── database/
│   └── tasktrackr.db        # SQLite database (created automatically)
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── server.js                # Main entry point
└── NODEJS_SETUP.md          # This file
```

## 🆘 Getting Help

1. **Check logs in backend terminal** - Most errors are logged there
2. **Check browser console** - Frontend errors appear here (F12)
3. **Verify all ports are correct** - Frontend on 3000, Backend on 8080
4. **Ensure Node.js is installed** - Run `node --version`
5. **Clear npm cache** if installation fails:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## ✨ Migration Checklist

- [ ] Node.js installed and verified
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend server running (`npm start`)
- [ ] Database file created at `nodejs-backend/database/tasktrackr.db`
- [ ] Health check returns 200: `http://localhost:8080/health`
- [ ] Frontend axios updated to use `/api` (without `/backend`)
- [ ] Frontend running on port 3000
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can create/edit/delete tasks
- [ ] Pomodoro timer works and saves sessions
- [ ] Mobile access working (if needed)

## 🎉 You're All Set!

The migration is complete! All the same features from the PHP backend are now available:

✅ User authentication  
✅ Task management with Kanban board  
✅ Pomodoro timer with history  
✅ Real-time statistics  
✅ Drag & drop functionality  
✅ Mobile access  

Enjoy your new, faster Node.js backend! 🚀

---

**Questions?** Check the main [README.md](../README.md) for application usage instructions.
