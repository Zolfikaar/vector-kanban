import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { serverIntegrationSetupOptions } from '../helpers/test-setup'

describe('POST /api/columns', async () => {
  await setup(serverIntegrationSetupOptions)

  it('rejects unauthenticated requests with 401 Unauthorized', async () => {
    await expect(
      $fetch('/api/columns', {
        method: 'POST',
        body: {
          title: 'QA Testing Column',
          boardId: 1,
          order: 0,
        },
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  })

  it('creates a column for an authenticated user with a valid payload', async () => {
    const result = await $fetch<{ title: string; boardId: number; order: number; userId: string }>(
      '/api/columns',
      {
        method: 'POST',
        headers: {
          'x-test-user-sub': 'test-uuid-123',
        },
        body: {
          title: 'QA Testing Column',
          boardId: 1,
          order: 0,
        },
      },
    )

    expect(result).toMatchObject({
      title: 'QA Testing Column',
      boardId: 1,
      order: 0,
      userId: 'test-uuid-123',
    })
  })
})
