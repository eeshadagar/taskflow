import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { Header } from './components/Header';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { QuickAddTask } from './components/QuickAddTask';
import { FilterBar } from './components/FilterBar';
import { StatsCard } from './components/StatsCard';
import { EmptyState } from './components/EmptyState';
import { useTasks } from './hooks/useTasks';
import { Task } from './types';

function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    stats,
    categories,
  } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleQuickAdd = (title: string) => {
    addTask({
      title,
      completed: false,
      priority: 'medium',
      category: 'Personal',
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const hasSearchOrFilters = searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Header stats={stats} onNewTask={() => setIsFormOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tasks"
            value={stats.total}
            icon={BarChart3}
            color="#3B82F6"
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="#10B981"
            bgColor="bg-green-50"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="#F59E0B"
            bgColor="bg-yellow-50"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color="#EF4444"
            bgColor="bg-red-50"
          />
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <QuickAddTask onAdd={handleQuickAdd} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            categories={categories}
          />
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState 
              onCreateTask={() => setIsFormOpen(true)}
              hasSearchQuery={hasSearchOrFilters}
            />
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={handleEditTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          task={editingTask}
          categories={categories.map(c => c.name)}
        />
      </main>
    </div>
  );
}

export default App;