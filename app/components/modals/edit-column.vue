<script setup>
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSubmitting, selectedColumn } = storeToRefs(uiStore)

const hasTriedSubmit = ref(false)
const columnTitle = ref('')

watchEffect(() => {
  if (!selectedColumn.value) return

  columnTitle.value = selectedColumn.value.title ?? ''
  hasTriedSubmit.value = false
})

const trimTitle = () => {
  columnTitle.value = columnTitle.value.trim()
}

const isTitleInvalid = () => hasTriedSubmit.value && !columnTitle.value.trim()

const submitUpdateColumn = async () => {
  if (isSubmitting.value || !selectedColumn.value?.id) return

  hasTriedSubmit.value = true
  trimTitle()

  if (!columnTitle.value) return

  const boardId = boardStore.selectedBoard?.id
  if (!boardId) return

  await boardStore.updateColumn(boardId, selectedColumn.value.id, {
    title: columnTitle.value,
  })
}
</script>

<template>
  <div class="modal-global">
    <div class="header">
      <h1>Edit Column</h1>

      <button type="button" class="close-btn" @click="uiStore.closeAllModals()">
        <Icon name="icon-cross" :size="18" />
      </button>
    </div>

    <div class="fields">
      <div class="column-name">
        <div class="field-label-row">
          <label class="medium">Name</label>
          <span v-if="isTitleInvalid()" class="field-error">Can't be empty</span>
        </div>
        <input
          v-model="columnTitle"
          type="text"
          placeholder="e.g. Todo"
          :class="{ error: isTitleInvalid() }"
          @blur="trimTitle"
        >
      </div>
    </div>

    <div class="btns">
      <button
        type="button"
        class="btn-primary update-btn"
        :disabled="isSubmitting"
        @click="submitUpdateColumn"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Updating column" />
        <span>{{ isSubmitting ? 'Saving…' : 'Save Changes' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header .close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--muted);
}

.header .close-btn:hover {
  color: var(--danger);
}

.column-name {
  margin-bottom: 20px;
}

.column-name label {
  color: var(--muted);
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.field-error {
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
}

.column-name input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--input-border);
  border-radius: 5px;
  padding-left: 10px;
  background: var(--card-topbar-sidebar);
  color: var(--text);
}

.column-name input.error {
  border-color: var(--danger);
}

.btns .update-btn {
  width: 100%;
  height: 40px;
  border-radius: 50px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btns .update-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
</style>
