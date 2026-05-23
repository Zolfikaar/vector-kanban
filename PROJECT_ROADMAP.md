# Vector Kanban — Project Roadmap

Production-grade, multi-user Kanban system on **Nuxt 4**, **Vue 3**, **Pinia**, **PostgreSQL**, **Drizzle ORM**, and **Supabase Auth**.

For granular checklists, see [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md). For architecture and setup, see [README.md](./README.md).

---

## Delivery Status Overview

| Phase | Focus | Status |
|-------|--------|--------|
| Phase 1 | Frontend Core (MVP) | **100% Done** |
| Phase 2 | Postgres + Drizzle Layer | **100% Done** |
| Phase 3 | UX — Drag & Drop | **100% Done** |
| Phase 4 | Nitro Server API | **100% Done** |
| Phase 5 | Backend Data Model & Guarantees | **100% Done** |
| Phase 6 | Supabase Server Auth | **100% Done** |
| Phase 7 | Vitest Integration Tests | **100% Done** |
| Phase 8 | Future Product Vision | Planned |

---

## Phase 1 — Frontend Core (MVP)

**Status: 100% Done**

**Goal:** Ship a fully interactive Kanban UI aligned with the product design.

| Area | Deliverables |
|------|--------------|
| Layout | Responsive shell, sidebar, header, theme switch |
| Boards | List, switch, create, edit, delete |
| Columns | Render, add, remove |
| Tasks | Create, view modal, edit, delete, status changes |
| Subtasks | Create, toggle completion, progress display |

---

## Phase 2 — Postgres + Drizzle Layer

**Status: 100% Done**

**Goal:** Replace ephemeral client storage with a durable, relational persistence layer on Supabase PostgreSQL.

| Deliverable | Status |
|-------------|--------|
| Supabase-hosted PostgreSQL | Done |
| Drizzle schema & relations (`server/database/schema.ts`) | Done |
| Deep cascading deletes (`boards → columns → tasks → subtasks`) | Done |
| Ordered entities (`columns.order`, `tasks.order`) | Done |
| `user_id` scoping on boards and columns | Done |

### Multi-User Row-Level Integrity

- Every **board** and **column** carries `user_id` tied to the authenticated Supabase user (`user.sub`).
- Server routes never trust client-supplied IDs alone; mutations verify resource ownership before read/write.
- `GET /api/boards` returns the full nested graph scoped to the current user via Drizzle `with` eager loading.
- Foreign keys and cascade rules prevent orphaned rows at the database level.

---

## Phase 3 — UX Improvements

**Status: 100% Done**

| Deliverable | Status |
|-------------|--------|
| Drag-and-drop (`vuedraggable`) | Done |
| Reorder within and across columns | Done |
| Optimistic Pinia updates during drag | Done |
| Toast notifications on API errors (`vue-sonner`) | Done |

---

## Phase 4 — Server API Layer (Nitro)

**Status: 100% Done**

RESTful handlers under `server/api/` with server-side session validation and ownership checks on every write.

### Boards

| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/boards` | Done |
| POST | `/api/boards` | Done |
| PATCH | `/api/boards/[id]` | Done |
| DELETE | `/api/boards/[id]` | Done |

### Columns

| Method | Route | Status |
|--------|-------|--------|
| POST | `/api/columns` | Done |
| PATCH | `/api/columns/[id]` | Done |
| DELETE | `/api/columns/[id]` | Done |

### Tasks

| Method | Route | Status |
|--------|-------|--------|
| GET | `/api/tasks` | Done |
| GET | `/api/tasks/[id]` | Done |
| POST | `/api/tasks` | Done |
| PATCH | `/api/tasks/[id]` | Done |
| DELETE | `/api/tasks/[id]` | Done |
| POST | `/api/tasks/reorder` | Done |

### Subtasks

| Method | Route | Status |
|--------|-------|--------|
| POST | `/api/subtasks` | Done |
| PATCH | `/api/subtasks/[id]` | Done |
| DELETE | `/api/subtasks/[id]` | Done |

---

## Phase 5 — Backend Data Model & Relational Guarantees

**Status: 100% Done**

| Table | Key Fields | Relationships |
|-------|------------|---------------|
| `boards` | `id`, `title`, `user_id`, `created_at` | → many `columns` |
| `columns` | `id`, `title`, `order`, `board_id`, `user_id` | → many `tasks` |
| `tasks` | `id`, `title`, `description`, `order`, `column_id` | → many `subtasks` |
| `subtasks` | `id`, `title`, `is_completed`, `task_id` | → `task` |

**Completed capabilities:** full CRUD, ownership validation (anti–ID spoofing), atomic batch reorder via Drizzle transaction, granular subtask endpoints, consistent `401` for invalid sessions.

---

## Phase 6 — Supabase Server Auth

**Status: 100% Done**

| Deliverable | Status |
|-------------|--------|
| `@nuxtjs/supabase` integration | Done |
| `serverSupabaseUser` / `resolveSessionUser` on protected routes | Done |
| Identity via `user.sub` (UUID) for row scoping | Done |
| Global auth middleware | Done |
| Login / logout and route guards | Done |
| Per-user board isolation | Done |

---

## Phase 7 — Vitest Integration Tests

**Status: 100% Done**

**Goal:** Automated confidence in API contracts, auth boundaries, and validation paths.

| Deliverable | Status |
|-------------|--------|
| Vitest + `@nuxt/test-utils` (Nuxt 4 / Nitro 4) | Done |
| `NUXT_TEST=true` with `x-test-user-sub` mocked sessions | Done |
| happy-dom `domEnvironment` in Vitest config | Done |
| Server route specs (`tests/server/`) | Done |
| Reorder validation & auth coverage | Done |
| Column create / 401 unauthenticated coverage | Done |

Run the suite: `npm run test`

---

## Phase 8 — Future Product Vision & Extensions

**Status: Planned**

**Architectural baseline (done):** Board edits are **title-only** (`PATCH /api/boards/:id`). Column lifecycle (add / edit / delete) is isolated to dedicated UI flows and `/api/columns` endpoints. See **[ROADMAP.md](./ROADMAP.md)** for the next board-centric expansion track (metadata, collaboration, styling, audit log).

High-value enhancements beyond the production core:

- [ ] Implement **Realtime Synchronization** using Supabase Replication Channels.
- [ ] Add **Dynamic Task Categorization**, multi-colored labels, and smart query filtering.
- [ ] Introduce **Due-Date Reminders** with server-side background crons.

---

## Project Vision

**North star:** A full-stack, production-ready Kanban productivity platform suitable for personal use, small teams, and portfolio demonstration of modern Nuxt 4 engineering.

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 |
| UI | Vue 3, Pinia |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase (server-side session validation) |
| API | Nitro 4 (`server/api/`) |
| QA | Vitest, @nuxt/test-utils, happy-dom |
