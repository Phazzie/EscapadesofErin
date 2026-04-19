import { Room, Task, TaskWithVotes, Vote, VoteChoice } from './entities';

export interface IRoomService {
  joinRoom(word: string): Promise<Room>;
}

export interface ITaskService {
  getTasks(roomId: string): Promise<TaskWithVotes[]>;
  addTask(roomId: string, text: string, creatorName: string): Promise<Task>;
  removeTask(taskId: string): Promise<void>;
}

export interface IVoteService {
  castVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote>;
  removeVote(taskId: string, voterName: string): Promise<void>;
}
