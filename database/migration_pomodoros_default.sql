-- Migration: Update default estimated_pomodoros to 3

-- Change default value for new tasks
ALTER TABLE tasks MODIFY COLUMN estimated_pomodoros INT DEFAULT 3;

-- Update existing tasks that have estimated_pomodoros = 1 to 3
-- (Optional: only if you want to update existing data)
-- UPDATE tasks SET estimated_pomodoros = 3 WHERE estimated_pomodoros = 1;

-- Display confirmation
SELECT 'Migration completed: estimated_pomodoros default changed to 3' AS status;
