# TaskTrackr API Reference - Node.js Backend

> Complete API documentation for the new Node.js/SQLite backend

## 📡 Base URL

```
http://localhost:8080/api
```

For network access:
```
http://YOUR_IP:8080/api
```

## 🔐 Authentication Endpoints

### Register User

**Endpoint:**
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "status": "error",
  "message": "Email already registered"
}
```

**Validation Rules:**
- Name: Required, non-empty
- Email: Required, unique, valid format
- Password: Required, any length (hashed with bcryptjs)

---

### Login

**Endpoint:**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

**Note:** Token is returned from user.id in frontend authentication flow.

---

## 📋 Task Endpoints

### Get All Tasks

**Endpoint:**
```
GET /api/tasks?user_id=1
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | integer | Yes | User ID to fetch tasks for |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Complete project",
      "description": "Finish the Node.js migration",
      "category": "in_progress",
      "due_date": "2024-12-25",
      "priority_level": "high",
      "estimated_pomodoros": 5,
      "completed_pomodoros": 2,
      "is_completed": false,
      "completed_at": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-16T14:20:00.000Z"
    },
    ...
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "user_id is required and must be positive"
}
```

---

### Create Task

**Endpoint:**
```
POST /api/tasks
```

**Request Body:**
```json
{
  "user_id": 1,
  "title": "Complete project",
  "description": "Finish the Node.js migration",
  "category": "upcoming",
  "due_date": "2024-12-25",
  "priority_level": "high",
  "estimated_pomodoros": 5
}
```

**Body Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `user_id` | integer | Yes | - | User ID |
| `title` | string | Yes | - | Task title |
| `description` | string | No | null | Task description |
| `category` | string | No | "upcoming" | Task category: `upcoming`, `in_progress`, `priority`, `completed` |
| `due_date` | date | No | null | Due date (YYYY-MM-DD format) |
| `priority_level` | string | No | "medium" | Priority: `low`, `medium`, `high` |
| `estimated_pomodoros` | integer | No | 1 | Estimated pomodoro sessions |

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Task created",
  "data": {
    "id": 42
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "user_id and title are required"
}
```

---

### Update Task

**Endpoint:**
```
PUT /api/tasks
```

**Request Body:** (Include task ID and fields to update)
```json
{
  "id": 1,
  "title": "Updated title",
  "category": "in_progress",
  "completed_pomodoros": 3,
  "priority_level": "medium"
}
```

**Body Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID (required) |
| `title` | string | Update task title |
| `description` | string | Update description |
| `category` | string | Update category |
| `due_date` | date | Update due date |
| `priority_level` | string | Update priority |
| `estimated_pomodoros` | integer | Update estimated pomodoros |
| `completed_pomodoros` | integer | Update completed pomodoros |
| `is_completed` | boolean | Mark as completed |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Task updated successfully"
}
```

**Special Behavior:**
- When `category` is set to `"completed"`, `is_completed` is automatically set to `true`
- `completed_at` timestamp is automatically set when completing a task
- `updated_at` is automatically updated on every change

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Task ID is required"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Task not found"
}
```

---

### Delete Task

**Endpoint:**
```
DELETE /api/tasks/1
```

or

```
DELETE /api/tasks?id=1
```

**Path/Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Task ID to delete |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Task deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Task not found"
}
```

---

## 🍅 Pomodoro Endpoints

### Save Pomodoro Session

**Endpoint:**
```
POST /api/pomodoro
```

**Request Body:**
```json
{
  "user_id": 1,
  "task_id": 5,
  "session_type": "work",
  "duration_minutes": 25,
  "started_at": "2024-01-15T10:30:00Z",
  "ended_at": "2024-01-15T10:55:00Z",
  "completed": true,
  "notes": "Made good progress on project setup"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | integer | Yes | User ID |
| `task_id` | integer | No | Associated task ID |
| `session_type` | string | Yes | `work`, `short_break`, or `long_break` |
| `duration_minutes` | integer | Yes | Duration in minutes |
| `started_at` | datetime | Yes | Session start time (ISO 8601 format) |
| `ended_at` | datetime | No | Session end time |
| `completed` | boolean | No | Whether session was completed |
| `notes` | string | No | Session notes |

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Pomodoro session saved successfully",
  "session_id": 123
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Missing required fields: user_id, session_type, duration_minutes, started_at"
}
```

---

### Get Pomodoro History

**Endpoint:**
```
GET /api/pomodoro?user_id=1
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | integer | Yes | User ID to fetch history for |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "task_id": 5,
      "session_type": "work",
      "duration_minutes": 25,
      "started_at": "2024-01-15T10:30:00.000Z",
      "ended_at": "2024-01-15T10:55:00.000Z",
      "completed": true,
      "notes": "Made good progress on project setup",
      "created_at": "2024-01-15T10:55:00.000Z",
      "task_title": "Complete project",
      "task_category": "in_progress"
    },
    ...
  ],
  "count": 42
}
```

**Note:** Returns up to 100 most recent sessions, ordered by start time (newest first).

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "user_id is required and must be positive"
}
```

---

## 🔄 Backward Compatibility

All old PHP endpoints still work! Both formats are supported:

### Old PHP Format (Still Works!)
```javascript
POST /api/auth/login.php
POST /api/auth/register.php
GET /api/tasks/get_tasks.php?user_id=1
POST /api/tasks/create_task.php
PUT /api/tasks/update_task.php
DELETE /api/tasks/delete_task.php?id=1
POST /api/pomodoro/save.php
GET /api/pomodoro/history.php?user_id=1
```

### New RESTful Format (Recommended)
```javascript
POST /api/auth/login
POST /api/auth/register
GET /api/tasks?user_id=1
POST /api/tasks
PUT /api/tasks/1
DELETE /api/tasks/1
POST /api/pomodoro
GET /api/pomodoro?user_id=1
```

Both work identically! The frontend automatically uses the correct format.

---

## 📊 Task Categories

Valid categories for tasks:
```javascript
"upcoming"      // Default for new tasks
"in_progress"   // Currently working on
"priority"      // High priority items
"completed"     // Finished tasks
```

---

## 📈 Priority Levels

Valid priority levels:
```javascript
"low"      // Low priority
"medium"   // Medium priority (default)
"high"     // High priority
```

---

## 🍅 Session Types

Valid pomodoro session types:
```javascript
"work"          // Work session (25 min default)
"short_break"   // Short break (5 min default)
"long_break"    // Long break (15 min default)
```

---

## 🔒 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Invalid credentials or missing auth |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already registered (registration only) |
| 500 | Server Error | Internal server error |

---

## 🔐 Security Features

✅ **SQL Injection Prevention:** All queries use parameterized statements  
✅ **Password Security:** Passwords hashed with bcryptjs  
✅ **CORS Enabled:** Cross-origin requests allowed (configurable)  
✅ **Data Validation:** All inputs validated before processing  
✅ **Foreign Key Constraints:** Database integrity enforced  

---

## 🧪 Example cURL Requests

### Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "SecurePass123!"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Complete project",
    "category": "in_progress",
    "priority_level": "high",
    "estimated_pomodoros": 5
  }'
```

### Get Tasks

```bash
curl "http://localhost:8080/api/tasks?user_id=1"
```

### Update Task

```bash
curl -X PUT http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "category": "completed"
  }'
```

### Delete Task

```bash
curl -X DELETE "http://localhost:8080/api/tasks/1"
```

---

## 📚 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'upcoming',
  due_date DATE,
  priority_level TEXT DEFAULT 'medium',
  estimated_pomodoros INTEGER DEFAULT 3,
  completed_pomodoros INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Pomodoro Sessions Table
```sql
CREATE TABLE pomodoro_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  task_id INTEGER,
  session_type TEXT DEFAULT 'work',
  duration_minutes INTEGER NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME,
  completed BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## 🚀 Performance Optimizations

- ✅ **Indexes:** Created on user_id, category, task_id for fast queries
- ✅ **Async/await:** Non-blocking database operations
- ✅ **Connection pooling:** Persistent database connection
- ✅ **Query optimization:** Only fetch required fields
- ✅ **Limit on history:** Pomodoro history limited to recent 100 sessions

---

**For more information, see:**
- [NODEJS_SETUP.md](../nodejs-backend/NODEJS_SETUP.md) - Installation guide
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Technical migration details
- [README.md](../README.md) - Application usage guide
