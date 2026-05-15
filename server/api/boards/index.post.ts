import { boards, columns } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = useDb()

  const title = body.title?.trim()
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board title is required',
    })
  }

  const columnTitles = (body.columns || [])
    .map((col: { title?: string } | string) =>
      typeof col === 'string' ? col.trim() : col.title?.trim()
    )
    .filter(Boolean)

  if (columnTitles.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one column is required',
    })
  }

  try {
    const [newBoard] = await db.insert(boards).values({ title }).returning()

    await db.insert(columns).values(
      columnTitles.map((colTitle: string, index: number) => ({
        title: colTitle,
        order: index,
        boardId: newBoard.id,
      }))
    )

    const board = await db.query.boards.findFirst({
      where: eq(boards.id, newBoard.id),
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
    const message =
      error instanceof Error ? error.message : 'Failed to create board'
    console.error('POST /api/boards Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})
