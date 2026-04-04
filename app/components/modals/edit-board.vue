<script setup>
import { ref, computed } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

const emit = defineEmits(['update:openEditBoardModal'])

const props = defineProps({
  openEditBoardModal: {
    type: Boolean,
    default: false
  }
})

const closeEditBoardModal = () => {
  emit('update:openEditBoardModal', false)
}

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
  currentBoard.value.columns.push({
    id: Date.now(),
    name: ''
  })

}

const RemoveColumn = (index) => {
  currentBoard.value.columns.splice(index, 1)
}

const UpdateBoard = () => {

  if (currentBoard.value.name === '') {
    isEmptyName.value = true
    return
  }

  boardStore.editBoard(currentBoard.value)

  closeEditBoardModal()
}

</script>

<template>

  <div class="edit-board" v-if="props.openEditBoardModal">

    <div class="header">
      <h1>Edit Board</h1>

      <button class="close-btn" @click="closeEditBoardModal">
        <IconCrossIcon />
      </button>
    </div>

    <div class="fields">

      <div class="board-name">

        <label class="medium">Name</label>

        <span class="err-msg" v-if="isEmptyName">
          Can't be empty
        </span>

        <input type="text" v-model="currentBoard.name">

      </div>


      <div class="columns">

        <div class="col-row">

          <label class="medium">Columns</label>

          <div class="col-input" v-for="(col, index) in currentBoard.columns" :key="col.id">

            <input type="text" v-model="col.name">

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
.edit-board {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  min-height: 430px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 25px;
  z-index: 105;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

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
  border: 1px solid var(--muted);
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