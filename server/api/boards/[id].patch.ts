import { boards } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'
import { fetchBoardWithRelations } from '~~/server/utils/board'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to update a board.',
    })
  }

  const userId = user.sub
  const boardId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  if (!boardId || Number.isNaN(boardId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid board id is required.',
    })
  }

  if (body?.columns != null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message:
        'Column changes are not supported on board update. Use the column API endpoints instead.',
    })
  }

  const existingBoard = await db.query.boards.findFirst({
    where: eq(boards.id, boardId),
  })

  if (!existingBoard) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Board not found.',
    })
  }

  if (existingBoard.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'You do not own this board.',
    })
  }

  const title = body.title?.trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Board title is required.',
    })
  }

  try {
    await db.update(boards).set({ title }).where(eq(boards.id, boardId))

    const board = await fetchBoardWithRelations(db, boardId, userId)

    return board
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
      error instanceof Error ? error.message : 'Failed to update board'
    console.error(`PATCH /api/boards/${boardId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
