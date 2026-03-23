<script setup>
import { useBoardStore } from './stores/board';
const boardStore = useBoardStore()

const isSidebarHidden = ref(false)

function showSidebar() {
  isSidebarHidden.value = false
}

let boards = ref([]);

onMounted(async () => {
  await useBoardStore().loadBoards();
  boards.value = boardStore.boards;
  if (boardStore.boards.length) {
  boardStore.selectBoard(boardStore.boards[0])
}
})




</script>

<template>
  <section class="overlay">
    <section class="app-shell">

      <Topbar :hidden="isSidebarHidden" />

      <section class="content-shell">

        <Sidebar v-model:hidden="isSidebarHidden" />

        <section class="main-area">

          <div class="show-sidebar" @click="showSidebar" v-if="isSidebarHidden">
            <IconShowSidebarIcon />
          </div>

          <div class="main-content">
            <Home />
          </div>

        </section>

      </section>

    </section>
  </section>
</template>

<style scoped>

.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-shell {
  flex: 1;
  display: flex;
  overflow: hidden;
  width: 100%;
}

.main-area {
  flex: 1;
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
}

</style>