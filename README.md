# Challenger Fantasy — Code Showcase

A curated excerpt of the backend for [Challenger Fantasy](https://challengerfantasy.com/) — a real-time combat sports fantasy platform. This repo shows the architecture, data layer, and real-time systems behind the product. Some packages are simplified, redacted, or omitted entirely — see [What's not here](#whats-not-here) below.

**This is not a buildable or complete copy of the product.** It's a portfolio excerpt shared to illustrate design decisions and implementation patterns.

---

## What this demonstrates

| Feature / Service                           | Explanation                                                                                                                                                                                                                                  | Link                                                                                                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Serverless real-time draft engine           | Each draft is a single source of truth held in one durable object (DO). Using the WebSocket Hibernation API, connections won't keep the object pinned in memory, so state is persisted to DO storage on every change and rehydrated on wake. | [`Draft Manager Durable Object`](/packages/worker/src/durable-objects/draft-manager.ts), [`Draft Server Durable Object`](/packages/worker/src/durable-objects/draft-server.ts) |
| REST API with edge caching & authentication | REST endpoints are hosted on the cloudflare edge.                                                                                                                                                                                            | [`Routes`](/packages/worker/src/app.ts)                                                                                                                                        |

---

## What's not here

A few things are intentionally omitted or simplified:

- **Many adapters and HTML parsers** (`adapters`, `parsers`) — the orchestration pattern is demonstrated with one sanitized example adapter; real scrape targets, selectors, and anti-detection logic are excluded to protect the live product and respect third-party terms of service.
- **Mobile app and frontends** — this repo focuses on backend/data architecture.
- **Business logic** — most domain-specific logic in `core`/`shared` is simplified or left out.

---

## Links

- Landing page: [Challenger Fantasy](https://challengerfantasy.com/)
- App store page: [Challenger Fantasy Sports](https://apps.apple.com/us/app/challenger-fantasy-sports/id6761962188)

---

*Code shared for portfolio and demonstration purposes. Not licensed for reuse or redistribution.*