import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import { useUiStore } from './ui'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),

  actions: {
    async Signup(email, password) {
      const supabase = useSupabaseClient()
      const uiStore = useUiStore()

      uiStore.isSubmitting = true
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          toast.error(error.message)
          return
        }

        if (data.session) {
          this.user = data.user
          toast.success('Account created!')
          await navigateTo('/')
          return
        }

        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (loginError) {
          toast.error(loginError.message)
          return
        }

        this.user = loginData.user
        toast.success('Account created!')
        await navigateTo('/')
      } catch {
        toast.error('An error occurred during signup.')
      } finally {
        uiStore.isSubmitting = false
      }
    },

    async Logout() {
      const supabase = useSupabaseClient()

      try {
        await supabase.auth.signOut()
        this.user = null
        await navigateTo('/login')
      } catch {
        toast.error('Failed to sign out.')
      }
    },

    async Login(email, password) {
      const supabase = useSupabaseClient()
      const uiStore = useUiStore()

      uiStore.isSubmitting = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error(error.message)
          return
        }

        this.user = data.user
        toast.success('Login successful!')
        await navigateTo('/')
      } catch {
        toast.error('An error occurred during login.')
      } finally {
        uiStore.isSubmitting = false
      }
    },
  },
})
