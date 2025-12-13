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

    // Capture the task being removed for potential rollback
    let removedTask: TaskWithVotes | undefined;
    let removedIndex: number = -1;

    // Optimistic update - capture removed task during the update
    setTasks(prev => {
      removedIndex = prev.findIndex(t => t.id === taskId);
      if (removedIndex !== -1) {
        removedTask = prev[removedIndex];
      }
      return prev.filter(t => t.id !== taskId);
    });

    try {
      await taskService.removeTask(taskId);
    } catch (e) {
      // Rollback on error - add the task back at its original position
      if (removedTask) {
        const taskToRestore = removedTask;
        const indexToRestore = removedIndex;
        setTasks(prev => {
          const newTasks = [...prev];
          // Insert at original position, or at end if position is invalid
          const insertIndex = Math.min(indexToRestore, newTasks.length);
          newTasks.splice(insertIndex, 0, taskToRestore);
          return newTasks;
        });
      }
      setError(e instanceof Error ? e : new Error('Failed to remove task'));
    }
  }, [taskService]);

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
