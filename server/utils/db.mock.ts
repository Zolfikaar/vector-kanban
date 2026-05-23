const TEST_USER_ID = 'test-uuid-123'

const mockBoard = {
  id: 1,
  title: 'Test Board',
  userId: TEST_USER_ID,
  columns: [
    {
      id: 1,
      title: 'QA Testing Column',
      order: 0,
      boardId: 1,
      userId: TEST_USER_ID,
      tasks: [],
    },
  ],
}

function createMockDb() {
  return {
    query: {
      boards: {
        findFirst: async () => mockBoard,
      },
      columns: {
        findMany: async () => [{ id: 1, userId: TEST_USER_ID }],
      },
      tasks: {
        findMany: async () => [],
      },
    },
    select: () => ({
      from: () => ({
        where: async () => [],
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: async () => [
          {
            id: 1,
            title: 'QA Testing Column',
            order: 0,
            boardId: 1,
            userId: TEST_USER_ID,
          },
        ],
      }),
    }),
    transaction: async (fn: (tx: ReturnType<typeof createMockDb>) => Promise<void>) => {
      await fn(createMockDb())
    },
    update: () => ({
      set: () => ({
        where: async () => undefined,
      }),
    }),
  }
}

export const useTestDb = () => createMockDb()
