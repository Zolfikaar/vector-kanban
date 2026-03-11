<template>
  <section class="sidebar">
    <div class="content">
      <h3>All Boards (0)</h3>
    </div>
    <div class="controls">
      <div class="theme-controls">
        <img src="/icons/icon-light-theme.svg" alt="Light theme">
        <button class="theme-toggle-btn">Light</button>
        <img src="/icons/icon-dark-theme.svg" alt="Dark theme">
      </div>
      <button class="toggle-sidebar">
        <img src="/icons/icon-show-sidebar.svg" alt="Hide Sidebar">
        Hide Sidebar
      </button>
    </div>
  </section>
</template>

<style scoped>
.sidebar {
  width: 300px;
  background-color: #fff;
  padding: 1em;
  height: calc(100vh - 75px);
  border-right: 1px solid var(--bg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.theme-toggle-btn{
  
}
</style>