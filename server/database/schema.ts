import { pgTable, serial, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const boards = pgTable('boards', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  userId: uuid('user_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  order: integer('order').notNull(),
  boardId: integer('board_id').references(() => boards.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  columnId: integer('column_id').references(() => columns.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subtasks = pgTable('subtasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});


export const boardsRelations = relations(boards, ({ many }) => ({
  columns: many(columns),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, { fields: [columns.boardId], references: [boards.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  column: one(columns, { fields: [tasks.columnId], references: [columns.id] }),
  subtasks: many(subtasks),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, { fields: [subtasks.taskId], references: [tasks.id] }),
}));