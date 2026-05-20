<script setup>
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Toaster theme="dark" rich-colors :close-button="false" />
</template>
