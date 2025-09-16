import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { Header } from './components/Header';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { QuickAddTask } from './components/QuickAddTask';
import { FilterBar } from './components/FilterBar';
import { StatsCard } from './components/StatsCard';
import { EmptyState } from './components/EmptyState';
import { TaskSummaryModal } from './components/TaskSummaryModal';
import { SummaryDashboard } from './components/SummaryDashboard';
import { useTasks } from './hooks/useTasks';
import { useSummaries } from './hooks/useSummaries';
import { Task } from './types';
import { TaskSummary } from './lib/gemini';

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
    allTasks,
  } = useTasks();

  const { getSummaryByDate } = useSummaries();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryDate, setSummaryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [existingSummary, setExistingSummary] = useState<TaskSummary | null>(null);

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

  const handleOpenSummaryModal = async (date?: string, summary?: TaskSummary) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    setSummaryDate(targetDate);
    
    if (summary) {
      setExistingSummary(summary);
    } else {
      try {
        const existing = await getSummaryByDate(targetDate);
        setExistingSummary(existing);
      } catch (err) {
        setExistingSummary(null);
      }
    }
    
    setIsSummaryModalOpen(true);
  };

  const handleCloseSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setExistingSummary(null);
  };

  const hasSearchOrFilters = searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Header 
        stats={stats} 
        onNewTask={() => setIsFormOpen(true)}
        onOpenSummary={() => handleOpenSummaryModal()}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <QuickAddTask onAdd={handleQuickAdd} />

            {/* Filters */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              categories={categories}
            />

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SummaryDashboard onOpenSummaryModal={handleOpenSummaryModal} />
          </div>
        </div>

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          task={editingTask}
          categories={categories.map(c => c.name)}
        />

        {/* Summary Modal */}
        <TaskSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={handleCloseSummaryModal}
          completedTasks={allTasks}
          date={summaryDate}
          existingSummary={existingSummary}
        />
      </main>
    </div>
  );
}

export default App;