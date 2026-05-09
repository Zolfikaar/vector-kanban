<script setup lang="ts">
import { computed } from "vue"
import { icons } from "../icons"

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 }
})

const iconComponent = computed(() => icons[props.name])
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :size="size"
  />
</template>
