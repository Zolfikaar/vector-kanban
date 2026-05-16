<script setup>
import { computed, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSubmitting, selectedTask } = storeToRefs(uiStore)

const hasTriedSubmit = ref(false)
const isTitleInvalid = ref(false)

const taskDraft = ref({
  id: null,
  title: '',
  description: '',
  order: null,
  columnId: null,
  subtasks: ['']
})

const hasEmptySubtask = computed(() =>
  taskDraft.value.subtasks.some((subtask) => !subtask.trim())
)

const isSubtaskInvalid = (subtask) =>
  hasTriedSubmit.value && !subtask.trim()

watchEffect(() => {
  if (!selectedTask.value) return

  taskDraft.value = {
    title: selectedTask.value.title ?? '',
    description: selectedTask.value.description ?? '',
    order: selectedTask.value.order ?? null,
    columnId: selectedTask.value.columnId ?? null,
    subtasks: selectedTask.value.subtasks?.length
      ? selectedTask.value.subtasks.map((subtask) => subtask.title ?? '')
      : ['']
  }

  hasTriedSubmit.value = false
  isTitleInvalid.value = false
})

const trimTitle = () => {
  taskDraft.value.title = taskDraft.value.title.trim()
}

const trimDescription = () => {
  taskDraft.value.description = taskDraft.value.description.trim()
}

const trimSubtask = (index) => {
  taskDraft.value.subtasks[index] = taskDraft.value.subtasks[index].trim()
}

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

const submitEdit = async () => {
  if (isSubmitting.value) return

  hasTriedSubmit.value = true
  trimTitle()
  isTitleInvalid.value = !taskDraft.value.title

  if (isTitleInvalid.value || hasEmptySubtask.value) return
  if (!selectedTask.value) return

  taskDraft.value.subtasks.forEach((_, index) => trimSubtask(index))

  const updatedTask = {
    ...selectedTask.value,
    title: taskDraft.value.title,
    description: taskDraft.value.description,
    columnId:
      taskDraft.value.columnId != null
        ? Number(taskDraft.value.columnId)
        : null,
    subtasks: taskDraft.value.subtasks.map((subtaskTitle, index) => {
      const previousSubtask = selectedTask.value.subtasks?.[index]
      return {
        id: previousSubtask?.id,
        title: subtaskTitle,
        isCompleted: previousSubtask?.isCompleted ?? false
      }
    })
  }

  await boardStore.editTask(updatedTask)
}
</script>

<template>
  <div class="modal-global edit-task">
    <h1>Edit Task</h1>

    <form @submit.prevent="submitEdit">
      <div class="input-row">
        <div class="field-label-row">
          <label>Title</label>
          <span v-if="isTitleInvalid" class="field-error">Can't be empty</span>
        </div>
        <input
          v-model="taskDraft.title"
          type="text"
          :class="{ error: isTitleInvalid }"
          @blur="trimTitle"
        />
      </div>

      <div class="input-row">
        <label>Description</label>
        <textarea
          v-model="taskDraft.description"
          rows="5"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
          @blur="trimDescription"
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
            <div class="col-input-row">
              <div class="subtask-field">
                <input
                  v-model="taskDraft.subtasks[index]"
                  type="text"
                  placeholder="e.g. Make coffee"
                  :class="{ error: isSubtaskInvalid(subtask) }"
                  @blur="trimSubtask(index)"
                >
                <span v-if="isSubtaskInvalid(subtask)" class="subtask-error">Can't be empty</span>
              </div>

              <button type="button" class="remove-subtask-btn" @click="removeSubtask(index)">
                <Icon name="icon-cross" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="add-subtask-btn" @click="addNewSubtask">
        + Add New Subtask
      </button>

      <div class="status">
        <label>Status</label>
        <select v-model="taskDraft.columnId">
          <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.id">
            {{ col.title }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="btn-primary updateTaskBtn"
        :disabled="isSubmitting"
      >
        <AppSpinner v-if="isSubmitting" :size="18" label="Saving task" class="edit-task__spinner" />
        <span>{{ isSubmitting ? 'Saving…' : 'Save Changes' }}</span>
      </button>
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

.edit-task form .field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-task form .field-error {
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
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
  margin-bottom: 12px;
}

.edit-task form .subtasks .col-row .col-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-task form .subtasks .col-row .subtask-field {
  position: relative;
  flex: 1;
  min-width: 0;
}

.edit-task form .subtasks .col-row .subtask-field input {
  width: 100%;
  height: 40px;
  padding-right: 7.5rem;
}

.edit-task form .subtasks .col-row .subtask-error {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--danger);
  font-weight: 700;
  font-size: 12px;
  pointer-events: none;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 44px;
}

.updateTaskBtn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.edit-task__spinner {
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
