<template>
  <div class="topbar">
    <div class="logo">
      <img src="/icons/logo-dark.svg" alt="">
      
    </div>

    <div class="main">
      <div class="board-name">My Board</div>
      <div class="action-btns">
        <button class="btn-primary">Add New Task</button>
        <button class="show-more">
          <img src="/icons/icon-vertical-ellipsis.svg" alt="">
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  width: 100%;
  height: 75px;
  display: flex;
  align-items: center;
  
  background-color: #fff;
}

.logo {
  width: 300px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--bg);
}

.main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 300px);
  padding: 0 1em ;
}

.board-name {
  font-size: 1.25em;
  font-weight: bold;
  
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 0.8em;
}

.action-btns button {
  color: #fff;
  border: none;
  padding: 0.5em 1em;
  border-radius: 24px;
  cursor: pointer;
}

.action-btns .show-more {
  background: none;
  padding: 0.5em;
 
}

</style>