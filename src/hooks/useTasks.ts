import { useState, useEffect } from 'react';
import { Task, TaskStats } from '../types';
import api from '../lib/axios';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = 'taskflow-tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get('/api/tasks');
        const parsed = (data || []).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
        setTasks(parsed);
      } catch {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            }));
            setTasks(parsedTasks);
          } catch (error) {
            console.error('Error loading tasks:', error);
          }
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const payload = {
        ...taskData,
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : undefined,
      };
      const { data } = await api.post('/api/tasks', payload);
      const normalized: Task = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };
      setTasks(prev => [normalized, ...prev]);
    } catch {
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task));
    try {
      const payload: any = { ...updates };
      if (updates.dueDate instanceof Date) payload.dueDate = updates.dueDate.toISOString();
      await api.put(`/api/tasks/${id}`, payload);
    } catch {}
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    try { await api.delete(`/api/tasks/${id}`); } catch {}
  };

  const toggleTask = (id: string) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => 
      !t.completed && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    ).length,
  };

  const categories = Array.from(new Set(tasks.map(t => t.category)))
    .map(category => ({
      id: category,
      name: category,
      color: getCategoryColor(category),
      count: tasks.filter(t => t.category === category).length,
    }));

  return {
    tasks: filteredTasks,
    allTasks: tasks,
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
  };
};

const getCategoryColor = (category: string): string => {
  const colors = [
    '#3B82F6', '#14B8A6', '#F97316', '#8B5CF6', 
    '#10B981', '#F59E0B', '#EF4444', '#6366F1'
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};