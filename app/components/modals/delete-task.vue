<script setup>
import { useBoardStore } from '~/stores/board'
const boardStore = useBoardStore()

</script>

<template>
  <div class="modal-global delete-modal">

    <h1>Delete this task?</h1>

    <p class="medium">Are you sure you want to delete the <b>'{{ boardStore.selectedTask.title }}'</b> task and its subtasks? This action cannot be reversed.</p>
    
    <div class="btns">
      <button class="delete-btn" @click="boardStore.deleteBoard(boardStore.selectedBoard)">Delete</button>
      <button class="cancel-btn secondary-btn" @click="boardStore.closeAllModals()">Cancel</button>
    </div>

  </div>
</template>

<style scoped>

</style>