import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);

// Support old PHP-style endpoints for backward compatibility
router.post('/register.php', register);
router.post('/login.php', login);

export default router;
