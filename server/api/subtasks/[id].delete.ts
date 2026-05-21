import { boards, columns, subtasks } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to delete a subtask.',
    })
  }

  const userId = user.sub
  const subtaskId = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (!subtaskId || Number.isNaN(subtaskId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid subtask id is required.',
    })
  }

  const existingSubtask = await db.query.subtasks.findFirst({
    where: eq(subtasks.id, subtaskId),
    with: {
      task: {
        with: { column: true },
      },
    },
  })

  if (!existingSubtask) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Subtask not found.',
    })
  }

  if (!existingSubtask.task?.column || existingSubtask.task.column.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not own this subtask.',
    })
  }

  const boardId = existingSubtask.task.column.boardId

  try {
    await db.delete(subtasks).where(eq(subtasks.id, subtaskId))

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
    const message = error instanceof Error ? error.message : 'Failed to delete subtask'
    console.error(`DELETE /api/subtasks/${subtaskId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
