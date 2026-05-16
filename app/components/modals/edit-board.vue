<script setup>
import { ref, computed, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSubmitting } = storeToRefs(uiStore)

const hasTriedSubmit = ref(false)

const currentBoard = ref({
  id: null,
  title: '',
  columns: []
})

const selectedBoard = computed(() => boardStore.selectedBoard)

watchEffect(() => {
  if (!selectedBoard.value) return

  currentBoard.value = {
    id: selectedBoard.value.id,
    title: selectedBoard.value.title ?? '',
    columns: JSON.parse(JSON.stringify(selectedBoard.value.columns || []))
  }

  hasTriedSubmit.value = false
})

const trimBoardTitle = () => {
  currentBoard.value.title = currentBoard.value.title.trim()
}

const trimColumnTitle = (col) => {
  col.title = col.title.trim()
}

const addNewColumn = () => {
  hasTriedSubmit.value = false
  currentBoard.value.columns.push({
    id: null,
    title: ''
  })
}

const removeColumn = (index) => {
  currentBoard.value.columns.splice(index, 1)
}

const isBoardTitleEmpty = computed(() => !currentBoard.value.title.trim())
const isAnyColumnEmpty = computed(() =>
  currentBoard.value.columns.some((col) => !col.title?.trim())
)
const isBoardTitleInvalid = computed(
  () => hasTriedSubmit.value && isBoardTitleEmpty.value
)
const isColumnInvalid = (col) => hasTriedSubmit.value && !col.title?.trim()

const columnKey = (col, index) => col.id ?? `new-${index}`

const submitUpdateBoard = async () => {
  if (isSubmitting.value) return

  hasTriedSubmit.value = true
  trimBoardTitle()
  currentBoard.value.columns.forEach(trimColumnTitle)

  if (isBoardTitleEmpty.value) return

  const columnsToSave = currentBoard.value.columns.filter((col) =>
    col.title?.trim()
  )

  await boardStore.editBoard({
    title: currentBoard.value.title,
    columns: columnsToSave
  })
}
</script>

<template>
  <div class="modal-global">
    <div class="header">
      <h1>Edit Board</h1>

      <button type="button" class="close-btn" @click="uiStore.closeAllModals()">
        <Icon name="icon-cross" :size="18" />
      </button>
    </div>

    <div class="fields">
      <div class="board-name">
        <div class="field-label-row">
          <label class="medium">Name</label>
          <span v-if="isBoardTitleInvalid" class="field-error">Can't be empty</span>
        </div>
        <input
          v-model="currentBoard.title"
          type="text"
          :class="{ error: isBoardTitleInvalid }"
          @blur="trimBoardTitle"
        >
      </div>

      <div class="columns">
        <div class="col-row">
          <label class="medium">Columns</label>

          <div
            v-for="(col, index) in currentBoard.columns"
            :key="columnKey(col, index)"
            class="col-input"
          >
            <span v-if="isColumnInvalid(col)" class="field-error">Can't be empty</span>
            <div class="col-input-row">
              <input
                v-model="col.title"
                type="text"
                :class="{ error: isColumnInvalid(col) }"
                @blur="trimColumnTitle(col)"
              >
              <button type="button" @click="removeColumn(index)">
                <Icon name="icon-cross" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="btns">
      <button type="button" class="add-column-btn" @click="addNewColumn">
        + Add New Column
      </button>

      <button
        type="button"
        class="btn-primary update-btn"
        :disabled="isSubmitting"
        @click="submitUpdateBoard"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Updating board" />
        <span>{{ isSubmitting ? 'Saving…' : 'Update Board' }}</span>
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

.fields .board-name {
  margin-bottom: 20px;
  position: relative;
}

.fields .board-name label,
.fields .columns .col-row label {
  color: var(--muted);
  display: inline-block;
  margin-bottom: 5px;
}

.fields .board-name input,
.fields .columns .col-row .col-input input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--input-border);
  border-radius: 5px;
  padding-left: 10px;
  background: var(--card-topbar-sidebar);
  color: var(--text);
}

.fields .board-name input:focus {
  outline-color: unset;
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

.col-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.col-input .field-error {
  text-align: right;
}

.col-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.col-input-row input {
  flex: 1;
  min-width: 0;
}

.fields .columns .col-row .col-input button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-width: 2rem;
  min-height: 2rem;
}

.fields .columns .col-row .col-input button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.fields .columns .col-row .col-input button:hover:not(:disabled) {
  color: var(--danger);
}

.fields .board-name input.error,
.fields .columns .col-row .col-input input.error {
  border-color: var(--danger);
}

.btns button {
  width: 100%;
  height: 40px;
  border-radius: 50px;
  border: none;
}

.btns button:hover {
  cursor: pointer;
}

.btns .update-btn {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btns .update-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btns .add-column-btn {
  color: var(--primary);
  background-color: var(--secondary-btn);
}

.btns .add-column-btn:hover {
  background-color: var(--primary-hover);
  color: white;
}
</style>
