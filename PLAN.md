# Erin's Escapades - Implementation Plan

## Framework Choice: Next.js 14 (App Router)

**Why Next.js:**
- Zero-config Vercel deployment
- API routes = natural seams between UI ↔ Data
- TypeScript-first for strong contracts
- Easy dependency injection for mocking

---

## Phase 1: Seams (Architectural Boundaries)

Three clear boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                             │
│   (React Components - pages, forms, task lists, voting)     │
└─────────────────────────┬───────────────────────────────────┘
                          │ Seam 1: Hooks/Context
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
│   (RoomService, TaskService, VoteService)                   │
│   - Business logic lives here                               │
│   - Swappable implementations (mock vs real)                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Seam 2: Repository Interface
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                         │
│   (SupabaseRepository implements IRepository)               │
│   - Database operations only                                │
│   - Can swap for InMemoryRepository in tests                │
└─────────────────────────────────────────────────────────────┘
```

### Seam 1: UI ↔ Services
- Components call hooks (useRoom, useTasks, useVotes)
- Hooks use service instances from context
- Services can be swapped via React Context

### Seam 2: Services ↔ Repository
- Services call repository methods
- Repository interface is the contract
- Can inject MockRepository or SupabaseRepository

---

## Phase 2: Contracts (TypeScript Interfaces)

### 2.1 Entity Types

```typescript
// types/entities.ts

interface Room {
  id: string;
  word: string;
  createdAt: Date;
}

interface Task {
  id: string;
  roomId: string;
  text: string;
  creatorName: string;
  createdAt: Date;
}

interface Vote {
  id: string;
  taskId: string;
  voterName: string;
  choice: 'yes' | 'no' | 'maybe';
}

// Aggregated view for UI
interface TaskWithVotes extends Task {
  votes: Vote[];
  voteCounts: { yes: number; no: number; maybe: number };
}
```

### 2.2 Repository Contract

```typescript
// types/repository.ts

interface IRepository {
  // Rooms
  getRoomByWord(word: string): Promise<Room | null>;
  createRoom(word: string): Promise<Room>;

  // Tasks
  getTasksByRoomId(roomId: string): Promise<Task[]>;
  createTask(roomId: string, text: string, creatorName: string): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;

  // Votes
  getVotesByTaskId(taskId: string): Promise<Vote[]>;
  getVotesByRoomId(roomId: string): Promise<Vote[]>;
  upsertVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote>;
  deleteVote(taskId: string, voterName: string): Promise<void>;

  // Realtime (optional - only Supabase impl)
  subscribeToRoom?(roomId: string, callbacks: RealtimeCallbacks): () => void;
}
```

### 2.3 Service Contracts

```typescript
// types/services.ts

interface IRoomService {
  joinRoom(word: string): Promise<Room>;
}

interface ITaskService {
  getTasks(roomId: string): Promise<TaskWithVotes[]>;
  addTask(roomId: string, text: string, creatorName: string): Promise<Task>;
  removeTask(taskId: string): Promise<void>;
}

interface IVoteService {
  castVote(taskId: string, voterName: string, choice: VoteChoice): Promise<Vote>;
  removeVote(taskId: string, voterName: string): Promise<void>;
}
```

### 2.4 Hook Contracts (UI Layer)

```typescript
// types/hooks.ts

interface UseRoomResult {
  room: Room | null;
  isLoading: boolean;
  error: Error | null;
  joinRoom: (word: string) => Promise<void>;
  leaveRoom: () => void;
}

interface UseTasksResult {
  tasks: TaskWithVotes[];
  isLoading: boolean;
  error: Error | null;
  addTask: (text: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
}

interface UseVotingResult {
  castVote: (taskId: string, choice: VoteChoice) => Promise<void>;
  removeVote: (taskId: string) => Promise<void>;
  myVotes: Record<string, VoteChoice>; // taskId -> choice
}
```

---

## Phase 3: Tests (Before Implementation)

### 3.1 Repository Tests
```typescript
// __tests__/repository.test.ts
describe('IRepository', () => {
  describe('Rooms', () => {
    it('creates a room with the given word')
    it('returns null for non-existent room')
    it('returns existing room by word')
    it('handles duplicate word gracefully')
  })

  describe('Tasks', () => {
    it('creates a task in a room')
    it('returns all tasks for a room')
    it('returns empty array for room with no tasks')
    it('deletes a task')
  })

  describe('Votes', () => {
    it('creates a vote')
    it('updates existing vote (upsert)')
    it('returns all votes for a task')
    it('deletes a vote')
    it('enforces one vote per user per task')
  })
})
```

### 3.2 Service Tests
```typescript
// __tests__/services.test.ts
describe('RoomService', () => {
  it('creates room if word is new')
  it('returns existing room if word exists')
  it('normalizes word (lowercase, trimmed)')
})

describe('TaskService', () => {
  it('adds task with creator name')
  it('returns tasks with aggregated votes')
  it('calculates vote counts correctly')
  it('removes task and associated votes')
})

describe('VoteService', () => {
  it('casts new vote')
  it('changes existing vote')
  it('removes vote')
})
```

### 3.3 Hook Tests
```typescript
// __tests__/hooks.test.ts
describe('useRoom', () => {
  it('starts with no room')
  it('joins room and updates state')
  it('handles join errors')
  it('leaves room and clears state')
})

describe('useTasks', () => {
  it('loads tasks on mount')
  it('adds task optimistically')
  it('handles add errors with rollback')
  it('removes task optimistically')
})

describe('useVoting', () => {
  it('tracks current user votes')
  it('casts vote optimistically')
  it('toggles vote off when same choice')
})
```

### 3.4 Integration Tests
```typescript
// __tests__/integration.test.ts
describe('Full Flow', () => {
  it('two users join same room via word')
  it('user A adds task, user B sees it')
  it('user A votes, user B sees vote count')
  it('user changes vote from yes to no')
})
```

---

## Phase 4: Mocks

### 4.1 In-Memory Repository Mock

```typescript
// mocks/InMemoryRepository.ts
class InMemoryRepository implements IRepository {
  private rooms: Map<string, Room> = new Map();
  private tasks: Map<string, Task> = new Map();
  private votes: Map<string, Vote> = new Map();

  // Implement all IRepository methods using Maps
  // This is used for unit tests and local development
}
```

### 4.2 Service Mocks (for Hook Tests)

```typescript
// mocks/mockServices.ts
const createMockRoomService = (): IRoomService => ({
  joinRoom: vi.fn(),
});

const createMockTaskService = (): ITaskService => ({
  getTasks: vi.fn(),
  addTask: vi.fn(),
  removeTask: vi.fn(),
});

const createMockVoteService = (): IVoteService => ({
  castVote: vi.fn(),
  removeVote: vi.fn(),
});
```

### 4.3 Test Utilities

```typescript
// mocks/testUtils.ts
function createTestRoom(overrides?: Partial<Room>): Room
function createTestTask(overrides?: Partial<Task>): Task
function createTestVote(overrides?: Partial<Vote>): Vote
function seedRepository(repo: IRepository, data: SeedData): Promise<void>
```

---

## Phase 5: Real Implementation

### 5.1 File Structure

```
/src
  /types
    entities.ts       # Room, Task, Vote types
    repository.ts     # IRepository interface
    services.ts       # Service interfaces
    hooks.ts          # Hook return types

  /repositories
    IRepository.ts    # Interface export
    InMemoryRepository.ts  # For tests
    SupabaseRepository.ts  # Real implementation

  /services
    RoomService.ts
    TaskService.ts
    VoteService.ts

  /hooks
    useRoom.ts
    useTasks.ts
    useVoting.ts
    useSession.ts     # Current user name

  /context
    ServiceContext.tsx  # DI container for services

  /components
    MagicWordForm.tsx
    TaskList.tsx
    TaskItem.tsx
    VoteButtons.tsx
    AddTaskForm.tsx

  /app
    page.tsx          # Landing / magic word entry
    /room
      /[word]
        page.tsx      # Room view with tasks

  /lib
    supabase.ts       # Supabase client

/__tests__
  /repositories
  /services
  /hooks
  /integration

/mocks
  InMemoryRepository.ts
  mockServices.ts
  testUtils.ts
```

### 5.2 Implementation Order

1. **Types** (contracts) - all interfaces
2. **InMemoryRepository** - mock implementation
3. **Services** - using repository interface
4. **Run repository + service tests** with mocks
5. **Hooks** - using service interfaces
6. **Run hook tests** with mock services
7. **SupabaseRepository** - real database
8. **UI Components** - wire everything up
9. **Run integration tests**
10. **Deploy to Vercel**

---

## Phase 6: Database Schema

```sql
-- supabase-schema.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Rooms table
create table rooms (
  id uuid primary key default uuid_generate_v4(),
  word text unique not null,
  created_at timestamptz default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade,
  text text not null,
  creator_name text not null,
  created_at timestamptz default now()
);

-- Votes table
create table votes (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade,
  voter_name text not null,
  choice text not null check (choice in ('yes', 'no', 'maybe')),
  created_at timestamptz default now(),
  unique(task_id, voter_name)
);

-- Indexes for performance
create index idx_rooms_word on rooms(word);
create index idx_tasks_room_id on tasks(room_id);
create index idx_votes_task_id on votes(task_id);

-- Enable real-time
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table votes;

-- RLS Policies (permissive for simplicity)
alter table rooms enable row level security;
alter table tasks enable row level security;
alter table votes enable row level security;

create policy "Anyone can read rooms" on rooms for select using (true);
create policy "Anyone can create rooms" on rooms for insert with check (true);

create policy "Anyone can read tasks" on tasks for select using (true);
create policy "Anyone can create tasks" on tasks for insert with check (true);
create policy "Anyone can delete tasks" on tasks for delete using (true);

create policy "Anyone can read votes" on votes for select using (true);
create policy "Anyone can create votes" on votes for insert with check (true);
create policy "Anyone can update votes" on votes for update using (true);
create policy "Anyone can delete votes" on votes for delete using (true);
```

---

## Execution Checklist

### Step 1: Project Setup
- [ ] Initialize Next.js with TypeScript
- [ ] Install dependencies (vitest, @testing-library/react, supabase-js)
- [ ] Configure Vitest
- [ ] Set up folder structure

### Step 2: Contracts
- [ ] Write all TypeScript interfaces
- [ ] Export from types/index.ts

### Step 3: Tests (red phase)
- [ ] Write repository tests
- [ ] Write service tests
- [ ] Write hook tests
- [ ] All tests should fail (no implementation yet)

### Step 4: Mocks
- [ ] Implement InMemoryRepository
- [ ] Create mock services
- [ ] Create test utilities

### Step 5: Services (green phase)
- [ ] Implement RoomService
- [ ] Implement TaskService
- [ ] Implement VoteService
- [ ] Service tests pass

### Step 6: Hooks
- [ ] Implement useRoom
- [ ] Implement useTasks
- [ ] Implement useVoting
- [ ] Implement useSession
- [ ] Hook tests pass

### Step 7: Real Repository
- [ ] Set up Supabase client
- [ ] Implement SupabaseRepository
- [ ] Create SQL schema file

### Step 8: UI
- [ ] Build MagicWordForm
- [ ] Build TaskList + TaskItem
- [ ] Build VoteButtons
- [ ] Build AddTaskForm
- [ ] Wire up pages

### Step 9: Deploy
- [ ] Create .env.example
- [ ] Test build locally
- [ ] Deploy to Vercel
- [ ] Add env vars in Vercel
- [ ] Apply schema to Supabase

---

## Quick Start Commands

```bash
# Initialize project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install deps
npm install @supabase/supabase-js
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Dev server
npm run dev

# Build
npm run build
```
