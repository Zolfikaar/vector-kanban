export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSupabaseSession()
  const user = useSupabaseUser()

  let isAuthenticated = !!(session.value?.access_token || user.value)

  if (import.meta.client && !isAuthenticated) {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()

    isAuthenticated = !!data.session

    if (data.session) {
      if (!session.value) {
        session.value = data.session
      }
      if (!user.value && data.session.user) {
        user.value = data.session.user
      }
    }
  }

  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login', { replace: true })
  }

  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/', { replace: true })
  }
})
