import React from 'react';
import { CheckSquare, Plus, Target } from 'lucide-react';

interface EmptyStateProps {
  onCreateTask: () => void;
  hasSearchQuery: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateTask, hasSearchQuery }) => {
  if (hasSearchQuery) {
    return (
      <div className="text-center py-16">
        <Target size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <CheckSquare size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks yet</h3>
      <p className="text-gray-500 mb-6">
        Start by creating your first task to get organized and boost your productivity.
      </p>
      <button
        onClick={onCreateTask}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Plus size={20} />
        Create Your First Task
      </button>
    </div>
  );
};