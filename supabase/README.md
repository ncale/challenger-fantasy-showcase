# supabase

Hosted Postgres via Supabase. Migrations live in `migrations/` — read them to understand schema history.

## Common Commands

```bash
# Push schema changes and apply repeatable SQL
bun run db:push

# Regenerate TypeScript types from the live schema
bun run typegen

# Run database tests
bun run db:test
```

## Resetting Migration History

Use this when the migration history has drifted from the live schema (a "baseline migration"):

```bash
# 1. Dump the current public schema as a single SQL file
supabase db dump --schema public > supabase/migrations/20260331190707_baseline.sql

# 2. Delete all existing migration files except the baseline
# 3. Tell Supabase the baseline is already applied (don't run it again)
supabase migration repair --status applied 20260331190707
```

A few things to check after dumping:

- The dump won't include `auth` schema triggers — manually add your `handle_new_user` trigger to the baseline or as a separate migration
- Confirm the CLI is linked to the right project before dumping: `supabase status`

---

[← Root](../README.md)
