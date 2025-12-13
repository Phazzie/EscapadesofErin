import { describe } from 'vitest';
import { VoteService } from './VoteService';
import { voteServiceTests } from './services.tests';
import type { IRepository } from '@/types';

describe('VoteService', () => {
  voteServiceTests((repo: IRepository) => new VoteService(repo));
});
