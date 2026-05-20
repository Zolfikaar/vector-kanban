// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Vector Kanban',
      meta: [
        { name: 'description', content: 'Vector Kanban — task boards and columns, developed by UrLabs.' },
      ],
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false
    },
    {
      path: '~/icons',
      pathPrefix: false
    }
  ],

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
    types: null,
  },

  devServer: {
    port: 3000,
  },
  typescript: {
    shim: false
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL
  },
  nitro: {
    preset: 'node-server'
  }
})