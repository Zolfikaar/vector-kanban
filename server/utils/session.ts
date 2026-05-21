import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Resolves the current user for API handlers.
 * In integration tests (`NUXT_TEST=true`), honors `x-test-user-sub` instead of Supabase cookies.
 */
export async function resolveSessionUser(event: H3Event) {
  if (process.env.NUXT_TEST === 'true') {
    const testSub = getHeader(event, 'x-test-user-sub')
    return testSub ? { sub: testSub } : null
  }

  return serverSupabaseUser(event)
}
