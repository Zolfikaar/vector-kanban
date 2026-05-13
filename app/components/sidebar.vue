<script setup>
import Switch from './switch.vue';
import { useBoardStore } from '~/stores/board'
const boardStore = useBoardStore()
const emit = defineEmits(['update:hidden', 'update:openCreateBoardModal'])

const THEME_STORAGE_KEY = 'theme'
const DarkModeEnabled = ref(false)

watch(DarkModeEnabled, (enabled) => {
  if (typeof window === 'undefined') return

  const html = document.documentElement

  if (enabled) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }

  localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light')
})

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  DarkModeEnabled.value = storedTheme === 'dark'
})

const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  },
  openCreateBoardModal: {
    type: Boolean,
    default: false
  }
})


function HideSidebar() {
  emit('update:hidden', true)
}

const createBoard = () => {
  emit('update:openCreateBoardModal', true)
}

</script>
<template>
  <section class="sidebar" :class="{ hidden: props.hidden }">
    <div class="content">

      <h3 class="all-boards">ALL BOARDS ({{ boardStore.boards.length }})</h3>
      <div class="boards-name" v-if="boardStore.boards && boardStore.boards.length > 0">

        <div v-for="board in boardStore.boards" :key="board.id">

          <h3 class="board-item " :class="{ active: boardStore.selectedBoard?.title === board.title }"
            @click="boardStore.selectBoard(board)">
            <Icon name="icon-board" :size="20" />
            <p class="board-name" v-if="board && board.title">{{ board.title }}</p>
          </h3>
        </div>

        <div class="board-item create-board" @click="createBoard">
          <Icon name="icon-board" :size="20" />
          <h3 class="board-name">
            <Icon name="icon-add-task-mobile" :size="10" />
            <p>Create New Board</p>
          </h3>
        </div>
      </div>
    </div>
    <div class="controls">
      <div class="theme-controls">
        <Icon name="icon-light-theme" :size="20"
          :style="{ color: !DarkModeEnabled ? 'var(--primary)' : 'var(--text)' }" />
        <Switch v-model="DarkModeEnabled" />
        <Icon name="icon-dark-theme" :size="20"
          :style="{ color: DarkModeEnabled ? 'var(--primary)' : 'var(--text)' }" />
      </div>
      <button class="toggle-sidebar" @click="HideSidebar">
        <Icon name="icon-hide-sidebar" :size="20" />
        <p>Hide Sidebar</p>
      </button>
    </div>
  </section>
</template>

<style scoped>
.sidebar {

  width: 300px;
  flex: 0 0 300px;
  background-color: var(--card-topbar-sidebar);
  height: calc(100vh - 75px);
  border-right: 1px solid var(--bg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: width 0.2s ease, flex-basis 0.2s ease;
}

.sidebar.hidden {
  width: 0;
  flex-basis: 0;
  border-right: 0;
  pointer-events: none;
}

.content {
  display: flex;
  flex-direction: column;
}

.all-boards {
  color: var(--muted);
  font-size: 1.2em;
  font-weight: bold;
  margin: 20px 0 10px 45px;
}

.boards-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.board-item {
  color: var(--muted);
  padding: 10px 0 10px 45px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 275px;
  border-bottom-right-radius: 50px;
  border-top-right-radius: 50px;
  height: 48px;
  margin: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.board-name {
  margin: 0;
}

.board-item svg {
  flex-shrink: 0;
}

.board-item:not(.active):hover {
  background-color: #9797971a;
  color: var(--primary);
  cursor: pointer;
}

html.dark .board-item:not(.active):hover {
  background-color: white;
  color: var(--primary);
}

.board-item.active {
  background-color: var(--primary);
  color: white;
}

.create-board {
  color: var(--primary);
}

.create-board .board-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 48px;
  margin: 0 45px;
  border-radius: 5px;
  padding: 10px;
  background-color: var(--bg);
}

.theme-controls svg {
  flex-shrink: 0;
}

.toggle-sidebar {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  background: transparent;
  border: none;
  font-weight: bold;
  max-width: 275px;
  border-bottom-right-radius: 50px;
  border-top-right-radius: 50px;
  height: 48px;
  padding-left: 45px;
}

.toggle-sidebar:hover {
  color: var(--primary);
  cursor: pointer;
  background-color: var(--primary-hover-bg);
}

.toggle-sidebar svg {
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .sidebar {
    width: 260px;
    flex-basis: 260px;
  }

  .all-boards {
    margin-left: 24px;
    font-size: 12px;
    letter-spacing: 2px;
  }

  .board-item {
    padding-left: 24px;
    max-width: 236px;
  }

  .theme-controls {
    margin: 0 24px;
  }

  .toggle-sidebar {
    padding-left: 24px;
    max-width: 236px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>