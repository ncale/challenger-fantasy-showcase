create view scheduled_events as
select 
  e.id,
  e.name,
  e.slug,
  e.status,
  a.external_id
from event e
join alias a on a.internal_id = e.id
where e.status = 'scheduled'
  and a.entity_type = 'event'
