import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const router = Router();

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, secret, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await User.create({ email, passwordHash, name: name || email.split('@')[0] });
  const token = signToken({ id: created.id, email: created.email, name: created.name });
  res.json({ token, user: { id: created.id, email: created.email, name: created.name } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ id: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;


