-- Fight header and stats function
create or replace function api.fight_header(p_fight_id uuid)
returns table (
  id uuid,
  event_slug text,
  event_name text,
  event_date timestamptz,
  fight_order int,
  weight_class text,
  weight_lbs numeric,
  is_title boolean,
  title_name text,
  result_method text,
  result_round int,
  result_time interval,
  fighter_1_id uuid,
  fighter_1_name text,
  fighter_1_height_in numeric,
  fighter_1_reach_in numeric,
  fighter_1_stance text,
  fighter_1_age interval,
  fighter_2_id uuid,
  fighter_2_name text,
  fighter_2_height_in numeric,
  fighter_2_reach_in numeric,
  fighter_2_stance text,
  fighter_2_age interval,
  winner_fighter_id uuid,
  round_snapshots jsonb
) language sql stable as $$
  with fight_data as (
    select
      f.*,
      e.slug as event_slug,
      e.name as event_name,
      e.event_date
    from fight f
    inner join event e on e.id = f.event_id
    where f.id = p_fight_id
  ),
  fighter_data as (
    select
      f1.id as fighter_1_id,
      f1.full_name as fighter_1_name,
      f1.height_in as fighter_1_height_in,
      f1.reach_in as fighter_1_reach_in,
      f1.stance as fighter_1_stance,
      f1.dob as fighter_1_dob,
      f2.id as fighter_2_id,
      f2.full_name as fighter_2_name,
      f2.height_in as fighter_2_height_in,
      f2.reach_in as fighter_2_reach_in,
      f2.stance as fighter_2_stance,
      f2.dob as fighter_2_dob
    from fight_data fd
    inner join fighter f1 on f1.id = fd.fighter_1_id
    inner join fighter f2 on f2.id = fd.fighter_2_id
  ),
  round_data as (
    select
      jsonb_agg(
        jsonb_build_object(
          'round', round,
          'fighter_1_stats', fighter_1_stats,
          'fighter_2_stats', fighter_2_stats
        ) order by round
      ) as round_snapshots
    from fight_round_snapshot
    where fight_id = p_fight_id
  )
  select
    fd.id,
		fd.event_slug,
		fd.event_name,
		fd.event_date,
		fd.fight_order,
		fd.weight_class,
		fd.weight_lbs,
		fd.is_title,
		fd.title_name,
		fd.result_method,
		fd.result_round,
		fd.result_round_time,
		fid.fighter_1_id,
		fid.fighter_1_name,
		fid.fighter_1_height_in,
		fid.fighter_1_reach_in,
		fid.fighter_1_stance,
		(age(fd.event_date, fid.fighter_1_dob)) as fighter_1_age,
		fid.fighter_2_id,
		fid.fighter_2_name,
		fid.fighter_2_height_in,
		fid.fighter_2_reach_in,
		fid.fighter_2_stance,
    (age(fd.event_date, fid.fighter_2_dob)) as fighter_2_age,
    fd.winner_fighter_id,
    coalesce(rd.round_snapshots, '[]'::jsonb) as round_snapshots
  from fight_data fd
  inner join fighter_data fid on true
  left join round_data rd on true;
$$;
