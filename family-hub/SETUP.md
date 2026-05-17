# FamilyOS Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your Project URL and anon key from **Settings → API**.

## 2. Run the Database Schema

In the Supabase SQL Editor, run the following:

```sql
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id text not null default 'home',
  title text not null,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  recurrence text check (recurrence in ('daily','weekly','monthly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  household_id text not null default 'home',
  date date not null,
  slot text not null check (slot in ('breakfast','lunch','dinner')),
  name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, date, slot)
);

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  household_id text not null default 'home',
  title text not null,
  interval_days integer not null default 7,
  next_due date not null,
  last_completed date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  household_id text not null default 'home',
  title text not null,
  date date not null,
  time text,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS (open for personal use)
alter table public.tasks enable row level security;
alter table public.meals enable row level security;
alter table public.chores enable row level security;
alter table public.events enable row level security;

create policy "public_access" on public.tasks for all using (true) with check (true);
create policy "public_access" on public.meals for all using (true) with check (true);
create policy "public_access" on public.chores for all using (true) with check (true);
create policy "public_access" on public.events for all using (true) with check (true);

alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.meals;
alter publication supabase_realtime add table public.chores;
alter publication supabase_realtime add table public.events;
```

## 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_HOUSEHOLD_ID=home
```

## 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Install on iPhone (PWA)

1. Open the app URL in Safari.
2. Tap the **Share** button (box with arrow up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**.

All devices using the same Supabase project and `NEXT_PUBLIC_HOUSEHOLD_ID` will share data in real-time.

## 6. Sharing with Family

All family members need to use the same:
- Supabase project URL + anon key
- `NEXT_PUBLIC_HOUSEHOLD_ID` value (default: `'home'`)

Deploy to Vercel or any static host, and share the URL. Everyone who opens it will have live-synced data.
