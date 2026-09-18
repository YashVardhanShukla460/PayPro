import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { JWT_SECRET, AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    employeeId: user.employee_id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    user: payload,
  });
});

// Register
router.post('/register', (req: Request, res: Response) => {
  const { email, password, name, role = 'EMPLOYEE' } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const id = `usr-${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, employee_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, email.trim().toLowerCase(), passwordHash, name, role, null);

  const payload = {
    id,
    email: email.trim().toLowerCase(),
    role,
    name,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    token,
    user: payload,
  });
});

// Current User Profile
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = db.prepare('SELECT id, email, name, role, employee_id FROM users WHERE id = ?').get(req.user.id) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    employeeId: user.employee_id,
  });
});

export default router;
