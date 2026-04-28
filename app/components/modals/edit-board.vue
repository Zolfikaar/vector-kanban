<script setup>
import { ref, computed } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

const hasTriedSubmit = ref(false)
const isEmptyName = ref(false)

const currentBoard = ref({
  id: null,
  name: '',
  columns: [],
  created_at: null,
  created_by: null,
  is_private: false
})

const selectedBoard = computed(() => boardStore.selectedBoard)

watchEffect(() => {

  if (!selectedBoard.value) return

  currentBoard.value = {
    id: selectedBoard.value.id,
    name: selectedBoard.value.name,
    columns: JSON.parse(JSON.stringify(selectedBoard.value.columns || [])),
    created_at: selectedBoard.value.created_at,
    created_by: selectedBoard.value.created_by,
    is_private: selectedBoard.value.is_private
  }

})

const AddNewColumn = () => {
  hasTriedSubmit.value = false
  isEmptyName.value = false
  currentBoard.value.columns.push({
    id: Date.now(),
    name: ''
  })

}

const RemoveColumn = (index) => {
  currentBoard.value.columns.splice(index, 1)
}

const isBoardNameEmpty = computed(() => !currentBoard.value.name.trim())
const isAnyColumnEmpty = computed(() =>
  currentBoard.value.columns.some((col) => !col.name?.trim())
)
const isBoardNameInvalid = computed(() => hasTriedSubmit.value && isBoardNameEmpty.value)
const isColumnInvalid = (col) => hasTriedSubmit.value && !col.name?.trim()

const UpdateBoard = () => {
  hasTriedSubmit.value = true

  if (isBoardNameEmpty.value || isAnyColumnEmpty.value) {
    isEmptyName.value = true
    return
  }

  boardStore.editBoard(currentBoard.value)
  boardStore.selectedBoard = currentBoard.value
  // closeEditBoardModal()
}

</script>

<template>

  <div class="modal-global">

    <div class="header">
      <h1>Edit Board</h1>

      <button class="close-btn" @click="boardStore.closeAllModals()">
        <IconCrossIcon />
      </button>
    </div>

    <div class="fields">

      <div class="board-name">

        <label class="medium">Name</label>

        <span class="err-msg" v-if="isEmptyName">
          Can't be empty
        </span>

        <input type="text" v-model="currentBoard.name" :class="{ error: isBoardNameInvalid }">

      </div>


      <div class="columns">

        <div class="col-row">

          <label class="medium">Columns</label>

          <div class="col-input" v-for="(col, index) in currentBoard.columns" :key="col.id">

            <input type="text" v-model="col.name" :class="{ error: isColumnInvalid(col) }">

            <button @click="RemoveColumn(index)">
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

      <button class="btn-primary update-btn" @click="UpdateBoard">
        Update Board
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

.fields .board-name {
  margin-bottom: 20px;
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
}

.fields .board-name input:focus {
  outline-color: unset;
}

.err-msg {
  color: red;
  float: right;
}

.fields .columns .col-row .col-input input {
  width: calc(100% - 40px);
}

.fields .columns .col-row .col-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fields .columns .col-row .col-input button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
}

.fields .columns .col-row .col-input button:hover {
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
  display: block;
}

.btns .add-column-btn {
  color: var(--primary);
  background-color: #9797971a;
}

html.dark .btns .add-column-btn {
  background-color: white;
}

.btns .add-column-btn:hover,
html.dark .btns .add-column-btn:hover {
  background-color: var(--primary-hover);
  color: white;
}
</style>