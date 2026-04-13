<script setup>
import { useBoardStore } from './stores/board';
const boardStore = useBoardStore()

const isSidebarHidden = ref(false)
const isCreateBoard = ref(false)
const isDeleteBoard = ref(false)
const isEditBoard = ref(false)
const isCreateColumn = ref(false)
const isOverlayActivated = computed(() => isCreateBoard.value || isDeleteBoard.value || isEditBoard.value || isCreateColumn.value)

const closeCreateBoardModal = () => {
  isCreateBoard.value = false
}

const closeDeleteBoardModal = () => {
  isDeleteBoard.value = false
}

const closeEditBoardModal = () => {
  isEditBoard.value = false
}

const closeCreateColumnModal = () => {
  isCreateColumn.value = false
}

function closeModals() {
  closeDeleteBoardModal()
  closeCreateBoardModal()
  closeEditBoardModal()
  closeCreateColumnModal()
}

function showSidebar() {
  isSidebarHidden.value = false
}


onMounted(async () => {
  await useBoardStore().loadBoards();
  if (boardStore.boards.length) {

    if (boardStore.selectBoard === null) {
      boardStore.selectBoard(boardStore.boards[0])
    }

  }
})

</script>

<template>
  <section class="app-shell">

    <Topbar v-model:hidden="isSidebarHidden" v-model:openDeleteBoardModal="isDeleteBoard"
      v-model:openEditBoardModal="isEditBoard" />

    <section class="content-shell">

      <Sidebar v-model:hidden="isSidebarHidden" v-model:openCreateBoardModal="isCreateBoard" />

      <section class="main-area">

        <div class="show-sidebar" @click="showSidebar" v-if="isSidebarHidden">
          <IconShowSidebarIcon />
        </div>

        <div class="main-content">
          <Home v-model:openCreateColumnModal="isCreateColumn" />
        </div>

      </section>

    </section>

  </section>

  <section class="overlay" :class="isOverlayActivated ? 'isactive' : ''" @click="closeModals"></section>

  <CreateBoard v-model:openCreateBoardModal="isCreateBoard" />

  <DeleteBoard v-model:openDeleteBoardModal="isDeleteBoard" />

  <EditBoard v-model:openEditBoardModal="isEditBoard" />

  <CreateColumn v-model:openCreateColumnModal="isCreateColumn" />

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