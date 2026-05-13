// server/api/tasks/[id].patch.ts
import { tasks } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = useDb()

  try {
    const updatedTask = await db.update(tasks)
      .set({ 
        columnId: body.columnId, 
        order: body.order 
      })
      .where(eq(tasks.id, Number(id)))
      .returning()

    return updatedTask[0]
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update task',
    })
  }
})