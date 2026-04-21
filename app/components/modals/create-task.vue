<script setup>
import { ref, computed, watch } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const selectedBoard = computed(() => boardStore.selectedBoard)

const emit = defineEmits(['update:openCreateTaskModal'])

const props = defineProps({
  openCreateTaskModal: {
    type: Boolean,
    default: false
  }
})

const closeCreateTaskModal = () => {
  emit('update:openCreateTaskModal', false)
}

const isEmptyName = ref(false)

const subtasks = ref([
  {
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  }
])

watch(() => props.openCreateTaskModal, (val) => {
  if (val) {
    subtasks.value = [{
      id: crypto.randomUUID(),
      name: '',
      tasks: []
    }]
  }
})


const AddNewSubtask = () => {
  subtasks.value.push({
    id: crypto.randomUUID(),
    name: '',
    tasks: []
  })
}

const RemoveSubtask = (index) => {
  subtasks.value.splice(index, 1)
}

const AddTask = () => {

  if (subtasks.value.some(col => col.name.trim() === '')) {
    isEmptyName.value = true
    return
  }

  isEmptyName.value = false

  boardStore.addColumnToBoard(subtasks.value)

  closeCreateTaskModal()
  subtasks.value = []
}

</script>

<template>
  <div class="modal-global create-task" >

    <h1>Add New Task</h1>

    <form @submit.prevent="boardStore.boardStore.createTask()">
      <div class="input-row">

        <label >Title</label>
        <input type="text" placeholder="e.g. Take coffee break" v-model="boardStore.newTaskTitle" required />
      </div>

      <div class="input-row">

        <label >Description</label>
        <textarea rows="5" placeholder="e.g. It’s always good to take a break. This 15 minute break will 
recharge the batteries a little." v-model="boardStore.newTaskDescription"></textarea>
      </div>

      <div class="subtasks">

        <div class="col-row">

          <label class="">Subtasks</label>

          <div class="col-input" v-for="subtask in subtasks" :key="subtask.id">

            <input type="text" v-model="subtask.name"  :class="{ error: !subtask.name.trim() }">

            <button @click="RemoveSubtask(subtask.id)">
              <IconCrossIcon />
            </button>

          </div>

        </div>
        
      </div>

      <button class="add-subtask-btn" @click="AddNewSubtask">
        + Add New Subtask
      </button>

      <div class="status">
        <label>Status</label>
        <select v-model="boardStore.newTaskStatus" @change="updateTaskStatus">

          <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.name">
            {{ col.name }}
          </option>


        </select>
      </div>

      <button class="createTaskBtn btn-primary" type="submit">Create Task</button>

    </form>
    
  </div>
</template>

<style scoped>
.create-task h1{}
.create-task form {
  display: flex;
  gap: 20px;
  flex-direction: column;
}
.create-task form .input-row{
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.create-task form input{
  
}
.create-task form textarea{
  
}
.create-task form .subtasks{}
.create-task form .subtasks .col-row{}
.create-task form .status label,
.create-task form .subtasks .col-row label{
  margin-bottom: 10px;
}
.create-task form .subtasks .col-row .col-input{
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 10px;
}
.create-task form .subtasks .col-row .col-input input{
  width: calc(100% - 2rem);
}
.create-task form .subtasks .col-row .col-input button{
  background: none;
  border: none;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  padding-top: 7px;
}
.create-task form .add-subtask-btn{}
.create-task form .status{}
.create-task form .status h3{}
.create-task form .status select{
  width: 100%;
  height: 40px;
}
.create-task form .status select option{}


.create-task form .subtasks .col-row label,
.create-task form .status label,
.create-task form label{
  color: var(--muted);
  display: inline-block;
  font-weight: bold;
}

.create-task form input,
.create-task form textarea,
.create-task form .status select,
.create-task form .subtask .col-row .col-input input{
  padding: 0.5rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
}



.create-task form .createTaskBtn{}
.create-task form .add-subtask-btn{
  width: 100%;
  height: 40px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
}

.createTaskBtn {
  margin-top: 20px;
  display: block;
}

.add-subtask-btn {
  color: var(--primary);
  background: #9797971a;
}

html.dark .add-subtask-btn {
  background: white;
}

.add-subtask-btn:hover,
html.dark .add-subtask-btn:hover {
  background: var(--primary-hover);
  color: white;
}
</style>