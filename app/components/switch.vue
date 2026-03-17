<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  activeColor: {
    type: String,
    default: '#7258DB'
  },
  inactiveColor: {
    type: String,
    default: '#E2E8F0'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button type="button" role="switch" :aria-checked="modelValue" :disabled="disabled" class="switch-root" :style="{
    '--switch-track-on': activeColor,
    '--switch-track-off': inactiveColor
  }" @click="toggle" @keydown.space.prevent="toggle" @keydown.enter.prevent="toggle">
    <span class="switch-track" :data-state="modelValue ? 'on' : 'off'" />
    <span class="switch-thumb" :data-state="modelValue ? 'on' : 'off'" />
  </button>
</template>

<style scoped>
.switch-root {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-radius: 9999px;
  background: transparent;
  cursor: pointer;
  outline: none;
}

.switch-root:focus-visible {
  outline: 2px solid var(--switch-track-on, #7258db);
  outline-offset: 2px;
}

.switch-root:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.switch-track {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background-color: var(--switch-track-off);
  transition: background-color 0.2s ease;
}

.switch-track[data-state='on'] {
  background-color: var(--switch-track-on);
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  transition: transform 0.2s ease;
  pointer-events: none;
}

.switch-thumb[data-state='on'] {
  transform: translateX(20px);
}
</style>
