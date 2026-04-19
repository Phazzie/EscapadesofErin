import { describe, it, expect, beforeEach } from 'vitest';
import type { IRepository } from '@/types';

// Tests that any IRepository implementation must pass
export function repositoryTests(createRepository: () => IRepository) {
  describe('IRepository', () => {
    let repo: IRepository;

    beforeEach(() => {
      repo = createRepository();
    });

    describe('Rooms', () => {
      it('returns null for non-existent room', async () => {
        const room = await repo.getRoomByWord('nonexistent');
        expect(room).toBeNull();
      });

      it('creates a room with the given word', async () => {
        const room = await repo.createRoom('tacos');
        expect(room.word).toBe('tacos');
        expect(room.id).toBeDefined();
      });

      it('returns existing room by word', async () => {
        const created = await repo.createRoom('friday');
        const found = await repo.getRoomByWord('friday');
        expect(found).toEqual(created);
      });
    });

    describe('Tasks', () => {
      it('returns empty array for room with no tasks', async () => {
        const room = await repo.createRoom('empty');
        const tasks = await repo.getTasksByRoomId(room.id);
        expect(tasks).toEqual([]);
      });

      it('creates a task in a room', async () => {
        const room = await repo.createRoom('work');
        const task = await repo.createTask(room.id, 'Buy groceries', 'Alice');
        expect(task.text).toBe('Buy groceries');
        expect(task.creatorName).toBe('Alice');
        expect(task.roomId).toBe(room.id);
      });

      it('returns all tasks for a room', async () => {
        const room = await repo.createRoom('tasks');
        await repo.createTask(room.id, 'Task 1', 'Alice');
        await repo.createTask(room.id, 'Task 2', 'Bob');
        const tasks = await repo.getTasksByRoomId(room.id);
        expect(tasks).toHaveLength(2);
      });

      it('deletes a task', async () => {
        const room = await repo.createRoom('delete');
        const task = await repo.createTask(room.id, 'To delete', 'Alice');
        await repo.deleteTask(task.id);
        const tasks = await repo.getTasksByRoomId(room.id);
        expect(tasks).toHaveLength(0);
      });
    });

    describe('Votes', () => {
      it('creates a vote', async () => {
        const room = await repo.createRoom('votes');
        const task = await repo.createTask(room.id, 'Vote on this', 'Alice');
        const vote = await repo.upsertVote(task.id, 'Bob', 'yes');
        expect(vote.choice).toBe('yes');
        expect(vote.voterName).toBe('Bob');
      });

      it('updates existing vote (upsert)', async () => {
        const room = await repo.createRoom('upsert');
        const task = await repo.createTask(room.id, 'Change vote', 'Alice');
        await repo.upsertVote(task.id, 'Bob', 'yes');
        const updated = await repo.upsertVote(task.id, 'Bob', 'no');
        expect(updated.choice).toBe('no');
        const votes = await repo.getVotesByTaskId(task.id);
        expect(votes).toHaveLength(1);
      });

      it('returns all votes for a task', async () => {
        const room = await repo.createRoom('allvotes');
        const task = await repo.createTask(room.id, 'Many votes', 'Alice');
        await repo.upsertVote(task.id, 'Bob', 'yes');
        await repo.upsertVote(task.id, 'Charlie', 'no');
        const votes = await repo.getVotesByTaskId(task.id);
        expect(votes).toHaveLength(2);
      });

      it('deletes a vote', async () => {
        const room = await repo.createRoom('delvote');
        const task = await repo.createTask(room.id, 'Delete vote', 'Alice');
        await repo.upsertVote(task.id, 'Bob', 'yes');
        await repo.deleteVote(task.id, 'Bob');
        const votes = await repo.getVotesByTaskId(task.id);
        expect(votes).toHaveLength(0);
      });

      it('returns votes by room', async () => {
        const room = await repo.createRoom('roomvotes');
        const task1 = await repo.createTask(room.id, 'Task 1', 'Alice');
        const task2 = await repo.createTask(room.id, 'Task 2', 'Alice');
        await repo.upsertVote(task1.id, 'Bob', 'yes');
        await repo.upsertVote(task2.id, 'Bob', 'no');
        const votes = await repo.getVotesByRoomId(room.id);
        expect(votes).toHaveLength(2);
      });
    });
  });
}
