import { boards, columns, tasks } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to delete a task.',
    })
  }

  const userId = user.sub
  const taskId = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (!taskId || Number.isNaN(taskId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid task id is required.',
    })
  }

  const existingTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: { column: true },
  })

  if (!existingTask) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Task not found.',
    })
  }

  if (!existingTask.column || existingTask.column.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not own this task.',
    })
  }

  const boardId = existingTask.column.boardId

  try {
    await db.delete(tasks).where(eq(tasks.id, taskId))

    const board = boardId
      ? await db.query.boards.findFirst({
          where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
          with: {
            columns: {
              orderBy: (columns, { asc }) => [asc(columns.order)],
              with: {
                tasks: {
                  orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
                  with: { subtasks: true },
                },
              },
            },
          },
        })
      : null

    return board
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to delete task'
    console.error(`DELETE /api/tasks/${taskId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
