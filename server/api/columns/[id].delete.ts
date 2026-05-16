import { boards, columns } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const columnId = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (!columnId || Number.isNaN(columnId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid column id',
    })
  }

  const existingColumn = await db.query.columns.findFirst({
    where: eq(columns.id, columnId),
  })

  if (!existingColumn) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Column not found',
    })
  }

  const boardId = existingColumn.boardId

  try {
    await db.delete(columns).where(eq(columns.id, columnId))

    const board = boardId
      ? await db.query.boards.findFirst({
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
      : null

    return board
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete column'
    console.error(`DELETE /api/columns/${columnId} Error:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})
