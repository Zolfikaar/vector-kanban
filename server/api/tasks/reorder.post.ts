import { columns, tasks } from '~~/server/database/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

type ReorderTaskItem = {
  id: number
  order: number
  columnId: number
}

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
  const items: ReorderTaskItem[] = body?.tasks

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A non-empty tasks array is required.',
    })
  }

  for (const item of items) {
    const id = Number(item.id)
    const order = Number(item.order)
    const columnId = Number(item.columnId)

    if (!id || Number.isNaN(id) || Number.isNaN(order) || !columnId || Number.isNaN(columnId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Each task must include valid id, order, and columnId.',
      })
    }
  }

  const db = useDb()
  const columnIds = [...new Set(items.map((item) => Number(item.columnId)))]
  const taskIds = items.map((item) => Number(item.id))

  try {
    await db.transaction(async (tx) => {
      const ownedColumns = await tx.query.columns.findMany({
        where: and(inArray(columns.id, columnIds), eq(columns.userId, userId)),
      })

      if (ownedColumns.length !== columnIds.length) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          message: 'You do not own one or more target columns.',
        })
      }

      const existingTasks = await tx.query.tasks.findMany({
        where: inArray(tasks.id, taskIds),
        with: { column: true },
      })

      if (existingTasks.length !== taskIds.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'One or more tasks were not found.',
        })
      }

      for (const task of existingTasks) {
        if (!task.column || task.column.userId !== userId) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: 'You do not own one or more tasks.',
          })
        }
      }

      for (const item of items) {
        await tx
          .update(tasks)
          .set({
            order: Number(item.order),
            columnId: Number(item.columnId),
          })
          .where(eq(tasks.id, Number(item.id)))
      }
    })

    return { success: true, message: 'Tasks reordered successfully.' }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to reorder tasks'
    console.error('POST /api/tasks/reorder Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
