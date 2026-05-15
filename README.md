# UrLabs Kanban

A full-stack Kanban task management application built on the [Frontend Mentor](https://www.frontendmentor.io) premium challenge design. Boards, columns, and tasks are persisted in a cloud PostgreSQL database via Supabase, with real-time drag-and-drop for reordering and moving tasks.

![Design preview](./preview.jpg)

## Features

- **Full-stack stack** — Nuxt 3 (Vue 3) frontend, Nitro server API, Drizzle ORM, and Supabase (PostgreSQL)
- **Full CRUD** — Create, read, update, and delete **boards**, **columns**, and **tasks** via Nitro API routes backed by Drizzle ORM and Supabase PostgreSQL
- **Form validation** — Required fields for board names, column names, task titles, and subtasks; empty subtask rows must be filled or removed before submit
- **Loading states** — `AppSpinner` on submit buttons during all create/edit/delete operations, with success/error toasts via vue-sonner
- **Drag and drop** — Move tasks between columns and reorder within a column (bonus)
- **Persistent storage** — Data stored in Supabase instead of `localStorage`
- **Responsive layout** — Optimized for mobile and desktop
- **Dark / light mode** — Theme toggle with persisted preference
- **Sidebar** — Show/hide board navigation

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Nuxt 3](https://nuxt.com/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Database | PostgreSQL ([Supabase](https://supabase.com/)) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Notifications | [vue-sonner](https://vue-sonner.vercel.app/) |

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project with PostgreSQL connection string

### Environment

Create a `.env` file in the project root:

```env
DATABASE_URL=your_supabase_postgres_connection_string
```

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm run preview
```

## Project structure

```
app/
  components/     # UI components and modals
  stores/         # Pinia board store
server/
  api/            # Nitro API routes
    boards/       # GET, POST, PATCH, DELETE
    tasks/        # GET, POST, PATCH, DELETE
  database/       # Drizzle schema
```

## API endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/boards` | List all boards with columns, tasks, and subtasks |
| `POST` | `/api/boards` | Create a board and its initial columns |
| `PATCH` | `/api/boards/:id` | Update board title; add, rename, or delete columns |
| `DELETE` | `/api/boards/:id` | Delete a board (cascades to columns, tasks, subtasks) |
| `GET` | `/api/tasks` | List tasks (if used) |
| `POST` | `/api/tasks` | Create a task with optional subtasks |
| `PATCH` | `/api/tasks/:id` | Update task fields or move between columns |
| `DELETE` | `/api/tasks/:id` | Delete a task and its subtasks |

Board and column changes are reflected immediately in the Pinia store without a page refresh.

## Form validation behaviour

- **Task title** — Required; shows a red border and “Can't be empty” when invalid
- **Subtasks** — Every subtask row must have a non-empty title before create/edit; empty rows show validation errors until filled or removed with the × button
- **Board / column names** — Required on create and edit board modals and when adding columns

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## License

Design assets from Frontend Mentor are for personal use only and must not be redistributed.
