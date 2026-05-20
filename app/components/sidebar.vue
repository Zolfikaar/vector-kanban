<script setup>
import Switch from './switch.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useBoardStore } from '~/stores/board'
import { useUiStore } from '~/stores/ui'

const authStore = useAuthStore()
const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSidebarHidden, isDarkTheme } = storeToRefs(uiStore)

const darkModeEnabled = computed({
  get: () => isDarkTheme.value,
  set: (enabled) => uiStore.setTheme(enabled ? 'dark' : 'light'),
})

function hideSidebar() {
  uiStore.hideSidebar()
}

function createBoard() {
  uiStore.openCreateBoardModal()
}
</script>
<template>
  <section class="sidebar" :class="{ hidden: isSidebarHidden }">
    <div class="sidebar-inner">
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
          :style="{ color: !darkModeEnabled ? 'var(--primary)' : 'var(--text)' }" />
        <Switch v-model="darkModeEnabled" />
        <Icon name="icon-dark-theme" :size="20"
          :style="{ color: darkModeEnabled ? 'var(--primary)' : 'var(--text)' }" />
      </div>
      <button type="button" class="logout-btn" @click="authStore.Logout()">
        <p>Logout</p>
      </button>
      <button type="button" class="toggle-sidebar" @click="hideSidebar">
        <Icon name="icon-hide-sidebar" :size="20" />
        <p>Hide Sidebar</p>
      </button>
      <p class="about">A product by <a href="https://urlabs.io" target="_blank" rel="noopener noreferrer">UrLabs</a>.</p>
    </div>
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
  overflow: hidden;
  transition: width 0.2s ease, flex-basis 0.2s ease;
}

.sidebar.hidden {
  width: 0;
  flex-basis: 0;
  border-right: 0;
  pointer-events: none;
}

.sidebar-inner {
  width: 300px;
  min-width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.hidden .sidebar-inner {
  opacity: 0;
  transition: opacity 0.05s ease;
}

.sidebar.hidden .sidebar-inner * {
  transition: none !important;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-sidebar p,
.logout-btn p,
.all-boards {
  white-space: nowrap;
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

.logout-btn {
  display: flex;
  align-items: center;
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

.logout-btn:hover {
  color: var(--primary);
  cursor: pointer;
  background-color: var(--primary-hover-bg);
}

.logout-btn p {
  margin: 0;
}

.about {
  text-align: center;
  margin: 0 45px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--muted);
}

@media (max-width: 1100px) {
  .sidebar {
    width: 260px;
    flex-basis: 260px;
  }

  .sidebar-inner {
    width: 260px;
    min-width: 260px;
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

  .logout-btn {
    padding-left: 24px;
    max-width: 236px;
  }

  .about {
    margin-left: 24px;
    margin-right: 24px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
