<script setup>
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSubmitting, selectedColumn } = storeToRefs(uiStore)

const deleteColumn = async () => {
  if (isSubmitting.value || !selectedColumn.value?.id) return
  await boardStore.deleteColumn(selectedColumn.value.id)
}
</script>

<template>
  <div class="modal-global delete-modal">
    <h2>Delete this column?</h2>
    <p class="medium">
      Are you sure you want to delete the <b>'{{ selectedColumn?.title }}'</b> column? This action will remove all tasks and subtasks inside it and cannot be undone.
    </p>
    <div class="btns">
      <button
        type="button"
        class="delete-btn"
        :disabled="isSubmitting"
        @click="deleteColumn"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Deleting column" />
        <span>{{ isSubmitting ? 'Deleting…' : 'Delete' }}</span>
      </button>
      <button
        type="button"
        class="cancel-btn secondary-btn"
        :disabled="isSubmitting"
        @click="uiStore.closeAllModals()"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
