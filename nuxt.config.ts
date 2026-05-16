// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Vector Kanban',
      meta: [
        { name: 'description', content: 'Vector Kanban — task boards and columns, developed under the UrLabs umbrella.' },
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
  modules: ['@pinia/nuxt'],
  typescript: {
    shim: false
  },
  runtimeConfig: {
    // أي شيء هنا يكون متاحاً فقط في السيرفر
    databaseUrl: process.env.DATABASE_URL
  },
  nitro: {
    preset: 'node-server'
  }
})