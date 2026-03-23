<script setup>
import { useBoardStore } from '~/stores/board'
import { storeToRefs } from 'pinia'

const boardStore = useBoardStore()
const { selectedBoard } = storeToRefs(boardStore)



</script>

<template>

  <div class="home">

    <div
      class="columns"
      v-if="selectedBoard?.columns && selectedBoard.columns?.length > 0"
    >
      <Column
        v-for="column in selectedBoard.columns"
        :key="column.id"
        :column="column"
        @open-task-modal="$emit('open-task-modal', column.id)"
      />

      <div class="add-column">
       
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
  padding: 20px;
  overflow: auto;
}

.columns {
  display: flex;
  gap: 20px;
  height: 100%;
  align-items: flex-start;
}
.add-column {
  width: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--newColumn-bg);
  z-index: 1;
  border-radius: 6px;
  margin-top: 55px;
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