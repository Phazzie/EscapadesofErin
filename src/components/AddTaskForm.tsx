'use client';

import { useState } from 'react';

interface AddTaskFormProps {
  onAdd: (text: string) => void;
  disabled?: boolean;
}

export function AddTaskForm({ onAdd, disabled }: AddTaskFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="px-6 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Add
      </button>
    </form>
  );
}
