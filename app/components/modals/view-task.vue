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

function deleteSelectedTask() {
  boardStore.isTaskModalOpen = false
  boardStore.isDeleteTaskOpen = true
  showDetailsBox.value = false
}
function editSelectedTask() {
  boardStore.isTaskModalOpen = false
  boardStore.isEditTaskOpen = true
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

        <button class="show-more" @click.stop="ToggleShowMoreBtn">
          <IconVerticalEllipsisIcon />
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
        <li v-for="subtask in task.subtasks" :key="subtask.id" :class="{ completed: subtask.isCompleted }">
          <input type="checkbox" :checked="subtask.isCompleted" @change="toggleSubtask(subtask.id)" />
          {{ subtask.title }}
        </li>

      </ul>
    </div>

    <div class="status">
      <h3>Status</h3>
      <select v-model="task.status" @change="updateTaskStatus">

        <option v-for="col in boardStore.selectedBoard.columns" :key="col.id" :value="col.name">
          {{ col.name }}
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
  background: none;
  border: none;
  cursor: pointer;
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
</style>