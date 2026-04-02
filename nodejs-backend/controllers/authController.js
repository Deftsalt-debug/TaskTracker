import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Trim and validate
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email cannot be empty'
      });
    }

    // Check if email already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [trimmedName, trimmedEmail, password_hash]
    );

    res.status(201).json({
      status: 'success',
      message: 'User registered',
      data: {
        id: result.id,
        name: trimmedName,
        email: trimmedEmail
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    const trimmedEmail = email.trim();

    // Find user by email
    const user = await db.get(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Return user data (without password hash)
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login'
    });
  }
};
