import { subtasks } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to update a subtask.',
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

  const body = await readBody(event)

  if (typeof body.isCompleted !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'isCompleted must be a boolean.',
    })
  }

  try {
    const [updatedSubtask] = await db
      .update(subtasks)
      .set({ isCompleted: body.isCompleted })
      .where(eq(subtasks.id, subtaskId))
      .returning()

    return updatedSubtask
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to update subtask'
    console.error(`PATCH /api/subtasks/${subtaskId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
