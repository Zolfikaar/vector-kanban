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
<path stroke="#FFF" stroke-width="2" fill="currentColor" d="m1.276 3.066 2.756 2.756 5-5"/>
  </svg>
</template>
