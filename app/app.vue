<script setup>
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

  <Topbar
    v-model:hidden="isSidebarHidden"
    v-model:openDeleteBoardModal="boardStore.isDeleteBoardOpen"
    v-model:openEditBoardModal="boardStore.isEditBoardOpen"
    v-model:openCreateTaskModal="boardStore.isCreateTaskOpen"
  />

  <section class="content-shell">

    <Sidebar
      v-model:hidden="isSidebarHidden"
      v-model:openCreateBoardModal="boardStore.isCreateBoardOpen"
    />

    <section class="main-area">

      <div
        class="show-sidebar"
        @click="showSidebar"
        v-if="isSidebarHidden"
      >
        <IconShowSidebarIcon />
      </div>

      <div class="main-content">
        <Home
          v-model:openCreateColumnModal="boardStore.isCreateColumnOpen"
        />
      </div>

    </section>

  </section>

</section>

<section
  class="overlay"
  :class="{ isactive: boardStore.isOverlayActive }"
  @click="boardStore.closeAllModals()"
/>

<CreateBoard v-if="boardStore.isCreateBoardOpen" />

<DeleteBoard v-if="boardStore.isDeleteBoardOpen" />

<EditBoard v-if="boardStore.isEditBoardOpen" />

<CreateColumn v-if="boardStore.isCreateColumnOpen" />

<ViewTask v-if="boardStore.isTaskModalOpen" />

<EditTask v-if="boardStore.isEditTaskOpen" />

<DeleteTask v-if="boardStore.isDeleteTaskOpen" />

<CreateTask v-if="boardStore.isCreateTaskOpen" />

</template>

<style scoped>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
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
  padding-top: 15px;
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
</style>