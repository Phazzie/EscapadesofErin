import type { IRepository, IVoteService, Vote, VoteChoice } from '@/types';

export class VoteService implements IVoteService {
  constructor(private repository: IRepository) {}

  async castVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote> {
    return this.repository.upsertVote(taskId, voterName, choice);
  }

  async removeVote(taskId: string, voterName: string): Promise<void> {
    return this.repository.deleteVote(taskId, voterName);
  }
}
