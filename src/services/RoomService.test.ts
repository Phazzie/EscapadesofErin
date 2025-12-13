import { describe } from 'vitest';
import { RoomService } from './RoomService';
import { roomServiceTests } from './services.tests';
import type { IRepository } from '@/types';

describe('RoomService', () => {
  roomServiceTests((repo: IRepository) => new RoomService(repo));
});
