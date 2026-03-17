<script setup>

import Switch from './switch.vue';

const DarkModeEnabled = ref(false)

watch(DarkModeEnabled, (enabled) => {
  const html = document.documentElement

  if (enabled) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
})

const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:hidden'])

function HideSidebar() {
  emit('update:hidden', true)
}

</script>
<template>
  <section class="sidebar" :class="{ hidden: props.hidden }">
    <div class="content">

      <h3 class="all-boards">ALL BOARDS (0)</h3>
      <div class="boards-name">
        <h3 class="board-item active">
          <IconBoardIcon />
          <p class="board-name">Platform Launch</p>
        </h3>
        <h3 class="board-item">
          <IconBoardIcon />
          <p class="board-name">Marketing Plan</p>
        </h3>
        <h3 class="board-item">
          <IconBoardIcon />
          <p class="board-name">Roadmap</p>
        </h3>

        <div class="board-item create-board">
          <IconBoardIcon />
          <h3 class="board-name">
            <IconAddTaskMobileIcon width="20" height="20" />
            <p>Create New Board</p>
          </h3>
        </div>
      </div>
    </div>
    <div class="controls">
      <div class="theme-controls">
        <IconLightThemeIcon :style="{ color: !DarkModeEnabled ? 'var(--primary)' : 'var(--text)' }" />
        <Switch v-model="DarkModeEnabled" />
        <IconDarkThemeIcon :style="{ color: DarkModeEnabled ? 'var(--primary)' : 'var(--text)' }" />
      </div>
      <button class="toggle-sidebar" @click="HideSidebar">
        <IconShowSidebarIcon />
        <p>Hide Sidebar</p>
      </button>
    </div>
  </section>
</template>

<style scoped>
.sidebar {
  width: 300px;
  background-color: var(--card-topbar-sidebar);
  height: calc(100vh - 75px);
  border-right: 1px solid var(--bg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: width 0.2s ease;
}

.sidebar.hidden {
  width: 0;
  border-right: 0;
  pointer-events: none;
}



.sidebar .content .all-boards {
  color: var(--muted);
  font-size: 1.2em;
  font-weight: bold;
  margin-left: 45px;
}

.board-item {
  color: var(--muted);
  padding: 10px 0 10px 45px;
  display: flex;
  align-items: center;
  max-width: 275px;
  border-bottom-right-radius: 50px;
  border-top-right-radius: 50px;
  height: 48px;
  margin: 0;
}

.board-item svg {
  margin-top: 10px;
}

.board-item .board-name {
  margin-left: 10px;
  display: inline-block;
}


.board-item:hover {
  background-color: #9797971a;
  color: var(--primary);
  cursor: pointer;
}

html.dark .board-item:hover {
  background-color: white;
  color: var(--primary);
  cursor: pointer;
}

.board-item.active,
html.dark .board-item.active {
  background-color: var(--primary);
  color: white;
  cursor: pointer;
}

.board-item img svg path {
  fill: var(--muted);
}

.board-item.create-board .board-name {
  display: flex;
  align-items: center;
}

.create-board {
  color: var(--primary);
}



.board-item:hover img svg path {
  fill: var(--bg);
}



/* ================ Controls ================= */
.controls {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.theme-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 48px;
  margin-left: 45px;
  margin-right: 45px;
  border-radius: 5px;
  padding: 10px;
  background-color: var(--bg);
}

.theme-controls svg {
  margin-top: 5px;
}

.theme-toggle-btn {}

.toggle-sidebar {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  background-color: transparent;
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
  margin-top: 15px;
}
</style>