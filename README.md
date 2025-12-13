# Erin's Escapades

A collaborative task management app where people join rooms via a "magic word" and vote yes/no/maybe on tasks.

**Core insight:** Same word = same room. No accounts needed. Just share a word.

## Features

- **Magic Word Rooms**: Type a word like "tacos" and you're in the "tacos" room
- **Task Voting**: Vote Yes / No / Maybe on any task
- **No Backend Required**: Works with just LocalStorage (or optionally Supabase)
- **Real-time Sync**: Cross-tab sync via storage events (full real-time with Supabase)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd EscapadesofErin
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**That's it!** The app works out of the box using LocalStorage - no database setup needed.

## How It Works

1. **Enter a magic word** - Type any word like "tacos", "friday", "adventure"
2. **Enter your name** - Just for display, no account needed
3. **Share the word** - Tell friends "Join tacos" to collaborate
4. **Add tasks** - Type a task and hit Enter
5. **Vote** - Click Yes / No / Maybe on any task

Everyone with the same word sees the same room.

## Deployment

### Vercel (Easiest)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy! (no environment variables needed for LocalStorage mode)

### Optional: Add Supabase for Real-time

If you want real-time sync between different browsers/devices:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL Editor
3. Add environment variables in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage (default) or Supabase (optional)
- **Testing**: Vitest

## Architecture

The app uses a clean seams-based architecture:

```
UI Components (React)
       │
       ▼ Hooks (useRoom, useTasks, useVoting)
Services (RoomService, TaskService, VoteService)
       │
       ▼ Repository Interface
LocalStorageRepository OR SupabaseRepository
```

This makes it easy to:
- Test with mocks
- Swap storage backends
- Add new features

## Project Structure

```
/src
  /app              # Next.js pages
  /components       # React components
  /hooks            # Custom React hooks
  /services         # Business logic
  /repositories     # Data storage
  /types            # TypeScript interfaces
  /mocks            # Test mocks
  /context          # React context (DI)
```

## Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Build for production
npm run build
```

## Database Schema (Supabase only)

```sql
-- Rooms: created when someone enters a magic word
CREATE TABLE rooms (
  id uuid PRIMARY KEY,
  word text UNIQUE NOT NULL,
  created_at timestamptz
);

-- Tasks: belong to a room
CREATE TABLE tasks (
  id uuid PRIMARY KEY,
  room_id uuid REFERENCES rooms(id),
  text text NOT NULL,
  creator_name text NOT NULL,
  created_at timestamptz
);

-- Votes: one per user per task
CREATE TABLE votes (
  id uuid PRIMARY KEY,
  task_id uuid REFERENCES tasks(id),
  voter_name text NOT NULL,
  choice text CHECK (choice IN ('yes', 'no', 'maybe')),
  UNIQUE(task_id, voter_name)
);
```

---

Built for collaborative chaos and organized adventures!
