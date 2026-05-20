import { columns } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to update a column.',
    })
  }

  const userId = user.sub
  const columnId = Number(getRouterParam(event, 'id'))

  if (!columnId || Number.isNaN(columnId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid column id is required.',
    })
  }

  const body = await readBody(event)
  const db = useDb()

  const title = body.title?.trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Column title is required.',
    })
  }

  const existingColumn = await db.query.columns.findFirst({
    where: eq(columns.id, columnId),
  })

  if (!existingColumn) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Column not found.',
    })
  }

  if (existingColumn.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not own this column',
    })
  }

  try {
    await db.update(columns).set({ title }).where(eq(columns.id, columnId))

    const updatedColumn = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
    })

    return updatedColumn
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to update column'
    console.error(`PATCH /api/columns/${columnId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
