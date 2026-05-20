import { tasks } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to view a task.',
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

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      column: true,
      subtasks: true,
    },
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Task not found.',
    })
  }

  if (!task.column || task.column.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not own this task.',
    })
  }

  const { column: _column, ...taskWithoutColumn } = task

  return taskWithoutColumn
})
