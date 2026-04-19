import { IRepository, Room, Task, Vote, VoteChoice } from '@/types';

export class InMemoryRepository implements IRepository {
  private rooms: Map<string, Room> = new Map();
  private roomsByWord: Map<string, Room> = new Map();
  private tasks: Map<string, Task> = new Map();
  private votes: Map<string, Vote> = new Map();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async getRoomByWord(word: string): Promise<Room | null> {
    return this.roomsByWord.get(word) || null;
  }

  async createRoom(word: string): Promise<Room> {
    const room: Room = {
      id: this.generateId(),
      word,
      createdAt: new Date(),
    };
    this.rooms.set(room.id, room);
    this.roomsByWord.set(word, room);
    return room;
  }

  async getTasksByRoomId(roomId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.roomId === roomId);
  }

  async createTask(roomId: string, text: string, creatorName: string): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      roomId,
      text,
      creatorName,
      createdAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks.delete(taskId);
    // Also delete associated votes
    for (const [key, vote] of this.votes.entries()) {
      if (vote.taskId === taskId) {
        this.votes.delete(key);
      }
    }
  }

  async getVotesByTaskId(taskId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(v => v.taskId === taskId);
  }

  async getVotesByRoomId(roomId: string): Promise<Vote[]> {
    const roomTasks = await this.getTasksByRoomId(roomId);
    const taskIds = new Set(roomTasks.map(t => t.id));
    return Array.from(this.votes.values()).filter(v => taskIds.has(v.taskId));
  }

  async upsertVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote> {
    const key = `${taskId}:${voterName}`;
    const existing = this.votes.get(key);

    const vote: Vote = {
      id: existing?.id || this.generateId(),
      taskId,
      voterName,
      choice,
    };

    this.votes.set(key, vote);
    return vote;
  }

  async deleteVote(taskId: string, voterName: string): Promise<void> {
    const key = `${taskId}:${voterName}`;
    this.votes.delete(key);
  }
}
