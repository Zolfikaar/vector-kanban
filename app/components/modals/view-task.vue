<script setup>
import { useBoardStore } from '~/stores/board'

const boardStore = useBoardStore()

// boardStore.openTaskModal(task, column)

</script>


<template>

  <div class="modal-global view-task-modal" >
    <h2>View Task Modal</h2>
  </div>

</template>

<style scoped>
.view-task-modal{

}
</style>