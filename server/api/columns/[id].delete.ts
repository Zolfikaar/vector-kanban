import { columns } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'
import { fetchBoardWithRelations } from '~~/server/utils/board'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to delete a column.',
    })
  }

  const userId = user.sub
  const columnId = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (!columnId || Number.isNaN(columnId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid column id is required.',
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

  const boardId = existingColumn.boardId

  try {
    await db.delete(columns).where(eq(columns.id, columnId))

    const board = boardId
      ? await fetchBoardWithRelations(db, boardId, userId)
      : null

    return board
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const err = error as { statusCode?: number }
      if (err.statusCode && err.statusCode !== 500) {
        throw error
      }
    }
    const message = error instanceof Error ? error.message : 'Failed to delete column'
    console.error(`DELETE /api/columns/${columnId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
