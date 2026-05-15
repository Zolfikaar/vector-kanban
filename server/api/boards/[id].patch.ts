import { boards, columns } from '~~/server/database/schema'
import { and, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const boardId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const db = useDb()

  if (!boardId || Number.isNaN(boardId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid board id',
    })
  }

  const existingBoard = await db.query.boards.findFirst({
    where: eq(boards.id, boardId),
  })

  if (!existingBoard) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Board not found',
    })
  }

  const title = body.title?.trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board title is required',
    })
  }

  const incomingColumns: Array<{ id?: number; title?: string }> =
    body.columns || []

  if (incomingColumns.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one column is required',
    })
  }

  for (const col of incomingColumns) {
    if (!col.title?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Column title cannot be empty',
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
          .where(and(eq(columns.id, colId), eq(columns.boardId, boardId)))
      } else {
        await db.insert(columns).values({
          title: colTitle,
          order: index,
          boardId,
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
      where: eq(boards.id, boardId),
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
      statusMessage: message,
    })
  }
})
