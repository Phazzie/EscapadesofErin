'use client';

import type { IRepository, Room, Task, Vote, VoteChoice, RealtimeCallbacks } from '@/types';

const STORAGE_KEY = 'erin-escapades-data';

interface StoredData {
  rooms: Room[];
  tasks: Task[];
  votes: Vote[];
}

/**
 * LocalStorage-based repository - no backend required!
 * Perfect for simple deployments or demos.
 */
export class LocalStorageRepository implements IRepository {
  private listeners: Set<() => void> = new Set();

  private getData(): StoredData {
    if (typeof window === 'undefined') {
      return { rooms: [], tasks: [], votes: [] };
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { rooms: [], tasks: [], votes: [] };
    try {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      data.rooms = data.rooms.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) }));
      data.tasks = data.tasks.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) }));
      return data;
    } catch {
      return { rooms: [], tasks: [], votes: [] };
    }
  }

  private setData(data: StoredData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Notify listeners
    this.listeners.forEach(cb => cb());
    // Broadcast to other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  async getRoomByWord(word: string): Promise<Room | null> {
    const data = this.getData();
    return data.rooms.find(r => r.word === word) || null;
  }

  async createRoom(word: string): Promise<Room> {
    const data = this.getData();
    const existing = data.rooms.find(r => r.word === word);
    if (existing) throw new Error(`Room with word "${word}" already exists`);

    const room: Room = {
      id: this.generateId(),
      word,
      createdAt: new Date(),
    };
    data.rooms.push(room);
    this.setData(data);
    return room;
  }

  async getTasksByRoomId(roomId: string): Promise<Task[]> {
    const data = this.getData();
    return data.tasks
      .filter(t => t.roomId === roomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createTask(roomId: string, text: string, creatorName: string): Promise<Task> {
    const data = this.getData();
    const task: Task = {
      id: this.generateId(),
      roomId,
      text,
      creatorName,
      createdAt: new Date(),
    };
    data.tasks.push(task);
    this.setData(data);
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    const data = this.getData();
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    data.votes = data.votes.filter(v => v.taskId !== taskId);
    this.setData(data);
  }

  async getVotesByTaskId(taskId: string): Promise<Vote[]> {
    const data = this.getData();
    return data.votes.filter(v => v.taskId === taskId);
  }

  async getVotesByRoomId(roomId: string): Promise<Vote[]> {
    const data = this.getData();
    const roomTasks = data.tasks.filter(t => t.roomId === roomId);
    const taskIds = new Set(roomTasks.map(t => t.id));
    return data.votes.filter(v => taskIds.has(v.taskId));
  }

  async upsertVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote> {
    const data = this.getData();
    const existingIndex = data.votes.findIndex(
      v => v.taskId === taskId && v.voterName === voterName
    );

    const vote: Vote = {
      id: existingIndex >= 0 ? data.votes[existingIndex].id : this.generateId(),
      taskId,
      voterName,
      choice,
    };

    if (existingIndex >= 0) {
      data.votes[existingIndex] = vote;
    } else {
      data.votes.push(vote);
    }
    this.setData(data);
    return vote;
  }

  async deleteVote(taskId: string, voterName: string): Promise<void> {
    const data = this.getData();
    data.votes = data.votes.filter(
      v => !(v.taskId === taskId && v.voterName === voterName)
    );
    this.setData(data);
  }

  // Cross-tab sync via storage events
  subscribeToRoom(roomId: string, callbacks: RealtimeCallbacks): () => void {
    const handleStorageEvent = (event: StorageEvent) => {
      // Only react to changes in our storage key
      if (event.key !== STORAGE_KEY) return;
      callbacks.onDataChanged?.();
    };

    const handleLocalChange = () => {
      callbacks.onDataChanged?.();
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageEvent);

    // Listen for changes from this tab
    this.listeners.add(handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      this.listeners.delete(handleLocalChange);
    };
  }
}
