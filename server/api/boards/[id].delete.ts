import { boards } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const boardId = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (!boardId || Number.isNaN(boardId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid board id',
    })
  }

  try {
    const deleted = await db
      .delete(boards)
      .where(eq(boards.id, boardId))
      .returning()

    if (!deleted.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Board not found',
      })
    }

    return { success: true, id: boardId }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      (error as { statusCode: number }).statusCode !== 500
    ) {
      throw error
    }

    const message =
      error instanceof Error ? error.message : 'Failed to delete board'
    console.error(`DELETE /api/boards/${boardId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})
