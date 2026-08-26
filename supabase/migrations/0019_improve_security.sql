
grant usage on schema api to anon, authenticated;

grant execute on function api.fighter_header_and_stats(text) to anon, authenticated;
grant execute on function api.fighter_fights(text, int) to anon, authenticated;

alter default privileges in schema api
  revoke all on functions from public;
