create table public.hero_fighter_game (
  id uuid primary key default gen_random_uuid(),
	event_id uuid not null references public.event(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hero_fighter_game owner to db_owner;

create table public.hero_fighter_game_entry (
  id uuid primary key default gen_random_uuid(),
  hero_fighter_game_id uuid not null references public.hero_fighter_game(id),
  head_fighter_id uuid not null references public.fighter(id),
	chest_fighter_id uuid not null references public.fighter(id),
	aura_fighter_id uuid not null references public.fighter(id),
	arms_fighter_id uuid not null references public.fighter(id),
	legs_fighter_id uuid not null references public.fighter(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hero_fighter_game_entry owner to db_owner;