'use client';

import type { VoteChoice } from '@/types';

interface VoteButtonsProps {
  voteCounts: { yes: number; no: number; maybe: number };
  myVote?: VoteChoice;
  onVote: (choice: VoteChoice) => void;
  disabled?: boolean;
}

export function VoteButtons({ voteCounts, myVote, onVote, disabled }: VoteButtonsProps) {
  const buttons: { choice: VoteChoice; label: string; color: string; activeColor: string }[] = [
    { choice: 'yes', label: 'Yes', color: 'bg-green-100 text-green-700 hover:bg-green-200', activeColor: 'bg-green-500 text-white' },
    { choice: 'no', label: 'No', color: 'bg-red-100 text-red-700 hover:bg-red-200', activeColor: 'bg-red-500 text-white' },
    { choice: 'maybe', label: 'Maybe', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', activeColor: 'bg-yellow-500 text-white' },
  ];

  return (
    <div className="flex gap-2">
      {buttons.map(({ choice, label, color, activeColor }) => (
        <button
          key={choice}
          onClick={() => onVote(choice)}
          disabled={disabled}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            myVote === choice ? activeColor : color
          } disabled:opacity-50`}
        >
          {label} {voteCounts[choice] > 0 && `(${voteCounts[choice]})`}
        </button>
      ))}
    </div>
  );
}
