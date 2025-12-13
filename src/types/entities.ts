export interface Room {
  id: string;
  word: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  roomId: string;
  text: string;
  creatorName: string;
  createdAt: Date;
}

export type VoteChoice = 'yes' | 'no' | 'maybe';

export interface Vote {
  id: string;
  taskId: string;
  voterName: string;
  choice: VoteChoice;
}

export interface TaskWithVotes extends Task {
  votes: Vote[];
  voteCounts: { yes: number; no: number; maybe: number };
}
