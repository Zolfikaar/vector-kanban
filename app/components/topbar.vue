<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useBoardStore } from '~/stores/board'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['update:openDeleteBoardModal', 'update:openEditBoardModal'])

const boardStore = useBoardStore()
const { selectedBoard } = storeToRefs(boardStore)

const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  },
  openDeleteBoardModal: {
    type: Boolean,
    default: false
  },
  openEditBoardModal: {
    type: Boolean,
    default: false
  }
})

const showDetailsBox = ref(false)
const dropdown = ref(null)

function ToggleShowMoreBtn() {
  showDetailsBox.value = !showDetailsBox.value
}

function handleClickOutside(event) {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    showDetailsBox.value = false
  }
}

function deleteSelectedBoard() {
  emit('update:openDeleteBoardModal', true)
}
function editSelectedBoard() {
  emit('update:openEditBoardModal', true)
  //  console.log(selectedBoard.value);

}

const topbarRef = ref(null)

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (topbarRef.value && !topbarRef.value.contains(e.target)) {
      showDetailsBox.value = false
    }
  })

  document.removeEventListener('click', handleClickOutside)
})



</script>

<template>
  <div class="topbar" ref="topbarRef">

    <div class="logo" :class="hidden ? 'shrinked' : ''">
      <LogoLightIcon class="logo-icon" />
    </div>

    <div class="main">
      <h1 class="board-name">{{ selectedBoard?.name }}</h1>

      <div class="action-btns" :class="selectedBoard == null ? 'inactive' : ''">

        <button class="btn-primary">
          <IconAddTaskMobileIcon width="20" height="20" />
          Add New Task
        </button>

        <div class="dropdown" ref="dropdown">

          <button class="show-more" @click="ToggleShowMoreBtn">
            <IconVerticalEllipsisIcon />
          </button>

          <div v-if="showDetailsBox" class="details-box">
            <span class="edit" @click="editSelectedBoard">Edit Board</span>
            <span class="delete" @click="deleteSelectedBoard">Delete Board</span>
          </div>

        </div>

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
  position: relative;
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

.details-box {
  position: absolute;
  top: 75px;
  right: 20px;
  padding: 10px;
  width: 195px;
  height: 95px;
  background-color: var(--card-topbar-sidebar);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

  /* تم حذف display:none حتى يشتغل v-if */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  z-index: 10;
}

.details-box span {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.details-box span:hover {
  background: rgba(0, 0, 0, 0.05);
}

.details-box .edit {
  color: var(--muted);
}

.details-box .delete {
  color: var(--danger);
}

.details-box .edit:hover {
  color: var(--primary);
}

.details-box .delete:hover {
  color: var(--danger-hover);
}
</style>