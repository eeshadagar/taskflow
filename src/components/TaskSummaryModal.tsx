import React, { useState } from 'react';
import { X, Sparkles, Calendar, BarChart3, Clock, Loader2 } from 'lucide-react';
import { generateTaskSummary, TaskSummaryData, TaskSummary } from '../lib/gemini';
import { Task } from '../types';
import api from '../lib/axios';

interface TaskSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: Task[];
  date?: string;
  existingSummary?: TaskSummary | null;
}

export const TaskSummaryModal: React.FC<TaskSummaryModalProps> = ({
  isOpen,
  onClose,
  completedTasks,
  date = new Date().toISOString().split('T')[0],
  existingSummary
}) => {
  const [summary, setSummary] = useState<string>(existingSummary?.summary || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todaysTasks = completedTasks.filter(task => {
    const taskDate = task.updatedAt.toISOString().split('T')[0];
    return taskDate === date && task.completed;
  });

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const summaryData: TaskSummaryData = {
        date,
        completedTasks: todaysTasks.map(task => ({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          completedAt: task.updatedAt
        }))
      };

      const generatedSummary = await generateTaskSummary(summaryData);
      setSummary(generatedSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summary.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const categories = Array.from(new Set(todaysTasks.map(task => task.category)));
      
      await api.post('/api/summaries', {
        date,
        summary: summary.trim(),
        taskCount: todaysTasks.length,
        categories,
        completedTasks: todaysTasks.map(task => ({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          completedAt: task.updatedAt
        }))
      });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save summary');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Daily Task Summary</h2>
              <p className="text-sm text-gray-600">AI-powered reflection on your accomplishments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Date and Stats */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-500" />
              <span>{todaysTasks.length} tasks completed</span>
            </div>
          </div>

          {/* Task List */}
          {todaysTasks.length > 0 ? (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Completed Tasks:</h3>
              <div className="space-y-2">
                {todaysTasks.map((task, index) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded-full">{task.category}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No tasks completed on this date</p>
            </div>
          )}

          {/* Summary Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">AI Summary</h3>
              {todaysTasks.length > 0 && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Summary
                    </>
                  )}
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={todaysTasks.length > 0 ? "Click 'Generate Summary' to create an AI-powered reflection..." : "Complete some tasks to generate a summary"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={4}
              disabled={todaysTasks.length === 0}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {existingSummary ? 'Update your daily summary' : 'Save your daily summary for progress tracking'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSummary}
              disabled={!summary.trim() || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {existingSummary ? 'Update' : 'Save'} Summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};