import { describe } from 'vitest';
import { TaskService } from './TaskService';
import { taskServiceTests } from './services.tests';
import type { IRepository } from '@/types';

describe('TaskService', () => {
  taskServiceTests((repo: IRepository) => new TaskService(repo));
});
