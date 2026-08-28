
alter type public.fight_result rename to fight_result_enum;
alter type public.single_fighter_fight_result rename to single_fighter_fight_result_enum;

create table if not exists public.fight_result (
  fight_id uuid primary key references public.fight(id) on delete cascade,
  method text,
  round int4,
  round_time interval,
  details text,
  referee text,
  result fight_result_enum,
	fighter_1_stats jsonb,
	fighter_2_stats jsonb,
	created_at timestamptz default now()
);
