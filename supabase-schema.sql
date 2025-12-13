-- Erin's Escapades Database Schema
-- Run this in your Supabase SQL Editor

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

-- RLS Policies (permissive for simplicity - just you and one other person)
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
