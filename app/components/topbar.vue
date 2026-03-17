<script setup>
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="topbar">
    <div class="logo" :class="hidden ? 'shrinked' : ''">
      <LogoIcon class="logo-icon" />
    </div>

    <div class="main">
      <h1 class="board-name">My Board</h1>
      <div class="action-btns ">
        <button class="btn-primary">
          <IconAddTaskMobileIcon width="20" height="20" />
          Add New Task
        </button>
        <button class="show-more">
          <IconVerticalEllipsisIcon width="" />
        </button>
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

}
</style>