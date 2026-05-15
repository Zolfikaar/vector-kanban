<script setup>
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const { isSubmitting } = storeToRefs(boardStore)

const deleteBoard = async () => {
  if (isSubmitting.value || !boardStore.selectedBoard) return
  await boardStore.deleteBoard(boardStore.selectedBoard)
}
</script>

<template>
  <div class="modal-global delete-modal">
    <h2>Delete this board?</h2>
    <p class="medium">
      Are you sure you want to delete the <b>'{{ boardStore.selectedBoard?.title }}'</b> board? This action will remove all columns and tasks and
      cannot be reversed.
    </p>
    <div class="btns">
      <button
        type="button"
        class="delete-btn"
        :disabled="isSubmitting"
        @click="deleteBoard"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Deleting board" />
        <span>{{ isSubmitting ? 'Deleting…' : 'Delete' }}</span>
      </button>
      <button
        type="button"
        class="cancel-btn secondary-btn"
        :disabled="isSubmitting"
        @click="boardStore.closeAllModals()"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
