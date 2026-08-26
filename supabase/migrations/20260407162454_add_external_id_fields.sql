alter table public.event
  add column if not exists ufcstats_external_id text null,
  add constraint event_ufcstats_external_id_key unique (ufcstats_external_id);

alter table public.fight
  add column if not exists ufcstats_external_id text null,
  add constraint fight_ufcstats_external_id_key unique (ufcstats_external_id);

alter table public.fighter
  add column if not exists ufcstats_external_id text null,
  add constraint fighter_ufcstats_external_id_key unique (ufcstats_external_id);