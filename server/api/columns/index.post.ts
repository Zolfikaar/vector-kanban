import { boards, columns } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to create a column.',
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
      message: 'Column title is required.',
    })
  }

  const boardId = Number(body.boardId)
  if (!boardId || Number.isNaN(boardId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Board ID is required.',
    })
  }

  const board = await db.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
  })

  if (!board) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Board not found.',
    })
  }

  const existingColumns = await db
    .select()
    .from(columns)
    .where(eq(columns.boardId, boardId))

  const order =
    body.order != null && !Number.isNaN(Number(body.order))
      ? Number(body.order)
      : existingColumns.length

  try {
    const [newColumn] = await db.insert(columns).values({
      title,
      order,
      boardId,
      userId,
    }).returning()

    return newColumn
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create column'
    console.error('POST /api/columns Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: message,
    })
  }
})