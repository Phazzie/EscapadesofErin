'use client';

import { useState, useCallback, useMemo } from 'react';
import type { TaskWithVotes, VoteChoice, IVoteService } from '@/types';

export function useVoting(
  voteService: IVoteService,
  tasks: TaskWithVotes[],
  userName: string | null
) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track user's votes for quick lookup
  const myVotes = useMemo(() => {
    const votes: Record<string, VoteChoice> = {};
    if (!userName) return votes;

    for (const task of tasks) {
      const myVote = task.votes.find(v => v.voterName === userName);
      if (myVote) {
        votes[task.id] = myVote.choice;
      }
    }
    return votes;
  }, [tasks, userName]);

  const castVote = useCallback(async (taskId: string, choice: VoteChoice) => {
    if (!userName) return;
    setIsVoting(true);
    setError(null);
    try {
      // If same choice, remove vote (toggle off)
      if (myVotes[taskId] === choice) {
        await voteService.removeVote(taskId, userName);
      } else {
        await voteService.castVote(taskId, userName, choice);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to cast vote'));
    } finally {
      setIsVoting(false);
    }
  }, [voteService, userName, myVotes]);

  const removeVote = useCallback(async (taskId: string) => {
    if (!userName) return;
    setIsVoting(true);
    setError(null);
    try {
      await voteService.removeVote(taskId, userName);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to remove vote'));
    } finally {
      setIsVoting(false);
    }
  }, [voteService, userName]);

  return {
    myVotes,
    isVoting,
    error,
    castVote,
    removeVote,
  };
}
