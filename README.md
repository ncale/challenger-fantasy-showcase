# Challenger Fantasy Showcase

This repo contains extracted, standalone pieces of [**Challenger Fantasy**](https://challengerfantasy.com), a combat-sports fantasy platform I built end-to-end as technical founder. The production codebase is closed-source, but this repo pulls out four representative pieces of the system for review.

## System overview

Challenger Fantasy is a Bun/TypeScript monorepo: a Hono API on Cloudflare Workers backed by Postgres (Supabase), a Redis job queue pipeline (BullMQ) that scrapes and refreshes fight data nightly, a real-time draft engine running on Cloudflare Durable Objects, and shared tooling that generates typed API clients directly from the DB schema. The four demos below are how a single request flows in production: the ETL pipeline (02) keeps the data current, the API layer (01) reads it, the draft engine (03) is a core feature in the API that needed strong consistency on a distributed infrastructure, and the tooling (04) is what provides  across all three.

## What's in here

| Folder                                                    | Focus                                   | Highlights                                                         |
| --------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| [`01-api-and-data-layer/`](./01-api-and-data-layer)       | REST API design, caching, data modeling | P99 latency down 92.5% (~8s → ~600ms)                              |
| [`02-etl-pipeline/`](./02-etl-pipeline)                   | Data engineering                        | 19 years of historical data, idempotent daily refresh              |
| [`03-realtime-draft-engine/`](./03-realtime-draft-engine) | Distributed systems                     | Cloudflare Durable Objects + WebSockets, concurrent lobby matching |
| [`04-monorepo-tooling/`](./04-monorepo-tooling)           | DevOps/tooling                          | Schema → typed API client generation, CI/CD                        |

Each folder has its own README with a short video walkthrough, the problem it solved, key decisions, and pointers to the most relevant files.

## About

This is not the live production repo. It's a curated set of extracts for portfolio review. Production secrets, live-data dependencies, and account-specific identifiers were removed or redacted (marked inline with `// STUBBED:` or a redaction placeholder). Because each folder is a self-contained slice of a larger monorepo, some supporting code (types, schemas, domain logic) is duplicated across folders rather than shared. Nothing here is guaranteed to run standalone.

## Contact

Nick Brodeur — [[email](nicholasbrodeur9@gmail.com) / [LinkedIn](https://www.linkedin.com/in/nicholasbrodeur/)]
