import { Router } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Task } from '../models/Task.js';

const router = Router();

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    req.user = { id: String(payload.sub), email: payload.email, name: payload.name };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const list = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', category = 'Personal', dueDate } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Title is required' });
    
    const created = await Task.create({
      userId: req.user.id,
      title,
      description,
      completed: false,
      priority,
      category,
      dueDate: dueDate || undefined,
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    const updated = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { ...req.body },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    const deleted = await Task.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

export default router;