<script setup>
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'
import { storeToRefs } from 'pinia'
import { useBoardStore } from './stores/board'
import { useUiStore } from './stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()
const { isSidebarHidden } = storeToRefs(uiStore)

onMounted(async () => {
  uiStore.initTheme()
  await boardStore.loadBoards()

  if (boardStore.boards.length && !boardStore.selectedBoard) {
    boardStore.selectBoard(boardStore.boards[0])
  }
})
</script>

<template>

  <section class="app-shell">

    <Topbar />

    <section class="content-shell">

      <Sidebar />

      <section class="main-area">

        <div class="show-sidebar" @click="uiStore.showSidebar()" v-if="isSidebarHidden">
          <Icon name="icon-show-sidebar" :size="20" />
        </div>

        <div class="main-content">
          <Home />
        </div>

      </section>

    </section>

  </section>

  <section class="overlay" :class="{ isactive: uiStore.isOverlayActive }" @click="uiStore.closeAllModals()" />

  <CreateBoard v-if="uiStore.isCreateBoardModalOpen" />

  <DeleteBoard v-if="uiStore.isDeleteBoardModalOpen" />

  <EditBoard v-if="uiStore.isEditBoardModalOpen" />

  <CreateColumn v-if="uiStore.isCreateColumnModalOpen" />

  <ViewTask v-if="uiStore.isViewTaskModalOpen" />

  <EditTask v-if="uiStore.isEditTaskModalOpen" />

  <DeleteTask v-if="uiStore.isDeleteTaskModalOpen" />

  <CreateTask v-if="uiStore.isCreateTaskModalOpen" />

  <DeleteColumn v-if="uiStore.isDeleteColumnModalOpen" />

  <Toaster theme="dark" rich-colors :close-button="false" />

</template>

<style scoped>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: auto;
}

.content-shell {
  flex: 1;
  display: flex;
  overflow: hidden;
  width: 100%;
}

.main-area {
  flex: 1;
  /* Allow this flex item to shrink so horizontal overflow can be scrollable. */
  min-width: 0;
  background-color: var(--bg);
  border-radius: 8px;
  position: relative;
}

.show-sidebar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-right-radius: 50px;
  border-top-right-radius: 50px;
  position: absolute;
  bottom: 20px;
  background-color: var(--primary);
  color: white;
  z-index: 2;
}

.show-sidebar:hover {
  background-color: var(--primary-hover);
  cursor: pointer;
}

.main-content {
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: auto;
}

@media (max-width: 768px) {
  .main-area {
    border-radius: 0;
  }

  .show-sidebar {
    display: none;
  }
}
</style>
