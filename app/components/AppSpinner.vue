<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Ring diameter in pixels */
  size: {
    type: Number,
    default: 40
  },
  /** Accessible label for the loading indicator */
  label: {
    type: String,
    default: 'Loading'
  }
})

const ringStyle = computed(() => {
  const w = Math.max(2, Math.round(props.size * 0.1))
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    borderWidth: `${w}px`
  }
})
</script>

<template>
  <span class="app-spinner" role="status" aria-live="polite">
    <span class="app-spinner__ring" aria-hidden="true" :style="ringStyle" />
    <span class="visually-hidden">{{ label }}</span>
  </span>
</template>

<style scoped>
.app-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-spinner__ring {
  border-style: solid;
  border-color: color-mix(in srgb, var(--muted) 35%, transparent);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: app-spinner-spin 0.8s linear infinite;
}
html.dark .app-spinner__ring {
  border-color: color-mix(in srgb, white 35%, transparent);
  border-top-color: var(--primary);
}

@keyframes app-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
