import {useDb} from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    const allBoards = await db.query.boards.findMany({
      with: {
        columns: {
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
    
    return allBoards;
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Unknown Error',
    });
  }
});
