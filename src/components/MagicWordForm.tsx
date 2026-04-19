'use client';

import { useState } from 'react';

interface MagicWordFormProps {
  onJoin: (word: string, name: string) => void;
  isLoading?: boolean;
}

export function MagicWordForm({ onJoin, isLoading }: MagicWordFormProps) {
  const [word, setWord] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && name.trim()) {
      onJoin(word.trim(), name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Erin&apos;s Escapades
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Enter a magic word to join a room
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magic Word
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="tacos, friday, adventure..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={!word.trim() || !name.trim() || isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Same word = same room. Share it with friends!
        </p>
      </div>
    </div>
  );
}
