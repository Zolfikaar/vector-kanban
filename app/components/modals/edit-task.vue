<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

const hasTriedSubmit = ref(false)
const isTitleInvalid = ref(false)

const taskDraft = ref({
  title: '',
  description: '',
  status: null,
  subtasks: ['']
})

const hasAnyNonEmptySubtask = computed(() =>
  taskDraft.value.subtasks.some((subtask) => subtask.trim())
)

const isSubtaskInvalid = (subtask) =>
  hasTriedSubmit.value && hasAnyNonEmptySubtask.value && !subtask.trim()

watchEffect(() => {
  const selectedTask = boardStore.selectedTask
  const selectedColumnName = boardStore.selectedColumn?.name

  if (!selectedTask) return

  taskDraft.value = {
    title: selectedTask.title ?? '',
    description: selectedTask.description ?? '',
    status: selectedTask.status ?? selectedColumnName ?? boardStore.selectedBoard?.columns?.[0]?.name ?? null,
    subtasks: selectedTask.subtasks?.length
      ? selectedTask.subtasks.map((subtask) => subtask.title ?? '')
      : ['']
  }

  hasTriedSubmit.value = false
  isTitleInvalid.value = false
})

const addNewSubtask = () => {
  taskDraft.value.subtasks.push('')
}

const removeSubtask = (index) => {
  if (taskDraft.value.subtasks.length === 1) {
    taskDraft.value.subtasks[0] = ''
    return
  }

  taskDraft.value.subtasks.splice(index, 1)
}

const submitEdit = () => {
  hasTriedSubmit.value = true
  isTitleInvalid.value = !taskDraft.value.title.trim()

  if (isTitleInvalid.value) return
  if (!boardStore.selectedTask) return

  const updatedTask = {
    ...boardStore.selectedTask,
    title: taskDraft.value.title.trim(),
    description: taskDraft.value.description.trim(),
    status: taskDraft.value.status,
    subtasks: taskDraft.value.subtasks
      .map((subtaskTitle, index) => {
        const previousSubtask = boardStore.selectedTask.subtasks?.[index]
        return {
          title: subtaskTitle.trim(),
          isCompleted: previousSubtask?.isCompleted ?? false
        }
      })
      .filter((subtask) => subtask.title)
  }

  boardStore.editTask(updatedTask)
}
</script>

<template>
  <div class="modal-global edit-task">
    <h1>Edit Task</h1>

    <form @submit.prevent="submitEdit">
      <div class="input-row">
        <label>Title</label>
        <input
          v-model="taskDraft.title"
          type="text"
          :class="{ error: isTitleInvalid }"
        />
      </div>

      <div class="input-row">
        <label>Description</label>
        <textarea
          v-model="taskDraft.description"
          rows="5"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
        />
      </div>

      <div class="subtasks">
        <div class="col-row">
          <label>Subtasks</label>

          <div
            v-for="(subtask, index) in taskDraft.subtasks"
            :key="index"
            class="col-input"
            :class="{ 'has-error': isSubtaskInvalid(subtask) }"
          >
            <input
              v-model="taskDraft.subtasks[index]"
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
        <select v-model="taskDraft.status">
          <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.name">
            {{ col.name }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn-primary updateTaskBtn">Save Changes</button>
    </form>
  </div>
</template>

<style scoped>
.edit-task form {
  display: flex;
  gap: 12px;
  flex-direction: column;
}

.edit-task form .input-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-task form textarea {
  resize: none;
  min-height: 112px;
}

.edit-task form .status label,
.edit-task form .subtasks .col-row label {
  margin-bottom: 8px;
}

.edit-task form .subtasks .col-row .col-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.edit-task form .subtasks .col-row .col-input input {
  width: calc(100% - 40px);
  height: 40px;
  padding-right: 130px;
}

.edit-task form .subtasks .col-row .col-input .error-message {
  position: absolute;
  right: 52px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
}

.edit-task form .subtasks .col-row .col-input .remove-subtask-btn {
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

.edit-task form .subtasks .col-row .col-input .remove-subtask-btn:hover {
  color: var(--danger);
}

.edit-task form .subtasks .col-row .col-input.has-error .remove-subtask-btn {
  color: var(--danger);
}

.edit-task form .status select {
  width: 100%;
  height: 46px;
}

.edit-task form .subtasks .col-row label,
.edit-task form .status label,
.edit-task form label {
  color: var(--muted);
  display: inline-block;
  font-weight: bold;
  font-size: 12px;
}

.edit-task form input,
.edit-task form textarea,
.edit-task form .status select {
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
}

.edit-task form input::placeholder,
.edit-task form textarea::placeholder {
  color: var(--muted);
  opacity: 0.65;
}

.edit-task form input:focus,
.edit-task form textarea:focus,
.edit-task form select:focus {
  outline: 1px solid var(--primary);
  border-color: var(--primary);
}

.edit-task form input.error {
  border-color: var(--danger);
  outline: none;
}

.edit-task form .add-subtask-btn {
  width: 100%;
  height: 44px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
}

.updateTaskBtn {
  margin-top: 8px;
  display: block;
  justify-content: center;
  width: 100%;
  height: 44px;
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