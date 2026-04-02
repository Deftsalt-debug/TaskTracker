import db from '../config/database.js';

export const savePomodoroSession = async (req, res) => {
  try {
    const {
      user_id,
      task_id,
      session_type,
      duration_minutes,
      started_at,
      ended_at,
      completed,
      notes
    } = req.body;

    // Validation
    if (!user_id || !session_type || !duration_minutes || !started_at) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: user_id, session_type, duration_minutes, started_at'
      });
    }

    // Insert pomodoro session
    const result = await db.run(
      `INSERT INTO pomodoro_sessions
       (user_id, task_id, session_type, duration_minutes, started_at, ended_at, completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        task_id || null,
        session_type,
        duration_minutes,
        started_at,
        ended_at || null,
        completed !== undefined ? completed : 1,
        notes || null
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Pomodoro session saved successfully',
      session_id: result.id
    });
  } catch (err) {
    console.error('Save pomodoro session error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save pomodoro session'
    });
  }
};

export const getPomodoroHistory = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id || user_id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'user_id is required and must be positive'
      });
    }

    // Fetch pomodoro sessions with task details, ordered by most recent
    const sessions = await db.all(
      `SELECT 
        ps.id,
        ps.task_id,
        ps.session_type,
        ps.duration_minutes,
        ps.started_at,
        ps.ended_at,
        ps.completed,
        ps.notes,
        ps.created_at,
        t.title as task_title,
        t.category as task_category
      FROM pomodoro_sessions ps
      LEFT JOIN tasks t ON ps.task_id = t.id
      WHERE ps.user_id = ?
      ORDER BY ps.started_at DESC
      LIMIT 100`,
      [user_id]
    );

    // Convert completed field from 0/1 to boolean
    const formattedSessions = sessions.map(session => ({
      ...session,
      completed: Boolean(session.completed)
    }));

    res.json({
      status: 'success',
      data: formattedSessions,
      count: formattedSessions.length
    });
  } catch (err) {
    console.error('Get pomodoro history error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pomodoro history'
    });
  }
};
