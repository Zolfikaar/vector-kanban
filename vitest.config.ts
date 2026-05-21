import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    env: {
      NUXT_TEST: 'true',
    },
    environment: 'node',
    include: ['tests/server/**/*.spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
  },
})
