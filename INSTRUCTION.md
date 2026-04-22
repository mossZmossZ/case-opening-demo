# INSTRUCTION.md — Zenith Case Opening Demo

## Roles

| Role | Person | Responsibility |
|------|--------|----------------|
| **Staff Engineer / CEO** | You (Human) | Final decisions, architecture approval, priority calls, business logic validation. If AI has any question or point of concern — **ask the CEO before proceeding.** |
| **Senior Software Engineer (AI)** | Claude | Programming, design implementation, production-grade architecture, code reviews, DevOps. Knowledge covers frontend, backend, infra, and observability. |

> **Standing rule:** If the AI encounters ambiguity, a risky tradeoff, or a decision that could affect cost/timeline/UX — stop and ask the CEO. Do not assume.

---

## Project Overview

**Zenith Case Opening Demo** — A lucky-draw / case-opening web application for corporate events (e.g., Nutanix Cloud Native & AI Innovation Day).

### User Flow
1. **Welcome** — Enter name + select number of attempts
2. **Game** — Spin a reel (weighted random) to land on a prize
3. **Result** — Reveal the prize with tier-based animations
4. **Summary** — Show all results, highlight best reward, play again

### Admin Flow
1. **Login** — Authenticate (username/password)
2. **Dashboard** — Overview stats, recent activity
3. **Prizes** — Manage prize inventory (CRUD, stock tracking)
4. **Probability** — Adjust drop rates per tier (common/rare/epic/legendary)
5. **History** — View all user opens with filters

---

## Source Materials

| File | Purpose |
|------|---------|
| `stitch_case_opening_demo/zenith_forge/DESIGN.md` | Design system ("The Kinetic Foundry") — colors, typography, components |
| `stitch_case_opening_demo/zenith_case_opening_landing/` | Stitch UI: Landing page (code.html + screen.png) |
| `stitch_case_opening_demo/zenith_case_opening_reel/` | Stitch UI: Reel spinning page (code.html + screen.png) |
| `stitch_case_opening_demo/zenith_prize_reveal/` | Stitch UI: Prize reveal page (code.html + screen.png) |
| `stitch_case_opening_demo/Case Opening - Claude.html` | Full logic prototype — all screens + admin dashboard in one React file |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS |
| Backend | Node.js (Express) |
| Database | MongoDB (Mongoose) |
| Cache (Phase 3+) | Redis |
| Observability (Phase 4) | Istio, Kiali, Jaeger |
| Container | Docker |
| Orchestration (Phase 4) | Kubernetes |

---

## Phase Roadmap

Each phase is documented in detail in a separate file to **save context and tokens** (lazy-load pattern).

| Phase | Summary | Architecture | Deployment | Detail File |
|-------|---------|-------------|------------|-------------|
| **1** | Monolith — Frontend + Backend + MongoDB | Single Node.js server serves React + API | `npm install` local | [docs/phase-1.md](docs/phase-1.md) |
| **2** | Split frontend/backend containers | React (nginx) + Node.js API + MongoDB | Docker Compose | [docs/phase-2.md](docs/phase-2.md) |
| **3** | Microservices + Redis cache | Auth, Game, Admin, Prize services | Docker Compose | [docs/phase-3.md](docs/phase-3.md) |
| **4** | Full K8s + Observability | All services + Istio mesh + Jaeger + Kiali | Kubernetes | [docs/phase-4.md](docs/phase-4.md) |

> **Read only the phase file you are currently working on.** This keeps token usage low.

---

## Architecture & Tasks

| Document | Purpose |
|----------|---------|
| [architecture.md](architecture.md) | Architecture diagrams for all 4 phases |
| [task.md](task.md) | Full task breakdown with clear acceptance criteria |

---

## Current State (Phase 1 — as of 2026-04-22)

Phase 1 is **complete and running**. Full monolith stack is live on local `npm run dev`.

### What's built
- **Frontend** — React + Vite + Tailwind CSS. All 4 user screens (Welcome, Game, Result, Summary) and full Admin dashboard (Login, Overview, Prizes, Probability, History).
- **Backend** — Express API with all game + admin endpoints. Server-side weighted random, session management, JWT admin auth.
- **Database** — MongoDB with Mongoose. Models: User, Session, Prize, AdminUser. Seed script populates defaults.
- **Docker Compose** — `docker-compose.yml` wires frontend (nginx), backend, and MongoDB.

### Design theme (CEO-approved)
- **White + Orange** formal theme (overrides original dark "Kinetic Foundry" spec)
- Fonts: **Lato** (all weights) — set via Tailwind config and index.css
- Welcome page: viewport-locked (`lg:h-screen`), no scroll on 1920×1080. Layout: compact heading → image + form side-by-side → stats bar → footer.
- All pages: white surfaces, `#E06020` orange primary, charcoal `#1A1410` footer.

### Known decisions & constraints
- `GET /api/game/stats` is a **public** endpoint — returns `participants`, `totalOpens`, `liveDrops`, `inventory`. Same data as admin dashboard but no auth required.
- Stats route must remain **before** `export default router` in `server/src/routes/game.js` (ordering bug fix applied 2026-04-22).
- Welcome page initial state must include `participants: 0, totalOpens: 0` to prevent undefined → 0 display on load.
- Prize `imageUrl` is stored as a base64 data URL in MongoDB (Phase 1 simplicity — no separate file storage service). Uploaded via the Admin › Prizes form; displayed in the spin reel. If no image is uploaded, the reel card shows **no graphic** (only the prize name).

---

## Key Design Decisions

1. **Weighted random on server** — The prototype does client-side random. Production must do server-side weighted random to prevent manipulation.
2. **Prize inventory tracking** — Admin sets total stock; server decrements on each win. Out-of-stock prizes are excluded from the pool.
3. **Tier system** — 4 tiers: Common, Rare, Epic, Legendary. Each has distinct color/glow/animation per DESIGN.md.
4. **Admin auth** — Phase 1: simple JWT. Phase 3+: dedicated auth microservice.
5. **Design theme** — CEO overrode original dark industrial theme. Current: white + orange formal (Lato font, warm surfaces, `#E06020` primary).

---

## Lazy-Load Convention

To minimize token/context cost:
- **INSTRUCTION.md** (this file) = always loaded, provides overview and pointers
- **docs/phase-N.md** = loaded only when working on that phase
- **architecture.md** = loaded when reviewing or planning architecture
- **task.md** = loaded when picking up or reviewing tasks

**Rule:** Never read all docs at once. Read only what the current task requires.

---

## Communication Protocol

- AI asks CEO before: changing DB schema, adding new dependencies, altering user flow, modifying deployment strategy
- AI proceeds autonomously on: implementing approved tasks, writing tests, fixing lint/build errors, refactoring within scope
- When in doubt: ask. The cost of a question is near zero; the cost of a wrong assumption can be a full rewrite.
