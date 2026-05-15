<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()
const { isSubmitting } = storeToRefs(boardStore)

const isTitleInvalid = ref(false)
const hasTriedSubmit = ref(false)
const hasAnyNonEmptySubtask = computed(() =>
  boardStore.createTaskDraft.subtasks.some((subtask) => subtask.trim())
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

const isSubtaskInvalid = (subtask) =>
  hasTriedSubmit.value && hasAnyNonEmptySubtask.value && !subtask.trim()

const submitTask = () => {
  if (isSubmitting.value) return

  hasTriedSubmit.value = true
  isTitleInvalid.value = !boardStore.createTaskDraft.title.trim()

  if (isTitleInvalid.value) return

  boardStore.createTask()
}
</script>

<template>
  <div class="modal-global create-task">

    <h1>Add New Task</h1>

    <form @submit.prevent="submitTask">
      <div class="input-row">

        <label>Title</label>
        <input
          v-model="boardStore.createTaskDraft.title"
          type="text"
          placeholder="e.g. Take coffee break"
          :class="{ error: isTitleInvalid }"
        />
      </div>

      <div class="input-row">

        <label>Description</label>
        <textarea
          v-model="boardStore.createTaskDraft.description"
          rows="5"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
        />
      </div>

      <div class="subtasks">

        <div class="col-row">

          <label>Subtasks</label>

          <div
            v-for="(subtask, index) in boardStore.createTaskDraft.subtasks"
            :key="index"
            class="col-input"
            :class="{ 'has-error': isSubtaskInvalid(subtask) }"
          >

            <input
              v-model="boardStore.createTaskDraft.subtasks[index]"
              type="text"
              placeholder="e.g. Make coffee"
              :class="{ error: isSubtaskInvalid(subtask) }"
            >
            <span v-if="isSubtaskInvalid(subtask)" class="error-message">Can’t be empty</span>

            <button type="button" class="remove-subtask-btn" @click="removeSubtask(index)">
              <Icon name="icon-cross" :size="16" />
            </button>

          </div>

        </div>
        
      </div>

      <button type="button" class="add-subtask-btn" @click="addNewSubtask">
        + Add New Subtask
      </button>

      <div class="status">
        <label>Status</label>
        <select v-model="boardStore.createTaskDraft.columnId" >

          <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.id">
            {{ col.title }}
          </option>


        </select>
      </div>

      <button
        type="submit"
        class="createTaskBtn btn-primary"
        :disabled="isSubmitting"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Creating task" class="create-task__spinner" />
        <span>{{ isSubmitting ? 'Creating…' : 'Create Task' }}</span>
      </button>

    </form>

  </div>
</template>

<style scoped>
.create-task form {
  display: flex;
  gap: 12px;
  flex-direction: column;
}
.create-task form .input-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.create-task form textarea {
  resize: none;
  min-height: 112px;
}

.create-task form .status label,
.create-task form .subtasks .col-row label {
  margin-bottom: 8px;
}
.create-task form .subtasks .col-row .col-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.create-task form .subtasks .col-row .col-input input {
  width: calc(100% - 40px);
  height: 40px;
  padding-right: 130px;
}

.create-task form .subtasks .col-row .col-input .error-message {
  position: absolute;
  right: 52px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
}

.create-task form .subtasks .col-row .col-input .remove-subtask-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.create-task form .subtasks .col-row .col-input .remove-subtask-btn:hover {
  color: var(--danger);
}

.create-task form .subtasks .col-row .col-input.has-error .remove-subtask-btn {
  color: var(--danger);
}

.create-task form .status select {
  width: 100%;
  height: 46px;
}

.create-task form .subtasks .col-row label,
.create-task form .status label,
.create-task form label {
  color: var(--muted);
  display: inline-block;
  font-weight: bold;
  font-size: 12px;
}

.create-task form input,
.create-task form textarea,
.create-task form .status select,
.create-task form .subtask .col-row .col-input input {
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
}

.create-task form input::placeholder,
.create-task form textarea::placeholder {
  color: var(--muted);
  opacity: 0.65;
}

.create-task form input:focus,
.create-task form textarea:focus,
.create-task form select:focus {
  outline: 1px solid var(--primary);
  border-color: var(--primary);
}

.create-task form select option{
  background: var(--bg);
  color: var(--text);
}
.create-task form input.error {
  border-color: var(--danger);
  outline: none;
}

.create-task form .add-subtask-btn {
  width: 100%;
  height: 44px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
}

.createTaskBtn {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 44px;
}

.createTaskBtn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.create-task__spinner {
  position: relative;
}

.add-subtask-btn {
  color: var(--primary);
  background: var(--secondary-btn);
}

html.dark .add-subtask-btn {
  background: #ffffff;
}

.add-subtask-btn:hover,
html.dark .add-subtask-btn:hover {
  background: var(--primary-hover);
  color: white;
}
</style>