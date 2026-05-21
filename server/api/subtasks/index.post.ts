import { subtasks, tasks } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in.',
    })
  }

  const userId = user.sub
  const body = await readBody(event)
  const db = useDb()

  const taskId = Number(body.taskId)
  if (!taskId || Number.isNaN(taskId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid task id is required.',
    })
  }

  const title = body.title?.trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Subtask title cannot be empty.',
    })
  }

  const parentTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: { column: true },
  })

  if (!parentTask) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Task not found.',
    })
  }

  if (!parentTask.column || parentTask.column.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not own this task.',
    })
  }

  try {
    const [createdSubtask] = await db
      .insert(subtasks)
      .values({
        title,
        taskId,
        isCompleted: false,
      })
      .returning()

    return createdSubtask
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to create subtask'
    console.error('POST /api/subtasks Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
