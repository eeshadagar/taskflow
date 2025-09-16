import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { TaskSummary } from '../models/TaskSummary.js';

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

// Get all summaries for user
router.get('/', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const summaries = await TaskSummary
      .find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ message: 'Failed to fetch summaries' });
  }
});

// Get summary for specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const summary = await TaskSummary.findOne({ 
      userId: req.user.id, 
      date 
    }).lean();
    
    if (!summary) {
      return res.status(404).json({ message: 'Summary not found' });
    }
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// Create or update summary
router.post('/', async (req, res) => {
  try {
    const { date, summary, taskCount, categories, completedTasks } = req.body;
    
    if (!date || !summary || taskCount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const summaryData = {
      userId: req.user.id,
      date,
      summary,
      taskCount,
      categories: categories || [],
      completedTasks: completedTasks || []
    };

    // Use upsert to create or update
    const savedSummary = await TaskSummary.findOneAndUpdate(
      { userId: req.user.id, date },
      summaryData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(savedSummary);
  } catch (error) {
    console.error('Error saving summary:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Summary already exists for this date' });
    }
    res.status(500).json({ message: 'Failed to save summary' });
  }
});

// Delete summary
router.delete('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const deleted = await TaskSummary.findOneAndDelete({ 
      userId: req.user.id, 
      date 
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Summary not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting summary:', error);
    res.status(500).json({ message: 'Failed to delete summary' });
  }
});

// Get summaries for date range (for weekly summaries)
router.get('/range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const summaries = await TaskSummary
      .find({ 
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: 1 })
      .lean();
    
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching date range summaries:', error);
    res.status(500).json({ message: 'Failed to fetch summaries' });
  }
});

export default router;