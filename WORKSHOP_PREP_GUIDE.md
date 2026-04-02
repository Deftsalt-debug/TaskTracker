# TaskTrackr React Workshop — Complete Preparation Guide

---

## The Core Philosophy (Read This First)

Before touching a single file, understand **why** we structure TODOs the way we do.

### What We Are Trying to Achieve

Participants leave the workshop with a **real, working, full-stack project** running on their laptop — connected to a live backend, not a mock. They should be able to show it to someone and say "I built this."

To get there in 3–4 hours with people who are new to React, every TODO must follow one rule:

> **A TODO is only valid if the participant can solve it using React knowledge alone — not by guessing JSX structure, looking up Tailwind classes, or copying color hex codes.**

### What a Good TODO Teaches

A good TODO targets one of these five React fundamentals:
1. `useState` — declaring and updating state
2. `useEffect` — running code when something happens (page load, prop change)
3. Props — passing data into a component and reading it
4. API calls — fetching/posting data with axios and handling the response
5. React Router — mapping URLs to components

### What a Bad TODO Looks Like

- "Fill in this color mapping object" → This is data entry, not React
- "Recreate this JSX structure" → Participants are guessing, not learning
- "Write these Tailwind class names" → This teaches CSS, not React
- A TODO with 6 sub-steps → Too much at once; participants get lost

### The Golden Rule for This Workshop

> If a participant stares at a TODO and their first instinct is "I need to look at the solution to even start" — it's a bad TODO. Every TODO should be approachable with just the hint and the concept explained in the session.

---

## What to Do With Each File

---

### BACKEND — Touch Nothing

**Files:** `server.js`, `tasks.js`, all controllers, all routes, `config/`

Do not change a single line. The backend should be deployed (Railway, Render, or any free host) before the workshop so participants never open the backend folder. They just point their frontend at a running URL.

**One thing to do:** Make sure `axiosInstance.js` in the frontend has the correct deployed backend URL hardcoded (or via `.env`) so participants just run `npm install && npm start` and everything works.

---

### `src/api/axiosInstance.js` — Touch Nothing

This file is already correct. The auto-detect hostname logic is a nice bonus to mention verbally: *"This file figures out where the backend is — you don't need to touch it."* Leave it exactly as-is.

---

### `src/App.jsx` — ADD TODOs (React Router lesson)

This is where you teach React Router. The auth listener (`useEffect`) and protected route wrapper are pre-written. Participants only write the Route declarations.

**Revert:** Delete the existing `App_TODO.jsx` if you made one.  
**Action:** Modify `App.jsx` directly with the following structure:

```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TasksPage from './pages/TasksPage';
import FocusPage from './pages/FocusPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/layout/Navbar';
import DashboardFooter from './components/layout/DashboardFooter';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // ── PRE-WRITTEN: Don't modify ──
  // This useEffect watches for login/logout events across the whole app
  // and keeps isAuthenticated in sync with localStorage
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  return (
    // TODO R1: Wrap everything in <Router>
    // React Router needs a single <Router> at the very top of your app.
    // All routing only works inside this wrapper.
    // Hint: <Router> ... your JSX ... </Router>
    <Router>
      <div className="min-h-screen bg-sageMist flex flex-col">
        <Toaster position="top-right" />

        {/* TODO R2: Add a <Routes> block */}
        {/* <Routes> looks at the current URL and renders only the matching <Route> */}
        {/* Think of it like a switch statement for URLs */}
        {/* Hint: <Routes> contains <Route> elements </Routes> */}
        <Routes>

          {/* TODO R3: Add a route for /login */}
          {/* If the user is NOT logged in → show <LoginPage /> */}
          {/* If they ARE logged in → redirect to /tasks using <Navigate to="/tasks" /> */}
          {/* Hint: <Route path="/login" element={condition ? <A /> : <B />} /> */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/tasks" />} />

          {/* TODO R4: Add a route for /register — same pattern as /login above */}
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/tasks" />} />

          {/* ── PRE-WRITTEN: Protected area — Do not modify ── */}
          {/* This catches all other URLs and checks if the user is logged in */}
          {/* If not, it redirects to /login */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Navigate to="/tasks" replace />} />

                    {/* TODO R5: Add a route for /tasks that renders <TasksPage /> */}
                    {/* Wrap TasksPage in: <div className="flex-1 px-6 py-0 overflow-y-auto"> */}
                    <Route
                      path="/tasks"
                      element={
                        <div className="flex-1 px-6 py-0 overflow-y-auto">
                          <TasksPage />
                        </div>
                      }
                    />

                    {/* ── PRE-WRITTEN: Focus and History routes ── */}
                    <Route path="/focus" element={<div className="flex-1 px-6 py-0 overflow-hidden"><FocusPage /></div>} />
                    <Route path="/history" element={<div className="flex-1 px-6 py-0 overflow-y-auto"><HistoryPage /></div>} />
                  </Routes>
                  <DashboardFooter />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

**What this teaches:**
| TODO | React Router Concept |
|------|----------------------|
| R1 | `<Router>` — the wrapper every React Router app needs |
| R2 | `<Routes>` — renders only the matching route |
| R3 | `<Route>` + conditional `element` — auth-based routing |
| R4 | `<Navigate>` — redirect to another route |
| R5 | Basic route — a URL maps to a component |

---

### `src/pages/TasksPage.jsx` — ADD TODOs (Main lesson file)

This is the heart of the workshop. Every React fundamental lives here. Participants spend the most time on this file.

**Revert:** This file has no TODO version yet — you're adding TODOs to the original.  
**Action:** Modify `TasksPage.jsx` with the following:

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskBoard from '../components/tasks/TaskBoard';
import axiosInstance from '../api/axiosInstance';

const TasksPage = () => {

  // TODO 1: Declare a state variable called 'tasks'
  // It should start as an empty array []
  // Hint: const [tasks, setTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  // TODO 2: Declare a state variable called 'loading'
  // It should start as true (we are loading when the page first opens)
  // Hint: const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // TODO 3: Call fetchTasks() when the page loads
  // useEffect runs code after the component renders
  // The empty [] means "run this only once, on first load"
  // Hint: useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // TODO 4: Fetch tasks from the API
      // Use axiosInstance to make a GET request to '/tasks?user_id={user.id}'
      // Store the result in a variable called 'response'
      // Hint: const response = await axiosInstance.get(`/tasks?user_id=${user.id}`);
      const response = await axiosInstance.get(`/tasks?user_id=${user.id}`);

      // TODO 5: Update tasks state with the fetched data
      // If response.data.status === 'success', call setTasks() with response.data.data
      if (response.data.status === 'success') {
        setTasks(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      // TODO 6: Stop the loading spinner
      // Set loading to false — this runs whether the request succeeded or failed
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    // TODO 7: Add the new task to the existing tasks array
    // You must create a NEW array — never mutate state directly
    // Hint: setTasks([...tasks, newTask]);
    // The ... is the spread operator — it copies all existing tasks, then adds newTask
    setTasks([...tasks, newTask]);
    toast.success('Task created successfully!');
  };

  const handleTaskUpdated = (updatedTask) => {
    // TODO 8: Replace the old task with the updated one
    // Use tasks.map() — if the task id matches, return updatedTask, otherwise return the original
    // Hint: setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setTasks(tasks.map(t => parseInt(t.id) === parseInt(updatedTask.id) ? updatedTask : t));
    toast.success('Task updated successfully!');
  };

  const handleTaskDeleted = (taskId) => {
    // TODO 9: Remove the deleted task from the array
    // Use tasks.filter() — keep only tasks whose id does NOT match taskId
    // Hint: setTasks(tasks.filter(t => t.id !== taskId));
    setTasks(tasks.filter(t => parseInt(t.id) !== parseInt(taskId)));
    toast.success('Task deleted successfully!');
  };

  // ── PRE-WRITTEN: Don't modify ──
  const handleTaskMoved = (taskId, newCategory) => {
    setTasks(tasks.map(t => parseInt(t.id) === parseInt(taskId) ? { ...t, category: newCategory } : t));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-completed border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onTaskMoved={handleTaskMoved}
        />
      )}
    </motion.div>
  );
};

export default TasksPage;
```

**What this teaches:**
| TODO | React Concept |
|------|---------------|
| 1–2 | `useState` — declaring state with an initial value |
| 3 | `useEffect` — running code on page load |
| 4–5 | API call with axios — `await`, handling the response |
| 6 | `finally` block — cleanup after async operations |
| 7 | Spread operator — adding to an array immutably |
| 8 | `Array.map()` — updating one item in an array |
| 9 | `Array.filter()` — removing an item from an array |

---

### `src/components/tasks/TaskBoard.jsx` — ONE TODO + explanation comment

**Revert:** Delete `TaskBoard_TODO.jsx` entirely.  
**Action:** Modify `TaskBoard.jsx` — add a header comment and one TODO only:

Add this block at the very top, just after the imports:

```jsx
// ════════════════════════════════════════════════════════════
// TaskBoard — MOSTLY PRE-WRITTEN for this workshop
//
// This component handles:
//   - Drag and drop between columns (DnD Kit)
//   - Opening the modal for creating/editing tasks
//   - Calling the delete API
//
// You only need to complete ONE TODO in this file (handleDeleteTask).
// Everything else is pre-written — read it, don't touch it.
//
// Concepts to notice as you read:
//   - Multiple useState hooks in one component
//   - How props (onTaskCreated, onTaskUpdated etc.) flow
//     from TasksPage down into this component
//   - How tasks are split into columns using .filter()
// ════════════════════════════════════════════════════════════
```

Then modify only `handleDeleteTask`:

```jsx
const handleDeleteTask = async (taskId) => {
  try {
    // TODO: Make a DELETE request to the API for this task
    // Hint: await axiosInstance.delete(`/tasks/${taskId}`);
    // Then call onTaskDeleted(taskId) to update the UI
    await axiosInstance.delete(`/tasks/${taskId}`);
    onTaskDeleted(taskId);
  } catch (error) {
    toast.error('Failed to delete task');
  }
};
```

Everything else in `TaskBoard.jsx` stays exactly as-is.

---

### `src/components/tasks/TaskCard.jsx` — NO TODOs, explanation comment only

**Revert:** Delete `TaskCard_TODO.jsx` entirely.  
**Action:** Add this comment block at the top of the original `TaskCard.jsx`, after the imports:

```jsx
// ════════════════════════════════════════════════════════════
// TaskCard — READ ONLY for this workshop
//
// This component receives one task object as a prop
// and displays it as a card.
//
// Things to notice as you read:
//   - Props: task, onEdit, onDelete, isDragging
//   - useState for the delete confirmation toggle
//   - Conditional rendering: {!isCompleted && (...)}
//   - How task.title, task.description etc. are accessed from props
//   - The useDraggable hook (from DnD Kit) — makes the card draggable
//
// You do NOT write anything here today.
// ════════════════════════════════════════════════════════════
```

---

### `src/components/tasks/TaskColumn.jsx` — NO TODOs, explanation comment only

**Revert:** Delete `TaskColumn_TODO.jsx` entirely.  
**Action:** Add this comment block at the top of the original `TaskColumn.jsx`, after the imports:

```jsx
// ════════════════════════════════════════════════════════════
// TaskColumn — READ ONLY for this workshop
//
// This component renders one column of the Kanban board.
// It receives an array of tasks and maps over them to render TaskCards.
//
// Things to notice as you read:
//   - Props: id, label, color, tasks, onAddTask, onEditTask, onDeleteTask
//   - tasks.map() — rendering a list of components from an array
//   - {tasks.length === 0 && ...} — conditional empty state
//   - useDroppable hook — makes this column a drop target
//
// You do NOT write anything here today.
// ════════════════════════════════════════════════════════════
```

---

### `src/components/tasks/TaskModal.jsx` — NO TODOs, explanation comment only

**Revert:** Delete `TaskModal_TODO.jsx` entirely.  
**Action:** Add this comment block at the top of the original `TaskModal.jsx`, after the imports:

```jsx
// ════════════════════════════════════════════════════════════
// TaskModal — READ ONLY for this workshop
//
// This is the form for creating and editing tasks.
// It is a great example of "controlled inputs" in React.
//
// Things to notice as you read:
//   - formData state — every input's value lives in state
//   - handleChange — one function updates any field using e.target.name
//   - useEffect — pre-fills the form when editing an existing task
//   - handleSubmit — POST (create) vs PUT (update) based on task.id
//
// You do NOT write anything here today.
// ════════════════════════════════════════════════════════════
```

---

## New Files to Create

### `WORKSHOP.md` — in the frontend root folder

```markdown
# TaskTrackr React Workshop

Welcome! By the end of this session you will have a working
task management app connected to a live backend.

---

## Getting Started

Run these two commands:
  npm install
  npm start

The app will open at http://localhost:3000
Register an account and log in — it's connected to a real database.

---

## Work Through Files In This Order

### Step 1 — App.jsx (React Router)
File: src/App.jsx
TODOs: R1, R2, R3, R4, R5
Concept: How React Router maps URLs to components

### Step 2 — TasksPage.jsx (Core React)
File: src/pages/TasksPage.jsx
TODOs: 1 through 9
Concept: useState, useEffect, API calls, array methods

### Step 3 — TaskBoard.jsx (API call)
File: src/components/tasks/TaskBoard.jsx
TODOs: Just one — handleDeleteTask
Concept: DELETE request with axios

---

## Files You Only Need to Read (No Writing)

- TaskCard.jsx — props, conditional rendering, useState
- TaskColumn.jsx — props, list rendering with .map()
- TaskModal.jsx — controlled inputs, form handling

Each has comments explaining what to look for.

---

## Stuck?

The src/solutions/ folder has a complete solution file for every file you are working in:
  - Stuck on App.jsx?        → open src/solutions/App.solution.jsx
  - Stuck on TasksPage.jsx?  → open src/solutions/TasksPage.solution.jsx
  - Stuck on TaskBoard.jsx?  → open src/solutions/TaskBoard.solution.jsx

Read it, understand it, then TYPE it yourself. Do not copy-paste.
The typing is where the learning happens.
```

### `src/solutions/` — one complete solution file per TODO file

For every file that has TODOs, create a matching solution file inside `src/solutions/`. The solution file is the original, complete, unmodified version of that file — no TODOs, no comments stripped, just the fully working code.

**Files to put in `src/solutions/`:**

| Solution file | Is the complete version of |
|---------------|---------------------------|
| `App.solution.jsx` | `src/App.jsx` |
| `TasksPage.solution.jsx` | `src/pages/TasksPage.jsx` |
| `TaskBoard.solution.jsx` | `src/components/tasks/TaskBoard.jsx` |

That's it — only three solution files, one per file that has TODOs. The read-only files (TaskCard, TaskColumn, TaskModal) do not need solution files because participants never modify them.

**Tell participants this at the very start of the workshop:**
> "The `src/solutions/` folder exists. Every TODO file has a complete solution next to it. If you are stuck for more than 5 minutes, open it, read it, understand why it works, then type it yourself. Do not copy-paste — the typing is where the learning happens."

**How the two files relate for each concept:**

```
src/App.jsx                          ← participant works in this (has TODOs)
src/solutions/App.solution.jsx       ← complete working version (no TODOs)

src/pages/TasksPage.jsx              ← participant works in this (has TODOs)
src/solutions/TasksPage.solution.jsx ← complete working version (no TODOs)

src/components/tasks/TaskBoard.jsx              ← participant works in this (1 TODO)
src/solutions/TaskBoard.solution.jsx            ← complete working version (no TODOs)
```

This pairing is intentional. The TODO file and its solution file teach the same code — one has gaps to fill, the other shows what filled gaps look like. Participants always have a reference, but they still have to write it themselves.

---

## Complete Summary Table

| File | Action | Why |
|------|--------|-----|
| All backend files | **Touch nothing** | Participants never open the backend |
| `axiosInstance.js` | **Touch nothing** | Already correct, explain verbally |
| `App.jsx` | **Add 5 TODOs** (R1–R5) | React Router lesson |
| `TasksPage.jsx` | **Add 9 TODOs** (1–9) | Core React lesson: state, effects, API |
| `TaskBoard.jsx` | **Add 1 TODO** + header comment | One DELETE API call |
| `TaskCard.jsx` | **Add explanation comment only** | Read-only reference |
| `TaskColumn.jsx` | **Add explanation comment only** | Read-only reference |
| `TaskModal.jsx` | **Add explanation comment only** | Read-only reference |
| `TaskBoard_TODO.jsx` | **Delete** | Replace with updated TaskBoard.jsx |
| `TaskCard_TODO.jsx` | **Delete** | Replaced by read-only original |
| `TaskColumn_TODO.jsx` | **Delete** | Replaced by read-only original |
| `TaskModal_TODO.jsx` | **Delete** | Replaced by read-only original |
| `WORKSHOP.md` | **Create new** | Participant guide |
| `src/solutions/App.solution.jsx` | **Create new** | Complete solution for App.jsx |
| `src/solutions/TasksPage.solution.jsx` | **Create new** | Complete solution for TasksPage.jsx |
| `src/solutions/TaskBoard.solution.jsx` | **Create new** | Complete solution for TaskBoard.jsx |

---

## The 3 Questions to Ask Before Adding Any TODO

Before you add a TODO anywhere, ask:

1. **Can a participant solve this using only React knowledge?**
   If they need to guess JSX structure or look up class names → remove it.

2. **Does solving this TODO teach one clear concept?**
   If it teaches nothing new compared to the previous TODO → remove it.

3. **Can a participant attempt it after reading just the hint?**
   If the hint isn't enough to get started → the TODO is too hard, split it or pre-write it.

If the answer to all three is yes — keep the TODO.
If any answer is no — pre-write it and add an explanation comment instead.
```
