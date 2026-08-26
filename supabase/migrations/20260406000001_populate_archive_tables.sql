INSERT INTO public.event_archive
  (id, org_id, slug, name, start_time, venue, city, country, status,
   state_or_region, short_name, prelims_start_time, main_card_start_time,
   event_date, created_at, updated_at)
SELECT
  id, org_id, slug, name, start_time, venue, city, country, status,
  state_or_region, short_name, prelims_start_time, main_card_start_time,
  event_date, created_at, updated_at
FROM public.event;

INSERT INTO public.fighter_archive
  (id, slug, full_name, nickname, country, stance, height_in, reach_in,
   dob, weight_lbs, flags, search_priority, created_at, updated_at)
SELECT
  id, slug, full_name, nickname, country, stance, height_in, reach_in,
  dob, weight_lbs, flags, search_priority, created_at, updated_at
FROM public.fighter;

INSERT INTO public.fight_archive
  (id, event_id, fighter_1_id, fighter_2_id, weight_class, weight_lbs,
   is_title, title_name, rounds_scheduled, time_format, fight_order,
   status, slug, created_at, updated_at)
SELECT
  id, event_id, fighter_1_id, fighter_2_id, weight_class, weight_lbs,
  is_title, title_name, rounds_scheduled, time_format, fight_order,
  status, slug, created_at, updated_at
FROM public.fight;

INSERT INTO public.fight_result_archive
  (fight_id, method, round, round_time, details, referee, result,
   fighter_1_stats, fighter_2_stats, created_at)
SELECT
  fight_id, method, round, round_time, details, referee, result,
  fighter_1_stats, fighter_2_stats, created_at
FROM public.fight_result;

INSERT INTO public.fight_round_snapshot_archive
  (id, fight_id, round, fighter_1_stats, fighter_2_stats, created_at, updated_at)
SELECT
  id, fight_id, round, fighter_1_stats, fighter_2_stats, created_at, updated_at
FROM public.fight_round_snapshot;
