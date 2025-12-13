'use client';

import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/context/ServiceContext';
import { useSession, useRoom, useTasks, useVoting } from '@/hooks';
import { MagicWordForm, RoomHeader, AddTaskForm, TaskList } from '@/components';

export default function Home() {
  const { roomService, taskService, voteService, repository } = useServices();
  const { userName, setUserName, clearSession, isLoading: sessionLoading } = useSession();
  const { room, isLoading: roomLoading, joinRoom, leaveRoom } = useRoom(roomService);
  const { tasks, isLoading: tasksLoading, addTask, removeTask, refreshTasks } = useTasks(taskService, room?.id || null);
  const { myVotes, castVote } = useVoting(voteService, tasks, userName, refreshTasks);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!room?.id || !repository.subscribeToRoom) return;

    const unsubscribe = repository.subscribeToRoom(room.id, {
      onTaskAdded: () => refreshTasks(),
      onTaskDeleted: () => refreshTasks(),
      onVoteChanged: () => refreshTasks(),
    });

    return unsubscribe;
  }, [room?.id, repository, refreshTasks]);

  const handleJoin = useCallback(async (word: string, name: string) => {
    setUserName(name);
    await joinRoom(word);
  }, [setUserName, joinRoom]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    clearSession();
  }, [leaveRoom, clearSession]);

  const handleAddTask = useCallback(async (text: string) => {
    if (userName) {
      await addTask(text, userName);
    }
  }, [addTask, userName]);

  const handleVote = useCallback(async (taskId: string, choice: 'yes' | 'no' | 'maybe') => {
    await castVote(taskId, choice);
  }, [castVote]);

  // Don't render until mounted (hydration fix)
  if (!mounted || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show magic word form if not in a room
  if (!room) {
    return <MagicWordForm onJoin={handleJoin} isLoading={roomLoading} />;
  }

  // Show room view
  return (
    <div className="min-h-screen bg-gray-50">
      <RoomHeader word={room.word} userName={userName!} onLeave={handleLeave} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <AddTaskForm onAdd={handleAddTask} disabled={tasksLoading} />
        </div>

        {tasksLoading && tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            myVotes={myVotes}
            onVote={handleVote}
            onDelete={removeTask}
            currentUser={userName!}
          />
        )}
      </main>
    </div>
  );
}
