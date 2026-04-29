<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useBoardStore } from '~/stores/board'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['update:openDeleteBoardModal', 'update:openEditBoardModal'])

const boardStore = useBoardStore()
const { selectedBoard } = storeToRefs(boardStore)

const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  },
  openDeleteBoardModal: {
    type: Boolean,
    default: false
  },
  openEditBoardModal: {
    type: Boolean,
    default: false
  },
})

const showDetailsBox = ref(false)
const showMobileBoardsMenu = ref(false)
const dropdown = ref(null)
const mobileBoardsDropdown = ref(null)
const THEME_STORAGE_KEY = 'theme'
const darkModeEnabled = ref(false)

function ToggleShowMoreBtn() {
  showDetailsBox.value = !showDetailsBox.value
}

function handleDocumentClick(event) {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    showDetailsBox.value = false
  }

  if (mobileBoardsDropdown.value && !mobileBoardsDropdown.value.contains(event.target)) {
    showMobileBoardsMenu.value = false
  }
}

function deleteSelectedBoard() {
  emit('update:openDeleteBoardModal', true)
  showDetailsBox.value = false
}
function editSelectedBoard() {
  emit('update:openEditBoardModal', true)
  showDetailsBox.value = false
}

function openCreateTaskModal() {
  if (!selectedBoard.value) return
  boardStore.openCreateTaskModal()
}

const isBoardControlsDisabled = computed(() => !selectedBoard.value)

function toggleMobileBoardsMenu() {
  showMobileBoardsMenu.value = !showMobileBoardsMenu.value
}

function selectBoardFromMobileMenu(board) {
  boardStore.selectBoard(board)
  showMobileBoardsMenu.value = false
}

function createBoardFromMobileMenu() {
  showMobileBoardsMenu.value = false
  boardStore.isCreateBoardModalOpen = true
}

onMounted(() => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  darkModeEnabled.value = storedTheme === 'dark'
  document.documentElement.classList.toggle('dark', darkModeEnabled.value)

  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

watch(darkModeEnabled, (enabled) => {
  document.documentElement.classList.toggle('dark', enabled)
  localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light')
})

</script>

<template>
  <div class="topbar">

    <div class="logo" :class="hidden ? 'shrinked' : ''">
      <LogoMobileIcon class="logo-mobile" />
      <LogoLightIcon class="logo-icon" />
    </div>

    <div class="main">
      <div class="mobile-board-selector" ref="mobileBoardsDropdown">
        <button class="board-name-button" @click.stop="toggleMobileBoardsMenu">
          <h1 class="board-name">{{ selectedBoard?.name }}</h1>
          <IconChevronDownIcon v-if="!showMobileBoardsMenu" />
          <IconChevronUpIcon v-else />
        </button>

        <div v-if="showMobileBoardsMenu" class="mobile-boards-menu">
          <h3 class="all-boards">ALL BOARDS ({{ boardStore.boards.length }})</h3>
          <div class="mobile-boards-list">
            <button
              v-for="board in boardStore.boards"
              :key="board.id"
              class="mobile-board-item"
              :class="{ active: boardStore.selectedBoard?.name === board.name }"
              @click="selectBoardFromMobileMenu(board)"
            >
              <IconBoardIcon />
              <span>{{ board.name }}</span>
            </button>
          </div>

          <button class="mobile-board-item create-board" @click="createBoardFromMobileMenu">
            <IconBoardIcon />
            <span>+ Create New Board</span>
          </button>

          <div class="theme-controls">
            <IconLightThemeIcon />
            <Switch v-model="darkModeEnabled" />
            <IconDarkThemeIcon />
          </div>
        </div>
      </div>

      <div class="action-btns" :class="{ inactive: isBoardControlsDisabled }">

        <button class="btn-primary" :disabled="isBoardControlsDisabled" @click="openCreateTaskModal">
          <IconAddTaskMobileIcon width="20" height="20" />
          <span class="add-task-label">Add New Task</span>
        </button>

        <div class="dropdown" ref="dropdown">

          <button class="show-more" :disabled="isBoardControlsDisabled" @click.stop="ToggleShowMoreBtn">
            <IconVerticalEllipsisIcon />
          </button>

          <div v-if="showDetailsBox" class="details-box">
            <span class="edit" @click="editSelectedBoard">Edit Board</span>
            <span class="delete" @click="deleteSelectedBoard">Delete Board</span>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.topbar {
  background-color: var(--card-topbar-sidebar);
  width: 100%;
  height: 75px;
  display: flex;
  align-items: center;
  position: relative;
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

.board-name-button svg {
  display: none;
  color: var(--primary);
  margin-top: 4px;
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

  /* تم حذف display:none حتى يشتغل v-if */
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
  .topbar {
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

  .logo-mobile {
    display: block;
  }

  .logo-icon {
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

  .board-name-button svg {
    display: block;
    margin-top: 2px;
  }

  .mobile-boards-menu {
    display: block;
    position: absolute;
    top: calc(100% + 12px);
    left: -68px;
    width: min(264px, calc(100vw - 24px));
    background: var(--card-topbar-sidebar);
    border-radius: 8px;
    padding: 16px 0 16px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    z-index: 50;
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
  }

  .theme-controls svg {
    margin-top: 8px;
    color: var(--muted);
  }

  .action-btns {
    gap: 8px;
  }

  .action-btns .btn-primary {
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