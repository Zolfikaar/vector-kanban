<script setup>
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'
import { useBoardStore } from './stores/board'

const boardStore = useBoardStore()

const isSidebarHidden = ref(false)

function showSidebar() {
  isSidebarHidden.value = false
}

onMounted(async () => {

  await boardStore.loadBoards()

  if (boardStore.boards.length && !boardStore.selectedBoard) {
    boardStore.selectBoard(boardStore.boards[0])
  }

})
</script>

<template>

  <section class="app-shell">

    <Topbar v-model:hidden="isSidebarHidden" v-model:openDeleteBoardModal="boardStore.isDeleteBoardModalOpen"
      v-model:openEditBoardModal="boardStore.isEditBoardModalOpen"
      v-model:openMobileBoardsDropdown="boardStore.isActiveMobileOverlay" />

    <section class="content-shell">

      <Sidebar v-model:hidden="isSidebarHidden" v-model:openCreateBoardModal="boardStore.isCreateBoardModalOpen" />

      <section class="main-area">

        <div class="show-sidebar" @click="showSidebar" v-if="isSidebarHidden">
          <Icon name="icon-show-sidebar" :size="20" />
        </div>

        <div class="main-content">
          <Home v-model:openCreateColumnModal="boardStore.isCreateColumnModalOpen" />
        </div>

      </section>

    </section>

  </section>

  <section class="overlay" :class="{ isactive: boardStore.isOverlayActive }" @click="boardStore.closeAllModals()" />

  <CreateBoard v-if="boardStore.isCreateBoardModalOpen"
    v-model:openCreateBoardModal="boardStore.isCreateBoardModalOpen" />

  <DeleteBoard v-if="boardStore.isDeleteBoardModalOpen" />

  <EditBoard v-if="boardStore.isEditBoardModalOpen" />

  <CreateColumn v-if="boardStore.isCreateColumnModalOpen"
    v-model:openCreateColumnModal="boardStore.isCreateColumnModalOpen" />

  <ViewTask v-if="boardStore.isViewTaskModalOpen" />

  <EditTask v-if="boardStore.isEditTaskModalOpen" />

  <DeleteTask v-if="boardStore.isDeleteTaskModalOpen" />

  <CreateTask v-if="boardStore.isCreateTaskModalOpen" />

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