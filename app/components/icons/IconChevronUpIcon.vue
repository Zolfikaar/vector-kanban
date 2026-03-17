<script setup>
defineProps({
  size: { type: [Number, String], default: 24 }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor" xmlns="http://www.w3.org/2000/svg"
  >
<path stroke="#635FC7" stroke-width="2" fill="currentColor" d="M9 6 5 2 1 6"/>
  </svg>
</template>
