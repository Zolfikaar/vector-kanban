<script setup>
import { useBoardStore } from '~/stores/board'
import { storeToRefs } from 'pinia'

const boardStore = useBoardStore()
const { selectedBoard } = storeToRefs(boardStore)
// const props = defineProps({

//   openViewTaskModal: {
//     type: Boolean,
//     default: false
//   }

// })
const emit = defineEmits(['open-task-modal', 'update:openCreateColumnModal'])

// const isViewTask = ref(false)
const openCreateColumnModal = () => {

  emit('update:openCreateColumnModal', true)
}

</script>

<template>

  <div class="home">

    <div class="no-selected-board" v-if="selectedBoard == null">
      <p>
        There is no board selected, please select one from the sidebar
      </p>
    </div>

    <div class="columns" v-else-if="selectedBoard?.columns && selectedBoard.columns?.length > 0">
      <Column v-for="column in selectedBoard.columns" :key="column?.id" :column="column"
         />

      <div class="add-column" @click="openCreateColumnModal">

        <p>
          + Add New Column
        </p>

      </div>
    </div>

    <div class="no-columns" v-else>
      <p>This board is empty. Create a new column to get started.</p>
      <button class="btn-primary" @click="$emit('create-column-modal')">
        + Add New Column
      </button>
    </div>

  </div>

</template>

<style scoped>
.home {
  height: 100%;
  width: 100%;
  min-width: 100%;
  padding: 20px;
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