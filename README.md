# 📋 TaskTrackr — Full-Stack Task Management Application

> A beautiful, feature-rich productivity app combining Kanban boards with Pomodoro technique for maximum focus and organization. Built with React 18, Node.js/Express, and SQLite for seamless task management and time tracking.

![TaskTrackr](https://img.shields.io/badge/React-18.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-16+-green) ![Express](https://img.shields.io/badge/Express-4.18-lightgrey) ![SQLite](https://img.shields.io/badge/SQLite-3-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![License](https://img.shields.io/badge/License-Educational-green)

---

## 🎬 Project Preview

### Dashboard & Kanban Board
![TaskTrackr Dashboard](./Kanban.png)

### Pomodoro Timer Interface
![Pomodoro Timer](./Pomodoro_timer.png)

### Mobile Responsive Design
![Mobile View](./Mobile_UI.png)

---

## ✨ Features

### 🎯 Core Functionality
- **📋 Kanban Board** - Visual task management with 4 columns (Priority, Upcoming, In Progress, Completed)
- **🍅 Pomodoro Timer** - Built-in focus timer with customizable work/break intervals (25 min default)
- **✨ Drag & Drop** - Smooth task movement between categories using @dnd-kit library
- **📊 Real-Time Analytics** - Live dashboard with completion rates and statistics
- **🔐 Secure Authentication** - User registration and login with bcryptjs password hashing
- **⚡ Instant Updates** - No page refresh needed, real-time task state synchronization

### 🎨 Design & UX
- **Custom Color Palette** - Eye-comfort optimized sage and olive theme
- **🌈 Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **📱 Responsive Design** - Works seamlessly on desktop (1440px+), tablet (768px+), and mobile (320px+)
- **🎯 Category-Specific Styling** - Each task category has unique colors for easy identification
- **✅ Inline Confirmations** - No jarring popups, smooth inline delete confirmations
- **🎭 Visual Feedback** - Hover effects, loading spinners, and success/error toasts

### 🚀 Advanced Features
- **💾 Task Persistence** - No refresh needed for any CRUD operations (Create, Read, Update, Delete)
- **⏱️ Timer Persistence** - Pomodoro timer continues even when navigating between pages
- **📱 Network Access** - Auto-detects IP for seamless mobile device access on same WiFi
- **📈 Pomodoro Progress** - Visual progress bars and counters showing time invested per task
- **🎯 Smart Task Selector** - Dropdown shows favorite tasks with scroll for more
- **🔄 Category Auto-Transitions** - Tasks auto-set to "completed" with timestamp when moved to Completed column

---

## 🛠️ Tech Stack

### Frontend Architecture
| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|-----------|
| **React** | 18.0+ | UI framework with hooks | Modern component-based architecture, excellent ecosystem |
| **Tailwind CSS** | 3.3+ | Utility-first styling | Rapid UI development, consistent design system |
| **Framer Motion** | 10.16+ | Smooth animations | Professional micro-interactions, easy implementation |
| **@dnd-kit** | 7.0+ | Drag & drop functionality | Lightweight, accessible, framework-agnostic |
| **React Router v6** | 6.14+ | Client-side routing | Dynamic page navigation, nested routes support |
| **Axios** | 1.4+ | HTTP client | Promise-based, interceptor support for auth tokens |
| **React Hot Toast** | 2.4+ | Notifications | Beautiful, accessible toast notifications |
| **React Icons** | 4.10+ | Icon library | Consistent, lightweight icon set |

### Backend Architecture
| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|-----------|
| **Node.js** | 16-20 | Runtime environment | Fast, non-blocking I/O, vast npm ecosystem |
| **Express.js** | 4.18+ | REST API framework | Minimal, flexible, industry-standard framework |
| **SQLite 3** | 3+ | Database (file-based) | No server needed, perfect for development/small projects |
| **bcryptjs** | 2.4+ | Password hashing | Secure password handling with salt rounds |
| **CORS** | 2.8+ | Cross-origin requests | Allows frontend (port 3000) to communicate with backend (port 8080) |
| **dotenv** | 16+ | Environment variables | Secure config management without exposing secrets |

### Development Tools
| Tool | Purpose |
|------|---------|
| **npm/yarn** | Dependency management |
| **Git** | Version control |
| **VS Code** | Code editor |
| **Browser DevTools** | Debugging & performance |



## 🔌 API Endpoints Reference

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| `POST` | `/auth/register` | Register new user | `{name, email, password}` |
| `POST` | `/auth/login` | Login user | `{email, password}` |

**Register Response:**
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

**Login Response:**
```json
{
  "status": "success",
  "message": "User logged in",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Task Management Endpoints

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|------------|
| `GET` | `/tasks?user_id=1` | Fetch all user tasks | `user_id` (query) |
| `POST` | `/tasks` | Create new task | JSON body |
| `PUT` | `/tasks/:id` | Update task | `id` (URL), JSON body |
| `DELETE` | `/tasks/:id` | Delete task | `id` (URL) |

**Create Task - Request:**
```json
{
  "user_id": 1,
  "title": "Complete project",
  "description": "Finish the task management app",
  "category": "in_progress",
  "due_date": "2026-04-01",
  "priority_level": "high",
  "estimated_pomodoros": 5
}
```

**Create Task - Response (201 Created):**
```json
{
  "status": "success",
  "message": "Task created",
  "data": {
    "id": 15
  }
}
```

**Update Task - Request:**
```json
{
  "title": "Updated title",
  "category": "completed",
  "priority_level": "medium"
}
```

**Get Tasks - Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Task 1",
      "description": "Details",
      "category": "upcoming",
      "priority_level": "high",
      "estimated_pomodoros": 3,
      "completed_pomodoros": 1,
      "is_completed": false,
      "due_date": "2026-04-01",
      "created_at": "2026-03-23T10:00:00Z",
      "updated_at": "2026-03-23T10:00:00Z"
    }
  ]
}
```

---

### Pomodoro Endpoints

| Method | Endpoint | Purpose | Description |
|--------|----------|---------|-------------|
| `POST` | `/pomodoro` | Save session | Create pomodoro session record |
| `GET` | `/pomodoro?user_id=1` | Get history | Retrieve all user sessions |

**Save Session - Request:**
```json
{
  "user_id": 1,
  "task_id": 5,
  "session_type": "work",
  "duration_minutes": 25,
  "started_at": "2026-03-23T10:00:00Z",
  "ended_at": "2026-03-23T10:25:00Z",
  "completed": 1,
  "notes": "Focused session"
}
```

**Get History - Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "task_id": 5,
      "task_title": "Complete project",
      "session_type": "work",
      "duration_minutes": 25,
      "started_at": "2026-03-23T10:00:00Z",
      "ended_at": "2026-03-23T10:25:00Z",
      "completed": 1,
      "notes": "Focused session",
      "created_at": "2026-03-23T10:25:00Z"
    }
  ]
}
```

---

### Error Responses

**Invalid Request (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Valid Task ID is required"
}
```

**Unauthorized (401):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

**Not Found (404):**
```json
{
  "status": "error",
  "message": "Task not found"
}
```

**Server Error (500):**
```json
{
  "status": "error",
  "message": "Failed to create task"
}
```

---

## 🎨 Color Palette

### Task Categories

| Category | Background | Primary Text | Secondary Text | Description |
|----------|-----------|--------------|----------------|-------------|
| **Priority** | `#B0724A` (Warm Terracotta) | `#1D1B19` | `#3E3B39` | Dark text for readability |
| **Upcoming** | `#A4B3A4` (Keep Same) | `#1F2720` | `#38433A` | Dark charcoal green |
| **In Progress** | `#92A763` (Softened Fern Green) | `#1F261E` | `#2E342A` | Dark fern green |
| **Completed** | `#708B4A` (Muted Olive) | `#5F6F3` | `#E0E4DA` | Off-white text |

### UI Elements

| Element | Color | Hex Code |
|---------|-------|----------|
| Background | Sage Mist | `#C8D1CC` |
| Navbar/Footer | Gunmetal Grey | `#4B4F55` |
| Buttons | Completed | `#556b2f` |
| Hover | In Progress | `#708238` |
| Focus Ring | Completed | `#556b2f` |

---


## 🎓 Learning Outcomes & Architecture

### What I've Learnt

This project demonstrates proficiency in:

- ✅ **Full-Stack Development** - React frontend with Node.js/Express backend
- ✅ **Component Architecture** - Reusable, maintainable React components with hooks
- ✅ **State Management** - Complex React state with callbacks and props
- ✅ **Drag & Drop** - Implementing @dnd-kit for smooth task movements
- ✅ **Animations** - Advanced Framer Motion transitions and micro-interactions
- ✅ **Responsive Design** - Mobile-first CSS with Tailwind (supports 320px-2560px+)
- ✅ **RESTful APIs** - Proper CRUD operations with HTTP methods
- ✅ **Database Design** - Normalized SQLite schema with relationships
- ✅ **Authentication** - Secure password hashing with bcryptjs
- ✅ **Error Handling** - Comprehensive validation and user feedback
- ✅ **Network Programming** - HTTP client setup with Axios and interceptors
- ✅ **Performance Optimization** - Rendering optimization and efficient queries


## 🚀 Future Enhancements

Potential features for version 2.0:

### Authentication & Security
- [ ] **JWT Authentication** - JWT tokens with expiration
- [ ] **Refresh Tokens** - Longer session persistence
- [ ] **Two-Factor Authentication** - Enhanced security
- [ ] **Password Recovery** - Email-based reset

### Task Management
- [ ] **Task Search & Filter** - Full-text search, filters by category/date
- [ ] **Task Tags** - Custom labels and organization
- [ ] **Subtasks** - Break down tasks into smaller steps
- [ ] **Task Dependencies** - Mark tasks that block other tasks
- [ ] **Recurring Tasks** - Daily, weekly, monthly tasks
- [ ] **Task Templates** - Reusable task blueprints

### Pomodoro Enhancements
- [ ] **Custom Profiles** - Different timer configs for different tasks
- [ ] **Sound Notifications** - Customizable alarm sounds
- [ ] **Statistics** - Daily/weekly/monthly pomodoro stats
- [ ] **Leaderboard** - Team productivity tracking

### User Experience
- [ ] **Dark Mode** - Toggle theme
- [ ] **Keyboard Shortcuts** - Speed up navigation
- [ ] **Task Notifications** - In-app and push notifications
- [ ] **Calendar View** - Visual task planning
- [ ] **Gantt Chart** - Project timeline view

### Team Features
- [ ] **Team Collaboration** - Share projects and tasks
- [ ] **Comments & @Mentions** - Task discussion
- [ ] **Permissions** - Role-based access control
- [ ] **Activity Log** - See who changed what and when

### Data & Export
- [ ] **Export Data** - CSV, PDF, JSON formats
- [ ] **Import Tasks** - Bulk import from files
- [ ] **Cloud Sync** - Sync across devices
- [ ] **Backup & Restore** - Automated backups

### Infrastructure
- [ ] **Progressive Web App** - Install as native app
- [ ] **Offline Support** - Work without internet
- [ ] **Native Mobile Apps** - iOS & Android apps
- [ ] **Database Migration** - PostgreSQL/MySQL support

---


---

## 📄 License

This project is created for **educational purposes** as part of 2nd Semester Web Technologies workshop.

---


---

## 🎉 Getting Started

Ready to use TaskTrackr? Follow these quick steps:

1. **Clone the repository**
2. **Install dependencies** (frontend & backend)
3. **Start the backend** (`npm start` in `nodejs-backend`)
4. **Start the frontend** (`npm start` in `frontend`)
5. **Register an account** and start tracking tasks!

**Happy task tracking! 🚀**

---

**Built with ❤️ and ☕ for Web Technologies Mini Project**

*Last Updated: April 2, 2026*
