<script setup>
import { useBoardStore } from '~/stores/board'
const boardStore = useBoardStore()

</script>
<template>
  <div class="modal-global delete-modal">
    <h2>Delete this board?</h2>
    <p class="medium">
      Are you sure you want to delete the <b>'{{ boardStore.selectedBoard.name }}'</b> board? This action will remove all columns and tasks and
      cannot be reversed.
    </p>
    <div class="btns">
      <button class="delete-btn" @click="boardStore.boardStore.deleteBoard(boardStore.selectedBoard)">Delete</button>
      <button class="cancel-btn secondary-btn" @click="boardStore.closeAllModals()">Cancel</button>
    </div>
  </div>
</template>