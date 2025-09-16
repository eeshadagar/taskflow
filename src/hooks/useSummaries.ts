// src/hooks/useSummaries.ts
import { useState, useEffect } from 'react';
import { TaskSummary } from '../lib/gemini';
import api from '../lib/axios';

export const useSummaries = () => {
  const [summaries, setSummaries] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = async (limit = 30) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get(`/api/summaries?limit=${limit}`);
      const normalizedSummaries = data.map((summary: any) => ({
        ...summary,
        createdAt: new Date(summary.createdAt)
      }));
      setSummaries(normalizedSummaries);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch summaries');
    } finally {
      setIsLoading(false);
    }
  };

  const getSummaryByDate = async (date: string): Promise<TaskSummary | null> => {
    try {
      const { data } = await api.get(`/api/summaries/${date}`);
      return {
        ...data,
        createdAt: new Date(data.createdAt)
      };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  };

  const saveSummary = async (summaryData: {
    date: string;
    summary: string;
    taskCount: number;
    categories: string[];
    completedTasks: any[];
  }): Promise<TaskSummary> => {
    try {
      const { data } = await api.post('/api/summaries', summaryData);
      const normalizedSummary = {
        ...data,
        createdAt: new Date(data.createdAt)
      };
      
      // Update local state
      setSummaries(prev => {
        const filtered = prev.filter(s => s.date !== summaryData.date);
        return [normalizedSummary, ...filtered].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return normalizedSummary;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Failed to save summary');
    }
  };

  const deleteSummary = async (date: string) => {
    try {
      await api.delete(`/api/summaries/${date}`);
      setSummaries(prev => prev.filter(s => s.date !== date));
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Failed to delete summary');
    }
  };

  const getWeeklySummaries = async (startDate: string, endDate: string): Promise<TaskSummary[]> => {
    try {
      const { data } = await api.get(`/api/summaries/range/${startDate}/${endDate}`);
      return data.map((summary: any) => ({
        ...summary,
        createdAt: new Date(summary.createdAt)
      }));
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch weekly summaries');
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  return {
    summaries,
    isLoading,
    error,
    fetchSummaries,
    getSummaryByDate,
    saveSummary,
    deleteSummary,
    getWeeklySummaries
  };
};