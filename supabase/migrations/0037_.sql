alter table "event" drop column tz;
alter table "event" add column short_name text;


alter table "drain_lock" rename to "ingest_lock";

alter table "ingest_lock" add column lock_name text;
