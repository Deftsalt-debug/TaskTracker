import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasksController.js';

const router = express.Router();

// Support old PHP-style endpoints FIRST (more specific routes must come before generic :id pattern)
router.get('/get_tasks.php', getTasks);
router.post('/create_task.php', createTask);
router.put('/update_task.php', updateTask);
router.delete('/delete_task.php', deleteTask);

// RESTful routes (generic patterns come after specific paths)
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
