// server/api/tasks/index.post.ts
import { tasks, subtasks } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = useDb()

  try {
    // 1. إدخال المهمة الأساسية
    const [newTask] = await db.insert(tasks)
      .values({
        title: body.title,
        description: body.description || '',
        order: body.order || 0,
        columnId: Number(body.columnId) // التأكد من أنه رقم
      })
      .returning()

    // 2. معالجة المهام الفرعية (إذا وجدت)
    if (body.subtasks && Array.isArray(body.subtasks)) {
      const validSubtasks = body.subtasks
        .filter((s: any) => (typeof s === 'string' ? s.trim() !== '' : s.title?.trim() !== ''))
        .map((s: any) => ({
          title: typeof s === 'string' ? s : s.title,
          taskId: newTask.id,
          isCompleted: false
        }))

      if (validSubtasks.length > 0) {
        await db.insert(subtasks).values(validSubtasks)
      }
    }

    // ارجاع المهمة مع المهام الفرعية لضمان تحديث الستور بشكل كامل
    return await db.query.tasks.findFirst({
      where: eq(tasks.id, newTask.id),
      with: { subtasks: true }
    })

  } catch (error: any) {
    console.error("POST /api/tasks Error:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create task'
    })
  }
})