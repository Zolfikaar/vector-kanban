import { useDb } from '~~/server/utils/db'
import { getAuthUserId } from '~~/server/utils/auth'
import { boards } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const userId = getAuthUserId(user)

  const userBoards = await useDb().query.boards.findMany({
    where: eq(boards.userId, userId),
    with: {
      columns: {
        orderBy: (columns, { asc }) => [asc(columns.order)],
        with: {
          tasks: {
            orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
            with: {
              subtasks: true,
            }
          }
        }
      }
    }
  });

  return userBoards;

  
});