import { fileURLToPath } from 'node:url'
import type { TestOptions } from '@nuxt/test-utils'

/** Enables test auth (`x-test-user-sub`) and in-memory DB mocks in Nitro handlers. */
process.env.NUXT_TEST = 'true'

const rootDir = fileURLToPath(new URL('../..', import.meta.url))

/** Shared `@nuxt/test-utils` e2e setup — builds Nuxt and serves real `/api/*` routes. */
export const serverIntegrationSetupOptions: Partial<TestOptions> = {
  rootDir,
  server: true,
  browser: false,
  env: {
    NUXT_TEST: 'true',
  },
}
