<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()
const uiStore = useUiStore()
const { isSubmitting } = storeToRefs(uiStore)

// حالات الحقول والتبديل
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')

// حالات التحقق من الأخطاء (Validation)
const emailError = ref('')
const passwordError = ref('')

// دالة التحقق من المدخلات قبل الإرسال
const validateForm = () => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value.trim()) {
    emailError.value = "Can't be empty"
    isValid = false
  }
  
  if (!password.value.trim()) {
    passwordError.value = "Can't be empty"
    isValid = false
  }

  return isValid
}

// دالة معالجة الإرسال (Submit)
const handleSubmit = async () => {
  if (!validateForm()) return

  if (isLoginMode.value) {
    // استدعاء دالة تسجيل الدخول من الستور الذي كتبته
    await authStore.Login(email.value, password.value)
  } else {
    // استدعاء دالة إنشاء الحساب من الستور الذي كتبته
    await authStore.Signup(email.value, password.value)
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-logo">Vector</h1>
      
      <h2 class="auth-title">
        {{ isLoginMode ? 'Sign In to your account' : 'Create a new account' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="input-group">
          <div class="label-row">
            <label>Email Address</label>
            <span v-if="emailError" class="error-text">{{ emailError }}</span>
          </div>
          <input 
            v-model="email" 
            type="email" 
            placeholder="e.g. alex@example.com"
            :class="{ 'input-error': emailError }"
          />
        </div>

        <div class="input-group">
          <div class="label-row">
            <label>Password</label>
            <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
          </div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Enter your password"
            :class="{ 'input-error': passwordError }"
          />
        </div>

        <button
          type="submit"
          class="btn-primary"
          :disabled="isSubmitting"
        >
          <AppSpinner v-if="isSubmitting" :size="18" />
          <span v-else>{{ isLoginMode ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <p class="auth-switch">
        {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
        <button
          type="button"
          class="btn-link"
          :disabled="isSubmitting"
          @click="isLoginMode = !isLoginMode"
        >
          {{ isLoginMode ? 'Create an account' : 'Sign In' }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #0c0d14; /* نفس درجة سواد خلفية التطبيق */
  padding: 20px;
}

.auth-card {
  background-color: #1e1f29; /* لون الكروت والمودالات الغامقة */
  padding: 40px;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-logo {
  color: #635fc7; /* اللون البنفسجي الأساسي للمشروع */
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
}

.auth-title {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 24px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
}

.error-text {
  color: #ea5555; /* اللون الأحمر المعتمد للتحذيرات */
}

input {
  background-color: transparent;
  border: 1px solid rgba(130, 143, 163, 0.25);
  padding: 12px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
}

input:focus {
  border-color: #635fc7;
}

.input-error {
  border-color: #ea5555 !important;
}

.btn-primary {
  background-color: #635fc7;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #a8a4ff;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #828fa3;
}

.btn-link {
  background: none;
  border: none;
  color: #635fc7;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.btn-link:hover:not(:disabled) {
  text-decoration: underline;
}

.btn-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>