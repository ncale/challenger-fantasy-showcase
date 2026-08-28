#!/usr/bin/env bash
# Step 1: generate raw TypeScript types straight from the live Postgres schema
# (Supabase project ref redacted). Run via `bun run typegen:db` from the repo root.

bunx supabase gen types typescript \
  --project-id <SUPABASE_PROJECT_REF> \
  --schema public,api,ops,reporting \
  > packages/types/src/generated.ts
