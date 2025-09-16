import React from 'react';
import { CheckSquare, Plus, BarChart3, Sparkles } from 'lucide-react';
import { TaskStats } from '../types';

interface HeaderProps {
  stats: TaskStats;
  onNewTask: () => void;
  onOpenSummary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onNewTask, onOpenSummary }) => {
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CheckSquare size={32} className="text-blue-200" />
              <h1 className="text-3xl font-bold">TaskFlow</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Stay organized and productive
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-blue-200">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{stats.completed}</div>
                <div className="text-blue-200">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
                <div className="text-blue-200">Pending</div>
              </div>
              {stats.overdue > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">{stats.overdue}</div>
                  <div className="text-blue-200">Overdue</div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {onOpenSummary && (
                <button
                  onClick={onOpenSummary}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  title="Generate AI Summary"
                >
                  <Sparkles size={20} />
                  <span className="hidden sm:inline">Summary</span>
                </button>
              )}
              
              <button
                onClick={onNewTask}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-200">Progress</span>
            <span className="text-blue-200">{Math.round(completionRate)}% Complete</span>
          </div>
          <div className="w-full bg-blue-800/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};