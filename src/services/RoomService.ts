import type { IRepository, IRoomService, Room } from '@/types';

export class RoomService implements IRoomService {
  constructor(private repository: IRepository) {}

  async joinRoom(word: string): Promise<Room> {
    // Normalize the word
    const normalizedWord = word.trim().toLowerCase();

    // Check if room exists
    const existingRoom = await this.repository.getRoomByWord(normalizedWord);
    if (existingRoom) {
      return existingRoom;
    }

    // Create new room
    return this.repository.createRoom(normalizedWord);
  }
}
