# Changes

## 2026-09-30

- Added a small "Find a task" search above the board. It checks titles and descriptions, shows the matching count, and has a clear button. The existing sage/olive layout stays intact.
- Creating or moving a task into Completed now sets its completion flag and timestamp. Moving it back clears both; editing a completed task keeps its original finish time.
- The frontend updates its completion flag too and uses the latest task state when requests finish close together.
- Update/delete endpoints reject partial, fractional and non-positive IDs instead of accidentally targeting another task.
- Database queries wait for the schema to be ready. `DB_PATH` can point at a separate database; regression tests use SQLite in memory.
- Added `npm test` to the backend and 11 regression tests. Removed an unused import in the edited task modal.

Checks on Node 26.10.0:

- `cd nodejs-backend && npm test`: **11 passed**, using the real SQLite engine and controller functions.
- `cd frontend && npm run build`: **passed**. The copied local dependencies were incomplete; rebuilding them from the matching local lockfile fixed the missing `caniuse-lite` file. No dependency versions in the committed manifests were changed.
- ESLint with the existing React App configuration on all three edited frontend files: **0 errors, 0 warnings**.
- The frontend's existing test command found **no tests**. It is not counted as test coverage.

Limits: no browser drag-and-drop or full login/history flow was exercised. Existing Pomodoro timing/history behavior still needs its own pass. This remains a local workshop app: the API does not enforce user authorization on task IDs, so these fixes do not make it suitable for public multi-user hosting. The build still reports an old Browserslist dataset.
