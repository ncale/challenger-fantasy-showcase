


-- DEPRECATED: this view is getting phased out in favor of using the events.ufcstats_external_id column directly
create or replace view ops.scheduled_events 
with (security_invoker = true, security_barrier = true)
as
select 
  e.id,
  e.name,
  e.slug,
  e.status,
  a.external_id
from "public"."event" e
join "public"."alias" a on a.internal_id = e.id
where e.status = 'scheduled'
  and a.entity_type = 'event';

alter view ops.scheduled_events owner to db_owner;
grant select on ops.scheduled_events to service_role;



create or replace view ops.aliased_fights
with (security_invoker = true, security_barrier = true)
as
with aliased_fights_data as (
  select 
    f.*,
    a.external_id as fight_external_id
  from fight f
  join alias a on a.internal_id = f.id
  where a.entity_type = 'fight'
  and a.source = 'ufcstats'
)
select * from aliased_fights_data;

alter view ops.aliased_fights owner to db_owner;
grant select on ops.aliased_fights to service_role;



create or replace view ops.aliased_events
with (security_invoker = true, security_barrier = true)
as
with aliased_events_data as (
  select 
    e.*,
    a.external_id as event_external_id
  from event e
  join alias a on a.internal_id = e.id
  where a.entity_type = 'event'
  and a.source = 'ufcstats'
)
select * from aliased_events_data;

alter view ops.aliased_events owner to db_owner;
grant select on ops.aliased_events to service_role;
