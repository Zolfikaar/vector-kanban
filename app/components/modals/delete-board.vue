<script setup>
import { useBoardStore } from '~/stores/board'
const boardStore = useBoardStore()



</script>
<template>
  <div class="modal-global delete-modal">
    <h2>Delete this board?</h2>
    <p class="medium">
      Are you sure you want to delete the ‘Platform Launch’ board? This action will remove all columns and tasks and
      cannot be reversed.
    </p>
    <div class="btns">
      <button class="delete-btn" @click="boardStore.boardStore.deleteBoard(boardStore.selectedBoard)">Delete</button>
      <button class="cancel-btn secondary-btn" @click="boardStore.closeAllModals()">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.modal-global delete-modal h2 {
  color: var(--danger);
}

.delete-modal p {
  color: var(--muted);
  margin-top: unset;
}

.delete-modal .btns {
  display: flex;
  justify-content: space-between;
}

.delete-modal .btns button {
  width: 200px;
  height: 40px;
  text-align: center;
  border-radius: 20px;
  border: none;
}

.delete-modal .btns .delete-btn {
  background-color: var(--danger);
  color: white;
}

.delete-modal .btns .delete-btn:hover {
  background-color: var(--danger-hover);
  cursor: pointer;
}
</style>