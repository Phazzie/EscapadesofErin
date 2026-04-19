'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TaskWithVotes, ITaskService } from '@/types';

export function useTasks(taskService: ITaskService, roomId: string | null) {
  const [tasks, setTasks] = useState<TaskWithVotes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track the current roomId to detect stale responses
  const currentRoomIdRef = useRef<string | null>(roomId);

  // Track current tasks for synchronous access in removeTask
  const tasksRef = useRef<TaskWithVotes[]>(tasks);
  tasksRef.current = tasks;

  // Load tasks with stale response protection
  useEffect(() => {
    currentRoomIdRef.current = roomId;

    // Clear state when roomId is falsy
    if (!roomId) {
      setTasks([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;
    const capturedRoomId = roomId;

    async function fetchTasks() {
      setIsLoading(true);
      setError(null);
      try {
        const loadedTasks = await taskService.getTasks(capturedRoomId);
        // Only update if this request is still active and roomId hasn't changed
        if (isActive && currentRoomIdRef.current === capturedRoomId) {
          setTasks(loadedTasks);
        }
      } catch (e) {
        if (isActive && currentRoomIdRef.current === capturedRoomId) {
          setError(e instanceof Error ? e : new Error('Failed to load tasks'));
        }
      } finally {
        if (isActive && currentRoomIdRef.current === capturedRoomId) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isActive = false;
    };
  }, [taskService, roomId]);

  // Manual refresh function
  const refreshTasks = useCallback(async () => {
    if (!roomId) return;

    const capturedRoomId = roomId;
    setIsLoading(true);
    setError(null);
    try {
      const loadedTasks = await taskService.getTasks(capturedRoomId);
      // Only update if roomId hasn't changed during the fetch
      if (currentRoomIdRef.current === capturedRoomId) {
        setTasks(loadedTasks);
      }
    } catch (e) {
      if (currentRoomIdRef.current === capturedRoomId) {
        setError(e instanceof Error ? e : new Error('Failed to load tasks'));
      }
    } finally {
      if (currentRoomIdRef.current === capturedRoomId) {
        setIsLoading(false);
      }
    }
  }, [taskService, roomId]);

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

    // Synchronously snapshot current tasks and find the one to remove
    const currentTasks = tasksRef.current;
    const removedIndex = currentTasks.findIndex(t => t.id === taskId);
    const removedTask = removedIndex !== -1 ? currentTasks[removedIndex] : undefined;

    // Optimistic update - remove the task
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await taskService.removeTask(taskId);
    } catch (e) {
      // Rollback on error - add the task back at its original position
      if (removedTask) {
        setTasks(prev => {
          const newTasks = [...prev];
          // Insert at original position, or at end if position is invalid
          const insertIndex = Math.min(removedIndex, newTasks.length);
          newTasks.splice(insertIndex, 0, removedTask);
          return newTasks;
        });
      }
      setError(e instanceof Error ? e : new Error('Failed to remove task'));
    }
  }, [taskService]);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    removeTask,
    refreshTasks,
  };
}
