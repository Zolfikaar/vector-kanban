<script setup>
import { ref, computed, watch } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const selectedBoard = computed(() => boardStore.selectedBoard)

const emit = defineEmits(['update:openCreateColumnModal'])

const props = defineProps({
  openCreateColumnModal: {
    type: Boolean,
    default: false
  }
})

const closeCreateColumnModal = () => {
  emit('update:openCreateColumnModal', false)
}

const isEmptyName = ref(false)

const columns = ref([
  {
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  }
])

// عندما يفتح المودل نضمن وجود حقل واحد
watch(() => props.openCreateColumnModal, (val) => {
  if (val) {
    columns.value = [{
      id: crypto.randomUUID(),
      name: '',
      tasks: []
    }]
  }
})

// إضافة عمود جديد
const AddNewColumn = () => {
  columns.value.push({
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  })
}

// حذف عمود
const RemoveColumn = (index) => {
  columns.value.splice(index, 1)
}

// إضافة الأعمدة للبورد
const AddColumn = () => {

  if (columns.value.some(col => col.name.trim() === '')) {
    isEmptyName.value = true
    return
  }

  isEmptyName.value = false

  boardStore.addColumnToBoard(columns.value)

  closeCreateColumnModal()
  columns.value = []
}
</script>

<template>
  <div class="create-column-modal" v-if="props.openCreateColumnModal">

    <h1>{{ selectedBoard?.name }}</h1>
    <div class="fields">

      <div class="columns">

        <div class="col-row" id="newColRow">

          <label class="medium">Column Name</label>
          <span class="err-msg" v-if="isEmptyName">Can't be empty</span>
          <div class="col-input" v-for="(col, index) in columns" :key="col.id">

            <input
              type="text"
              placeholder="e.g. Todo"
              v-model="col.name"
            />

            <button @click="RemoveColumn(index)">
              <IconCrossIcon />
            </button>

        </div>


        </div>

      </div>

    </div>

    <div class="btns">
      <button class="add-column-btn" @click="AddNewColumn">+ Add New Column</button>
      <button class="btn-primary create-btn" @click="AddColumn">Add Column</button>
    </div>
  </div>
</template>

<style scoped>
.create-column-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  min-height: 230px;
  padding: 25px;
  border-radius: 20px;
  z-index: 105;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--card-topbar-sidebar);
}

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