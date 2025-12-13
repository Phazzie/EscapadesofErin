import { Room, Task, Vote, VoteChoice } from './entities';

export interface RealtimeCallbacks {
  onTaskAdded?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onVoteChanged?: (vote: Vote) => void;
  /** Called when any data changes - use for simple refresh triggers */
  onDataChanged?: () => void;
}

export interface IRepository {
  // Rooms
  getRoomByWord(word: string): Promise<Room | null>;
  createRoom(word: string): Promise<Room>;

  // Tasks
  getTasksByRoomId(roomId: string): Promise<Task[]>;
  createTask(roomId: string, text: string, creatorName: string): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;

  // Votes
  getVotesByTaskId(taskId: string): Promise<Vote[]>;
  getVotesByRoomId(roomId: string): Promise<Vote[]>;
  upsertVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote>;
  deleteVote(taskId: string, voterName: string): Promise<void>;

  // Realtime (optional)
  subscribeToRoom?(roomId: string, callbacks: RealtimeCallbacks): () => void;
}
