// src/components/SummaryDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';
import { TaskSummary } from '../lib/gemini';
import api from '../lib/axios';

interface SummaryDashboardProps {
  onOpenSummaryModal: (date?: string, summary?: TaskSummary) => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ onOpenSummaryModal }) => {
  const [summaries, setSummaries] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/summaries?limit=7');
      setSummaries(data.map((summary: any) => ({
        ...summary,
        createdAt: new Date(summary.createdAt)
      })));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch summaries');
    } finally {
      setIsLoading(false);
    }
  };

  const totalTasks = summaries.reduce((sum, summary) => sum + summary.taskCount, 0);
  const averageTasksPerDay = summaries.length > 0 ? Math.round(totalTasks / summaries.length) : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Progress Summaries</h2>
              <p className="text-sm text-gray-600">AI-powered insights into your productivity</p>
            </div>
          </div>
          <button
            onClick={() => onOpenSummaryModal()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <Sparkles size={16} />
            Today's Summary
          </button>
        </div>

        {summaries.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <BarChart3 size={16} />
                <span className="text-sm font-medium">Total Tasks</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{totalTasks}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Daily Average</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{averageTasksPerDay}</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {summaries.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No summaries yet</h3>
            <p className="text-gray-500 mb-4">
              Complete some tasks and generate your first daily summary to track your progress!
            </p>
            <button
              onClick={() => onOpenSummaryModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Sparkles size={16} />
              Create Summary
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {summaries.map((summary) => (
              <div
                key={summary.id}
                className="group border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                onClick={() => onOpenSummaryModal(summary.date, summary)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar size={14} />
                        {new Date(summary.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BarChart3 size={14} />
                        {summary.taskCount} tasks
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                      {summary.summary}
                    </p>
                    {summary.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {summary.categories.slice(0, 3).map((category, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                        {summary.categories.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{summary.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {summaries.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={fetchSummaries}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors duration-200"
            >
              Refresh Summaries
            </button>
          </div>
        )}
      </div>
    </div>
  );
};