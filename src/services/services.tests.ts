import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IRepository, IRoomService, ITaskService, IVoteService, Room, Task, Vote } from '@/types';

// Mock repository for service tests
function createMockRepository(): IRepository {
  return {
    getRoomByWord: vi.fn(),
    createRoom: vi.fn(),
    getTasksByRoomId: vi.fn(),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    getVotesByTaskId: vi.fn(),
    getVotesByRoomId: vi.fn(),
    upsertVote: vi.fn(),
    deleteVote: vi.fn(),
  };
}

export function roomServiceTests(createService: (repo: IRepository) => IRoomService) {
  describe('RoomService', () => {
    let repo: IRepository;
    let service: IRoomService;

    beforeEach(() => {
      repo = createMockRepository();
      service = createService(repo);
    });

    it('creates room if word is new', async () => {
      const mockRoom: Room = { id: '1', word: 'tacos', createdAt: new Date() };
      vi.mocked(repo.getRoomByWord).mockResolvedValue(null);
      vi.mocked(repo.createRoom).mockResolvedValue(mockRoom);

      const room = await service.joinRoom('tacos');

      expect(repo.getRoomByWord).toHaveBeenCalledWith('tacos');
      expect(repo.createRoom).toHaveBeenCalledWith('tacos');
      expect(room).toEqual(mockRoom);
    });

    it('returns existing room if word exists', async () => {
      const mockRoom: Room = { id: '1', word: 'friday', createdAt: new Date() };
      vi.mocked(repo.getRoomByWord).mockResolvedValue(mockRoom);

      const room = await service.joinRoom('friday');

      expect(repo.getRoomByWord).toHaveBeenCalledWith('friday');
      expect(repo.createRoom).not.toHaveBeenCalled();
      expect(room).toEqual(mockRoom);
    });

    it('normalizes word (lowercase, trimmed)', async () => {
      const mockRoom: Room = { id: '1', word: 'hello', createdAt: new Date() };
      vi.mocked(repo.getRoomByWord).mockResolvedValue(null);
      vi.mocked(repo.createRoom).mockResolvedValue(mockRoom);

      await service.joinRoom('  HELLO  ');

      expect(repo.getRoomByWord).toHaveBeenCalledWith('hello');
    });
  });
}

export function taskServiceTests(createService: (repo: IRepository) => ITaskService) {
  describe('TaskService', () => {
    let repo: IRepository;
    let service: ITaskService;

    beforeEach(() => {
      repo = createMockRepository();
      service = createService(repo);
    });

    it('adds task with creator name', async () => {
      const mockTask: Task = {
        id: '1',
        roomId: 'room1',
        text: 'New task',
        creatorName: 'Alice',
        createdAt: new Date()
      };
      vi.mocked(repo.createTask).mockResolvedValue(mockTask);

      const task = await service.addTask('room1', 'New task', 'Alice');

      expect(repo.createTask).toHaveBeenCalledWith('room1', 'New task', 'Alice');
      expect(task).toEqual(mockTask);
    });

    it('returns tasks with aggregated votes', async () => {
      const mockTasks: Task[] = [
        { id: '1', roomId: 'room1', text: 'Task 1', creatorName: 'Alice', createdAt: new Date() }
      ];
      const mockVotes: Vote[] = [
        { id: 'v1', taskId: '1', voterName: 'Bob', choice: 'yes' },
        { id: 'v2', taskId: '1', voterName: 'Charlie', choice: 'yes' },
        { id: 'v3', taskId: '1', voterName: 'Dave', choice: 'no' },
      ];
      vi.mocked(repo.getTasksByRoomId).mockResolvedValue(mockTasks);
      vi.mocked(repo.getVotesByRoomId).mockResolvedValue(mockVotes);

      const tasks = await service.getTasks('room1');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].voteCounts).toEqual({ yes: 2, no: 1, maybe: 0 });
    });

    it('removes task', async () => {
      vi.mocked(repo.deleteTask).mockResolvedValue();

      await service.removeTask('task1');

      expect(repo.deleteTask).toHaveBeenCalledWith('task1');
    });
  });
}

export function voteServiceTests(createService: (repo: IRepository) => IVoteService) {
  describe('VoteService', () => {
    let repo: IRepository;
    let service: IVoteService;

    beforeEach(() => {
      repo = createMockRepository();
      service = createService(repo);
    });

    it('casts new vote', async () => {
      const mockVote: Vote = { id: 'v1', taskId: 't1', voterName: 'Alice', choice: 'yes' };
      vi.mocked(repo.upsertVote).mockResolvedValue(mockVote);

      const vote = await service.castVote('t1', 'Alice', 'yes');

      expect(repo.upsertVote).toHaveBeenCalledWith('t1', 'Alice', 'yes');
      expect(vote).toEqual(mockVote);
    });

    it('removes vote', async () => {
      vi.mocked(repo.deleteVote).mockResolvedValue();

      await service.removeVote('t1', 'Alice');

      expect(repo.deleteVote).toHaveBeenCalledWith('t1', 'Alice');
    });
  });
}
