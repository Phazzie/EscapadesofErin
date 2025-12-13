'use client';

import { useState, useCallback } from 'react';
import type { Room, IRoomService } from '@/types';

export function useRoom(roomService: IRoomService) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const joinRoom = useCallback(async (word: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const joinedRoom = await roomService.joinRoom(word);
      setRoom(joinedRoom);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to join room'));
    } finally {
      setIsLoading(false);
    }
  }, [roomService]);

  const leaveRoom = useCallback(() => {
    setRoom(null);
  }, []);

  return {
    room,
    isLoading,
    error,
    joinRoom,
    leaveRoom,
  };
}
