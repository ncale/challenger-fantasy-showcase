
-- no implicit access anywhere
revoke all on schema public     from public;
revoke all on schema api        from public;
revoke all on schema reporting  from public;
revoke all on schema ops        from public;

-- no implicit default access
alter default privileges for role db_owner in schema public    revoke all on tables    from public;
alter default privileges for role db_owner in schema public    revoke all on sequences from public;
alter default privileges for role db_owner in schema api       revoke all on routines  from public;
alter default privileges for role db_owner in schema api       revoke all on tables    from public;
alter default privileges for role db_owner in schema reporting revoke all on tables    from public;


revoke all on all tables    in schema public, ops, api, reporting from public;
revoke all on all routines  in schema public, ops, api, reporting from public;
revoke all on all sequences in schema public, ops, api, reporting from public;
