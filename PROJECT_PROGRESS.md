# Vector Kanban — Project Progress

Production-grade full-stack Kanban application — **Nuxt 4**, **PostgreSQL**, **Drizzle ORM**, **Supabase Auth**, and secure Nuxt server routes.

See also: [README.md](./README.md) · [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md)

---

## Phase 1 — Core Frontend

- [x] Setup Nuxt 4
- [x] Responsive layout (sidebar, header, board view)
- [x] Dark mode / theme switch
- [x] Board list in sidebar
- [x] Switch active board
- [x] Create board
- [x] Edit board
- [x] Delete board
- [x] Render columns
- [x] Add column
- [x] Remove column
- [x] Add task
- [x] Task details modal
- [x] Edit task
- [x] Delete task
- [x] Subtasks (create, toggle completion, progress display)
- [x] Drag & drop (reorder within and across columns)

---

## Phase 2 — Persistence & Database

- [x] PostgreSQL database (Supabase-hosted)
- [x] Drizzle ORM schema (`boards`, `columns`, `tasks`, `subtasks`)
- [x] Relational definitions and eager-loading queries
- [x] Deep cascade deletes (board → column → task → subtask)
- [x] Ordered columns and tasks (`order` integer fields)
- [x] Multi-user row-level integrity (`user_id` on boards and columns)

---

## Phase 3 — UX

- [x] Drag-and-drop task reordering (`vuedraggable`)
- [x] Optimistic Pinia store updates during drag
- [x] Persisted reorder via batch API after drop
- [x] Toast error feedback on failed API calls

---

## Backend Core & Security

- [x] Secure Nuxt Server Routes Integration
- [x] Session Validation with `serverSupabaseUser` / `resolveSessionUser` via UUID (`user.sub`)
- [x] Backend Relational Ownership Validation (preventing ID parameter spoofing)
- [x] Atomic Batch Task Reordering via Drizzle Transaction Handler
- [x] Granular Subtask PATCH/DELETE Endpoints adhering to Single Responsibility Principle

### API Routes Implemented

**Boards**

- [x] `GET /api/boards` — list boards with nested relations (user-scoped)
- [x] `POST /api/boards` — create board
- [x] `PATCH /api/boards/[id]` — update board
- [x] `DELETE /api/boards/[id]` — delete board

**Columns**

- [x] `POST /api/columns` — create column
- [x] `PATCH /api/columns/[id]` — update column
- [x] `DELETE /api/columns/[id]` — delete column

**Tasks**

- [x] `GET /api/tasks` — list tasks
- [x] `GET /api/tasks/[id]` — get task
- [x] `POST /api/tasks` — create task
- [x] `PATCH /api/tasks/[id]` — update task
- [x] `DELETE /api/tasks/[id]` — delete task
- [x] `POST /api/tasks/reorder` — atomic batch reorder (transaction)

**Subtasks**

- [x] `POST /api/subtasks` — create subtask
- [x] `PATCH /api/subtasks/[id]` — update subtask
- [x] `DELETE /api/subtasks/[id]` — delete subtask

---

## Frontend Persistence & Guards

- [x] Pinia Store Integration with Global API Dispatchers
- [x] Unified Client/Server Router Navigation Guards (Middleware)
- [x] Atomic Store State Mutation during Client Drag & Drop Action

### Store & Client Details

- [x] `loadBoards()` — fetch from `GET /api/boards`
- [x] Board / column / task / subtask CRUD via `$fetch` to server routes
- [x] `buildTasksReorderPayload()` + `reorderTasksAfterDrag()` — POST batch after drag
- [x] Global auth middleware (`auth.global.ts`) — redirect to `/login` when unauthenticated
- [x] Supabase session hydration on client before route decision

---

## Authentication

- [x] Supabase Auth module (`@nuxtjs/supabase`)
- [x] Login page and session management
- [x] Server-side session resolution on all protected API handlers
- [x] Per-user board isolation (`user_id` scoping)
- [x] `401 Unauthorized` for missing or invalid sessions

---

## Quality Assurance & Maintenance

- [x] Server route integration tests (Vitest + `@nuxt/test-utils`)
- [x] `NUXT_TEST=true` mocked auth via `x-test-user-sub`
- [x] Column create + `401` unauthenticated coverage (`tests/server/columns.spec.ts`)
- [x] Reorder validation coverage (`tests/server/reorder.spec.ts`)

### Future Test Coverage (Phase 8+)

- [ ] Board CRUD with ownership checks
- [ ] Task CRUD and extended reorder edge cases
- [ ] Subtask PATCH / DELETE isolation specs
- [ ] Auth middleware redirect behavior (guest → login, authed → home)

---

## Phase 8 — Future Product Vision

- [ ] Realtime synchronization (Supabase Replication Channels)
- [ ] Dynamic task categorization, labels, and smart filtering
- [ ] Due-date reminders with server-side background crons

---

## Overall Status

| Area | Progress |
|------|----------|
| Frontend MVP | Complete |
| Database & ORM | Complete |
| Server API | Complete |
| Authentication | Complete |
| Quality Assurance (core integration) | Complete |
| Future extensions | Planned |
