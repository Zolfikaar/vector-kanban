<script setup>
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const { isSubmitting } = storeToRefs(boardStore)

const deleteTask = async () => {
  if (isSubmitting.value) return
  await boardStore.deleteTask()
}
</script>

<template>
  <div class="modal-global delete-modal">
    <h1>Delete this task?</h1>

    <p class="medium">
      Are you sure you want to delete the <b>'{{ boardStore.selectedTask.title }}'</b> task and its subtasks? This action cannot be reversed.
    </p>

    <div class="btns">
      <button
        type="button"
        class="delete-btn"
        :disabled="isSubmitting"
        @click="deleteTask"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Deleting task" />
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
