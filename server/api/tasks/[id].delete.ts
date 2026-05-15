import { tasks } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const db = useDb();

  await db.delete(tasks).where(eq(tasks.id, Number(id)));

  return { success: true };
});