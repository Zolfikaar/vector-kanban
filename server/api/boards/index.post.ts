import { boards, columns } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'
import { getAuthUserId } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const db = useDb()
  const body = await readBody(event)

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: You must be logged in to create a board.",
    });
  }

  const userId = getAuthUserId(user)
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

  try {
    // استخدام العمليات الموحدة لحماية سلامة البيانات من الفشل الجزئي
    const board = await db.transaction(async (tx) => {
      
      // 1. إدخال اللوحة داخل سياق العملية المشتركة
      const [newBoard] = await tx.insert(boards).values({ title, userId }).returning()

      // 2. إدخال الأعمدة التابعة لها إن وجدت
      if (columnTitles.length > 0) {
        await tx.insert(columns).values(
          columnTitles.map((colTitle: string, index: number) => ({
            title: colTitle,
            order: index,
            boardId: newBoard.id,
            userId: userId,
          }))
        )
      }

      // 3. جلب الكائن الكامل قبل إتمام العملية واعتمادها في الجداول
      return await tx.query.boards.findFirst({
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
    })

    return board

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create board'
    console.error('POST /api/boards Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})