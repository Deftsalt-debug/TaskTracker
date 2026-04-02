# Database Migration Instructions

## Update Default Estimated Pomodoros (from 1 to 3)

This migration updates the default value for `estimated_pomodoros` from 1 to 3 for all new tasks.

### Steps:

1. Open phpMyAdmin or MySQL command line
2. Select your `tasktrackr` database
3. Run the following SQL command:

```sql
ALTER TABLE tasks MODIFY COLUMN estimated_pomodoros INT DEFAULT 3;
```

### Optional: Update Existing Tasks

If you want to update tasks that currently have `estimated_pomodoros = 1` to the new default of 3:

```sql
UPDATE tasks SET estimated_pomodoros = 3 WHERE estimated_pomodoros = 1;
```

**Note:** This is optional and will only affect existing tasks with 1 pomodoro estimate.

### Verify Migration

Check that the default was updated:

```sql
SHOW CREATE TABLE tasks;
```

Look for the line: `estimated_pomodoros int DEFAULT 3`

---

## Auto-Adjusting Feature

The system now automatically increases `estimated_pomodoros` if a user completes more pomodoros than the target.

**Example:**
- Task has 3 estimated pomodoros
- User completes 3 pomodoros → Shows 3/3 (100%)
- User completes 4th pomodoro → Automatically updates to 4/4 (stays at 100%)
- This prevents the progress bar from exceeding 100%

No database changes needed for this feature - it's handled in the frontend logic.
