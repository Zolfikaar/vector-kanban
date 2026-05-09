<script setup>
defineProps({
  size: { type: [Number, String], default: 24 }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 25"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
<g fill="currentColor" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg"><rect width="6" height="25" rx="2"/><rect width="6" height="25" x="9" opacity=".75" rx="2"/><rect width="6" height="25" x="18" opacity=".5" rx="2"/></g>
  </svg>
</template>
