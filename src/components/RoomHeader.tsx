'use client';

interface RoomHeaderProps {
  word: string;
  userName: string;
  onLeave: () => void;
}

export function RoomHeader({ word, userName, onLeave }: RoomHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Room: <span className="text-purple-600">{word}</span>
          </h1>
          <p className="text-sm text-gray-500">Logged in as {userName}</p>
        </div>
        <button
          onClick={onLeave}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
