import { columns, tasks } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to update a task.',
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

  const body = await readBody(event)
  const patch: Record<string, unknown> = {}

  if (body.title !== undefined) {
    const title = body.title?.trim()
    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Task title cannot be empty.',
      })
    }
    patch.title = title
  }

  if (body.description !== undefined) {
    patch.description = body.description?.trim() ?? ''
  }

  if (body.order !== undefined) {
    patch.order = Number(body.order)
  }

  if (body.columnId !== undefined) {
    const newColumnId = Number(body.columnId)
    if (!newColumnId || Number.isNaN(newColumnId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'A valid column id is required.',
      })
    }

    if (newColumnId !== existingTask.columnId) {
      const targetColumn = await db.query.columns.findFirst({
        where: and(eq(columns.id, newColumnId), eq(columns.userId, userId)),
      })

      if (!targetColumn) {
        const columnExists = await db.query.columns.findFirst({
          where: eq(columns.id, newColumnId),
        })

        if (!columnExists) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'Column not found.',
          })
        }

        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          message: 'You do not own the target column.',
        })
      }
    }

    patch.columnId = newColumnId
  }

  if (Object.keys(patch).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No fields to update.',
    })
  }

  try {
    await db.update(tasks).set(patch).where(eq(tasks.id, taskId))

    const updatedTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: { subtasks: true },
    })

    return updatedTask
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to update task'
    console.error(`PATCH /api/tasks/${taskId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
