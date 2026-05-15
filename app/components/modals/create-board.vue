<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const { isSubmitting } = storeToRefs(boardStore)

const newBoard = ref({ title: '' })
const hasTriedSubmit = ref(false)

const columns = ref([
  { id: crypto.randomUUID(), title: '', tasks: [] }
])

const resetModal = () => {
  newBoard.value.title = ''
  columns.value = [{ id: crypto.randomUUID(), title: '', tasks: [] }]
  hasTriedSubmit.value = false
}

const trimBoardTitle = () => {
  newBoard.value.title = newBoard.value.title.trim()
}

const trimColumnTitle = (col) => {
  col.title = col.title.trim()
}

const addColumn = () => {
  hasTriedSubmit.value = false
  columns.value.push({
    id: crypto.randomUUID(),
    title: '',
    tasks: []
  })
}

const removeColumn = (id) => {
  if (columns.value.length === 1) return
  columns.value = columns.value.filter((c) => c.id !== id)
}

const isBoardTitleEmpty = computed(() => !newBoard.value.title.trim())
const isAnyColumnEmpty = computed(() =>
  columns.value.some((col) => !col.title.trim())
)
const isBoardTitleInvalid = computed(
  () => hasTriedSubmit.value && isBoardTitleEmpty.value
)
const isColumnInvalid = (col) => hasTriedSubmit.value && !col.title.trim()

const submitCreateBoard = async () => {
  if (isSubmitting.value) return

  hasTriedSubmit.value = true
  trimBoardTitle()
  columns.value.forEach(trimColumnTitle)

  if (isBoardTitleEmpty.value || isAnyColumnEmpty.value) return

  const success = await boardStore.createBoard({
    title: newBoard.value.title,
    columns: columns.value
  })

  if (success) {
    resetModal()
  }
}
</script>

<template>
  <div
    class="modal-global"
    
    
    
  >
    <div
      class="header"
      
      
      
    >
      <h1>Add New Board</h1>
    </div>

    <div
      class="fields"
      
      
      
    >
      <div class="board-name">
        <div class="field-label-row">
          <label class="medium">Name</label>
          <span v-if="isBoardTitleInvalid" class="field-error">Can't be empty</span>
        </div>
        <input
          v-model="newBoard.title"
          type="text"
          :class="{ error: isBoardTitleInvalid }"
          @blur="trimBoardTitle"
        >
      </div>

      <div class="columns">
        <div class="col-row">
          <label class="medium">Columns</label>

          <div
            v-for="col in columns"
            :key="col.id"
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
              <button type="button" class="remove-btn" @click="removeColumn(col.id)">
                <Icon name="icon-cross" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="btns"
      
      
      
    >
      <button type="button" class="add-column-btn" @click="addColumn">
        + Add New Column
      </button>

      <button
        type="button"
        class="btn-primary create-btn"
        :disabled="isSubmitting"
        @click="submitCreateBoard"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Creating board" />
        <span>{{ isSubmitting ? 'Creating…' : 'Create New Board' }}</span>
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

.board-name {
  margin-bottom: 20px;
  position: relative;
}

.board-name label,
.col-row label {
  color: var(--muted);
  display: inline-block;
  margin-bottom: 5px;
}

.board-name input,
.col-input input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--input-border);
  border-radius: 5px;
  padding-left: 10px;
  background: var(--card-topbar-sidebar);
  color: var(--text);
}

.col-input {
  margin-bottom: 10px;
}

.col-input .remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--muted);
}

.col-input .remove-btn:hover {
  color: var(--danger);
}

.col-input input {
  width: calc(100% - 40px);
  height: 40px;
}

.board-name input.error,
.col-input input.error {
  border-color: var(--danger);
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

.btns button {
  width: 100%;
  height: 40px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
}

.create-btn {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.create-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.add-column-btn {
  color: var(--primary);
  background: var(--secondary-btn);
}

.add-column-btn:hover {
  background: var(--primary-hover);
  color: white;
}
</style>
