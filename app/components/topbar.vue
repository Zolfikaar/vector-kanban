<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useBoardStore } from '~/stores/board'
import { useUiStore, MODAL_NAMES } from '~/stores/ui'
import { storeToRefs } from 'pinia'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { selectedBoard } = storeToRefs(boardStore)
const { isSidebarHidden, isDarkTheme, isActiveMobileOverlay } = storeToRefs(uiStore)

const showDetailsBox = ref(false)
const showMobileBoardsMenu = ref(false)
const dropdown = ref(null)
const mobileBoardsDropdown = ref(null)
const darkModeEnabled = computed({
  get: () => isDarkTheme.value,
  set: (enabled) => uiStore.setTheme(enabled ? 'dark' : 'light'),
})

function ToggleShowMoreBtn() {
  showDetailsBox.value = !showDetailsBox.value
}

function closeMobileBoards() {
  showMobileBoardsMenu.value = false
  uiStore.isActiveMobileOverlay = false
}

function handleDocumentClick(event) {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    showDetailsBox.value = false
  }

  if (
    showMobileBoardsMenu.value &&
    mobileBoardsDropdown.value &&
    !mobileBoardsDropdown.value.contains(event.target) &&
    !event.target.closest('.mobile-board-overlay')
  ) {
    closeMobileBoards()
  }
}

function deleteSelectedBoard() {
  uiStore.openModal(MODAL_NAMES.DELETE_BOARD)
  showDetailsBox.value = false
}
function editSelectedBoard() {
  uiStore.openModal(MODAL_NAMES.EDIT_BOARD)
  showDetailsBox.value = false
}

function openCreateTaskModal() {
  if (!selectedBoard.value) return
  boardStore.openCreateTaskModal()
}

const hasColumns = computed(
  () => (selectedBoard.value?.columns?.length ?? 0) > 0
)

const isAddTaskDisabled = computed(
  () => !selectedBoard.value || !hasColumns.value
)

const isBoardMenuDisabled = computed(() => !selectedBoard.value)

function toggleMobileBoardsMenu() {
  const next = !isActiveMobileOverlay.value
  showMobileBoardsMenu.value = next
  uiStore.isActiveMobileOverlay = next
}

function selectBoardFromMobileMenu(board) {
  boardStore.selectBoard(board)
  closeMobileBoards()
}

function createBoardFromMobileMenu() {
  closeMobileBoards()
  uiStore.openCreateBoardModal()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

watch(isActiveMobileOverlay, (v) => {
  showMobileBoardsMenu.value = v
}, { immediate: true })

</script>

<template>
  <div class="topbar" :class="{ 'mobile-board-open': showMobileBoardsMenu }">
    <div class="topbar-row">
      <div class="logo" :class="isSidebarHidden ? 'shrinked' : ''">
        <Icon class="logo-mobile" name="logo-mobile" :size="30" />
        <Icon class="logo-icon" name="logo-light" :size="160" v-if="darkModeEnabled" />
        <Icon class="logo-icon" name="logo-dark" :size="160" v-else />
      </div>

      <div class="main">
        <div class="mobile-board-selector" ref="mobileBoardsDropdown">
          <button type="button" class="board-name-button" @click.stop="toggleMobileBoardsMenu">
            <h1 class="board-name">{{ selectedBoard?.title }}</h1>
            <span class="board-name-chevron" aria-hidden="true">
              <Icon name="icon-chevron-down" :size="20" v-if="!showMobileBoardsMenu" />
              <Icon name="icon-chevron-up" :size="20" v-else />
            </span>
          </button>
        </div>

        <div class="action-btns">

          <button
            type="button"
            class="btn-primary"
            :class="{ inactive: isAddTaskDisabled }"
            :disabled="isAddTaskDisabled"
            @click="openCreateTaskModal"
          >
            <Icon name="icon-add-task-mobile" :size="15" />
            <span class="add-task-label">Add New Task</span>
          </button>

          <div class="dropdown" ref="dropdown">

            <button type="button" class="show-more" :disabled="isBoardMenuDisabled" @click.stop="ToggleShowMoreBtn">
              <Icon name="icon-vertical-ellipsis" :size="20" />
            </button>

            <div v-if="showDetailsBox" class="details-box">
              <span class="edit" @click="editSelectedBoard">Edit Board</span>
              <span class="delete" @click="deleteSelectedBoard">Delete Board</span>
            </div>

          </div>

        </div>
      </div>
    </div>

    <div
      v-if="showMobileBoardsMenu"
      class="mobile-board-overlay"
      @click.self="closeMobileBoards"
    >
      <div class="mobile-boards-menu" @click.stop>
        <h3 class="all-boards">ALL BOARDS ({{ boardStore.boards.length }})</h3>
        <div class="mobile-boards-list">
          <button
            v-for="board in boardStore.boards"
            :key="board.id"
            type="button"
            class="mobile-board-item"
            :class="{ active: boardStore.selectedBoard?.title === board.title }"
            @click="selectBoardFromMobileMenu(board)"
          >
            <Icon name="icon-board" :size="20" />
            <span>{{ board.title }}</span>
          </button>
        </div>

        <button type="button" class="mobile-board-item create-board" @click="createBoardFromMobileMenu">
          <Icon name="icon-board" :size="20" />
          <span>+ Create New Board</span>
        </button>

        <div class="theme-controls">
          <Icon name="icon-light-theme" :size="15" />
          <Switch v-model="darkModeEnabled" />
          <Icon name="icon-dark-theme" :size="15" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  background-color: var(--card-topbar-sidebar);
  width: 100%;
  position: relative;
}

.topbar-row {
  height: 75px;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: var(--card-topbar-sidebar);
}

.logo {
  width: 300px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--bg);
  transition: width 0.1s ease-in-out;
}

.logo-mobile {
  display: none;
}

.logo-icon {
  display: block;
}

@media (min-width: 769px) {
  .logo:not(.shrinked) .logo-mobile {
    display: none;
  }

  .logo:not(.shrinked) .logo-icon {
    display: block;
  }

  .logo.shrinked .logo-mobile {
    display: block;
  }

  .logo.shrinked .logo-icon {
    display: none;
  }
}

.logo.shrinked {
  width: 75px;
}

.logo svg {
  display: block;
  margin: 0;
}

.main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 0 1em;
}

.board-name {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0;
}

.mobile-board-selector {
  position: relative;
}

.board-name-button {
  border: none;
  background: transparent;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  cursor: pointer;
}

.board-name-button .board-name-chevron {
  display: none;
}


.mobile-board-overlay {
  display: none;
}

.mobile-boards-menu {
  display: none;
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

.all-boards {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 2px;
  margin: 0 0 16px;
}

.mobile-boards-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.mobile-board-item {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  border-radius: 0 24px 24px 0;
  padding: 0 16px 0 24px;
  text-align: left;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.mobile-board-item.active {
  background: var(--primary);
  color: #fff;
}

.mobile-board-item.create-board {
  color: var(--primary);
}

.mobile-board-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-controls {
  display: none;
}

.add-task-label {
  display: inline;
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

@media (max-width: 1100px) {
  .logo {
    width: 260px;
    flex-basis: 260px;
  }
}

@media (max-width: 768px) {
  .topbar.mobile-board-open {
    z-index: 110;
  }

  .topbar-row {
    height: 64px;
    padding: 0 12px;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    width: auto;
    height: 64px;
    border-right: none;
    justify-content: flex-start;
    margin-right: 12px;
    flex: 0 0 auto;
  }

  .logo .logo-mobile {
    display: block;
  }

  .logo .logo-icon {
    display: none;
  }

  .main {
    padding: 0;
    min-width: 0;
  }

  .board-name {
    font-size: 18px;
    line-height: 1.3;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .board-name-button .board-name-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-width: 44px;
    min-height: 44px;
    margin: -10px -6px -10px 2px;
  }

  .board-name-button .board-name-chevron {
    color: var(--primary);
  }

  .board-name-button .board-name-chevron :deep(svg) {
    display: block;
  }

  .mobile-board-overlay {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 24px 16px;
    background: rgba(0, 0, 0, 0.5);
    z-index: 109;
  }

  .mobile-boards-menu {
    display: flex;
    flex-direction: column;
    width: min(264px, calc(100vw - 32px));
    max-height: min(520px, calc(100vh - 64px - 48px));
    overflow-y: auto;
    background: var(--card-topbar-sidebar);
    border-radius: 8px;
    padding: 16px 0;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
    z-index: 1;
  }

  .mobile-board-item {
    width: 240px;
    max-width: calc(100% - 24px);
  }

  .mobile-board-item:not(.active):hover {
    background-color: #9797971a;
    color: var(--primary);
    cursor: pointer;
  }

  html.dark .mobile-board-item:not(.active):hover {
    background-color: white;
    color: var(--primary);
  }

  .mobile-board-item.active {
    background-color: var(--primary);
    color: white;
  }

  .all-boards {
    margin-left: 24px;
    padding-right: 24px;
  }

  .theme-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    height: 48px;
    margin: 12px 16px 0;
    border-radius: 6px;
    background: var(--bg);
    flex-shrink: 0;
  }

  .theme-controls svg {
    color: var(--muted);
  }

  .action-btns {
    gap: 8px;
  }

  .action-btns .btn-primary {
    height: 32px;
    width: 48px;
    min-width: 48px;
    border-radius: 24px;
    justify-content: center;
    padding: 0;
  }

  .add-task-label {
    display: none;
  }

  .action-btns .show-more {
    width: 24px;
    padding: 0;
  }

  .details-box {
    top: calc(100% + 8px);
    right: 0;
  }
}
</style>