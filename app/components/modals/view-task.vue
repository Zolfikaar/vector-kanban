<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useBoardStore } from '~/stores/board'
import { storeToRefs } from 'pinia'

const boardStore = useBoardStore()
const { selectedBoard } = storeToRefs(boardStore)

const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  }
})

const showDetailsBox = ref(false)
const dropdown = ref(null)

const ToggleShowMoreBtn = () => showDetailsBox.value = !showDetailsBox.value

const toggleSubtask = (subtaskIndex) => {
  boardStore.toggleSelectedTaskSubtask(subtaskIndex)
}

const updateTaskStatus = () => {
  if (!task.value || !column.value || !selectedBoard.value) return
  if (task.value.status === column.value.name) return

  const sourceColumn = column.value
  const destinationColumn = selectedBoard.value.columns.find((col) => col.name === task.value.status)
  if (!destinationColumn || destinationColumn === sourceColumn) return

  const taskIndex = sourceColumn.tasks.indexOf(task.value)
  if (taskIndex === -1) return

  sourceColumn.tasks.splice(taskIndex, 1)
  destinationColumn.tasks.push(task.value)
  column.value = destinationColumn
  boardStore.saveBoards()
}

function deleteSelectedTask() {
  boardStore.isViewTaskModalOpen = false
  boardStore.isDeleteTaskModalOpen = true
  showDetailsBox.value = false
}
function editSelectedTask() {
  boardStore.isViewTaskModalOpen = false
  boardStore.isEditTaskModalOpen = true
  showDetailsBox.value = false
}

// const taskActionBtnsRef = ref(null)
const handleDocumentClick = (e) => {
  if (dropdown.value && !dropdown.value.contains(e.target)) {
    showDetailsBox.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const { selectedTask: task, selectedColumn: column } = storeToRefs(boardStore)

</script>


<template>

  <div class="modal-global view-task-modal">

    <div class="task-header">
      <h2>{{ task.title }}</h2>
      <div class="dropdown" ref="dropdown">

        <button type="button" class="show-more" @click.stop="ToggleShowMoreBtn">
          <Icon name="icon-vertical-ellipsis" :size="20" />
        </button>

        <div v-if="showDetailsBox" class="details-box">
          <span class="edit" @click="editSelectedTask">Edit Task</span>
          <span class="delete" @click="deleteSelectedTask">Delete Task</span>
        </div>

      </div>
    </div>

    <p class="task-description medium">{{ task.description }}</p>

    <div class="subtasks">
      <h3>Subtasks ({{task.subtasks.filter((st) => st.isCompleted).length}} of {{ task.subtasks?.length }})</h3>
      <ul>
        <li
          v-for="(subtask, index) in task.subtasks"
          :key="subtask.id ?? `${subtask.title}-${index}`"
          :class="{ completed: subtask.isCompleted }"
        >
          <input type="checkbox" :checked="subtask.isCompleted" @change="toggleSubtask(index)" />
          {{ subtask.title }}
        </li>

      </ul>
    </div>

    <div class="status">
      <h3>Status</h3>
      <select v-model="task.columnId" @change="updateTaskStatus">

        <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.id">
          {{ col.title }}
        </option>


      </select>
    </div>

  </div>

</template>

<style scoped>
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.show-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--muted);
}

.show-more:hover {
  color: var(--text);
}

.task-description,
.subtasks h3,
.subtasks ul li:has(input[type="checkbox"]:checked),
.status h3 {
  color: var(--muted);
}

.subtasks ul {
  padding-left: unset;
}

.subtasks ul li {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--bg);
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
}
.subtasks ul li:hover{
  background-color: #9797971a;
}

.subtasks li.completed {
  text-decoration: line-through;
  accent-color: var(--primary);
}

.status select {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  background-color: var(--bg);
  border: .5px solid var(--muted);
}

.status select option {
  color: var(--muted);
}

.details-box {
  position: absolute;
  top: 75px;
  right: 20px;
  padding: 10px;
  width: 195px;
  height: 95px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  z-index: 10;
}

.details-box span {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.details-box span:hover {
  background: rgba(0, 0, 0, 0.05);
}

.details-box .edit {
  color: var(--muted);
}

.details-box .delete {
  color: var(--danger);
}

.details-box .edit:hover {
  color: var(--primary);
}

.details-box .delete:hover {
  color: var(--danger-hover);
}

@media (max-width: 768px) {
  .task-header h2 {
    margin: 0;
    font-size: 22px;
    line-height: 1.3;
  }

  .task-description {
    margin: 20px 0 24px;
  }

  .details-box {
    top: 52px;
    right: 0;
  }
}
</style>