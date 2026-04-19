'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { IRepository, IRoomService, ITaskService, IVoteService } from '@/types';
import { SupabaseRepository, LocalStorageRepository } from '@/repositories';
import { RoomService, TaskService, VoteService } from '@/services';

interface Services {
  repository: IRepository;
  roomService: IRoomService;
  taskService: ITaskService;
  voteService: IVoteService;
}

const ServiceContext = createContext<Services | null>(null);

// Use Supabase if configured, otherwise fall back to LocalStorage
function createRepository(): IRepository {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
    return new SupabaseRepository();
  }

  // Default: LocalStorage (no backend needed!)
  return new LocalStorageRepository();
}

export function ServiceProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => {
    const repository = createRepository();
    return {
      repository,
      roomService: new RoomService(repository),
      taskService: new TaskService(repository),
      voteService: new VoteService(repository),
    };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
