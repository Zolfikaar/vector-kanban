<script setup>
import { ref, computed } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

const emit = defineEmits(['update:openCreateBoardModal'])

const newBoard = ref({ name: '' })
const hasTriedSubmit = ref(false)

const columns = ref([
  { id: crypto.randomUUID(), name: '', tasks: [] }
])

const closeModal = () => {
  emit('update:openCreateBoardModal', false)
  resetModal()
}

const resetModal = () => {
  newBoard.value.name = ''
  columns.value = [{ id: crypto.randomUUID(), name: '', tasks: [] }]
  hasTriedSubmit.value = false
}

const addColumn = () => {
  hasTriedSubmit.value = false
  columns.value.push({
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  })
}

const removeColumn = (id) => {
  if (columns.value.length === 1) return
  columns.value = columns.value.filter(c => c.id !== id)
}

const isBoardNameEmpty = computed(() => !newBoard.value.name.trim())
const isBoardNameInvalid = computed(() => hasTriedSubmit.value && isBoardNameEmpty.value)
const isEmptyName = computed(() => hasTriedSubmit.value && isBoardNameEmpty.value)

const createBoard = () => {
  hasTriedSubmit.value = true
  if (isBoardNameEmpty.value) return

  const sanitizedColumns = columns.value
    .map((column) => ({
      ...column,
      name: column.name.trim()
    }))
    .filter((column) => column.name)

  boardStore.createNewBoard({
    id: crypto.randomUUID(),
    name: newBoard.value.name.trim(),
    columns: sanitizedColumns,
    created_at: new Date(),
    created_by: 'John Doe',
    is_private: false
  })

  boardStore.selectBoard(boardStore.boards.at(-1))
  closeModal()
}
</script>

<template>
  <div class="modal-global">

    <div class="header">
      <h1>Add New Board</h1>

      <!--
        <button class="close-btn" @click="closeCreateBoardModal">
          <IconCrossIcon />
        </button>
        -->
    </div>

    <div class="fields">

      <div class="board-name">
        <label class="medium">Name</label>

        <span class="err-msg" v-if="isEmptyName">
          Can't be empty
        </span>

        <input type="text" v-model="newBoard.name" :class="{ error: isBoardNameInvalid }">
      </div>

      <div class="columns">

        <div class="col-row">

          <label class="medium">Columns</label>

          <div class="col-input" v-for="col in columns" :key="col.id">

            <input type="text" v-model="col.name">

            <button class="remove-btn" @click="removeColumn(col.id)">
              <IconCrossIcon />
            </button>

          </div>

        </div>

      </div>

    </div>

    <div class="btns">
      <button class="add-column-btn" @click="addColumn">
        + Add New Column
      </button>

      <button class="btn-primary create-btn" @click="createBoard">
        Create New Board
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
}

.col-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 10px;
}

.col-input .remove-btn{
  background: none;
  border: none;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  padding-top: 7px;
  color: var(--muted);
}

.col-input .remove-btn:hover {
  color: var(--danger);
}

.col-input input {
  width: calc(100% - 40px);
  height: 40px;
}

.err-msg {
  color: red;
  float: right;
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
  display: block;
}

.add-column-btn {
  color: var(--primary);
  background: #9797971a;
}

html.dark .add-column-btn {
  background: white;
}

.add-column-btn:hover,
html.dark .add-column-btn:hover {
  background: var(--primary-hover);
  color: white;
}
</style>