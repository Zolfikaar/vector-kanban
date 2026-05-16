<script setup>
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'
import draggable from 'vuedraggable'
import { computed, ref, watchEffect, onMounted, onUnmounted } from 'vue'
import { MODAL_NAMES } from '~/stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()

const props = defineProps({
  column: {
    type: Object,
    required: true
  }
})

watchEffect(() => {
  const col = props.column
  if (col && !Array.isArray(col.tasks)) {
    col.tasks = []
  }
})

const onTaskDragEnd = async () => {
  await boardStore.syncTaskStatusesWithColumns()
}

const showColumnMenu = ref(false)
const columnMenuRef = ref(null)

function toggleColumnMenu() {
  showColumnMenu.value = !showColumnMenu.value
}

function closeColumnMenu() {
  showColumnMenu.value = false
}

function editColumn() {
  uiStore.openModal(MODAL_NAMES.EDIT_BOARD)
  closeColumnMenu()
}

function openDeleteColumnModal() {
  uiStore.selectedColumn = props.column
  uiStore.openModal(MODAL_NAMES.DELETE_COLUMN)
  closeColumnMenu()
}

function handleDocumentClick(event) {
  if (columnMenuRef.value && !columnMenuRef.value.contains(event.target)) {
    closeColumnMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const colors = [
  { name: 'todo', color: '#49C4E5' },
  { name: 'doing', color: '#8471F2' },
  { name: 'done', color: '#67E2AE' },
  { name: 'next', color: '#5AD0F0' },
  { name: 'now', color: '#3BB9DB' },
  { name: 'later', color: '#6FD6F4' },
  { name: 'urgent', color: '#2FA7C9' },
  { name: 'low', color: '#7BE0FF' },
  { name: 'high', color: '#54CBE8' },
  { name: 'backlog', color: '#957FF5' },
  { name: 'sprint', color: '#A08CFF' },
  { name: 'release', color: '#7260E8' },
  { name: 'archive', color: '#6B5BD6' },
  { name: 'bug', color: '#9C8BFF' },
  { name: 'feature', color: '#FF7FB2' },
  { name: 'improvement', color: '#F07FAE' },
  { name: 'testing', color: '#FF92C1' },
  { name: 'meeting', color: '#E96AA0' },
  { name: 'research', color: '#FFB86B' },
  { name: 'design', color: '#FFD966' },
  { name: 'deployment', color: '#FFA24C' },
  { name: 'documentation', color: '#FFE38A' },
  { name: 'planning', color: '#FFCA8A' },
  { name: 'retrospective', color: '#F5C94C' },
  { name: 'review', color: '#F5A75D' },
  { name: 'analysis', color: '#FFEAA7' }
]

const fallbackPalette = [
  '#49C4E5',
  '#8471F2',
  '#67E2AE',
  '#5AD0F0',
  '#957FF5',
  '#FF7FB2',
  '#FFD966',
  '#FFA24C'
]

const normalizeName = (value = '') => value.trim().toLowerCase()

const getStablePaletteColor = (seedValue = '') => {
  const seed = String(seedValue)
  if (!seed) return fallbackPalette[0]

  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }

  const paletteIndex = Math.abs(hash) % fallbackPalette.length
  return fallbackPalette[paletteIndex]
}


const columnColor = computed(() => {
  const normalizedColumnName = normalizeName(props.column?.title)
  const match = colors.find(
    c => c.name === normalizedColumnName
  )

  if (match) return match.color

  return getStablePaletteColor(props.column?.id || normalizedColumnName)
})


</script>

<template>


  <div class="column">
    <div class="column-header" v-if="column && column.title">
      <p class="column-title bold">
        <span class="column-color" :style="{ backgroundColor: columnColor }"></span>
        <span>
          {{ column.title }} ({{ column.tasks?.length || 0 }})
        </span>
      </p>
      <div class="dropdown" ref="columnMenuRef">
        <button
          type="button"
          class="show-more"
          aria-label="Column actions"
          @click.stop="toggleColumnMenu"
        >
          <Icon name="icon-vertical-ellipsis" :size="20" />
        </button>

        <div v-if="showColumnMenu" class="details-box">
          <span class="edit" @click="editColumn">Edit Column</span>
          <span class="delete" @click="openDeleteColumnModal">Delete Column</span>
        </div>
      </div>
    </div>

    <div class="tasks">
      <ClientOnly>
        <draggable
          v-model="column.tasks"
          class="draggable-list"
          ghost-class="ghost-card"
          group="tasks"
          item-key="title"
          @end="onTaskDragEnd"
        >
          <template #item="{ element }">
            <Task
              :task="element"
              @click="uiStore.openTaskModal(element, column)"
            />
          </template>
        </draggable>
        <template #fallback>
          <div class="draggable-list">
            <Task
              v-for="task in column.tasks"
              :key="task.title"
              :task="task"
              @click="uiStore.openTaskModal(task, column)"
            />
          </div>
        </template>
      </ClientOnly>

      <div v-if="!column.tasks?.length" class="no-task">
        <p>No tasks in this column. Add a new task to get started.</p>
        <button type="button" class="btn-primary" @click="boardStore.openCreateTaskModal(column)">
          + Add New Task
        </button>
      </div>
    </div>

  </div>



</template>

<style scoped>
.column {
  background-color: var(--light);
  border-radius: 8px;
  width: 300px;
  /* Prevent flexbox from shrinking columns; otherwise horizontal overflow never occurs. */
  flex: 0 0 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 20px 0;
  padding-right: 8px;
}

.column-title {
  text-transform: uppercase;
  margin: 0;
  color: var(--muted);
  display: flex;
  align-items: center;
}

.dropdown {
  position: relative;
  flex-shrink: 0;
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

.details-box {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
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

.column-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}

.tasks {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.draggable-list {
  flex: 1;
  min-height: 120px;
}

:deep(.ghost-card) {
  opacity: 0.5;
  border: 2px solid #42b883;
  border-radius: 10px;
}

.no-task {
  position: absolute;
  inset: 0;
  pointer-events: none;
  min-height: 88px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-task .btn-primary {
  pointer-events: auto;
  margin-bottom: 20px;
}

@media (max-width: 1100px) {
  .column {
    width: 280px;
    flex-basis: 280px;
  }
}
</style>