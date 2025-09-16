import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Gemini API key not found. Summary feature will be disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface TaskSummaryData {
  date: string;
  completedTasks: Array<{
    title: string;
    description?: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    completedAt?: Date;
  }>;
}

export interface TaskSummary {
  id: string;
  date: string;
  summary: string;
  taskCount: number;
  categories: string[];
  createdAt: Date;
}

export const generateTaskSummary = async (data: TaskSummaryData): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API is not configured');
  }

  if (data.completedTasks.length === 0) {
    return "No tasks were completed today. Take some time to plan for tomorrow!";
  }

  try {
    // Updated model name for the current API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const tasksText = data.completedTasks
      .map((task, index) => {
        return `${index + 1}. ${task.title}${task.description ? ` - ${task.description}` : ''} (${task.category}, ${task.priority} priority)`;
      })
      .join('\n');

    const prompt = `
You are a productivity assistant. I completed the following tasks today (${data.date}):

${tasksText}

Please generate a positive, encouraging summary of my accomplishments today. The summary should:
- Highlight what I achieved
- Mention the variety of areas I worked on
- Be motivating and acknowledge my progress
- Be 2-3 sentences long
- Use a warm, personal tone

Focus on productivity insights and patterns if you notice any.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    if (!summary) {
      throw new Error('No summary generated');
    }

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    
    // Provide more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message.includes('models/') && error.message.includes('not found')) {
        throw new Error('Model not available. Please check if gemini-1.5-flash is accessible with your API key.');
      }
    }
    
    throw new Error('Failed to generate task summary. Please try again.');
  }
};

export const generateWeeklySummary = async (summaries: TaskSummary[]): Promise<string> => {
  if (!genAI || summaries.length === 0) {
    throw new Error('Cannot generate weekly summary');
  }

  try {
    // Updated model name for the current API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const summariesText = summaries
      .map((summary, index) => `Day ${index + 1} (${summary.date}): ${summary.taskCount} tasks - ${summary.summary}`)
      .join('\n');

    const prompt = `
Based on these daily task summaries from the past week:

${summariesText}

Please provide a weekly productivity summary that:
- Highlights overall progress and patterns
- Notes areas of consistency or growth
- Provides gentle suggestions for the upcoming week
- Maintains an encouraging tone
- Is 3-4 sentences long

Focus on productivity trends and celebrate achievements.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || 'Week summary unavailable';
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    throw new Error('Failed to generate weekly summary');
  }
};