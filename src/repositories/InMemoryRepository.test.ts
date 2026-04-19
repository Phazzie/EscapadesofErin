import { describe } from 'vitest';
import { InMemoryRepository } from '@/mocks/InMemoryRepository';
import { repositoryTests } from './repository.tests';

// Run all repository tests against InMemoryRepository
describe('InMemoryRepository', () => {
  repositoryTests(() => new InMemoryRepository());
});
