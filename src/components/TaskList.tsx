'use client';

import type { TaskWithVotes, VoteChoice } from '@/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: TaskWithVotes[];
  myVotes: Record<string, VoteChoice>;
  onVote: (taskId: string, choice: VoteChoice) => void;
  onDelete: (taskId: string) => void;
  currentUser: string;
}

export function TaskList({ tasks, myVotes, onVote, onDelete, currentUser }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No tasks yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          myVote={myVotes[task.id]}
          onVote={(choice) => onVote(task.id, choice)}
          onDelete={() => onDelete(task.id)}
          canDelete={task.creatorName === currentUser}
        />
      ))}
    </div>
  );
}
