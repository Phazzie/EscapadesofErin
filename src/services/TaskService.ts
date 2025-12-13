import type { IRepository, ITaskService, Task, TaskWithVotes, Vote } from '@/types';

export class TaskService implements ITaskService {
  constructor(private repository: IRepository) {}

  async getTasks(roomId: string): Promise<TaskWithVotes[]> {
    const [tasks, votes] = await Promise.all([
      this.repository.getTasksByRoomId(roomId),
      this.repository.getVotesByRoomId(roomId),
    ]);

    // Group votes by task
    const votesByTask = new Map<string, Vote[]>();
    for (const vote of votes) {
      const taskVotes = votesByTask.get(vote.taskId) || [];
      taskVotes.push(vote);
      votesByTask.set(vote.taskId, taskVotes);
    }

    // Combine tasks with votes
    return tasks.map(task => {
      const taskVotes = votesByTask.get(task.id) || [];
      const voteCounts = { yes: 0, no: 0, maybe: 0 };

      for (const vote of taskVotes) {
        voteCounts[vote.choice]++;
      }

      return {
        ...task,
        votes: taskVotes,
        voteCounts,
      };
    });
  }

  async addTask(roomId: string, text: string, creatorName: string): Promise<Task> {
    return this.repository.createTask(roomId, text, creatorName);
  }

  async removeTask(taskId: string): Promise<void> {
    return this.repository.deleteTask(taskId);
  }
}
