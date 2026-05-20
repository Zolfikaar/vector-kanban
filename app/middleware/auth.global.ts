export default defineNuxtRouteMiddleware(async (to) => {
  const session = useSupabaseSession()
  const user = useSupabaseUser()

  let isAuthenticated = !!(session.value || user.value)

  if (import.meta.client) {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()

    isAuthenticated = !!data.session

    if (data.session) {
      if (!session.value) {
        session.value = data.session
      }
      if (!user.value) {
        const { data: claimsData } = await supabase.auth.getClaims()
        user.value = claimsData?.claims ?? null
      }
    }
  }

  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})


