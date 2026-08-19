begin;
select plan(40);

-- Test schema permissions for db_owner
select ok(has_schema_privilege('db_owner', 'public', 'CREATE'),    'db_owner can CREATE in public schema');
select ok(has_schema_privilege('db_owner', 'public', 'USAGE'),     'db_owner can USE public schema');
select ok(has_schema_privilege('db_owner', 'api', 'CREATE'),       'db_owner can CREATE in api schema');
select ok(has_schema_privilege('db_owner', 'api', 'USAGE'),        'db_owner can USE api schema');
select ok(has_schema_privilege('db_owner', 'ops', 'CREATE'),       'db_owner can CREATE in ops schema');
select ok(has_schema_privilege('db_owner', 'ops', 'USAGE'),        'db_owner can USE ops schema');
select ok(has_schema_privilege('db_owner', 'reporting', 'CREATE'), 'db_owner can CREATE in reporting schema');
select ok(has_schema_privilege('db_owner', 'reporting', 'USAGE'),  'db_owner can USE reporting schema');

-- Test schema permissions for postgres
select ok(has_schema_privilege('postgres', 'public', 'CREATE'),    'postgres can CREATE in public schema');
select ok(has_schema_privilege('postgres', 'public', 'USAGE'),     'postgres can USE public schema');
select ok(has_schema_privilege('postgres', 'api', 'CREATE'),       'postgres can CREATE in api schema');
select ok(has_schema_privilege('postgres', 'api', 'USAGE'),        'postgres can USE api schema');
select ok(has_schema_privilege('postgres', 'ops', 'CREATE'),       'postgres can CREATE in ops schema');
select ok(has_schema_privilege('postgres', 'ops', 'USAGE'),        'postgres can USE ops schema');
select ok(has_schema_privilege('postgres', 'reporting', 'CREATE'), 'postgres can CREATE in reporting schema');
select ok(has_schema_privilege('postgres', 'reporting', 'USAGE'),  'postgres can USE reporting schema');

-- Test schema permissions for anon
select ok(not has_schema_privilege('anon', 'public', 'CREATE'),    'anon cannot CREATE in public schema');
select ok(has_schema_privilege('anon', 'public', 'USAGE'),         'anon can USE public schema');
select ok(not has_schema_privilege('anon', 'api', 'CREATE'),       'anon cannot CREATE in api schema');
select ok(has_schema_privilege('anon', 'api', 'USAGE'),            'anon can USE api schema');
select ok(not has_schema_privilege('anon', 'ops', 'CREATE'),       'anon cannot CREATE in ops schema');
select ok(not has_schema_privilege('anon', 'ops', 'USAGE'),        'anon cannot USE ops schema');
select ok(not has_schema_privilege('anon', 'reporting', 'CREATE'), 'anon cannot CREATE in reporting schema');
select ok(not has_schema_privilege('anon', 'reporting', 'USAGE'),  'anon cannot USE reporting schema');

-- Test schema permissions for authenticated
select ok(not has_schema_privilege('authenticated', 'public', 'CREATE'),    'authenticated cannot CREATE in public schema');
select ok(has_schema_privilege('authenticated', 'public', 'USAGE'),         'authenticated can USE public schema');
select ok(not has_schema_privilege('authenticated', 'api', 'CREATE'),       'authenticated cannot CREATE in api schema');
select ok(has_schema_privilege('authenticated', 'api', 'USAGE'),            'authenticated can USE api schema');
select ok(not has_schema_privilege('authenticated', 'ops', 'CREATE'),       'authenticated cannot CREATE in ops schema');
select ok(not has_schema_privilege('authenticated', 'ops', 'USAGE'),        'authenticated cannot USE ops schema');
select ok(not has_schema_privilege('authenticated', 'reporting', 'CREATE'), 'authenticated cannot CREATE in reporting schema');
select ok(not has_schema_privilege('authenticated', 'reporting', 'USAGE'),  'authenticated cannot USE reporting schema');

-- Test schema permissions for ops_exec
select ok(not has_schema_privilege('ops_exec', 'public', 'CREATE'),    'ops_exec cannot CREATE in public schema');
select ok(not has_schema_privilege('ops_exec', 'public', 'USAGE'),     'ops_exec cannot USE public schema');
select ok(not has_schema_privilege('ops_exec', 'api', 'CREATE'),       'ops_exec cannot CREATE in api schema');
select ok(not has_schema_privilege('ops_exec', 'api', 'USAGE'),        'ops_exec cannot USE api schema');
select ok(not has_schema_privilege('ops_exec', 'ops', 'CREATE'),       'ops_exec cannot CREATE in ops schema');
select ok(has_schema_privilege('ops_exec', 'ops', 'USAGE'),            'ops_exec can USE ops schema');
select ok(not has_schema_privilege('ops_exec', 'reporting', 'CREATE'), 'ops_exec cannot CREATE in reporting schema');
select ok(not has_schema_privilege('ops_exec', 'reporting', 'USAGE'),  'ops_exec cannot USE reporting schema');

select * from finish();
rollback;
