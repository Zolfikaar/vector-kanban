import { boards } from '~~/server/database/schema'
import { and, eq } from 'drizzle-orm'

export async function fetchBoardWithRelations(
  db: ReturnType<typeof useDb>,
  boardId: number,
  userId: string
) {
  return db.query.boards.findFirst({
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
}
