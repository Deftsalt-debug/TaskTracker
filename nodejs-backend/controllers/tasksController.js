import db from '../config/database.js';

export const getTasks = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || user_id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'user_id is required and must be positive'
      });
    }

    // Fetch all tasks for user ordered by created_at DESC
    const tasks = await db.all(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    // Convert boolean fields (SQLite stores booleans as 0/1)
    const formattedTasks = tasks.map(task => ({
      ...task,
      is_completed: Boolean(task.is_completed)
    }));

    res.json({
      status: 'success',
      data: formattedTasks
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tasks'
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      category,
      due_date,
      priority_level,
      estimated_pomodoros
    } = req.body;

    // Validation
    if (!user_id || !title) {
      return res.status(400).json({
        status: 'error',
        message: 'user_id and title are required'
      });
    }

    // Insert task
    const result = await db.run(
      `INSERT INTO tasks
       (user_id, title, description, category, due_date, priority_level, estimated_pomodoros, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        title,
        description || null,
        category || 'upcoming',
        due_date || null,
        priority_level || 'medium',
        estimated_pomodoros || 1,
        category === 'completed' ? 1 : 0,
        category === 'completed' ? new Date().toISOString() : null
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Task created',
      data: { id: result.id }
    });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task'
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    // Get ID from URL parameter (new RESTful way) or from body (backward compatibility)
    const id = Number(req.params.id || req.body.id);
    const updates = { ...req.body };
    
    // Remove id from updates if it exists in body
    delete updates.id;
    delete updates.user_id; // Don't allow user_id to be updated

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid Task ID is required'
      });
    }

    // Allowed fields to update
    const allowedFields = [
      'title',
      'description',
      'category',
      'due_date',
      'priority_level',
      'estimated_pomodoros',
      'completed_pomodoros',
      'is_completed'
    ];

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    // The board column is the source of truth when a task is moved.
    // This also clears the completed flag when bringing a task back to work.
    if (updates.category !== undefined) {
      updates.is_completed = updates.category === 'completed' ? 1 : 0;
    }

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updates.category !== undefined) {
      // Editing an already completed task keeps its original finish time.
      updateFields.push(updates.is_completed ? 'completed_at = COALESCE(completed_at, ?)' : 'completed_at = ?');
      updateValues.push(updates.is_completed ? new Date().toISOString() : null);
    }

    if (updateFields.length === 0) {
      return res.json({
        status: 'success',
        message: 'No fields to update'
      });
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());

    updateValues.push(id);

    const sql = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await db.run(sql, updateValues);

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Task updated successfully'
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update task'
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    // Get ID from URL parameter (new RESTful way) or from query (backward compatibility)
    const id = Number(req.params.id || req.query.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid task ID is required'
      });
    }

    const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task'
    });
  }
};
