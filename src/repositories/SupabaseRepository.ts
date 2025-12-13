import { supabase } from '@/lib/supabase';
import type { IRepository, Room, Task, Vote, VoteChoice, RealtimeCallbacks } from '@/types';

export class SupabaseRepository implements IRepository {
  async getRoomByWord(word: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('word', word)
      .single();

    if (error || !data) return null;
    return this.mapRoom(data);
  }

  async createRoom(word: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert({ word })
      .select()
      .single();

    if (error) throw new Error(`Failed to create room: ${error.message}`);
    return this.mapRoom(data);
  }

  async getTasksByRoomId(roomId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get tasks: ${error.message}`);
    return (data || []).map(this.mapTask);
  }

  async createTask(roomId: string, text: string, creatorName: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ room_id: roomId, text, creator_name: creatorName })
      .select()
      .single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);
    return this.mapTask(data);
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw new Error(`Failed to delete task: ${error.message}`);
  }

  async getVotesByTaskId(taskId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('task_id', taskId);

    if (error) throw new Error(`Failed to get votes: ${error.message}`);
    return (data || []).map(this.mapVote);
  }

  async getVotesByRoomId(roomId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*, tasks!inner(room_id)')
      .eq('tasks.room_id', roomId);

    if (error) throw new Error(`Failed to get votes: ${error.message}`);
    return (data || []).map(this.mapVote);
  }

  async upsertVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote> {
    const { data, error } = await supabase
      .from('votes')
      .upsert(
        { task_id: taskId, voter_name: voterName, choice },
        { onConflict: 'task_id,voter_name' }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert vote: ${error.message}`);
    return this.mapVote(data);
  }

  async deleteVote(taskId: string, voterName: string): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('task_id', taskId)
      .eq('voter_name', voterName);

    if (error) throw new Error(`Failed to delete vote: ${error.message}`);
  }

  subscribeToRoom(roomId: string, callbacks: RealtimeCallbacks): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks', filter: `room_id=eq.${roomId}` },
        (payload) => callbacks.onTaskAdded?.(this.mapTask(payload.new))
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks', filter: `room_id=eq.${roomId}` },
        (payload) => callbacks.onTaskDeleted?.(payload.old.id)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            callbacks.onVoteChanged?.(this.mapVote(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Map database records to our types
  private mapRoom(data: any): Room {
    return {
      id: data.id,
      word: data.word,
      createdAt: new Date(data.created_at),
    };
  }

  private mapTask(data: any): Task {
    return {
      id: data.id,
      roomId: data.room_id,
      text: data.text,
      creatorName: data.creator_name,
      createdAt: new Date(data.created_at),
    };
  }

  private mapVote(data: any): Vote {
    return {
      id: data.id,
      taskId: data.task_id,
      voterName: data.voter_name,
      choice: data.choice,
    };
  }
}
