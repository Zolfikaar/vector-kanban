<script setup>
const emit = defineEmits(['update:openCreateBoardModal'])

const props = defineProps({
  openCreateBoardModal: {
    type: Boolean,
    default: false
  }
})

const closeCreateBoardModal = () => {
  emit('update:openCreateBoardModal', false)
}
</script>

<template>
  <div class="new-board" v-if="props.openCreateBoardModal">
    <h1>New Board</h1>
    <button @click="closeCreateBoardModal">Close</button>
  </div>
</template>

<style scoped>
.new-board {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  height: 430px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 25px;
  z-index: 105;
}
</style>