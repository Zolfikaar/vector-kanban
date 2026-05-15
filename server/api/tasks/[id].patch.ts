// server/api/tasks/[id].patch.ts
import { tasks } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const db = useDb()

  try {
    const patch: Record<string, unknown> = {}
    if (body.columnId !== undefined) patch.columnId = Number(body.columnId)
    if (body.order !== undefined) patch.order = body.order
    if (body.title !== undefined) patch.title = body.title
    if (body.description !== undefined) patch.description = body.description

    if (Object.keys(patch).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update',
      })
    }

    const updatedTask = await db
      .update(tasks)
      .set(patch)
      .where(eq(tasks.id, Number(id)))
      .returning()

    return updatedTask[0]
  } catch (error: any) {
    if (error?.statusCode && error.statusCode !== 500) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update task',
    })
  }
})