import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';

interface QuickAddTaskProps {
  onAdd: (title: string) => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd(title.trim());
    setTitle('');
    setIsExpanded(false);
  };

  const handleBlur = () => {
    if (!title.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-6 text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
        >
          <Plus size={20} className="text-blue-600" />
          <span>Add a new task...</span>
          <Zap size={16} className="ml-auto text-yellow-500" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoFocus
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to add quickly, or use the full form for more options
          </p>
        </form>
      )}
    </div>
  );
};