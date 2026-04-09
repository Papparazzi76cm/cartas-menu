create table public.saved_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  menu_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_menus enable row level security;

create policy "Allow public read" on public.saved_menus for select using (true);
create policy "Allow public insert" on public.saved_menus for insert with check (true);
create policy "Allow public update" on public.saved_menus for update using (true);
create policy "Allow public delete" on public.saved_menus for delete using (true);