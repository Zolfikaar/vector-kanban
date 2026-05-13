// server/api/tasks/index.post.ts
import { tasks, subtasks } from "~~/server/database/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = useDb()

  // 1. إدخال المهمة
  const [newTask] = await db.insert(tasks)
    .values({
      title: body.title,
      description: body.description,
      order: body.order || 0,
      columnId: body.columnId
    })
    .returning()

  // 2. إدخال المهام الفرعية (إذا كانت موجودة في الـ draft)
  if (body.subtasks && body.subtasks.length > 0) {
    const subtasksToInsert = body.subtasks
      .filter((s: any) => s.title && s.title.trim() !== "")
      .map((s: any) => ({
        title: s.title,
        taskId: newTask.id,
        isCompleted: false
      }))

    if (subtasksToInsert.length > 0) {
      await db.insert(subtasks).values(subtasksToInsert)
    }
  }

  return newTask
})