import mongoose from 'mongoose';

const taskSummarySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD format
    summary: { type: String, required: true },
    taskCount: { type: Number, required: true },
    categories: [{ type: String }],
    completedTasks: [{
      title: { type: String, required: true },
      description: { type: String },
      category: { type: String, required: true },
      priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
      completedAt: { type: Date }
    }]
  },
  { 
    timestamps: true,
    // Ensure one summary per user per day
    index: { userId: 1, date: 1 }, 
  }
);

// Compound unique index to prevent duplicate summaries
taskSummarySchema.index({ userId: 1, date: 1 }, { unique: true });

export const TaskSummary = mongoose.models.TaskSummary || mongoose.model('TaskSummary', taskSummarySchema);