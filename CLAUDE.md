# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Challenger Fantasy is a Bun-based TypeScript monorepo for a combat sports fantasy platform. It consists of multiple applications: web app (React), stats dashboard (React), marketing site (Astro), mobile app (React Native/Expo), API server (Hono on Cloudflare Workers), and data ingestion pipeline.

## Commands

```bash
# Install dependencies
bun i

# Development servers (run from package directories)
cd packages/webapp && bun run dev      # Main web app (port 5173)
cd packages/worker && bun run dev      # API server
cd packages/landing && bun run dev     # Marketing site
cd packages/stats-webapp && bun run dev # Stats dashboard
cd packages/mobile && bun start        # Mobile app

# Code quality (from root)
bun run check                          # Lint and format with Biome
bun run lint                           # Lint only
bun run format                         # Format only

# Tests
bun test                               # Run all tests
bun test path/to/file.test.ts          # Run single test file

# Database
bun run typegen                        # Generate types from Supabase schema
bun run db:push                        # Push schema changes
bun run db:test                        # Run database tests
```

## Architecture

**Monorepo packages** (all use `@challenger-fantasy/*` namespace):
- `packages/core` - Shared utilities, services, data-client
- `packages/types` - TypeScript types (generated from Supabase via `bun run typegen`)
- `packages/schemas` - Zod validation schemas
- `packages/models` - Data models
- `packages/parsers` - HTML/DOM parsing utilities
- `packages/webapp` - Main React app (TanStack Router/Query, Cloudflare Pages)
- `packages/stats-webapp` - Stats dashboard (Vite + React)
- `packages/worker` - Hono API server (Cloudflare Workers)
- `packages/mobile` - React Native app (Expo)
- `packages/drain` - Data ingestion pipeline (Google Cloud)
- `packages/landing` - Marketing site (Astro)
- `packages/devtools` - Development scripts

**Key patterns**:
- API client exported from `packages/worker/src/api-client.ts` for type-safe frontend consumption
- Business logic in `packages/core/src/services/`
- Database access via `packages/core/src/lib/data-client.ts`
- Supabase migrations in `/supabase/migrations/`

## Code Standards

- Never use `any` or type assertions in TypeScript
- Use Bun for all package management and execution
- Use Zod for runtime validation (schemas go in `packages/schemas`)
- Use Tailwind v4 for frontend styling
- Component naming: PascalCase (e.g., `MyComponent.tsx`)
- Biome handles linting/formatting with `noExplicitAny: error`
