<script setup>
import { ref } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

const emit = defineEmits(['update:openCreateBoardModal'])

const props = defineProps({
  openCreateBoardModal: Boolean
})

const newBoard = ref({ name: '' })

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
}

const addColumn = () => {
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

const createBoard = () => {

  if (!newBoard.value.name.trim()) return
  if (columns.value.some(c => !c.name.trim())) return

  boardStore.createNewBoard({
    name: newBoard.value.name,
    columns: columns.value,
    created_at: new Date(),
    created_by: 'John Doe',
    is_private: false
  })

  closeModal()
}
</script>

<template>
  <div class="modal-global">

    <div class="header">
      <h1>Add New Board</h1>
      <button class="close-btn" @click="closeCreateBoardModal">
        <IconCrossIcon />
      </button>
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

            <input type="text" v-model="col.name" :class="{ error: !col.name.trim() }">

            <button @click="RemoveColumn(col.id)">
              <IconCrossIcon />
            </button>

          </div>

        </div>

      </div>

    </div>

    <div class="btns">
      <button class="add-column-btn" @click="AddNewColumn">
        + Add New Column
      </button>

      <button class="btn-primary create-btn" @click="CreateNewBoard">
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
  margin-bottom: 10px;
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