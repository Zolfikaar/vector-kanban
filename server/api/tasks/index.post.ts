import { columns, tasks, subtasks } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to create a task.',
    })
  }

  const userId = user.sub
  const body = await readBody(event)
  const db = useDb()

  const title = body.title?.trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Task title is required.',
    })
  }

  const columnId = Number(body.columnId)
  if (!columnId || Number.isNaN(columnId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Column ID is required.',
    })
  }

  const targetColumn = await db.query.columns.findFirst({
    where: and(eq(columns.id, columnId), eq(columns.userId, userId)),
  })

  if (!targetColumn) {
    const columnExists = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
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
      message: 'You do not own this column.',
    })
  }

  const order =
    body.order != null && !Number.isNaN(Number(body.order))
      ? Number(body.order)
      : 0

  try {
    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description: body.description?.trim() ?? '',
        order,
        columnId,
      })
      .returning()

    if (body.subtasks && Array.isArray(body.subtasks)) {
      const validSubtasks = body.subtasks
        .filter((s: string | { title?: string }) =>
          typeof s === 'string' ? s.trim() !== '' : s.title?.trim() !== ''
        )
        .map((s: string | { title?: string }) => ({
          title: typeof s === 'string' ? s.trim() : s.title!.trim(),
          taskId: newTask.id,
          isCompleted: false,
        }))

      if (validSubtasks.length > 0) {
        await db.insert(subtasks).values(validSubtasks)
      }
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, newTask.id),
      with: { subtasks: true },
    })

    return task
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to create task'
    console.error('POST /api/tasks Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
