-- service_role 
-- - ops functions
grant usage on schema public, ops, api to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant execute on all functions in schema ops, api to service_role;
grant select on all tables in schema ops, api to service_role;

-- db_owner



-- see permissions for a specific role

-- WITH "names"("name") AS (
--   SELECT n.nspname AS "name"
--     FROM pg_catalog.pg_namespace n
--       WHERE n.nspname !~ '^pg_'
--         AND n.nspname <> 'information_schema'
-- ) 
-- SELECT "name",
--   pg_catalog.has_schema_privilege('service_role', "name", 'CREATE') AS "create",
--   pg_catalog.has_schema_privilege('service_role', "name", 'USAGE') AS "usage"
-- FROM "names";