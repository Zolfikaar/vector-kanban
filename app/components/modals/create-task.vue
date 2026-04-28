<script setup>
import { computed, ref } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

const isTitleInvalid = ref(false)
const areAllSubtasksEmpty = computed(() =>
  boardStore.createTaskDraft.subtasks.every((subtask) => !subtask.trim())
)

const addNewSubtask = () => {
  boardStore.createTaskDraft.subtasks.push('')
}

const removeSubtask = (index) => {
  if (boardStore.createTaskDraft.subtasks.length === 1) {
    boardStore.createTaskDraft.subtasks[0] = ''
    return
  }

  boardStore.createTaskDraft.subtasks.splice(index, 1)
}

const submitTask = () => {
  isTitleInvalid.value = !boardStore.createTaskDraft.title.trim()

  if (isTitleInvalid.value) return

  boardStore.createTask()
}
</script>

<template>
  <div class="modal-global create-task" >

    <h1>Add New Task</h1>

    <form @submit.prevent="submitTask">
      <div class="input-row">

        <label >Title</label>
        <input
          v-model="boardStore.createTaskDraft.title"
          type="text"
          placeholder="e.g. Take coffee break"
          :class="{ error: isTitleInvalid }"
          required
        />
      </div>

      <div class="input-row">

        <label >Description</label>
        <textarea
          v-model="boardStore.createTaskDraft.description"
          rows="5"
          placeholder="Task Description"
        />
      </div>

      <div class="subtasks">

        <div class="col-row">

          <label class="">Subtasks</label>

          <div
            v-for="(subtask, index) in boardStore.createTaskDraft.subtasks"
            :key="index"
            class="col-input"
          >

            <input
              v-model="boardStore.createTaskDraft.subtasks[index]"
              type="text"
              :class="{ error: !subtask.trim() && !areAllSubtasksEmpty }"
            >

            <button type="button" @click="removeSubtask(index)">
              <IconCrossIcon />
            </button>

          </div>

        </div>
        
      </div>

      <button type="button" class="add-subtask-btn" @click="addNewSubtask">
        + Add New Subtask
      </button>

      <div class="status">
        <label>Status</label>
        <select v-model="boardStore.createTaskDraft.status">

          <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.name">
            {{ col.name }}
          </option>


        </select>
      </div>

      <button type="submit" class="createTaskBtn btn-primary">Create Task</button>

    </form>
    
  </div>
</template>

<style scoped>
.create-task form {
  display: flex;
  gap: 10px;
  flex-direction: column;
}
.create-task form .input-row{
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.create-task form textarea{
  resize: none;
}

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

.create-task form .status select{
  width: 100%;
  height: 40px;
}

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