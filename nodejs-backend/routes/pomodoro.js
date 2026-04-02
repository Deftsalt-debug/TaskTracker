import express from 'express';
import {
  savePomodoroSession,
  getPomodoroHistory
} from '../controllers/pomodoroController.js';

const router = express.Router();

// RESTful routes
router.post('/', savePomodoroSession);
router.get('/', getPomodoroHistory);

// Support old PHP-style endpoints for backward compatibility
router.post('/save.php', savePomodoroSession);
router.get('/history.php', getPomodoroHistory);

export default router;
