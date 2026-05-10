🗺 Kanban Task App — Development Roadmap
Phase 1 — Core Frontend (MVP)

Goal: Build a fully working frontend Kanban system.

Layout
 Responsive layout
 Sidebar
 Board list
 Header
 Theme switch
Boards
 Load boards from data.json
 Display boards in sidebar
 Switch boards
 Create board
 Edit board
 Delete board
Columns
 Render columns
 Add column
 Remove column
Tasks
 Add task
 View task modal
 Edit task
 Delete task
 Change task status
Subtasks
 Create subtasks
 Toggle completion
 Show progress
Phase 2 — Persistence Layer

Goal: Preserve user changes.

 Save boards to localStorage
 Load boards from localStorage
 Fallback to data.json
 Sync store changes automatically
Phase 3 — UX Improvements
 Drag and drop tasks
 Reorder tasks inside column
 Smooth animations
 Accessibility improvements
Phase 4 — Backend Integration

Goal: Convert project to full-stack application

Backend

Using Nuxt server routes

server/api/

Endpoints:

GET /boards
POST /boards
PUT /boards/:id
DELETE /boards/:id
GET /tasks
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
Phase 5 — Database

Database: SQLite

Tables:

Boards
id
name
Columns
id
name
board_id
Tasks
id
title
description
column_id
Subtasks
id
title
task_id
is_completed
Phase 6 — Production Version
 Authentication
 Multi-user boards
 API validation
 Performance improvements
Estimated Completion
Phase	Description	Progress
Phase 1	Frontend Core	100%
Phase 2	Persistence	100%
Phase 3	UX	100%
Phase 4	Backend	0%
Phase 5	Database	0%
Project Vision

Final goal:

A full-stack Kanban productivity system built with:

Nuxt 4
Vue 3
Pinia
SQLite
Server API

Suitable for:

personal productivity
small teams
portfolio showcase