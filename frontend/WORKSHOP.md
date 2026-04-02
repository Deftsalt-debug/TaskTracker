# TaskTrackr React Workshop

Welcome! By the end of this session you will have a working task management app connected to a live backend.

---

## Getting Started

Run these two commands:
```bash
npm install
npm start
```

The app will open at http://localhost:3000. Register an account and log in — it's connected to a real database.

---

## Work Through Files In This Order

### Step 1 — App.jsx (React Router)
**File:** `src/App.jsx`  
**TODOs:** R1, R2, R3, R4, R5  
**Concept:** How React Router maps URLs to components  
**Time:** ~15 minutes

What you'll learn: Every React app that has multiple pages uses Router. You'll complete 5 simple TODOs that tell React "if URL is /login, show LoginPage; if URL is /tasks, show TasksPage".

### Step 2 — TasksPage.jsx (Core React)
**File:** `src/pages/TasksPage.jsx`  
**TODOs:** 1 through 9  
**Concept:** useState, useEffect, API calls, array methods  
**Time:** ~30 minutes

What you'll learn: This is the MOST important file. It teaches:
- `useState` — React remembers data using state
- `useEffect` — running code when the page loads or data changes
- `async/await` — waiting for data from the backend
- Array methods — `map()` to update, `filter()` to delete

### Step 3 — TaskBoard.jsx (API call)
**File:** `src/components/tasks/TaskBoard.jsx`  
**TODOs:** Just one — `TB1` (handleDeleteTask)  
**Concept:** DELETE request with axios  
**Time:** ~5 minutes

What you'll learn: How to call the API to DELETE data from the backend.

---

## Files You Only Need to Read (No Writing)

These files already have explanatory comments at the top. Read them to understand React patterns:

- **TaskCard.jsx** — props, conditional rendering, useState
- **TaskColumn.jsx** — props, list rendering with .map()
- **TaskModal.jsx** — controlled inputs, form handling

Each has detailed comments explaining what to look for.

---

## Stuck?

The `src/solutions/` folder has a complete solution file for every file you are working in.

| If stuck on... | Open this file |
|---|---|
| App.jsx | `src/solutions/App.solution.jsx` |
| TasksPage.jsx | `src/solutions/TasksPage.solution.jsx` |
| TaskBoard.jsx | `src/solutions/TaskBoard.solution.jsx` |

**How to use solutions:**
1. Open the solution file
2. Read it and understand why each line works
3. Close the solution
4. TYPE the code into your file (don't copy-paste!)
5. The typing is where the learning happens

---

## Testing Your Work

After completing each file:

✅ **No red errors in browser console** (F12 to open DevTools)  
✅ **Component displays** — things visible on screen  
✅ **Feature works** — buttons click, data shows, etc.

---

## Common Mistakes

| Problem | Fix |
|---------|-----|
| `setTask is not defined` | Use `const [task, setTask] = useState(defaultValue)` |
| `Module not found` | Check the file path spelling (case-sensitive!) |
| Blank page | Press F12, check console for red errors |
| State doesn't update | Use spread operator: `{ ...oldState, newValue }` |
| Form won't submit | Check that all fields have `value` and `onChange` |

---

## Key React Concepts You'll Learn

- ✅ **Components** — Reusable UI pieces
- ✅ **Props** — How components talk to each other
- ✅ **State** — How components remember data
- ✅ **Hooks** — useState, useEffect, useDraggable
- ✅ **Events** — onClick, onChange, onDragStart
- ✅ **API Calls** — Fetch data with axios, handle responses
- ✅ **Conditional Rendering** — Show/hide based on state
- ✅ **Array Methods** — map, filter for rendering lists

---

## Before You Start

**Make sure:**
- [ ] npm modules installed (`npm install` ran successfully)
- [ ] App loads at http://localhost:3000
- [ ] You can register and log in
- [ ] Task board appears with 4 empty columns
- [ ] Browser console has no red errors

**If any of these fail, ask the instructor before starting TODOs!**

---

## How Long Does This Take?

- **App.jsx:** 15 minutes
- **TasksPage.jsx:** 30 minutes
- **TaskBoard.jsx:** 5 minutes
- **Total:** ~50 minutes

You'll have about 110 minutes, so you'll have time to ask questions and explore!

---

## Your First TODO

Open `src/App.jsx` and look for `TODO R1`. The first thing you'll do is:

Find this comment:
```javascript
// TODO R1: Wrap everything in <Router>
```

And replace it with actual code. The hint tells you exactly what to type!

---

**Ready? Let's code! 🚀**

If you have questions, raise your hand. That's what I'm here for!
