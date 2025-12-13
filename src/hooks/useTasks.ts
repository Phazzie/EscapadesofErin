'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TaskWithVotes, ITaskService } from '@/types';

export function useTasks(taskService: ITaskService, roomId: string | null) {
  const [tasks, setTasks] = useState<TaskWithVotes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTasks = useCallback(async () => {
    if (!roomId) return;
    setIsLoading(true);
    setError(null);
    try {
      const loadedTasks = await taskService.getTasks(roomId);
      setTasks(loadedTasks);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load tasks'));
    } finally {
      setIsLoading(false);
    }
  }, [taskService, roomId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (text: string, creatorName: string) => {
    if (!roomId) return;
    setError(null);
    try {
      const newTask = await taskService.addTask(roomId, text, creatorName);
      // Add task with empty votes
      setTasks(prev => [...prev, {
        ...newTask,
        votes: [],
        voteCounts: { yes: 0, no: 0, maybe: 0 }
      }]);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to add task'));
    }
  }, [taskService, roomId]);

  const removeTask = useCallback(async (taskId: string) => {
    setError(null);
    // Optimistic update
    const previousTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await taskService.removeTask(taskId);
    } catch (e) {
      // Rollback on error
      setTasks(previousTasks);
      setError(e instanceof Error ? e : new Error('Failed to remove task'));
    }
  }, [taskService, tasks]);

  const refreshTasks = loadTasks;

  return {
    tasks,
    isLoading,
    error,
    addTask,
    removeTask,
    refreshTasks,
  };
}
