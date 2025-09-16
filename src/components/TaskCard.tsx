import React, { useState } from 'react';
import { Check, Clock, Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react';
import { Task } from '../types';
import { formatRelativeTime, getPriorityColor, getPriorityLabel } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(task.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div 
      className={`group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
        >
          {task.completed && <Check size={14} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className={`text-lg font-semibold ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: priorityColor }}
              title={getPriorityLabel(task.priority)}
            />
          </div>

          {task.description && (
            <p className={`text-gray-600 mb-3 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {task.category}
            </span>
            
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatRelativeTime(task.createdAt)}</span>
            </div>

            {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar size={14} />
                <span>{formatRelativeTime(task.dueDate)}</span>
                {isOverdue && <AlertCircle size={14} className="text-red-500" />}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDeleting
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={isDeleting ? 'Click again to confirm' : 'Delete task'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};