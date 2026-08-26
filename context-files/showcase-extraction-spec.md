# Showcase Repo Extraction Spec

## Goal
Extract code from the Challenger Fantasy monorepo into a new standalone showcase repository. The showcase repo is for portfolio/recruiting purposes — it does not need to run end-to-end, but each node should be internally coherent and clearly documented. Preserve real code and logic wherever possible; only stub out things that depend on production secrets, live data sources, or infra we don't want to expose.

## Target structure

```
showcase-repo/
├── README.md                      (top-level overview, written separately — do not generate)
├── 01-api-and-data-layer/
├── 02-etl-pipeline/
├── 03-realtime-draft-engine/
└── 04-monorepo-tooling/
```

Each node folder should contain its own `README.md` with a short explanation of what it does and why it was built that way (leave a placeholder like `<!-- TODO: notes + video link -->` if the full write-up isn't ready yet).

---

## Node 1: `01-api-and-data-layer/`

**Story:** REST API design + performance optimization (P99 latency reduced ~92.5%, ~8s → ~600ms via edge caching, summary tables, and materialized views).

**Extract:**
- API route/controller files (REST endpoint definitions and handlers)
- Edge caching logic/middleware
- Summary table and materialized view definitions (SQL/migration files)
- Any query-layer code that reads from the summary tables/views
- Relevant schema files needed to understand the data model

**Notes for Claude Code:**
- Preserve directory relationships between routes and their data access code where possible (e.g., keep a `routes/` and `data/` or `queries/` subfolder split).
- Strip out API keys, DB connection strings, and env-specific config — replace with `.env.example` placeholders.
- If caching logic depends on a specific CDN/edge provider config, keep the code but redact any account-specific identifiers.

---

## Node 2: `02-etl-pipeline/`

**Story:** Data engineering — ETL pipeline processing 19 years of historical sports data via BullMQ job queue, with daily refresh jobs and idempotent upserts to handle upstream data corrections.

**Extract:**
- Job adapters (entrypoint/handler files)
- Upsert/idempotency logic
- Refresh job scheduling code (cron config, trigger definitions)
- Any data transformation/normalization logic specific to this pipeline

**Notes for Claude Code:**
- It's fine if this can't run standalone (no live upstream data source) — keep the transformation and upsert logic intact and stub the data-fetch step with a clear comment explaining what it would normally call.
- Include any retry/error-handling logic as-is; this is part of the story (handling upstream corrections).

---

## Node 3: `03-realtime-draft-engine/`

**Story:** Distributed systems — serverless real-time draft engine using Cloudflare Durable Objects and WebSockets, matching concurrent users into draft lobbies with strongly-consistent turn-based state.

**Extract:**
- Durable Object class(es)
- WebSocket connection/message handlers
- Lobby matching/assignment logic
- Turn-based state machine logic

**Notes for Claude Code:**
- This is the most "impressive" node from a systems-design standpoint — prioritize keeping the full state machine and concurrency-handling logic intact over trimming it down.
- Redact any Cloudflare account IDs or deployment-specific config.

---

## Node 4: `04-monorepo-tooling/`

**Story:** DevOps/tooling — monorepo with end-to-end type generation from database schema to API clients, plus CI/CD setup.

**Extract:**
- Type generation scripts/config (schema → types → API client pipeline)
- GitHub Actions workflow YAML files
- Any Docker/containerization config tied to the build/deploy process
- Root-level monorepo config (workspace definitions, build tooling config) if relevant

**Notes for Claude Code:**
- This node doesn't need "runnable app code" — it's a tooling/process showcase. Focus on making the pipeline (schema → types → client) legible as a sequence of files.
- Trim CI/CD YAML to remove any secrets/deployment targets specific to production.

---

## General instructions for Claude Code

1. Do not include `.env` files, API keys, secrets, or production connection strings anywhere.
2. Where a file references removed/stubbed dependencies, leave a clear inline comment (`// STUBBED: originally called <X>`) rather than deleting the reference silently.
3. Keep git history out of scope — this is a fresh copy, not a fork/clone with history.
4. Do not attempt to make the nodes independently `npm install && run` unless asked — the priority is code clarity for a human reader, not runnability.
5. Leave each node's `README.md` mostly empty (title + one-sentence description + TODO placeholder) — detailed write-ups and video walkthroughs will be added manually afterward.
