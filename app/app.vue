<script setup>


const isSidebarHidden = ref(false)



function showSidebar() {
  isSidebarHidden.value = false
}


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

            <h1>Main Area</h1>
          </div>
        </section>

      </section>

    </section>
  </section>
</template>

<style scoped>
.content-shell {
  min-height: calc(100vh - 75px);
  display: flex;
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
}

.show-sidebar:hover {
  background-color: var(--primary-hover);
  cursor: pointer;
}

.main-content {
  padding: 1em;
}
</style>