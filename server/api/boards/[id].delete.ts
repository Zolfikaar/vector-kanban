import { boards } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'
import { getAuthUserId } from '~~/server/utils/auth'

const CONNECTION_ERROR_CODES = new Set([
  'ENOTFOUND',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENETUNREACH',
])

function getDatabaseErrorMessage(error: unknown, fallback: string): string {
  let current: unknown = error
  for (let depth = 0; depth < 4; depth++) {
    if (!current || typeof current !== 'object') break

    const code =
      'code' in current ? (current as { code?: string }).code : undefined
    if (code && CONNECTION_ERROR_CODES.has(code)) {
      return 'Database is unreachable. Check DATABASE_URL and your network connection.'
    }

    if ('cause' in current) {
      current = (current as { cause?: unknown }).cause
      continue
    }
    break
  }

  return error instanceof Error ? error.message : fallback
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to delete a board.',
    })
  }

  const userId = getAuthUserId(user)
  const boardId = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (!boardId || Number.isNaN(boardId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'A valid board id is required.',
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

  try {
    await db.delete(boards).where(eq(boards.id, boardId))

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

    const message = getDatabaseErrorMessage(error, 'Failed to delete board.')
    console.error(`DELETE /api/boards/${boardId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message,
    })
  }
})
