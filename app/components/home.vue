<script setup>
import { useBoardStore } from '~/stores/board'
import { storeToRefs } from 'pinia'

const boardStore = useBoardStore()
const { selectedBoard } = storeToRefs(boardStore)

// const emit = defineEmits(['open-task-modal', 'update:openCreateColumnModal'])

// const openCreateColumnModal = () => {

//   emit('update:openCreateColumnModal', true)
// }


const isLoading = computed(() => boardStore.isLoading)
</script>

<template>

  <div class="home">
    <div class="content">

      <div class="no-selected-board" v-if="selectedBoard == null">
        <p>
          There is no board selected, please select one from the sidebar
        </p>
      </div>

      <div class="columns" v-else-if="selectedBoard?.columns && selectedBoard.columns?.length > 0">
        <Column v-for="column in selectedBoard.columns" :key="column?.id" :column="column" />

        <div class="add-column" >

          <button class="btn-primary" @click="boardStore.openCreateColumnModal()">
            + Add New Column
          </button>

        </div>
      </div>

      <div class="no-columns" v-else>
        <p>This board is empty. Create a new column to get started.</p>
        <button class="btn-primary" @click="boardStore.openCreateColumnModal()">
          + Add New Column
        </button>
      </div>

    </div>

    <div class="loading" v-if="isLoading">
      <div class="spinner" />
    </div>

  </div>

</template>

<style scoped>
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  z-index: 30;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid color-mix(in srgb, var(--muted) 35%, transparent);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.home {
  height: 100%;
  width: 100%;
  min-width: 100%;
  padding: 20px;
  position: relative;
  /* Let the outer `.main-content` scroll handle both axes. */
  overflow: visible;
}

.no-selected-board {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.columns {
  display: flex;
  gap: 20px;
  height: 100%;
  align-items: flex-start;
  /* Make the flex row expand to the total width of its children.
     This ensures the parent scroll container actually gets horizontal overflow. */
  flex-wrap: nowrap;
  width: max-content;
  min-width: max-content;
}

.add-column {
  width: 280px;
  /* Keep this fixed so it contributes to horizontal overflow. */
  flex: 0 0 280px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--newColumn-bg);
  z-index: 1;
  border-radius: 6px;
  margin-top: 55px;
  margin-right: 20px;
}

.add-column:hover {
  cursor: pointer;
}

.add-column p {
  color: var(--muted);
  font-size: 1.1rem;
}

.add-column:hover p {
  color: var(--primary);
}

.no-columns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.no-columns p {
  font-size: 1.2rem;
  color: var(--muted);
  margin-bottom: 20px;
}
</style>