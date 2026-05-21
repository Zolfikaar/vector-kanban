import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { serverIntegrationSetupOptions } from '../helpers/test-setup'

describe('POST /api/tasks/reorder', async () => {
  await setup(serverIntegrationSetupOptions)

  it('returns 400 Bad Request when the tasks array is missing or invalid', async () => {
    await expect(
      $fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: {
          'x-test-user-sub': 'test-uuid-123',
        },
        body: { tasks: 'not-an-array' },
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })

    await expect(
      $fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: {
          'x-test-user-sub': 'test-uuid-123',
        },
        body: {},
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  })
})
