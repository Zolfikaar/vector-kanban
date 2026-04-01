<script setup>
import { useBoardStore } from '~/stores/board'
const boardStore = useBoardStore()
const emit = defineEmits(['update:openDeleteBoardModal'])

const props = defineProps({
  openDeleteBoardModal: {
    type: Boolean,
    default: false
  }
})

const closeDeleteBoardModal = () => {
  emit('update:openDeleteBoardModal', false)
}

const deleteSelectedBoard = () => {
  boardStore.deleteBoard(boardStore.selectedBoard)
  closeDeleteBoardModal()
}
</script>
<template>
  <div class="delete-modal" v-if="props.openDeleteBoardModal">
    <h2>Delete this board?</h2>
    <p class="medium">
      Are you sure you want to delete the ‘Platform Launch’ board? This action will remove all columns and tasks and
      cannot be reversed.
    </p>
    <div class="btns">
      <button class="delete-btn" @click="deleteSelectedBoard">Delete</button>
      <button class="cancel-btn" @click="closeDeleteBoardModal">Cancel</button>
    </div>
  </div>
</template>

<style scoped>
.delete-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  height: 230px;
  padding: 25px;
  border-radius: 20px;
  z-index: 105;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--card-topbar-sidebar);
}

.delete-modal h2 {
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

.delete-modal .btns .cancel-btn {
  background-color: var(--secondary-btn);
  color: var(--primary);
}

.delete-modal .btns .cancel-btn:hover {
  background-color: var(--secondary-btn-hover);
  cursor: pointer;
}
</style>