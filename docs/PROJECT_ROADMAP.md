# Vector-Kanban App — Development Roadmap

A production-grade, multi-user Kanban system built on **Nuxt 4**, **Vue 3**, **Pinia**, **PostgreSQL**, **Drizzle ORM**, and **Supabase Auth**.

---

## Phase 1 — Core Frontend (MVP)

**Status:** 100% Complete

**Goal:** Build a fully working frontend Kanban system.

| Area | Deliverables |
|------|--------------|
| **Layout** | Responsive layout, sidebar, board list, header, theme switch |
| **Boards** | Display boards in sidebar, switch boards, create / edit / delete |
| **Columns** | Render columns, add column, remove column |
| **Tasks** | Add task, view task modal, edit task, delete task, change task status |
| **Subtasks** | Create subtasks, toggle completion, show progress |

---

## Phase 2 — Persistence & Modern Core Database (Postgres & Drizzle ORM)

**Status:** 100% Complete

**Goal:** Replace ephemeral client storage with a durable, relational persistence layer.

| Deliverable | Status |
|-------------|--------|
| PostgreSQL database (hosted via Supabase) | Done |
| Drizzle ORM schema & relations (`server/database/schema.ts`) | Done |
| Deep cascading deletes (`boards → columns → tasks → subtasks`) | Done |
| Ordered entities (`columns.order`, `tasks.order`) | Done |
| `user_id` scoping on boards and columns for multi-tenant isolation | Done |

### Architecture Notes — Multi-User Row-Level Integrity

- Every **board** and **column** row carries a `user_id` (UUID) tied to the authenticated Supabase user (`user.sub`).
- Server routes never trust client-supplied IDs alone; each mutation verifies that the target resource belongs to the requesting user before reading or writing.
- Relational queries use Drizzle `with` eager loading so a single authenticated `GET /api/boards` returns the full nested graph (boards → columns → tasks → subtasks) scoped to the current user.
- Foreign keys enforce referential integrity at the database level; cascade rules prevent orphaned rows when parent entities are deleted.

---

## Phase 3 — UX Improvements

**Status:** 100% Complete

**Goal:** Polish interaction and visual feedback.

| Deliverable | Status |
|-------------|--------|
| Drag-and-drop tasks (`vuedraggable`) | Done |
| Reorder tasks inside and across columns | Done |
| Optimistic local store updates during drag | Done |
| Toast notifications for API errors (`vue-sonner`) | Done |

---

## Phase 4 — Server API Layer (Nuxt Server Routes)

**Status:** 100% Complete

**Goal:** Expose a secure, RESTful API via Nuxt `server/api/` handlers.

All routes validate the Supabase session server-side and enforce relational ownership before mutating data.

### Boards (`server/api/boards/`)

| Method | Route | Action | Status |
|--------|-------|--------|--------|
| GET | `/api/boards` | List boards (nested columns, tasks, subtasks) for authenticated user | Done |
| POST | `/api/boards` | Create board | Done |
| PATCH | `/api/boards/[id]` | Update board title | Done |
| DELETE | `/api/boards/[id]` | Delete board (cascades) | Done |

### Columns (`server/api/columns/`)

| Method | Route | Action | Status |
|--------|-------|--------|--------|
| POST | `/api/columns` | Create column on owned board | Done |
| PATCH | `/api/columns/[id]` | Update column | Done |
| DELETE | `/api/columns/[id]` | Delete column (cascades tasks) | Done |

### Tasks (`server/api/tasks/`)

| Method | Route | Action | Status |
|--------|-------|--------|--------|
| GET | `/api/tasks` | List tasks (scoped) | Done |
| GET | `/api/tasks/[id]` | Get single task | Done |
| POST | `/api/tasks` | Create task in owned column | Done |
| PATCH | `/api/tasks/[id]` | Update task fields | Done |
| DELETE | `/api/tasks/[id]` | Delete task (cascades subtasks) | Done |
| POST | `/api/tasks/reorder` | Atomic batch reorder (transaction) | Done |

### Subtasks (`server/api/subtasks/`)

| Method | Route | Action | Status |
|--------|-------|--------|--------|
| POST | `/api/subtasks` | Create subtask on owned task | Done |
| PATCH | `/api/subtasks/[id]` | Update subtask (title / completion) | Done |
| DELETE | `/api/subtasks/[id]` | Delete subtask | Done |

---

## Phase 5 — Backend Data Model & Relational Guarantees

**Status:** 100% Complete

**Goal:** Model the domain in PostgreSQL with strict ownership and ordering semantics.

### Schema Overview

| Table | Key Fields | Relationships |
|-------|------------|---------------|
| `boards` | `id`, `title`, `user_id`, `created_at` | → many `columns` |
| `columns` | `id`, `title`, `order`, `board_id`, `user_id` | → many `tasks` |
| `tasks` | `id`, `title`, `description`, `order`, `column_id` | → many `subtasks` |
| `subtasks` | `id`, `title`, `is_completed`, `task_id` | belongs to `task` |

### Completed Backend Capabilities

- Full CRUD for boards, columns, tasks, and subtasks
- Relational ownership validation on every write (prevents ID parameter spoofing)
- Atomic batch task reordering via Drizzle transaction handler (`POST /api/tasks/reorder`)
- Granular subtask PATCH / DELETE endpoints (single-responsibility per route file)
- Consistent `401 Unauthorized` responses when session is missing or invalid

---

## Phase 6 — Authentication (Supabase)

**Status:** 100% Complete

**Goal:** Secure multi-user access with server-side session validation.

| Deliverable | Status |
|-------------|--------|
| Supabase Auth integration (`@nuxtjs/supabase`) | Done |
| `serverSupabaseUser` validation on every protected API route | Done |
| User identity via `user.sub` (UUID) for row-level scoping | Done |
| Global auth middleware (`app/middleware/auth.global.ts`) | Done |
| Login / logout flow with route guards (redirect unauthenticated users) | Done |
| Per-user board isolation (no cross-user data leakage) | Done |

---

## Phase 7 — Quality Assurance & Testing

**Status:** In Progress

**Goal:** Establish confidence in API contracts, auth boundaries, and client navigation.

| Deliverable | Status |
|-------------|--------|
| Server route integration tests (CRUD, ownership, reorder) | Pending |
| Validation of UI client routing transitions (auth middleware) | Pending |
| End-to-end drag-and-drop persistence verification | Pending |
| Error-path coverage (401, 403, 400 responses) | Pending |

---

## Progress Summary

| Phase | Description | Progress |
|-------|-------------|----------|
| Phase 1 | Core Frontend (MVP) | 100% |
| Phase 2 | Persistence & Core Database (Postgres & Drizzle) | 100% |
| Phase 3 | UX Improvements | 100% |
| Phase 4 | Server API Layer | 100% |
| Phase 5 | Backend Data Model & Relational Guarantees | 100% |
| Phase 6 | Authentication (Supabase) | 100% |
| Phase 7 | Quality Assurance & Testing | In Progress |

---

## Project Vision

**Final goal:** A full-stack, production-ready Kanban productivity system.

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 |
| UI | Vue 3, Pinia |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Supabase (server-side session validation) |
| API | Nuxt Server Routes (`server/api/`) |

**Suitable for:** personal productivity, small teams, and portfolio showcase of modern full-stack engineering practices.
