import { boards, columns } from '~~/server/database/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

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

  const incomingColumns: Array<{ id?: number; title?: string }> =
    body.columns || []

  for (const col of incomingColumns) {
    if (!col.title?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Column title cannot be empty.',
      })
    }
  }

  try {
    await db.update(boards).set({ title }).where(eq(boards.id, boardId))

    const existingColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.boardId, boardId))

    const existingIds = new Set(existingColumns.map((col) => col.id))
    const keepIds: number[] = []

    for (let index = 0; index < incomingColumns.length; index++) {
      const col = incomingColumns[index]
      const colTitle = col.title!.trim()
      const colId = col.id != null ? Number(col.id) : null

      if (colId && existingIds.has(colId)) {
        keepIds.push(colId)
        await db
          .update(columns)
          .set({ title: colTitle, order: index })
          .where(
            and(
              eq(columns.id, colId),
              eq(columns.boardId, boardId),
              eq(columns.userId, userId)
            )
          )
      } else {
        await db.insert(columns).values({
          title: colTitle,
          order: index,
          boardId,
          userId,
        })
      }
    }

    const deleteIds = [...existingIds].filter((id) => !keepIds.includes(id))
    if (deleteIds.length > 0) {
      await db
        .delete(columns)
        .where(
          and(eq(columns.boardId, boardId), inArray(columns.id, deleteIds))
        )
    }

    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
      with: {
        columns: {
          orderBy: (columns, { asc }) => [asc(columns.order)],
          with: {
            tasks: {
              orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
              with: { subtasks: true },
            },
          },
        },
      },
    })

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
