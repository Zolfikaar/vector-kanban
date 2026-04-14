<script setup>
import { useBoardStore } from '~/stores/board'
const boardStore = useBoardStore()
const emit = defineEmits(['update:openCreateBoardModal'])

const props = defineProps({
  openCreateBoardModal: {
    type: Boolean,
    default: false
  }
})

const closeCreateBoardModal = () => {
  emit('update:openCreateBoardModal', false)
}

const newBoard = ref({
  name: '',
  columns: [],
  created_at: null,
  created_by: null,
  is_private: false
})
const isEmptyName = ref(false)
const columns = ref([])

watch(() => props.openCreateBoardModal, (val) => {
  if (val) {
    columns.value = [{
      id: crypto.randomUUID(),
      name: '',
      tasks: []
    }]
  }
})

const AddNewColumn = () => {

  columns.value.push({
    id: crypto.randomUUID(),
    name: ''
  })

}

const CreateNewBoard = () => {
  // console.log(newBoard.value.name);
  if (newBoard.value.name == '') {
    isEmptyName.value = true
  } else {
    newBoard.value.columns = columns.value
    newBoard.value.created_at = new Date()
    newBoard.value.created_by = 'John Doe'
    isEmptyName.value = false
  }

  boardStore.createNewBoard({ ...newBoard.value });
  closeCreateBoardModal()
  clearModal()
}

const RemoveColumn = () => {
  if (columns.value.length > 0) {
    columns.value.pop()
  }
}

const clearModal = () => {
  // newBoard.value.name = ''
  // newBoard.value.columns = []
  // newBoard.value.created_at = null
  // newBoard.value.created_by = null
  // newBoard.value.is_private = false

  newBoard.value = {
    name: '',
    columns: [],
    created_at: null,
    created_by: null,
    is_private: false
  }

  columns.value = []

}

</script>

<template>
  <div class="modal-global" >

    <div class="header">
      <h1>Add New Board</h1>
      <button class="close-btn" @click="closeCreateBoardModal">
        <IconCrossIcon />
      </button>
    </div>


    <div class="fields">
      <div class="board-name">
        <label for="" class="medium">Name</label>
        <span class="err-msg" v-if="isEmptyName">Can't be empty</span>
        <input type="text" v-model="newBoard.name" :style="isEmptyName ? 'border: 1px solid red;' : ''">

      </div>

      <div class="columns">

        <div class="col-row" id="newColRow">

          <label class="medium">Columns</label>

          <div class="col-input" v-for="col in columns" :key="col.id">
            <input type="text" v-model="col.name">

            <button @click="RemoveColumn">
              <IconCrossIcon />
            </button>
          </div>


        </div>

      </div>

    </div>

    <div class="btns">
      <button class="add-column-btn" @click="AddNewColumn">+ Add New Column</button>
      <button class="btn-primary create-btn" @click="CreateNewBoard">Create New Board</button>
    </div>

  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fields {}

.fields .board-name {
  margin-bottom: 20px;
}

.fields .columns {}

.fields .columns .col-row {}

.fields .columns .col-row .col-input {
  margin-bottom: 10px;
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

.btns .create-btn {
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

/*
.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: .5px solid var(--danger-hover);
}

.close-btn:hover {
  cursor: pointer;
  border-color: var(--danger);
}

.close-btn svg {
  margin-top: 5px;
  color: var(--danger);
}

.close-btn:hover svg {
  color: var(--danger-hover);
  
}

.name-field {
  margin-bottom: 15px;
}

.name-field input {
  height: 40px;
  width: 100%;
  margin-top: 10px;
  border-radius: 5px;
  border: 1px solid var(--muted);
}

.columns .column-row {
  margin-bottom: 10px;
}

.columns .column-row input {
  margin-top: 10px;
  height: 40px;
  border: 1px solid var(--muted);
  border-radius: 5px;
  width: calc(100% - 30px);
}

.add-column-btn,
.create-btn {
  height: 40px;
}

.add-column-btn {
  color: var(--primary);
  background-color: #625fc719;
  border-radius: 50px;
  border: none;
}

.add-column-btn:hover {
  cursor: pointer;
}

.create-btn {

margin-top: 15px;
display: flex;
justify-content: center;
}
*/
</style>