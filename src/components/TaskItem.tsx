'use client';

import type { TaskWithVotes, VoteChoice } from '@/types';
import { VoteButtons } from './VoteButtons';

interface TaskItemProps {
  task: TaskWithVotes;
  myVote?: VoteChoice;
  onVote: (choice: VoteChoice) => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function TaskItem({ task, myVote, onVote, onDelete, canDelete }: TaskItemProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-800 font-medium">{task.text}</p>
          <p className="text-gray-400 text-sm">by {task.creatorName}</p>
        </div>
        {canDelete && onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition"
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <VoteButtons voteCounts={task.voteCounts} myVote={myVote} onVote={onVote} />
    </div>
  );
}
