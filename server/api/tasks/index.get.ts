export default defineEventHandler(async (event) => {

  const db = useDb()
  const result = await db.select().from(tasks)
  return result
})